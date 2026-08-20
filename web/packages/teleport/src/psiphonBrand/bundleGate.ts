/*
 * Psiphon Access
 * Copyright (C) 2026  Psiphon Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Layer 2 of the brand gate. It reads the emitted bundle, so it measures what
 * ships. It is the step that proves the plugin actually ran, and it is what
 * makes the build-time transform safe: a build that skipped the plugin cannot
 * pass it.
 *
 * ENFORCEMENT SWITCHES ITSELF ON. While the source baseline still admits a
 * phrase, the bundle necessarily still holds unbranded copy, so the gate
 * reports and does not throw. When the aggregate source baseline reaches zero,
 * `isBundleGateStrict` becomes true on its own, with no further commit.
 *
 * THREE THINGS ACCOUNT FOR AN OCCURRENCE, and nothing else does.
 *
 *   1. A catalog entry, matched by its replacement text.
 *   2. An excluded host from `EXCLUDED_HOSTS`.
 *   3. A record or a named rule in `bundleBaseline.ts`, for the occurrences a
 *      source-keyed catalog entry can never reach.
 *
 * The third list has ITS OWN RATCHET, in `evaluateBundleBaseline`, and that
 * ratchet does not wait for strict mode. A record that stops matching fails
 * the build until somebody removes it, so the list can only shrink.
 */

import {
  BRAND_BASELINE,
  BRAND_CATALOG,
  BRAND_WORD,
  EXCLUDED_HOSTS,
  type BrandBaselineEntry,
  type BrandPhrase,
  type ExcludedHost,
} from './brandCatalog';
import { isExcludedByHost, sortLongestFirst } from './brandMatcher';
import {
  BUNDLE_BASELINE_COMMIT,
  BUNDLE_BASELINE_DATE,
  BUNDLE_CATEGORY_RULES,
  BUNDLE_EXCLUSIONS,
  type BundleCategoryRule,
  type BundleExclusion,
  type BundleTail,
} from './bundleBaseline';

/** One group of unaccounted occurrences in the emitted bundle. */
export interface BundleResidual {
  /** The surrounding run of non-whitespace, non-quote characters. */
  readonly run: string;
  /** How many times that run holds an unaccounted occurrence. */
  readonly count: number;
  /** Offset of the first occurrence, so a human can find it. */
  readonly firstIndex: number;
  /** The token the exclusion list would have to name to admit this run. */
  readonly token: string;
  /** The identifier the exclusion list would have to name instead. */
  readonly identifier: string;
}

export interface BundleScanResult {
  readonly chunk: string;
  readonly totalOccurrences: number;
  readonly accountedByCatalog: number;
  readonly accountedByHost: number;
  /** Occurrences a record or a rule in `bundleBaseline.ts` admitted. */
  readonly accountedByExclusion: number;
  /** Hits per exclusion key in this chunk. The ratchet reads this. */
  readonly exclusionHits: Readonly<Record<string, number>>;
  readonly residuals: readonly BundleResidual[];
  readonly residualOccurrences: number;
}

/**
 * True when the bundle gate throws rather than reports. It is derived, never
 * configured, so nobody has to remember to turn it on.
 */
export function isBundleGateStrict(
  baseline: readonly BrandBaselineEntry[] = BRAND_BASELINE
): boolean {
  return baseline.length === 0;
}

/** Stable key for one record, used in the report and in a ratchet message. */
export function bundleExclusionKey(exclusion: BundleExclusion): string {
  return `${exclusion.shape}:${exclusion.token}`;
}

/** Stable key for one named rule. */
export function bundleRuleKey(rule: BundleCategoryRule): string {
  return `rule:${rule.id}`;
}

/**
 * The named tail alphabets. The data in `bundleBaseline.ts` names one of
 * these, so a rule cannot express an arbitrary pattern. This mirrors the way
 * ADR 0007 keeps a pattern out of the catalog by giving the entry no field
 * that could hold one.
 */
const TAIL_MATCHERS: Readonly<Record<BundleTail, (tail: string) => boolean>> = {
  // A kebab CSS name: lower case letters, digits and hyphens.
  lowerKebab: tail => /^[a-z0-9-]+$/.test(tail),
  // A protobuf message type path: one or more lower-case package segments, a
  // version segment, then one or more capitalised type segments.
  protobufTypePath: tail =>
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*\.v[0-9]+(\.[A-Za-z][A-Za-z0-9]*)+$/.test(
      tail
    ),
};

