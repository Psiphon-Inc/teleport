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

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  BRAND_AREAS,
  BRAND_BASELINE,
  BRAND_BASELINE_BY_AREA,
  BRAND_CATALOG,
  EXCLUDED_HOSTS,
  PROTOCOL_ENTRIES,
  type BrandArea,
  type BrandBaselineEntry,
  type BrandPhrase,
} from './brandCatalog';
import {
  areaForPath,
  evaluateBrandGate,
  formatBrandReport,
  isScanned,
  validateCatalog,
} from './brandGate';
import {
  editsForRegion,
  matchNode,
  sortLongestFirst,
  visitNodes,
} from './brandMatcher';
import { applyBrandCatalog, shouldTransform } from './brandPlugin';
import {
  formatBundleReport,
  isBundleGateStrict,
  scanBundleResidual,
} from './bundleGate';

const EMPTY_BASELINE: Record<BrandArea, readonly BrandBaselineEntry[]> = {
  'discover-enrolment': [],
  'integrations-aws': [],
  'roles-users-tokens': [],
  'bots-workload-identity': [],
  'audit-sessions-recordings': [],
  'navigation-empty-dialogs': [],
  'account-support': [],
};

/**
 * Build a throwaway repository shaped like the real one, so a mutation test
 * runs in milliseconds instead of rescanning 1600 files.
 */
