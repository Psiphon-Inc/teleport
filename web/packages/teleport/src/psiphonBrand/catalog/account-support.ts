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
 * Brand catalog leaf: account settings, support, login and everything not in another area.
 *
 * One authoring child owns this file. Add an entry to `ACCOUNT_SUPPORT_ENTRIES` and
 * remove the matching entry from `ACCOUNT_SUPPORT_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const ACCOUNT_SUPPORT_ENTRIES: readonly BrandPhrase[] = [];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const ACCOUNT_SUPPORT_BASELINE: readonly BrandBaselineEntry[] = [
  {
    source: ' - Configure your teleport agent',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source: ' - Download Teleport Connect',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/TcpAppConnectDialog.tsx',
  },
  {
    source: ' - Log in to Teleport',
    count: 6,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx, teleport/src/Apps/MCPAppConnectDialog.tsx, teleport/src/Apps/TcpAppConnectDialog.tsx',
  },
  {
    source: ' - Start VNet in Teleport Connect',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/TcpAppConnectDialog.tsx',
  },
  {
    source: ' - Start the Teleport agent with the configuration file',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source: ' - Start the Teleport agent with the generated configuration file',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source:
      '# POST ${cfg.api.bot.genWizardCiCd}\n:body\n\n# This is a mocked Terraform template\nresource "teleport_bot" "bot_name" {\n  version = "v1"\n\n  metadata = {\n    name = "bot_name"\n  }\n\n  spec = {\n    roles = ["access"]\n  }\n}\n',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/test/helpers/bots.ts',
  },
  {
    source: '$HOME/.config/teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/config.ts',
  },
  {
    source: '${DOWNLOAD_BASE_URL}teleport-${enterprise}${version}.pkg',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/links.ts',
  },
  {
    source:
      '${DOWNLOAD_BASE_URL}teleport-${enterprise}v${version}-${infix}-bin.tar.gz',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/links.ts',
  },
  {
    source:
      '* Note: For a self-hosted Teleport version, you may need to update DNS and obtain a TLS certificate for this application.\n            Learn more about application access ',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source: '- Download Teleport package to your computer',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source:
      '. Every request is authenticated and audited by Teleport, which also injects the provider API key - so no real key is needed locally.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/LLMAppConnectDialog.tsx',
  },
  {
    source: '234.dev-test.teleport',
    count: 4,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'Any non-empty value works; Teleport swaps in the real key.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/LLMAppConnectDialog.tsx',
  },
  {
    source:
      'Auth connectors allow Teleport to authenticate users via an external identity source such as Okta, Microsoft Entra ID, GitHub, etc. This authentication method is commonly known as single sign-on (SSO).',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AuthConnectors/AuthConnectors.tsx',
  },
  {
    source:
      "Choose if Teleport's appearance should be light or dark, or follow your computer's settings.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Account/Preferences.tsx',
  },
  {
    source:
      'Device Trust reduces the attack surface by enforcing that only trusted, registered devices can access your Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/DeviceTrust/EmptyList.tsx',
  },
  {
    source: 'Go to Teleport Customer Center',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/ManagedUpdates/ManagedUpdates/ManagedUpdates.tsx',
  },
  {
    source: 'Log into Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/LLMAppConnectDialog.tsx',
  },
  {
    source: 'Manual auth w/ users local to Teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AuthConnectors/AuthConnectorTile.tsx',
  },
  {
    source: 'Open Teleport-authenticated session in the browser:',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Databases/ConnectDialog/ConnectDialog.tsx, teleport/src/Kubes/ConnectDialog/ConnectDialog.tsx',
  },
  {
    source:
      'Open a Support ticket in the Teleport Customer Center to report this view and request assistance for next steps.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/ManagedUpdates/ManagedUpdates/ManagedUpdates.tsx',
  },
  {
    source: 'Teleport Home',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Scopes/LoginScopePicker.tsx',
  },
  {
    source: 'Teleport Okta',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'Teleport Version',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Clusters/ManageCluster/ManageCluster.tsx',
  },
  {
    source:
      'Teleport can automatically set up application access. Provide the name and URL of your application to generate our auto-installer script.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Automatically.tsx',
  },
  {
    source:
      'Teleport uses security devices - TPMs on Windows and Linux and secure enclaves on Macs to give every device a cryptographic identity.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/DeviceTrust/EmptyList.tsx',
  },
  {
    source:
      'The script will install the Teleport agent to provide secure access to your application.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Automatically.tsx',
  },
  {
    source:
      'Unable to access "${fqdn}". This may happen if your Teleport Proxy is using an untrusted or self-signed certificate. Please ensure Teleport Proxy service uses a valid certificate or access the application domain directly (https://${fqdn}${port}) and accept the certificate exception from your browser.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AppLauncher/AppLauncher.tsx',
  },
  {
    source: 'Unable to retrieve Teleport Context',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/useTeleport.ts',
  },
  {
    source: 'Unlock OIDC & SAML Single Sign-On with Teleport Enterprise',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AuthConnectors/ConnectorList/CTAConnectors.tsx',
  },
  {
    source: 'Unlock Trusted Devices With Teleport Enterprise',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/DeviceTrust/EmptyList.tsx',
  },
  {
    source:
      'You have been logged out of Teleport, but we were unable to log you out of ${connectorNameText}. See the Teleport logs for details.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/SingleLogoutFailed/SingleLogoutFailed.tsx',
  },
  {
    source: 'anthropic.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source:
      'automatically proxies connections from your computer to TCP apps available through Teleport. Any program on your device can connect to an application behind Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/TcpAppConnectDialog.tsx',
  },
  {
    source: 'awsconsole-1.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'bedrock.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'cloud-app.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'dev-test.teleport',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'example.teleport.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Clusters/fixtures/index.ts',
  },
  {
    source: 'export ANTHROPIC_API_KEY=teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/LLMAppConnectDialog.tsx',
  },
  {
    source: 'export KUBECONFIG=${HOME?}/teleport-kubeconfig.yaml',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Kubes/ConnectDialog/ConnectDialog.tsx',
  },
  {
    source: 'export OPENAI_API_KEY=teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/LLMAppConnectDialog.tsx',
  },
  {
    source: 'grafana.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'grv_teleport_access_graph_enabled',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_graph_iac_enabled',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_graph_query',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_graph_role_tester_enabled',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_graph_search_mode',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_graph_sql_enabled',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_access_list_preferences',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_app_launcher_fragment',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_cloud_user_invites',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_discover',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_enable_telemetry',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_external_audit_storage_disabled',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source:
      'grv_teleport_identity_security_recommendations_unified_resources_cta_seen',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_last_active',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_license_acknowledged',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_login_time',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_notification_states',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_onboard_survey',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_remembered_sso_username',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_scope_selected',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recording_sidebar_hidden',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recording_sidebar_width',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recording_timeline_height',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recording_timeline_hidden',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recording_timeline_show_absolute_time',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recordings_density',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recordings_dismissed_cta',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recordings_dismissed_setup',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_session_recordings_view_mode',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_sidenav_recent_history',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_token',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_token_renew',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_ui_theme',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_use_login_scope_picker',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_use_new_role_editor',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_use_topbar',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'grv_teleport_user_preferences',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/storageService/types.ts',
  },
  {
    source: 'https://${fqdn}${port}/x-teleport-auth',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/AppLauncher/AppLauncher.tsx',
  },
  {
    source: 'https://github.com/Psiphon-Inc/teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/accessBuild.ts',
  },
  {
    source: 'https://grafana.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'https://jenkins.teleport-proxy.com',
    count: 5,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts, teleport/src/Discover/AwsMangementConsole/fixtures.ts',
  },
  {
    source: 'https://mattermost1.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'https://slack.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'jenkins.teleport-proxy.com',
    count: 5,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts, teleport/src/Discover/AwsMangementConsole/fixtures.ts',
  },
  {
    source: 'mattermost.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'mcp-everything.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'openai-bedrock.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'openai.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source:
      'rendering OpenSSH config\\n\\twriting known_hosts to destination\\n\\t\\treading "/opt/teleport/identity/known_hosts"\\n\\t\\t\\topen /opt/teleport/identity/known_hosts: permission denied',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/test/helpers/botInstances.ts',
  },
  {
    source: 'saml_app_launch_url.teleport.com',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source: 'slack.teleport-proxy.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source:
      'some-long-cluster-public-url-name.cloud.teleport.gravitational.io:1234',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/mocks/contexts.ts',
  },
  {
    source: 'tcp-app.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source:
      'teleport configure --output=${configFile} --app-name=[example-app] --app-uri=http://localhost/ \\\n--roles=app --token=${token} --proxy=${host} --data-dir=${cfg.configDir}',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source: 'teleport start --config=${configFile}',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/AddApp/Manually.tsx',
  },
  {
    source: 'teleport-auth-01',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/test/helpers/instances.ts',
  },
  {
    source: 'teleport-web-ui',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/telemetry-boot.ts',
  },
  {
    source: 'teleport.internal/link',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/alerts/alerts.tsx',
  },
  {
    source: 'teleport.internal/link-text',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/alerts/alerts.tsx',
  },
  {
    source: 'teleport.internal/ver-in-use',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/alerts/alerts.tsx',
  },
  {
    source: 'tls-grpc-app.teleport.example.com',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Apps/fixtures/index.ts',
  },
  {
    source:
      'web/packages/teleport/src/ManagedUpdates/shared.tsx:259 ProgressBar fill on tonal neutral',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/psiphonContrast/pairs.ts',
  },
  {
    source:
      'web/packages/teleport/src/ManagedUpdates/shared.tsx:264 ProgressBar fill on tonal neutral',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/psiphonContrast/pairs.ts',
  },
];