function runAround(
  text: string,
  index: number
): { run: string; start: number } {
  const isRunChar = (c: string) => !/[\s'"`]/.test(c);
  let lo = index;
  while (lo > 0 && isRunChar(text[lo - 1])) {
    lo--;
  }
  let hi = index;
  while (hi < text.length && isRunChar(text[hi])) {
    hi++;
  }
  return { run: text.slice(lo, hi), start: lo };
}

function spanAround(
  text: string,
  index: number,
  isMember: (c: string) => boolean
): string {
  let lo = index;
  while (lo > 0 && isMember(text[lo - 1])) {
    lo--;
  }
  let hi = index;
  while (hi < text.length && isMember(text[hi])) {
    hi++;
  }
  return text.slice(lo, hi);
}

/**
 * The `token` shape. It keeps a dotted protobuf name, a kebab CSS class and a
 * slashed path whole, and it stops at any character a minifier would put
 * between two unrelated names.
 *
 * Leading and trailing `.`, `/` and `@` are trimmed, because a CSS selector
 * writes `.ace-teleport` and a path writes a trailing slash, and neither
 * belongs to the name. A hyphen is NOT trimmed, because `--teleport-colors-x`
 * is a CSS custom property whose name starts with the two hyphens.
 */
export function tokenAround(text: string, index: number): string {
  const raw = spanAround(text, index, c => /[A-Za-z0-9_$./@-]/.test(c));
  return raw.replace(/^[./@]+/, '').replace(/[./@]+$/, '');
}

/**
 * The `identifier` shape. Use it when the token would drag in a neighbouring
 * minified name, as `e.validTeleportConfig` does.
 */
export function identifierAround(text: string, index: number): string {
  return spanAround(text, index, c => /[A-Za-z0-9_$]/.test(c));
}

/** True when a named rule admits this token. */
export function ruleMatches(
  rule: BundleCategoryRule,
  subject: string
): boolean {
  if (!subject.startsWith(rule.prefix)) {
    return false;
  }
  const tail = subject.slice(rule.prefix.length);
  if (tail.length === 0) {
    return false;
  }
  return TAIL_MATCHERS[rule.tail](tail);
}

/**
 * Validate the exclusion list before any bundle is read. The two length rules
 * are the structural guard that keeps copy out: no record and no rule can be
 * the bare brand word, so none of them can ever admit a lone `Teleport`.
 */
export function validateBundleBaseline(
  exclusions: readonly BundleExclusion[] = BUNDLE_EXCLUSIONS,
  rules: readonly BundleCategoryRule[] = BUNDLE_CATEGORY_RULES
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const exclusion of exclusions) {
    const key = bundleExclusionKey(exclusion);
    const lower = exclusion.token.toLowerCase();
    if (!lower.includes(BRAND_WORD)) {
      problems.push(
        `INVALID_EXCLUSION: record "${key}" does not contain the brand word, so it excludes nothing this gate looks for.`
      );
    }
    if (exclusion.token.length <= BRAND_WORD.length) {
      problems.push(
        `INVALID_EXCLUSION: record "${key}" is not longer than the brand word. A record that short could admit a lone occurrence of it, which is copy.`
      );
    }
    if (exclusion.reason.trim().length === 0) {
      problems.push(`INVALID_EXCLUSION: record "${key}" has no reason.`);
    }
    if (exclusion.count < 1) {
      problems.push(
        `INVALID_EXCLUSION: record "${key}" records a count below 1, so it was never measured.`
      );
    }
    if (seen.has(key)) {
      problems.push(`INVALID_EXCLUSION: record "${key}" is a duplicate.`);
    }
    seen.add(key);
  }

  for (const rule of rules) {
    const key = bundleRuleKey(rule);
    const lower = rule.prefix.toLowerCase();
    if (!lower.includes(BRAND_WORD)) {
      problems.push(
        `INVALID_EXCLUSION: rule "${key}" has a prefix that does not contain the brand word, so it is not narrow.`
      );
    }
    if (rule.prefix.length <= BRAND_WORD.length) {
      problems.push(
        `INVALID_EXCLUSION: rule "${key}" has a prefix no longer than the brand word. That rule would swallow copy, which ADR 0007 rejected.`
      );
    }
    if (rule.reason.trim().length === 0) {
      problems.push(`INVALID_EXCLUSION: rule "${key}" has no reason.`);
    }
    if (rule.count < 1) {
      problems.push(
        `INVALID_EXCLUSION: rule "${key}" records a count below 1, so it was never measured.`
      );
    }
    if (seen.has(key)) {
      problems.push(`INVALID_EXCLUSION: rule "${key}" is a duplicate.`);
    }
    seen.add(key);
  }

  return problems;
}

/**
 * Find every occurrence of the brand word in one emitted chunk that neither a
 * catalog entry, nor an excluded host, nor the bundle exclusion list explains.
 *
 * The bundle holds the REPLACEMENT text, not the source text, so the catalog is
 * consumed by replacement. In practice only an immutable entry keeps the word,
 * which is exactly why ADR 0007 keeps all five immutable entries: without them
 * this layer cannot tell a header it must leave alone from a phrase somebody
 * forgot.
 */