function fixtureRepo(files: Record<string, string>): {
  root: string;
  cleanup: () => void;
} {
  const root = mkdtempSync(join(tmpdir(), 'brand-gate-'));
  for (const [relative, contents] of Object.entries(files)) {
    const absolute = join(root, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents, 'utf8');
  }
  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function baselineOf(
  area: BrandArea,
  entries: BrandBaselineEntry[]
): Record<BrandArea, readonly BrandBaselineEntry[]> {
  return { ...EMPTY_BASELINE, [area]: entries };
}

const phrase = (over: Partial<BrandPhrase> = {}): BrandPhrase => ({
  source: 'Teleport Fixture',
  replacement: 'Psiphon Access Fixture',
  count: 1,
  tier: 'render',
  immutable: false,
  reason: 'fixture',
  ...over,
});

describe('psiphonBrand catalog shape', () => {
  it('ships seven leaf modules and every leaf is empty of authored copy', () => {
    expect(BRAND_AREAS).toHaveLength(7);
    for (const area of BRAND_AREAS) {
      // Acceptance criterion 9: the machinery child authors no replacement
      // copy. Every catalog leaf ships empty, so four authoring children can
      // fill disjoint files in parallel.
      expect(BRAND_CATALOG.filter(e => !e.immutable)).toHaveLength(0);
      expect(BRAND_BASELINE_BY_AREA[area]).toBeDefined();
    }
    expect(BRAND_CATALOG).toHaveLength(PROTOCOL_ENTRIES.length);
  });

  it('holds the five immutable entries and no pattern field', () => {
    expect(PROTOCOL_ENTRIES.map(e => e.source)).toEqual([
      'TeleportDatabaseAccess_${props.agentMeta.resourceName}',
      'TeleportDatabaseAccess',
      'TeleportDatabaseName',
      'Teleport-Mfa-Response',
      'X-Teleport-TokenName',
    ]);
    for (const entry of PROTOCOL_ENTRIES) {
      expect(entry.tier).toBe('protocol');
      expect(entry.immutable).toBe(true);
      expect(entry.replacement).toBe(entry.source);
      expect(typeof entry.source).toBe('string');
      expect(entry).not.toHaveProperty('pattern');
      expect(entry).not.toHaveProperty('regex');
    }
  });

  it('never holds the bare brand word as an entry source', () => {
    for (const entry of BRAND_CATALOG) {
      expect(entry.source.trim().toLowerCase()).not.toBe('teleport');
    }
  });
});

describe('psiphonBrand scan set', () => {
  it('covers all three packages and excludes tests, stories and itself', () => {
    expect(isScanned('web/packages/teleport/src/Login/Login.tsx')).toBe(true);
    expect(isScanned('web/packages/design/src/constants.ts')).toBe(true);
    // web/packages/shared HAS NO src directory.
    expect(
      isScanned('web/packages/shared/components/UnifiedResources/x.tsx')
    ).toBe(true);
    expect(isScanned('web/packages/teleport/src/Login/Login.test.tsx')).toBe(
      false
    );
    expect(isScanned('web/packages/teleport/src/Login/Login.story.tsx')).toBe(
      false
    );
    expect(
      isScanned('web/packages/teleport/src/psiphonBrand/brandCatalog.ts')
    ).toBe(false);
    expect(isScanned('web/packages/teleterm/src/x.ts')).toBe(false);
  });

  it('maps every file to exactly one area, with a total fallback', () => {
    expect(areaForPath('web/packages/teleport/src/Discover/x.tsx')).toBe(
      'discover-enrolment'
    );
    expect(areaForPath('web/packages/teleport/src/Integrations/x.tsx')).toBe(
      'integrations-aws'
    );
    expect(areaForPath('web/packages/teleport/src/Bots/x.tsx')).toBe(
      'bots-workload-identity'
    );
    expect(areaForPath('web/packages/teleport/src/Roles/x.tsx')).toBe(
      'roles-users-tokens'
    );
    expect(areaForPath('web/packages/teleport/src/Sessions/x.tsx')).toBe(
      'audit-sessions-recordings'
    );
    expect(areaForPath('web/packages/design/src/constants.ts')).toBe(
      'navigation-empty-dialogs'
    );
    expect(areaForPath('web/packages/teleport/src/config.ts')).toBe(
      'account-support'
    );
  });
});

describe('psiphonBrand matcher', () => {
  it('visits a string, a whole template and a JSX text node, and nothing else', () => {
    const code = [
      "import { thing } from './Teleport/path';",
      '// A comment naming Teleport must not be visited.',
      "const teleportIdentifier = 'Teleport Alpha';",
      'const t = `Resource [${name}] joined this Teleport Cluster.`;',
      'const e = <div title="Teleport Attribute">Join Teleport Now</div>;',
    ].join('\n');
    const nodes = visitNodes(code, 'x.tsx');
    const texts = nodes.map(n => `${n.kind}:${n.matchText}`);
    expect(texts).toContain('string:Teleport Alpha');
    expect(texts).toContain(
      'template:Resource [${name}] joined this Teleport Cluster.'
    );
    expect(texts).toContain('string:Teleport Attribute');
    expect(texts).toContain('jsxText:Join Teleport Now');
    // The import specifier and the comment are unreachable as visited nodes.
    expect(texts.some(t => t.includes('./Teleport/path'))).toBe(false);
    expect(texts.some(t => t.includes('must not be visited'))).toBe(false);
  });

  it('normalises a JSX text node that the formatter wrapped over three lines', () => {
    const code =
      'const e = <p>\n      Once you have downloaded\n      Teleport Connect, run it.\n    </p>;';
    const nodes = visitNodes(code, 'x.tsx').filter(n => n.kind === 'jsxText');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].matchText).toBe(
      'Once you have downloaded Teleport Connect, run it.'
    );
  });

  it('matches longest source first and consumes the region', () => {
    const code = 'const a = `TeleportDatabaseAccess_${props.name}`;';
    const node = visitNodes(code, 'x.ts')[0];
    const catalog = [
      phrase({
        source: 'TeleportDatabaseAccess_${props.name}',
        replacement: 'TeleportDatabaseAccess_${props.name}',
        immutable: true,
        tier: 'protocol',
      }),
      phrase({
        source: 'TeleportDatabaseAccess',
        replacement: 'TeleportDatabaseAccess',
        immutable: true,
        tier: 'protocol',
      }),
    ];
    const { regions, residuals } = matchNode(node, sortLongestFirst(catalog));
    expect(regions).toHaveLength(1);
    expect(regions[0].entry.source).toBe(
      'TeleportDatabaseAccess_${props.name}'
    );
    expect(residuals).toHaveLength(0);
  });

  it('reports a residual and excludes an occurrence inside an excluded host', () => {
    const code = [
      "const a = 'Welcome to Teleport';",
      "const b = 'https://goteleport.com/docs/x';",
    ].join('\n');
    const nodes = visitNodes(code, 'x.ts');
    const runs = nodes.flatMap(n => matchNode(n, []).residuals.map(r => r.run));
    expect(runs).toEqual(['Teleport']);
  });

  it('rewrites only the quasis of a template and never an expression span', () => {
    const code =
      'const m = `You were logged out of Teleport, but not out of ${connectorNameText}. See the Teleport logs.`;';
    const node = visitNodes(code, 'x.ts')[0];
    const entry = phrase({
      source:
        'You were logged out of Teleport, but not out of ${connectorNameText}. See the Teleport logs.',
      replacement:
        'You were logged out of Psiphon Access, but not out of ${connectorNameText}. See the Psiphon Access logs.',
    });
    const { regions } = matchNode(node, sortLongestFirst([entry]));
    expect(regions).toHaveLength(1);
    const edits = editsForRegion(node, regions[0]);
    // Two edits, one per quasi. The ${...} span is untouched.
    expect(edits).toHaveLength(2);
    let out = code;
    for (const edit of [...edits].reverse()) {
      out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    }
    expect(out).toContain('${connectorNameText}');
    expect(out).toContain('logged out of Psiphon Access');
    expect(out).toContain('See the Psiphon Access logs');
    expect(out).not.toContain('Teleport');
  });

  it('refuses a replacement that drops a template expression span', () => {
    const code = 'const m = `Added to ${name} Teleport Cluster.`;';
    const node = visitNodes(code, 'x.ts')[0];
    const entry = phrase({
      source: 'Added to ${name} Teleport Cluster.',
      replacement: 'Added to this Psiphon Access cluster.',
    });
    const { regions } = matchNode(node, sortLongestFirst([entry]));
    expect(() => editsForRegion(node, regions[0])).toThrow(
      /drops the template expression/
    );
  });

  it('refuses a JSX replacement that would inject markup', () => {
    const code = 'const e = <p>Join Teleport</p>;';
    const node = visitNodes(code, 'x.tsx').filter(n => n.kind === 'jsxText')[0];
    const entry = phrase({
      source: 'Join Teleport',
      replacement: 'Join <b>Psiphon Access</b>',
    });
    const { regions } = matchNode(node, sortLongestFirst([entry]));
    expect(() => editsForRegion(node, regions[0])).toThrow(
      /must not contain <, >, \{ or \}/
    );
  });

  it('escapes a replacement for the quote character it lands in', () => {
    const code = "const a = 'Teleport Home';";
    const node = visitNodes(code, 'x.ts')[0];
    const entry = phrase({
      source: 'Teleport Home',
      replacement: "Psiphon's Home",
    });
    const { regions } = matchNode(node, sortLongestFirst([entry]));
    const edits = editsForRegion(node, regions[0]);
    expect(edits[0].text).toBe("Psiphon\\'s Home");
  });
});

