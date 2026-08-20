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
 * The dated bundle-side exclusion list for layer 2 of the brand gate.
 *
 * WHY IT EXISTS. Layer 1 reads source and accounts a phrase with a catalog
 * entry. Layer 2 reads the emitted bundle. Some occurrences in the bundle have
 * no source-side representation that a content-keyed catalog entry can ever
 * reach, so layer 1 cannot account them and layer 2 would fail forever. This
 * file names those occurrences, with a reason each, and it carries its own
 * ratchet so it can only shrink.
 *
 * WHAT MAY GO IN IT. An occurrence belongs here only when a catalog entry
 * cannot address it. Measured on 2026-08-19 there are exactly two such
 * reasons, and every record below states which one applies.
 *
 *   1. The occurrence is an identifier or a property name. ADR 0007 "The
 *      algorithm" step 2 forbids the scanner from visiting an identifier, so
 *      no `source` string can ever name one.
 *   2. The occurrence comes from a module outside the layer 1 scan set and
 *      outside `shouldTransform`. That set is `.ts` and `.tsx` under
 *      `web/packages/teleport/src`, `web/packages/design/src` and
 *      `web/packages/shared`. A dependency, a generated protobuf module and a
 *      `.jsx` module all sit outside it.
 *
 * WHAT MAY NOT GO IN IT. Copy. An unbranded phrase that a user reads belongs
 * in a catalog leaf or, until an authoring child reaches it, in that leaf's
 * source baseline. Two structural guards enforce this, and `bundleGate.test.ts`
 * asserts both: no record may hold the bare brand word, and every record must
 * be strictly longer than it. A record or a rule that could match a lone
 * `Teleport` is rejected before any bundle is read.
 *
 * THE RATCHET. Every record and every rule must match at least one occurrence
 * in the emitted bundle. One that matches nothing fails the build until
 * somebody removes it. The ratchet does not wait for strict mode, because it
 * measures the health of this file and not the state of the rebrand.
 *
 * The ratchet is on presence, not on count. `count` records what was measured
 * and the report prints the drift, but a changed count never fails the build.
 * Keying a hard failure on an occurrence count would fire on any dependency
 * bump that adds one CSS selector, and a gate that cries wolf gets deleted.
 *
 * TWO MEASURED GAPS ARE DELIBERATELY NOT IN THIS FILE. Both were found by
 * building the tree with every source baseline emptied and every catalog leaf
 * filled, which is the state that turns strict mode on.
 *
 *   1. Three occurrences where the WHOLE string is the bare brand word, all of
 *      them the design system CSS variable namespace: ``cssVarsPrefix:`teleport` ``,
 *      the preset ``name:`teleport` `` and the token path ``[`teleport`,`colors`]``.
 *      No record can name them, because the structural guard forbids a record
 *      as short as the brand word and that guard is what keeps copy out. They
 *      need a decision, not an exclusion.
 *   2. One occurrence of user-visible copy at
 *      `AuthConnectors/templates/github.yaml:16`, which the editor shows to a
 *      user. It reaches the bundle through `?raw`, so neither the layer 1 scan
 *      set nor `shouldTransform` sees it. It is copy, so it must not come here.
 */

/**
 * Which derived shape of an occurrence a record inspects.
 *
 * - `token`: the longest run of `[A-Za-z0-9_$./@-]` around the occurrence,
 *   trimmed of leading and trailing `.`, `/` and `@`. This keeps a dotted
 *   protobuf name, a kebab CSS class and a slashed path whole.
 * - `identifier`: the longest run of `[A-Za-z0-9_$]` around the occurrence.
 *   Use this when the token would drag in a neighbouring minified name, as
 *   `e.validTeleportConfig` does. The identifier is `validTeleportConfig`,
 *   which the minifier preserves because it is a property name.
 */
export type BundleShape = 'token' | 'identifier';

/** Why an occurrence is out of reach of a catalog entry. */
export type BundleCategory =
  /** A `.jsx` module. Neither the scan set nor the transform covers one. */
  | 'jsx-only-module'
  /** A class name emitted by the `@gravitational/design-system` dependency. */
  | 'dependency-css-class'
  /** A CSS custom property emitted from the design system `cssVarsPrefix`. */
  | 'dependency-css-var'
  /** A message type name in generated protobuf code under `gen/proto/ts`. */
  | 'generated-protobuf'
  /** An identifier or property name, which the scanner never visits. */
  | 'source-identifier';

