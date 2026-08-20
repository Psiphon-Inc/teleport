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
 * Brand catalog leaf: navigation, empty states, dialogs and shared chrome.
 *
 * One authoring child owns this file. Add an entry to `NAVIGATION_EMPTY_DIALOGS_ENTRIES` and
 * remove the matching entry from `NAVIGATION_EMPTY_DIALOGS_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const NAVIGATION_EMPTY_DIALOGS_ENTRIES: readonly BrandPhrase[] = [
  {
    source: 'teleport',
    replacement: 'teleport',
    count: 22,
    tier: 'protocol',
    immutable: true,
    match: 'wholeNode',
    reason:
      'NONE OF THESE 22 NODES IS COPY, and every one of them names something outside this fork that a rename would break. They are: the deep-link URL scheme CUSTOM_PROTOCOL in shared/deepLinks.ts, which every teleport:// link depends on; the resource subKind of an SSH node, at 14 fixtures in teleport/src/Nodes/fixtures/index.ts and one in shared/hooks/useInfiniteScroll/testUtils.ts, which the backend sends and the UI switches on; the default GitHub repository name in teleport/src/Bots/Add/GitHubActionsK8s/useGitHubK8sFlow.tsx, which completes gravitational/teleport and names an upstream repository; the <Mark>teleport</Mark> binary name in teleport/src/Bots/InfoGuide.tsx, which a user types; the default Kubernetes namespace placeholder in teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx, which matches the upstream chart default; and the mock cluster name in teleport/src/SessionRecordings/mock.ts and teleport/src/SessionRecordings/list/mock.ts. Protocol tier because it is the strictest tier and forces immutability on all six uses at once',
  },
];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const NAVIGATION_EMPTY_DIALOGS_BASELINE: readonly BrandBaselineEntry[] =
  [
    {
      source:
        '\n            // This preserves white spaces from Go errors (mainly in Teleport Connect).\n            // Thanks to it, each error line is nicely indented with tab,\n            //  instead od being treated as a one, long line.\n            white-space: pre-wrap;\n            flex-shrink: ${wrapContents ? 0 : 1};\n          ',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Alert/Alert.tsx',
    },
    {
      source:
        "\n  // reset the appearance so we can style the background\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  border: 1.5px solid ${props => props.theme.colors.text.muted};\n  border-radius: ${props => props.theme.radii[2]}px;\n  background: transparent;\n  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};\n\n  position: relative;\n  margin: 0;\n\n  // Give it some animation, but don't animate focus-related properties.\n  transition:\n    border-color 150ms,\n    background-color 150ms,\n    box-shadow 150ms;\n\n  // State-specific styles. Note: the \"force\" classes are required for\n  // Storybook, where we want to show all the states, even though we can't\n  // enforce them.\n  &:enabled {\n    &:checked {\n      background-color: ${props => props.theme.colors.buttons.primary.default};\n      border-color: transparent;\n    }\n\n    &:hover,\n    .teleport-checkbox__force-hover & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[0]};\n      border-color: ${props => props.theme.colors.text.slightlyMuted};\n\n      &:checked {\n        background-color: ${props => props.theme.colors.buttons.primary.hover};\n        border-color: transparent;\n        box-shadow:\n          0px 2px 1px -1px rgba(0, 0, 0, 0.2),\n          0px 1px 1px 0px rgba(0, 0, 0, 0.14),\n          0px 1px 3px 0px rgba(0, 0, 0, 0.12);\n      }\n    }\n\n    &:focus-visible,\n    .teleport-checkbox__force-focus-visible & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[0]};\n      border-color: ${props => props.theme.colors.buttons.primary.default};\n      outline: none;\n      border-width: 2px;\n\n      &:checked {\n        background-color: ${props =>\n          props.theme.colors.buttons.primary.default};\n        border-color: transparent;\n        outline: 2px solid\n          ${props => props.theme.colors.buttons.primary.default};\n        outline-offset: 1px;\n      }\n    }\n\n    &:active,\n    .teleport-checkbox__force-active & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[1]};\n      border-color: ${props => props.theme.colors.text.slightlyMuted};\n\n      &:checked {\n        background-color: ${props => props.theme.colors.buttons.primary.active};\n        border-color: transparent;\n      }\n    }\n  }\n\n  &:disabled {\n    background-color: ${props =>\n      props.theme.colors.interactive.tonal.neutral[0]};\n    border-color: transparent;\n  }\n\n  ${size}\n",
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Checkbox/Checkbox.tsx',
    },
    {
      source:
        "\n  appearance: none;\n  border-style: solid;\n  border-color: ${props => props.theme.colors.text.muted};\n  border-radius: 50%;\n  background-color: transparent;\n  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};\n\n  position: relative;\n  margin: 0;\n\n  // Give it some animation, but don't animate focus-related properties.\n  transition:\n    border-color 150ms,\n    background-color 150ms,\n    box-shadow 150ms;\n\n  // State-specific styles. Note: the \"force\" classes are required for\n  // Storybook, where we want to show all the states, even though we can't\n  // enforce them.\n  &:enabled {\n    &:checked {\n      border-color: ${props =>\n        props.theme.colors.interactive.solid.primary.default};\n    }\n\n    &:hover,\n    .teleport-radio-button__force-hover & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[0]};\n      border-color: ${props => props.theme.colors.text.slightlyMuted};\n      box-shadow:\n        0px 2px 1px -1px rgba(0, 0, 0, 0.2),\n        0px 1px 1px 0px rgba(0, 0, 0, 0.14),\n        0px 1px 3px 0px rgba(0, 0, 0, 0.12);\n\n      &:checked {\n        background-color: transparent;\n        border-color: ${props =>\n          props.theme.colors.interactive.solid.primary.hover};\n      }\n    }\n\n    &:focus-visible,\n    .teleport-radio-button__force-focus-visible & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[0]};\n      border-color: ${props =>\n        props.theme.colors.interactive.solid.primary.default};\n      outline: 3px solid\n        ${props => props.theme.colors.interactive.solid.primary.default};\n      outline-offset: -1px;\n\n      &:checked {\n        border-color: ${props =>\n          props.theme.colors.interactive.solid.primary.default};\n        background-color: transparent;\n      }\n    }\n\n    &:active,\n    .teleport-radio-button__force-active & {\n      background-color: ${props =>\n        props.theme.colors.interactive.tonal.neutral[1]};\n      border-color: ${props => props.theme.colors.text.slightlyMuted};\n\n      &:checked {\n        border-color: ${props =>\n          props.theme.colors.interactive.solid.primary.active};\n        background-color: transparent;\n      }\n    }\n  }\n\n  &:disabled {\n    border-color: ${props => props.theme.colors.text.disabled};\n  }\n\n  ${size}\n",
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/RadioButton/RadioButton.tsx',
    },
    {
      source:
        '\n  border-radius: 50%;\n  position: absolute;\n  ${indicatorSize}\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  margin: auto;\n  pointer-events: none;\n  opacity: 0;\n\n  transition: all 150ms;\n\n  input:checked + & {\n    opacity: 1;\n  }\n\n  input:enabled + & {\n    background: ${props =>\n      props.theme.colors.interactive.solid.primary.default};\n  }\n\n  input:enabled:hover + &,\n  .teleport-radio-button__force-hover input + & {\n    background-color: ${props =>\n      props.theme.colors.interactive.solid.primary.hover};\n  }\n\n  input:enabled:focus-visible + &,\n  .teleport-radio-button__force-focus-visible input + & {\n    background-color: ${props =>\n      props.theme.colors.interactive.solid.primary.default};\n  }\n\n  input:enabled:active + &,\n  .teleport-radio-button__force-active input + & {\n    background-color: ${props =>\n      props.theme.colors.interactive.solid.primary.active};\n  }\n\n  input:disabled + & {\n    background-color: ${props => props.theme.colors.text.disabled};\n  }\n',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/RadioButton/RadioButton.tsx',
    },
    {
      source: ' with Teleport Enterprise',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/ExternalAuditStorageCta/ExternalAuditStorageCta.tsx',
    },
    {
      source:
        '${url}?product=teleport&version=${verPrefix}_${version}${anchorHash}',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Support/Support.tsx',
    },
    {
      source: '&:active, .teleport-button__force-active &',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Button/Button.tsx',
    },
    {
      source: '&:focus-visible, .teleport-button__force-focus-visible &',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Button/Button.tsx',
    },
    {
      source: '&:hover, .teleport-button__force-hover &',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Button/Button.tsx',
    },
    {
      source: 'Affected Teleport',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/UnifiedResources/shared/StatusInfo.tsx',
    },
    {
      source:
        'Companies may use Teleport Community Edition on the condition they have less than 100 employees and less than $10MM in annual revenue. If your company exceeds these limits, please',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/Login.tsx',
    },
    {
      source:
        "Connect your own AWS account to store audit logs and session recordings on your own infrastructure${\n                featureEnabled ? '' : ' with Teleport Enterprise'\n              }.",
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/ExternalAuditStorageCta/ExternalAuditStorageCta.tsx',
    },
    {
      source: 'Download Teleport Connect',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/DownloadConnect/DownloadConnect.tsx',
    },
    {
      source:
        'Insufficient permissions. Reach out to your Teleport administrator\n    to request External Audit Storage permissions.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/ExternalAuditStorageCta/ExternalAuditStorageCta.tsx',
    },
    {
      source:
        'Psiphon Access is based on Teleport by Gravitational, Inc. It is not affiliated with, nor endorsed by, Gravitational, Inc.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/Login.tsx',
    },
    {
      source: 'Self-Hosting Teleport',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Support/Support.tsx',
    },
    {
      source: 'Sign in to Teleport',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/FormLogin/FormLogin.tsx',
    },
    {
      source: 'Sign in to Teleport with SSO',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/FormLogin/FormLogin.tsx',
    },
    {
      source: 'Teleport Blog',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Support/Support.tsx',
    },
    {
      source: 'Teleport Connect',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/DownloadConnect/DownloadConnect.tsx',
    },
    {
      source: 'Teleport Identity Governance',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/constants.ts',
    },
    {
      source: 'Teleport Identity Security',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/constants.ts, teleport/src/Roles/RoleEditor/RoleEditorVisualizer.tsx',
    },
    {
      source: 'Teleport Resources Home',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/TopBar/TopBar.tsx',
    },
    {
      source: 'Teleport Version:',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Support/Support.tsx',
    },
    {
      source: 'Teleport database',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/UnifiedResources/shared/StatusInfo.tsx',
    },
    {
      source: 'Teleport logo',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/TopBar/TopBar.tsx',
    },
    {
      source:
        'Teleport provides users the ability to add labels (in the form of key:value pairs) to resources. Some valid example labels are “env: prod” and “arch: x86_64”. Labels, used in conjunction with roles, define access in Teleport. For example, you can specify that users with the “on-call” role can access resources labeled “env: prod”. For more information, check out our documentation on',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/LabelSelector/LabelSelector.tsx',
    },
    {
      source: 'This is an independently compiled AGPL-3.0 version of Teleport.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Navigation/Section.tsx',
    },
    {
      source: "Unable to log in, please check Teleport's log for details.",
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/LoginFailed.tsx',
    },
    {
      source: 'Upgrade to Teleport Enterprise',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Navigation/Section.tsx',
    },
    {
      source: 'Welcome to Teleport',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/Login.tsx',
    },
    {
      source:
        'You are not authorized. Please contact your Teleport administrator.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/LoginFailed.tsx',
    },
    {
      source:
        'Your account is a member of more than 150 Entra ID groups. Please contact your SSO administrator to configure Graph API access on the Teleport SAML connector.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/LoginFailed.tsx',
    },
    {
      source: 'icon icon-teleportlogo',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from design/src/Icon/Icons/TeleportLogo.tsx',
    },
    {
      source:
        'not running network health checks for the database endpoint. User connections will not be routed through affected Teleport database services as long as other database services report a healthy connection to the database.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/UnifiedResources/shared/StatusInfo.tsx',
    },
    {
      source: 'powered by teleport',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/components/PoweredByTeleportLogo/PoweredByTeleportLogo.tsx',
    },
    {
      source: 'teleport-logo',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/TopBar/TopBar.tsx',
    },
    {
      source: 'teleport-mcp-${appName}',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/services/mcp/client.ts',
    },
    {
      source: 'teleport.icon',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/UnifiedResources/shared/guessAppIcon.ts',
    },
    {
      source: 'to evaluate and use Teleport.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Login/Login.tsx',
    },
  ];