describe('psiphonBrand transform', () => {
  it('applies to all three packages and skips tests, stories and node_modules', () => {
    expect(
      shouldTransform('/repo/web/packages/teleport/src/Login/Login.tsx')
    ).toBe(true);
    expect(shouldTransform('/repo/web/packages/design/src/constants.ts')).toBe(
      true
    );
    expect(
      shouldTransform('/repo/web/packages/shared/components/X.tsx?used')
    ).toBe(true);
    expect(
      shouldTransform('/repo/web/packages/teleport/src/Login/Login.test.tsx')
    ).toBe(false);
    expect(
      shouldTransform('/repo/node_modules/x/web/packages/shared/a.ts')
    ).toBe(false);
    expect(shouldTransform('/repo/web/packages/teleterm/src/a.ts')).toBe(false);
  });

  it('rewrites a module and returns a source map rather than a bare string', () => {
    const code = "export const title = 'Teleport Fixture';\n";
    const result = applyBrandCatalog(code, 'x.ts', [phrase()]);
    expect(result).not.toBeNull();
    expect(result!.code).toBe(
      "export const title = 'Psiphon Access Fixture';\n"
    );
    expect(result!.map).toBeTruthy();
    expect(result!.map.mappings.length).toBeGreaterThan(0);
    expect(result!.map.sources).toContain('x.ts');
  });

  it('leaves a module alone when nothing matches', () => {
    expect(
      applyBrandCatalog("const a = 'nothing';\n", 'x.ts', [phrase()])
    ).toBeNull();
  });

  it('leaves the real committed source alone, because every leaf is empty', () => {
    // The whole point of the build-time transform: no committed UI source file
    // changes its copy, and the 27 coupled assertions keep passing untouched.
    const code = "export const MFA_HEADER = 'Teleport-Mfa-Response';\n";
    expect(applyBrandCatalog(code, 'api.ts')).toBeNull();
  });
});

