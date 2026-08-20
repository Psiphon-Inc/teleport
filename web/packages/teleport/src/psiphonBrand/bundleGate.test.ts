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
 * Tests for layer 2 of the brand gate: the bundle exclusion list, its ratchet,
 * and the proof that the plugin carrying layer 2 is actually registered.
 *
 * THE LAST GROUP IS THE IMPORTANT ONE. ref-o74l.3.1 measured that deleting
 * `psiphonBrandPlugin()` from the vite plugin array makes the build SUCCEED,
 * because a plugin that is not registered has no `generateBundle` hook to
 * throw from. A gate cannot detect its own absence from inside itself, so the
 * check has to live outside it, in a test that reads the resolved plugin list.
 */

import { execFileSync } from 'child_process';
import { resolve } from 'path';

import { psiphonBrandPlugin } from './brandPlugin';
import {
  BUNDLE_CATEGORY_RULES,
  BUNDLE_EXCLUSIONS,
  type BundleCategoryRule,
  type BundleExclusion,
} from './bundleBaseline';
import {
  assertBundleBaselineHealth,
  bundleExclusionKey,
  evaluateBundleBaseline,
  formatBundleReport,
  identifierAround,
  ruleMatches,
  scanBundleResidual,
  tokenAround,
  validateBundleBaseline,
} from './bundleGate';

/** A record shaped like a real one, so a test can vary one field at a time. */
function record(over: Partial<BundleExclusion> = {}): BundleExclusion {
  return {
    token: 'teleport-widget',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason: 'a reason',
    ...over,
  };
}

function rule(over: Partial<BundleCategoryRule> = {}): BundleCategoryRule {
  return {
    id: 'test-rule',
    category: 'generated-protobuf',
    shape: 'token',
    prefix: 'teleport.',
    tail: 'protobufTypePath',
    count: 1,
    reason: 'a reason',
    ...over,
  };
}

describe('bundle exclusion list, validity', () => {
  it('the shipped list validates', () => {
    expect(validateBundleBaseline()).toEqual([]);
    expect(BUNDLE_EXCLUSIONS.length).toBeGreaterThan(0);
    expect(BUNDLE_CATEGORY_RULES.length).toBeGreaterThan(0);
  });

  it('every shipped record and rule states a reason', () => {
    for (const exclusion of BUNDLE_EXCLUSIONS) {
      expect(exclusion.reason.trim().length).toBeGreaterThan(0);
    }
    for (const r of BUNDLE_CATEGORY_RULES) {
      expect(r.reason.trim().length).toBeGreaterThan(0);
    }
  });

  it('rejects a record that is the bare brand word', () => {
    const problems = validateBundleBaseline(
      [record({ token: 'Teleport' })],
      []
    );
    expect(problems.join('\n')).toContain('not longer than the brand word');
  });

  it('rejects a record that does not hold the brand word at all', () => {
    const problems = validateBundleBaseline(
      [record({ token: 'psiphon-x' })],
      []
    );
    expect(problems.join('\n')).toContain('does not contain the brand word');
  });

  it('rejects the broad rule that ADR 0007 rejected', () => {
    // A rule whose prefix is the bare word would swallow every occurrence,
    // including copy. The length check makes that unexpressible.
    const problems = validateBundleBaseline(
      [],
      [rule({ prefix: 'teleport', tail: 'lowerKebab' })]
    );
    expect(problems.join('\n')).toContain('would swallow copy');
  });

  it('rejects an empty reason, a zero count and a duplicate', () => {
    const problems = validateBundleBaseline(
      [record({ reason: '  ' }), record({ count: 0 })],
      []
    );
    const text = problems.join('\n');
    expect(text).toContain('has no reason');
    expect(text).toContain('count below 1');
    expect(text).toContain('is a duplicate');
  });
});

