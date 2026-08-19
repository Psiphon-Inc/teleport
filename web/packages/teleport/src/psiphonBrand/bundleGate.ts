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

/** One group of unaccounted occurrences in the emitted bundle. */
export interface BundleResidual {
  /** The surrounding run of non-whitespace, non-quote characters. */
  readonly run: string;
  /** How many times that run holds an unaccounted occurrence. */
  readonly count: number;
  /** Offset of the first occurrence, so a human can find it. */
  readonly firstIndex: number;
}

export interface BundleScanResult {
  readonly chunk: string;
  readonly totalOccurrences: number;
  readonly accountedByCatalog: number;
  readonly accountedByHost: number;
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

/**
 * Find every occurrence of the brand word in one emitted chunk that neither a
 * catalog entry nor an excluded host explains.
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
  hosts: readonly ExcludedHost[] = EXCLUDED_HOSTS
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

  const lower = code.toLowerCase();
  const grouped = new Map<string, { count: number; firstIndex: number }>();
  let total = 0;
  let accountedByHost = 0;
  let residualOccurrences = 0;
  let at = lower.indexOf(BRAND_WORD);
  while (at >= 0) {
    total++;
    if (!consumed[at]) {
      const { run, start } = runAround(code, at);
      if (isExcludedByHost(run, hosts)) {
        accountedByHost++;
      } else {
        residualOccurrences++;
        const existing = grouped.get(run);
        if (existing) {
          existing.count++;
        } else {
          grouped.set(run, { count: 1, firstIndex: start });
        }
      }
    }
    at = lower.indexOf(BRAND_WORD, at + 1);
  }

  const residuals: BundleResidual[] = [...grouped]
    .map(([run, v]) => ({ run, count: v.count, firstIndex: v.firstIndex }))
    .sort((a, b) => b.count - a.count || (a.run < b.run ? -1 : 1));

  return {
    chunk,
    totalOccurrences: total,
    accountedByCatalog,
    accountedByHost,
    residuals,
    residualOccurrences,
  };
}

export function formatBundleReport(
  results: readonly BundleScanResult[],
  strict: boolean,
  sampleSize = 25
): string {
  const lines: string[] = [];
  lines.push('=== Psiphon brand gate, layer 2 (emitted bundle) ===');
  lines.push(
    `mode: ${strict ? 'STRICT (throws)' : 'REPORT (source baseline is not empty yet)'}`
  );
  for (const result of results) {
    lines.push(
      `${result.chunk}: ${result.totalOccurrences} occurrences, ${result.accountedByCatalog} accounted by catalog, ${result.accountedByHost} accounted by an excluded host, ${result.residualOccurrences} unaccounted in ${result.residuals.length} distinct runs`
    );
    for (const residual of result.residuals.slice(0, sampleSize)) {
      lines.push(
        `  x${String(residual.count).padStart(4)}  ${JSON.stringify(residual.run.slice(0, 100))}`
      );
    }
    if (result.residuals.length > sampleSize) {
      lines.push(`  ... and ${result.residuals.length - sampleSize} more runs`);
    }
  }
  return lines.join('\n');
}