describe('psiphonBrand catalog validation', () => {
  it('accepts the shipped catalog', () => {
    expect(validateCatalog(BRAND_CATALOG)).toEqual([]);
  });

  it.each([
    [
      'an empty source',
      phrase({ source: '', replacement: 'x' }),
      /empty source/,
    ],
    ['count below one', phrase({ count: 0 }), /requires an integer count >= 1/],
    [
      'immutable disagreeing with replacement',
      phrase({ immutable: true }),
      /but replacement differs from source/,
    ],
    [
      'protocol tier that is not immutable',
      phrase({ tier: 'protocol' }),
      /protocol tier and must be immutable/,
    ],
    ['an empty reason', phrase({ reason: '   ' }), /empty reason/],
  ])('rejects %s', (_label, entry, pattern) => {
    const problems = validateCatalog([entry]);
    expect(problems.join('\n')).toMatch(pattern);
  });

  it('rejects a duplicate source', () => {
    const problems = validateCatalog([phrase(), phrase()]);
    expect(problems.join('\n')).toMatch(/duplicates the source of entry 0/);
  });
});

describe('psiphonBrand gate, layer 1', () => {
  it('passes against the committed tree and prints the full report', () => {
    const evaluation = evaluateBrandGate();
    // eslint-disable-next-line no-console
    console.log(formatBrandReport(evaluation));

    expect(evaluation.invalidEntries).toEqual([]);
    expect(evaluation.deadEntries).toEqual([]);
    expect(evaluation.countMismatches).toEqual([]);
    expect(evaluation.ratchetFailures).toEqual([]);
    expect(evaluation.unknownPhrases).toEqual([]);

    expect(evaluation.counts.catalogEntries).toBe(5);
    expect(evaluation.counts.pass).toBe(5);
    expect(evaluation.counts.baselineEntries).toBe(BRAND_BASELINE.length);
    expect(evaluation.counts.baselined).toBe(BRAND_BASELINE.length);
    expect(evaluation.fileCount).toBeGreaterThan(1000);
  });

  it('is not vacuous: an unbaselined unbranded phrase raises UNKNOWN_PHRASE', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/Fixture.tsx':
        'export const F = () => <p>Add Teleport Resource Access</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [],
        EMPTY_BASELINE,
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.unknownPhrase).toBe(1);
      const message = evaluation.unknownPhrases[0];
      expect(message).toContain('UNKNOWN_PHRASE');
      expect(message).toContain('Add Teleport Resource Access');
      expect(message).toContain('Roles/Fixture.tsx:1');
      expect(message).toContain('roles-users-tokens');
    } finally {
      cleanup();
    }
  });

  it('admits the same phrase once its area baseline holds it', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/Fixture.tsx':
        'export const F = () => <p>Add Teleport Resource Access</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [],
        baselineOf('roles-users-tokens', [
          {
            source: 'Add Teleport Resource Access',
            count: 1,
            reason: 'fixture',
          },
        ]),
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.unknownPhrases).toEqual([]);
      expect(evaluation.counts.baselined).toBe(1);
    } finally {
      cleanup();
    }
  });

  it('raises RATCHET_FAIL when a baselined phrase stops appearing', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/Fixture.tsx':
        'export const F = () => <p>nothing branded here</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [],
        baselineOf('roles-users-tokens', [
          { source: 'Add Teleport Resource Access', count: 1, reason: 'x' },
        ]),
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.ratchetFail).toBe(1);
      expect(evaluation.ratchetFailures[0]).toContain(
        'no longer appears in the scan set'
      );
      expect(evaluation.ratchetFailures[0]).toContain(
        'ROLES_USERS_TOKENS_BASELINE'
      );
    } finally {
      cleanup();
    }
  });

  it('raises RATCHET_FAIL when a phrase is in both the catalog and the baseline', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/Fixture.tsx':
        'export const F = () => <p>Add Teleport Resource Access</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [
          phrase({
            source: 'Add Teleport Resource Access',
            replacement: 'Add Resource Access',
          }),
        ],
        baselineOf('roles-users-tokens', [
          { source: 'Add Teleport Resource Access', count: 1, reason: 'x' },
        ]),
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.ratchetFail).toBe(1);
      expect(evaluation.ratchetFailures[0]).toContain('is now a catalog entry');
    } finally {
      cleanup();
    }
  });

  it('raises DEAD_ENTRY for a catalog entry that matches nothing', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/Fixture.tsx':
        'export const F = () => <p>nothing branded here</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [phrase({ source: 'Teleport Ghost Phrase' })],
        EMPTY_BASELINE,
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.deadEntry).toBe(1);
      expect(evaluation.deadEntries[0]).toContain('matches nothing');
      expect(evaluation.deadEntries[0]).toContain('Teleport Ghost Phrase');
    } finally {
      cleanup();
    }
  });

  it('raises COUNT_MISMATCH when upstream adds another copy of a phrase', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/A.tsx':
        'export const A = () => <p>Add Teleport Resource Access</p>;\n',
      'web/packages/teleport/src/Roles/B.tsx':
        'export const B = () => <p>Add Teleport Resource Access</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [
          phrase({
            source: 'Add Teleport Resource Access',
            replacement: 'Add Resource Access',
            count: 1,
          }),
        ],
        EMPTY_BASELINE,
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.countMismatch).toBe(1);
      expect(evaluation.countMismatches[0]).toContain('expects count 1');
      expect(evaluation.countMismatches[0]).toContain('found 2');
      expect(evaluation.countMismatches[0]).toContain('Roles/A.tsx:1');
      expect(evaluation.countMismatches[0]).toContain('Roles/B.tsx:1');
    } finally {
      cleanup();
    }
  });

  it('raises COUNT_MISMATCH when a baselined phrase drifts', () => {
    const { root, cleanup } = fixtureRepo({
      'web/packages/teleport/src/Roles/A.tsx':
        'export const A = () => <p>Add Teleport Resource Access</p>;\n',
      'web/packages/teleport/src/Roles/B.tsx':
        'export const B = () => <p>Add Teleport Resource Access</p>;\n',
    });
    try {
      const evaluation = evaluateBrandGate(
        [],
        baselineOf('roles-users-tokens', [
          { source: 'Add Teleport Resource Access', count: 1, reason: 'x' },
        ]),
        EXCLUDED_HOSTS,
        root
      );
      expect(evaluation.counts.countMismatch).toBe(1);
      expect(evaluation.countMismatches[0]).toContain('a human must look');
    } finally {
      cleanup();
    }
  });
});