describe('bundle exclusion list, the keys it is built on', () => {
  it('the token shape keeps a dotted name whole and drops a selector dot', () => {
    const css = ';}.ace-teleport{color:red}';
    expect(tokenAround(css, css.toLowerCase().indexOf('teleport'))).toBe(
      'ace-teleport'
    );
    const proto = 'x="teleport.desktop.v1.SharedDirectoryRequest.Create";';
    expect(tokenAround(proto, proto.indexOf('teleport'))).toBe(
      'teleport.desktop.v1.SharedDirectoryRequest.Create'
    );
    const cssVar = 'color:var(--teleport-colors-brand);';
    expect(tokenAround(cssVar, cssVar.indexOf('teleport'))).toBe(
      '--teleport-colors-brand'
    );
  });

  it('the identifier shape drops a minified member prefix', () => {
    // This is why the key is not the surrounding run. The run holds `e.`, and
    // `e` is a minified name that changes on an unrelated dependency bump.
    const code = 'a={...u,validTeleportConfig:e.validTeleportConfig??!1};';
    const at = code.indexOf('e.validTeleportConfig') + 2;
    expect(tokenAround(code, code.toLowerCase().indexOf('teleport', at))).toBe(
      'e.validTeleportConfig'
    );
    expect(
      identifierAround(code, code.toLowerCase().indexOf('teleport', at))
    ).toBe('validTeleportConfig');
  });

  it('a named tail alphabet accepts its category and refuses the rest', () => {
    const proto = rule();
    expect(ruleMatches(proto, 'teleport.mfa.v1.SSOChallenge')).toBe(true);
    expect(ruleMatches(proto, 'teleport.userpreferences.v1.ViewMode')).toBe(
      true
    );
    // Not a protobuf path: no version segment, or a slash, or nothing at all.
    expect(ruleMatches(proto, 'teleport.yaml')).toBe(false);
    expect(ruleMatches(proto, 'teleport.internal/resource-id')).toBe(false);
    expect(ruleMatches(proto, 'teleport')).toBe(false);
    expect(ruleMatches(proto, 'Teleport')).toBe(false);

    const kebab = rule({ prefix: '--teleport-colors-', tail: 'lowerKebab' });
    expect(ruleMatches(kebab, '--teleport-colors-brand')).toBe(true);
    expect(ruleMatches(kebab, '--teleport-colors-')).toBe(false);
    expect(ruleMatches(kebab, '--teleport-spacing-1')).toBe(false);
  });
});

describe('bundle exclusion list, what it admits', () => {
  it('admits a record and a rule, and counts each hit', () => {
    const code =
      'const a="ace-teleport";const b="teleport.desktop.v1.Ping";' +
      'const c="teleport.mfa.v1.SSOChallenge";';
    const result = scanBundleResidual(
      'app/app.js',
      code,
      [],
      [],
      [record({ token: 'ace-teleport', count: 1 })],
      [rule({ count: 2 })]
    );
    expect(result.totalOccurrences).toBe(3);
    expect(result.accountedByExclusion).toBe(3);
    expect(result.residualOccurrences).toBe(0);
    expect(result.exclusionHits['token:ace-teleport']).toBe(1);
    expect(result.exclusionHits['rule:test-rule']).toBe(2);
  });

  it('admits by identifier when the run holds a minified neighbour', () => {
    const code = 'x(e.validTeleportConfig,I.getAwsDeployTeleportServiceUrl);';
    const result = scanBundleResidual(
      'app/app.js',
      code,
      [],
      [],
      [
        record({ token: 'validTeleportConfig', shape: 'identifier' }),
        record({
          token: 'getAwsDeployTeleportServiceUrl',
          shape: 'identifier',
        }),
      ],
      []
    );
    expect(result.residualOccurrences).toBe(0);
    expect(result.accountedByExclusion).toBe(2);
  });

  it('IS NOT VACUOUS: the shipped list never admits a lone brand word', () => {
    // The whole list, exactly as shipped, against copy. If any record or rule
    // ever grew broad enough to swallow a bare occurrence, this fails.
    const copy =
      'const a="Welcome to Teleport";const b=`Log in to Teleport`;' +
      'const c="this Teleport Cluster.";const d="teleport";';
    const result = scanBundleResidual('app/app.js', copy, [], []);
    expect(result.accountedByExclusion).toBe(0);
    expect(result.residualOccurrences).toBe(4);
  });

  it('still reports an occurrence that no record names', () => {
    const code = 'const a="teleport-not-on-the-list";';
    const result = scanBundleResidual('app/app.js', code, [], [], [], []);
    expect(result.residualOccurrences).toBe(1);
    expect(result.residuals[0].token).toBe('teleport-not-on-the-list');
    expect(formatBundleReport([result], true)).toContain('1 unaccounted');
  });
});