/**
 * A named alphabet for the tail of a category rule. The data names the
 * alphabet, and `bundleGate.ts` holds the matcher. A rule therefore cannot
 * express an arbitrary pattern, which is the same discipline ADR 0007 applies
 * to the catalog.
 */
export type BundleTail =
  /** `[a-z0-9-]+`, one character or more. A kebab CSS name. */
  | 'lowerKebab'
  /** `pkg(.pkg)*.vN.Type(.Type)*`. A protobuf message type path. */
  | 'protobufTypePath';

/** One excluded occurrence, keyed on a single exact token or identifier. */
export interface BundleExclusion {
  /** The exact token or identifier. Never the bare brand word. */
  readonly token: string;
  /** Which derived shape `token` is compared against. */
  readonly shape: BundleShape;
  /** Why a catalog entry cannot reach it. */
  readonly category: BundleCategory;
  /** Occurrences measured at the baseline. A note, not a ratchet input. */
  readonly count: number;
  /** One sentence naming the emitter and what breaks on a rename. */
  readonly reason: string;
}

/**
 * A named category rule. It stands in for a set of records whose membership
 * churns with a code generator rather than with a human decision, so listing
 * the members one by one would fail the build on a regeneration that changed
 * nothing a reader can see.
 */
export interface BundleCategoryRule {
  /** Unique id, used in the report and in a ratchet message. */
  readonly id: string;
  /** Why a catalog entry cannot reach the members. */
  readonly category: BundleCategory;
  /** Which derived shape the rule is compared against. */
  readonly shape: BundleShape;
  /**
   * The token must start with this exact literal. It must contain the brand
   * word and be strictly longer than it, so no rule can match a lone
   * `Teleport`.
   */
  readonly prefix: string;
  /** Every character after `prefix` must satisfy this named alphabet. */
  readonly tail: BundleTail;
  /** Occurrences measured at the baseline. A note, not a ratchet input. */
  readonly count: number;
  /** Why a rule is right here instead of one record per member. */
  readonly reason: string;
}

/** The commit the list below was measured against. */
export const BUNDLE_BASELINE_COMMIT = 'e94e5af620c';

/** The date the list below was measured. */
export const BUNDLE_BASELINE_DATE = '2026-08-19';

/**
 * Named category rules. Measured against commit e94e5af620c on 2026-08-19.
 *
 * TWO rules, and the bar for a third is high. A rule is right only when the
 * membership of the category is decided by a generator. Everything else is a
 * record, because a record names one thing and a reader can check it.
 */
export const BUNDLE_CATEGORY_RULES: readonly BundleCategoryRule[] = [
  {
    id: 'generated-protobuf-type-name',
    category: 'generated-protobuf',
    shape: 'token',
    prefix: 'teleport.',
    tail: 'protobufTypePath',
    count: 66,
    reason:
      'A protobuf message type path emitted by protobuf-ts into gen/proto/ts, which sits outside the layer 1 scan set. The path is the wire type name that the proxy matches on, so a rename breaks desktop access, MFA and user preferences. A rule rather than 66 records because protoc decides the membership: regenerating from an upstream .proto adds or removes type names without any human touching the fork',
  },
  {
    id: 'design-system-css-var',
    category: 'dependency-css-var',
    shape: 'token',
    prefix: '--teleport-colors-',
    tail: 'lowerKebab',
    count: 2,
    reason:
      'A CSS custom property that @gravitational/design-system emits from its cssVarsPrefix of "teleport". A rule rather than records because the surviving set is whatever tree shaking keeps: any component change alters which colour tokens reach the bundle, so a record list would go stale on a change that a reader cannot see',
  },
];

/**
 * Individual exclusions. Measured against commit e94e5af620c on 2026-08-19.
 *
 * 30 records. Each names one token or one identifier, so a reader can check it
 * against the bundle without running anything.
 */