describe('psiphonBrand gate, layer 2', () => {
  it('switches strict enforcement on by itself when the baseline empties', () => {
    expect(isBundleGateStrict([])).toBe(true);
    expect(isBundleGateStrict([{ source: 'x', count: 1, reason: 'y' }])).toBe(
      false
    );
    // Today the shipped baseline is not empty, so the build reports instead of
    // throwing. No further commit turns this on.
    expect(isBundleGateStrict()).toBe(BRAND_BASELINE.length === 0);
  });

  it('is not vacuous: an unbranded phrase in an emitted chunk is a residual', () => {
    const result = scanBundleResidual(
      'app/app.js',
      'const a="Welcome to Teleport";',
      []
    );
    expect(result.residualOccurrences).toBe(1);
    expect(result.residuals[0].run).toBe('Teleport');
    expect(formatBundleReport([result], true)).toContain('1 unaccounted');
  });

  it('accounts for an immutable entry and for an excluded host', () => {
    const code =
      'const h="Teleport-Mfa-Response";const u="https://goteleport.com/docs/x";';
    const result = scanBundleResidual('app/app.js', code, PROTOCOL_ENTRIES);
    expect(result.totalOccurrences).toBe(2);
    expect(result.accountedByCatalog).toBe(1);
    expect(result.accountedByHost).toBe(1);
    expect(result.residualOccurrences).toBe(0);
  });

  it('would fail a bundle that shipped upstream copy under an empty catalog', () => {
    const clean = scanBundleResidual('app/app.js', 'const a="hello";', []);
    expect(clean.residualOccurrences).toBe(0);
    const dirty = scanBundleResidual(
      'app/app.js',
      'const a="Welcome to Teleport";const b="Teleport Identity Security";',
      []
    );
    expect(dirty.residualOccurrences).toBe(2);
  });
});