describe('bundle exclusion list, the ratchet', () => {
  const stale = record({ token: 'teleport-gone-away', count: 3 });

  it('fails the run when a record stops matching', () => {
    const result = scanBundleResidual(
      'app/app.js',
      'const a="nothing here";',
      [],
      [],
      [stale],
      []
    );
    const verdict = evaluateBundleBaseline([result], [stale], []);
    expect(verdict.obsolete).toHaveLength(1);
    expect(verdict.obsolete[0]).toContain('BUNDLE_RATCHET_FAIL');
    expect(verdict.obsolete[0]).toContain(bundleExclusionKey(stale));
    expect(verdict.obsolete[0]).toContain('The list can only shrink');
  });

  it('fails the run when a rule stops matching', () => {
    const result = scanBundleResidual(
      'app/app.js',
      'const a="nothing here";',
      [],
      [],
      [],
      [rule()]
    );
    const verdict = evaluateBundleBaseline([result], [], [rule()]);
    expect(verdict.obsolete).toHaveLength(1);
    expect(verdict.obsolete[0]).toContain('rule "rule:test-rule"');
  });

  it('throws in report mode too, because the list is its own concern', () => {
    const result = scanBundleResidual(
      'app/app.js',
      'const a="nothing here";',
      [],
      [],
      [stale],
      []
    );
    expect(() => assertBundleBaselineHealth([result], [stale], [])).toThrow(
      /BUNDLE_RATCHET_FAIL/
    );
  });

  it('reports a moved count without failing, so a bump does not cry wolf', () => {
    const keep = record({ token: 'teleport-widget', count: 5 });
    const result = scanBundleResidual(
      'app/app.js',
      'const a="teleport-widget";',
      [],
      [],
      [keep],
      []
    );
    const verdict = assertBundleBaselineHealth([result], [keep], []);
    expect(verdict.obsolete).toEqual([]);
    expect(verdict.drift.join('\n')).toContain('recorded 5, found 1');
    expect(formatBundleReport([result], false, 25, verdict)).toContain(
      'recorded 5, found 1'
    );
  });

  it('passes a healthy list, and admits every occurrence it names', () => {
    const keep = record({ token: 'teleport-widget', count: 1 });
    const result = scanBundleResidual(
      'app/app.js',
      'const a="teleport-widget";',
      [],
      [],
      [keep],
      []
    );
    const verdict = assertBundleBaselineHealth([result], [keep], []);
    expect(verdict.invalid).toEqual([]);
    expect(verdict.obsolete).toEqual([]);
    expect(verdict.drift).toEqual([]);
    expect(verdict.admitted).toBe(1);
  });
});

/**
 * A gate cannot detect its own absence. These tests read the plugin list the
 * real build resolves, so removing `psiphonBrandPlugin()` from
 * `web/packages/build/vite/config.ts` fails here even though the build would
 * happily succeed.
 */
describe('the brand plugin is registered in the real vite config', () => {
  /**
   * Ask vite itself to resolve `web/packages/teleport/vite.config.mts`, and
   * report the plugin list it produced. This is the list the build runs, after
   * vite has flattened every nested array and sorted on `enforce`.
   *
   * It runs in a child process because the config is ESM and several of its
   * imports publish no CommonJS entry point, so jest cannot load them.
   */
  function resolvedPlugins(): { name: string; enforce?: string }[] {
    const packageRoot = resolve(__dirname, '..', '..');
    const script = [
      "import { resolveConfig } from 'vite';",
      "const c = await resolveConfig({ configFile: 'vite.config.mts' }, 'build', 'production', 'production');",
      'console.log(JSON.stringify(c.plugins.map(p => ({ name: p.name, enforce: p.enforce }))));',
    ].join('\n');
    const out = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      { cwd: packageRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return JSON.parse(out.trim().split('\n').pop() as string);
  }

  it('the plugin the fork ships declares enforce: pre', () => {
    // Without this the transform hook runs after vite:react-swc and receives
    // compiled jsx() calls, so a JSX text node is unreachable as text.
    expect(psiphonBrandPlugin().enforce).toBe('pre');
    expect(psiphonBrandPlugin().name).toBe('psiphon-brand');
  });

  it('psiphon-brand IS in the resolved plugin list', () => {
    const names = resolvedPlugins().map(p => p.name);
    expect(names).toContain('psiphon-brand');
  });

  it('psiphon-brand carries enforce: pre in the resolved plugin list', () => {
    const found = resolvedPlugins().find(p => p.name === 'psiphon-brand');
    expect(found).toBeDefined();
    expect(found?.enforce).toBe('pre');
  });

  it('psiphon-brand is ordered ahead of vite:react-swc', () => {
    const names = resolvedPlugins().map(p => p.name);
    const brand = names.indexOf('psiphon-brand');
    const react = names.indexOf('vite:react-swc');
    expect(brand).toBeGreaterThanOrEqual(0);
    expect(react).toBeGreaterThan(brand);
  });
});
