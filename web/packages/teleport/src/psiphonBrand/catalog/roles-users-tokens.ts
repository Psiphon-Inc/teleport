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
 * Brand catalog leaf: roles, users, join tokens and access requests.
 *
 * One authoring child owns this file. Add an entry to `ROLES_USERS_TOKENS_ENTRIES` and
 * remove the matching entry from `ROLES_USERS_TOKENS_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const ROLES_USERS_TOKENS_ENTRIES: readonly BrandPhrase[] = [
  {
    source: 'Teleport',
    replacement: 'Psiphon Access',
    count: 5,
    tier: 'render',
    immutable: false,
    match: 'wholeNode',
    reason:
      'The product name standing alone in copy, at five visited nodes that hold the word and nothing else: the <BrandName> label in shared/components/AccessRequests/ReviewRequests/RequestView/RequestView.tsx, the diagram label in shared/components/LatencyDiagnostic/LatencyDiagnostic.tsx, the info-guide sentence in teleport/src/WorkloadIdentity/WorkloadIdentities.tsx, and the non-Beams branch of productName in teleport/src/Welcome/Welcome.tsx and teleport/src/components/Passkeys/PasskeyBlurb.tsx. Whole-node matching keeps it out of every longer phrase, which is why it cannot reach Welcome to Teleport',
  },
];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const ROLES_USERS_TOKENS_BASELINE: readonly BrandBaselineEntry[] = [
  {
    source:
      '\n  .teleport-resourcekind__value--unknown {\n    background: ${props => props.theme.colors.interactive.solid.alert.default};\n    .react-select__multi-value__label,\n    .react-select__multi-value__remove {\n      color: ${props => props.theme.colors.text.primaryInverse};\n    }\n  }\n',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/AdminRules.tsx',
  },
  {
    source:
      '\n  position: absolute;\n  // This z-index must be a higher value than the top bar z-index defined for\n  // Teleport web UI navigation found in teleport/src/Navigation/zIndexMap.ts.\n  // It prevents this SidePanel from rendering underneath the navigation bits.\n  z-index: 100;\n  top: 0px;\n  right: 0px;\n  background: ${({ theme }) => theme.colors.levels.sunken};\n  min-height: 100%;\n  width: 500px;\n  padding: 20px;\n\n  &.entering {\n    right: -500px;\n  }\n\n  &.entered {\n    right: 0px;\n    transition: right 300ms ease-out;\n  }\n\n  &.exiting {\n    right: -500px;\n    transition: right 300ms ease-out;\n  }\n\n  &.exited {\n    right: -500px;\n  }\n',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from shared/components/AccessRequests/NewRequest/RequestCheckout/RequestCheckout.tsx',
  },
  {
    source: 'Add Teleport Resource Access',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/Resources.tsx',
  },
  {
    source: 'Rules that allow connecting to resources controlled by Teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/Resources.tsx',
  },
  {
    source:
      'Rules that give this role administrative rights to Teleport resources',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/AdminRules.tsx',
  },
  {
    source:
      'Screenshot of a graph that visualizes access to Teleport resources',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/PolicyPlaceholder.tsx',
  },
  {
    source: 'Teleport Documentation.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AccessRequests/LockedAccessRequests/LockedAccessRequests.tsx',
  },
  {
    source: 'Teleport Preset Roles',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/Roles.tsx',
  },
  {
    source: 'Teleport Resources',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/AdminRules.tsx',
  },
  {
    source: 'Teleport Role Templates',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/Roles.tsx',
  },
  {
    source:
      'Teleport Role-based access control (RBAC) provides fine-grained control over who can access resources and in which contexts. A Teleport role can be assigned automatically based on user identity when used with single sign-on (SSO).',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/Roles.tsx',
  },
  {
    source: 'Teleport Users',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Users/Users.tsx',
  },
  {
    source: 'Teleport allows for two kinds of',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Users/Users.tsx',
  },
  {
    source: 'Teleport predicate language',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/AdminRules.tsx',
  },
  {
    source:
      'The database service labels control which Database Services (Teleport Agents) are visible to the user, which is required when adding Databases in the Enroll New Resource wizard. Access to Databases themselves is controlled by the Database Labels field.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/Resources.tsx',
  },
  {
    source:
      'There are Join Tokens for most types of infrastructure you can connect to Teleport that establish an identity for that infrastructure using metadata, such as AWS role, GitHub organization or TPM hash. These are called',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/JoinTokens/JoinTokens.tsx',
  },
  {
    source: 'This token is managed by Teleport Cloud.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/JoinTokens/JoinTokens.tsx',
  },
  {
    source: 'To take any action in Teleport, users must have at least one',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Users/Users.tsx',
  },
  {
    source:
      'Trusted Clusters allow Teleport administrators to connect multiple clusters together and establish trust between them. Users of Trusted Clusters can seamlessly access the resources of the leaf cluster from the root cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/TrustedClusters/TrustedClusters.tsx',
  },
  {
    source: 'Unlock Access Requests With Teleport Enterprise',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AccessRequests/LockedAccessRequests/LockedAccessRequests.tsx',
  },
  {
    source:
      'You cannot configure or delete static tokens via the web UI. Static tokens should be removed from your Teleport configuration file.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/JoinTokens/JoinTokens.tsx',
  },
  {
    source:
      'are how a Teleport agent authenticates itself to the Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/JoinTokens/JoinTokens.tsx',
  },
  {
    source: 'gravitational/teleport',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/JoinTokens/JoinTokenGithubForm.tsx, teleport/src/test/helpers/botInstances.ts',
  },
  {
    source: 'teleport-resourcekind__value--unknown',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Roles/RoleEditor/StandardEditor/AdminRules.tsx',
  },
  {
    source:
      'users are created and managed in Teleport and stored in the Auth Service backend.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Users/Users.tsx',
  },
];