export function scanBundleResidual(
  chunk: string,
  code: string,
  catalog: readonly BrandPhrase[] = BRAND_CATALOG,
  hosts: readonly ExcludedHost[] = EXCLUDED_HOSTS,
  exclusions: readonly BundleExclusion[] = BUNDLE_EXCLUSIONS,
  rules: readonly BundleCategoryRule[] = BUNDLE_CATEGORY_RULES
): BundleScanResult {
  const consumed = new Uint8Array(code.length);
  const surviving = sortLongestFirst(
    catalog.filter(entry => /teleport/i.test(entry.replacement))
  );
  let accountedByCatalog = 0;
  for (const entry of surviving) {
    const needle = entry.replacement;
    let from = 0;
    for (;;) {
      const at = code.indexOf(needle, from);
      if (at < 0) {
        break;
      }
      const end = at + needle.length;
      let free = true;
      for (let i = at; i < end; i++) {
        if (consumed[i]) {
          free = false;
          break;
        }
      }
      if (free) {
        for (let i = at; i < end; i++) {
          consumed[i] = 1;
        }
        accountedByCatalog++;
      }
      from = at + 1;
    }
  }

  const byToken = new Map<string, BundleExclusion>();
  const byIdentifier = new Map<string, BundleExclusion>();
  for (const exclusion of exclusions) {
    const target = exclusion.shape === 'token' ? byToken : byIdentifier;
    target.set(exclusion.token, exclusion);
  }
  const exclusionHits: Record<string, number> = {};
  for (const exclusion of exclusions) {
    exclusionHits[bundleExclusionKey(exclusion)] = 0;
  }
  for (const rule of rules) {
    exclusionHits[bundleRuleKey(rule)] = 0;
  }

  const lower = code.toLowerCase();
  const grouped = new Map<
    string,
    { count: number; firstIndex: number; token: string; identifier: string }
  >();
  let total = 0;
  let accountedByHost = 0;
  let accountedByExclusion = 0;
  let residualOccurrences = 0;
  let at = lower.indexOf(BRAND_WORD);
  while (at >= 0) {
    total++;
    if (!consumed[at]) {
      const { run, start } = runAround(code, at);
      if (isExcludedByHost(run, hosts)) {
        accountedByHost++;
      } else {
        const token = tokenAround(code, at);
        const identifier = identifierAround(code, at);
        const record = byToken.get(token) ?? byIdentifier.get(identifier);
        const rule = record
          ? undefined
          : rules.find(candidate =>
              candidate.shape === 'token'
                ? ruleMatches(candidate, token)
                : ruleMatches(candidate, identifier)
            );
        if (record || rule) {
          const key = record
            ? bundleExclusionKey(record)
            : bundleRuleKey(rule as BundleCategoryRule);
          exclusionHits[key] = (exclusionHits[key] ?? 0) + 1;
          accountedByExclusion++;
        } else {
          residualOccurrences++;
          const existing = grouped.get(run);
          if (existing) {
            existing.count++;
          } else {
            grouped.set(run, {
              count: 1,
              firstIndex: start,
              token,
              identifier,
            });
          }
        }
      }
    }
    at = lower.indexOf(BRAND_WORD, at + 1);
  }

  const residuals: BundleResidual[] = [...grouped]
    .map(([run, v]) => ({
      run,
      count: v.count,
      firstIndex: v.firstIndex,
      token: v.token,
      identifier: v.identifier,
    }))
    .sort((a, b) => b.count - a.count || (a.run < b.run ? -1 : 1));

  return {
    chunk,
    totalOccurrences: total,
    accountedByCatalog,
    accountedByHost,
    accountedByExclusion,
    exclusionHits,
    residuals,
    residualOccurrences,
  };
}

/** What the exclusion ratchet found across every emitted chunk. */
export interface BundleBaselineVerdict {
  /** Messages from `validateBundleBaseline`. Any one of these fails a build. */
  readonly invalid: readonly string[];
  /** Records and rules that matched nothing. Each fails a build. */
  readonly obsolete: readonly string[];
  /** Records whose measured count moved. Reported, never fatal. */
  readonly drift: readonly string[];
  /** Total occurrences the list admitted. */
  readonly admitted: number;
}

/**
 * The ratchet. A record or a rule that matched nothing in the whole bundle is
 * obsolete, and it fails the build until somebody removes it. Without this
 * rule the list would rot into a permanent exemption, which is the failure
 * mode the gate exists to prevent.
 *
 * The ratchet is on presence, not on count. A count that moved is printed and
 * is not fatal, because keying a failure on an occurrence count would fire on
 * any dependency bump that added one CSS selector.
 */