export const BUNDLE_EXCLUSIONS: readonly BundleExclusion[] = [
  // --- jsx-only-module: 2 records, 45 occurrences ---
  {
    token: 'ace-teleport',
    shape: 'token',
    category: 'jsx-only-module',
    count: 44,
    reason:
      'The ace editor theme class. TextEditor.jsx:120 passes it to setTheme and StyledTextEditor.jsx repeats it in every themed selector. Both are .jsx, so neither the layer 1 scan set nor shouldTransform reaches them, and the class name must match the value ace receives',
  },
  {
    token: 'ace-teleport.ace_multiselect',
    shape: 'token',
    category: 'jsx-only-module',
    count: 1,
    reason:
      'The same ace theme class with the ace_multiselect state class appended, from the compound selector at StyledTextEditor.jsx:61. Same .jsx module, same reason',
  },

  // --- dependency-css-class: 24 records, 24 occurrences ---
  {
    token: 'teleport-alert',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/feedback/alert/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-banner',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/feedback/banner/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-button',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/button recipe. design/src/Button/Button.tsx names the same prefix in its own force-state classes, but this occurrence is the dependency copy and no catalog entry reaches it',
  },
  {
    token: 'teleport-checkbox',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/checkbox recipe. design/src/Checkbox/Checkbox.tsx names the same prefix in its own force-state classes, but this occurrence is the dependency copy and no catalog entry reaches it',
  },
  {
    token: 'teleport-blockquote',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/blockquote/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-card',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/layout/card/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-code',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/code/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-container',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/container/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-date-picker',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/datePicker/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-dialog',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/overlays/dialog/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-field',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/field/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-heading',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/typography/heading/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-icon',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/button/IconButton.recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-icon-button',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/button/IconButton.recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-input',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/input/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-link',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/link/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-menu',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/overlays/menu/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-popover',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/overlays/popover/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-radio-group',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/radio/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-shimmer-box',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/feedback/shimmerBox/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-spinner',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/spinner/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-table',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/table/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-toggle',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/forms/toggle/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },
  {
    token: 'teleport-tooltip',
    shape: 'token',
    category: 'dependency-css-class',
    count: 1,
    reason:
      'Class name from @gravitational/design-system components/overlays/tooltip/recipe.js. The fork does not build that dependency, so no catalog entry can reach the string',
  },

  // --- source-identifier: 7 records, 21 occurrences ---
  {
    token: 'teleport_id',
    shape: 'identifier',
    category: 'source-identifier',
    count: 10,
    reason:
      'The audit event field name, read as an unquoted destructuring key in services/audit/makeEvent.ts. It is the wire field the audit log emits, and the scanner never visits a destructuring pattern',
  },
  {
    token: 'awsDeployTeleportServicePath',
    shape: 'identifier',
    category: 'source-identifier',
    count: 2,
    reason:
      'An api config property name declared at teleport/src/config.ts:545 and read at line 1773. ADR 0007 forbids the scanner from visiting an identifier, so no catalog entry can name it',
  },
  {
    token: 'getAwsDeployTeleportServiceUrl',
    shape: 'identifier',
    category: 'source-identifier',
    count: 2,
    reason:
      'A method name declared at teleport/src/config.ts:1770 and called from services/integrations/integrations.ts. ADR 0007 forbids the scanner from visiting an identifier, so no catalog entry can name it',
  },
  {
    token: 'installTeleport',
    shape: 'identifier',
    category: 'source-identifier',
    count: 2,
    reason:
      'A discovery config field name in services/discovery/discovery.ts. ADR 0007 forbids the scanner from visiting an identifier, so no catalog entry can name it',
  },
  {
    token: 'install_teleport',
    shape: 'identifier',
    category: 'source-identifier',
    count: 1,
    reason:
      'The wire field name the discovery API reads, written as an unquoted object key at services/discovery/discovery.ts:82. It is a protocol name that must not change, and the scanner never visits an object key',
  },
  {
    token: 'validTeleportConfig',
    shape: 'identifier',
    category: 'source-identifier',
    count: 2,
    reason:
      'The wire field name in the deployed database service response, declared at services/integrations/types.ts:909. It is a protocol name that must not change, and the scanner never visits an identifier',
  },
  {
    token: 'TeleportSetUp',
    shape: 'identifier',
    category: 'source-identifier',
    count: 2,
    reason:
      'A guide reference link key declared at Integrations/Enroll/AwsConsole/Guide.tsx:49 and read at line 67. It names no user-visible text, and the scanner never visits an object key',
  },
];