export function evaluateBundleBaseline(
  results: readonly BundleScanResult[],
  exclusions: readonly BundleExclusion[] = BUNDLE_EXCLUSIONS,
  rules: readonly BundleCategoryRule[] = BUNDLE_CATEGORY_RULES
): BundleBaselineVerdict {
  const invalid = validateBundleBaseline(exclusions, rules);

  const totals = new Map<string, number>();
  for (const exclusion of exclusions) {
    totals.set(bundleExclusionKey(exclusion), 0);
  }
  for (const rule of rules) {
    totals.set(bundleRuleKey(rule), 0);
  }
  for (const result of results) {
    for (const [key, hits] of Object.entries(result.exclusionHits)) {
      totals.set(key, (totals.get(key) ?? 0) + hits);
    }
  }

  const obsolete: string[] = [];
  const drift: string[] = [];
  let admitted = 0;
  for (const exclusion of exclusions) {
    const key = bundleExclusionKey(exclusion);
    const found = totals.get(key) ?? 0;
    admitted += found;
    if (found === 0) {
      obsolete.push(
        `BUNDLE_RATCHET_FAIL: exclusion "${key}" matched nothing in the emitted bundle. ` +
          `It was recorded against ${BUNDLE_BASELINE_COMMIT} on ${BUNDLE_BASELINE_DATE} with ${exclusion.count} occurrences. ` +
          'Delete it from BUNDLE_EXCLUSIONS. The list can only shrink.'
      );
    } else if (found !== exclusion.count) {
      drift.push(
        `  drift  ${key}: recorded ${exclusion.count}, found ${found}. Update the count when you next touch this record.`
      );
    }
  }
  for (const rule of rules) {
    const key = bundleRuleKey(rule);
    const found = totals.get(key) ?? 0;
    admitted += found;
    if (found === 0) {
      obsolete.push(
        `BUNDLE_RATCHET_FAIL: rule "${key}" matched nothing in the emitted bundle. ` +
          `It was recorded against ${BUNDLE_BASELINE_COMMIT} on ${BUNDLE_BASELINE_DATE} with ${rule.count} occurrences. ` +
          'Delete it from BUNDLE_CATEGORY_RULES. The list can only shrink.'
      );
    } else if (found !== rule.count) {
      drift.push(
        `  drift  ${key}: recorded ${rule.count}, found ${found}. Update the count when you next touch this rule.`
      );
    }
  }

  return { invalid, obsolete, drift, admitted };
}

/**
 * Throw when the exclusion list is invalid or has gone stale. The plugin calls
 * this on every build, in both report mode and strict mode, because the health
 * of this list does not depend on how far the rebrand has got.
 */
export function assertBundleBaselineHealth(
  results: readonly BundleScanResult[],
  exclusions: readonly BundleExclusion[] = BUNDLE_EXCLUSIONS,
  rules: readonly BundleCategoryRule[] = BUNDLE_CATEGORY_RULES
): BundleBaselineVerdict {
  const verdict = evaluateBundleBaseline(results, exclusions, rules);
  const fatal = [...verdict.invalid, ...verdict.obsolete];
  if (fatal.length > 0) {
    throw new Error(
      `psiphon-brand: the bundle exclusion list in bundleBaseline.ts is not healthy.\n${fatal.join('\n')}`
    );
  }
  return verdict;
}

export function formatBundleReport(
  results: readonly BundleScanResult[],
  strict: boolean,
  sampleSize = 25,
  verdict?: BundleBaselineVerdict
): string {
  const lines: string[] = [];
  lines.push('=== Psiphon brand gate, layer 2 (emitted bundle) ===');
  lines.push(
    `mode: ${strict ? 'STRICT (throws)' : 'REPORT (source baseline is not empty yet)'}`
  );
  for (const result of results) {
    lines.push(
      `${result.chunk}: ${result.totalOccurrences} occurrences, ${result.accountedByCatalog} accounted by catalog, ${result.accountedByHost} accounted by an excluded host, ${result.accountedByExclusion} accounted by the bundle exclusion list, ${result.residualOccurrences} unaccounted in ${result.residuals.length} distinct runs`
    );
    for (const residual of result.residuals.slice(0, sampleSize)) {
      lines.push(
        `  x${String(residual.count).padStart(4)}  ${JSON.stringify(residual.run.slice(0, 100))}  token=${JSON.stringify(residual.token)}`
      );
    }
    if (result.residuals.length > sampleSize) {
      lines.push(`  ... and ${result.residuals.length - sampleSize} more runs`);
    }
  }
  if (verdict) {
    lines.push(
      `bundle exclusion list (${BUNDLE_BASELINE_COMMIT}, ${BUNDLE_BASELINE_DATE}): ${BUNDLE_EXCLUSIONS.length} records and ${BUNDLE_CATEGORY_RULES.length} rules admitted ${verdict.admitted} occurrences`
    );
    lines.push(...verdict.drift);
  }
  return lines.join('\n');
}
