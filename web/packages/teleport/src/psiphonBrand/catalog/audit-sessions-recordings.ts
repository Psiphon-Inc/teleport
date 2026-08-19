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
 * Brand catalog leaf: the audit log, active sessions and session recordings.
 *
 * One authoring child owns this file. Add an entry to `AUDIT_SESSIONS_RECORDINGS_ENTRIES` and
 * remove the matching entry from `AUDIT_SESSIONS_RECORDINGS_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const AUDIT_SESSIONS_RECORDINGS_ENTRIES: readonly BrandPhrase[] = [];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const AUDIT_SESSIONS_RECORDINGS_BASELINE: readonly BrandBaselineEntry[] =
  [
    {
      source:
        '---\ntitle: "Audit Event Reference"\ndescription: "Provides a comprehensive list of Teleport audit events and their fields."\n---\n{/* Generated file. Do not edit. */}\n{/* To regenerate, run \\`make audit-event-reference\\` */}\n\n${introParagraph}\n',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/gen-event-reference/gen-event-reference.ts',
    },
    {
      source: 'Clipboard Sharing disabled by Teleport RBAC.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/DesktopSession/useDesktopSession.tsx',
    },
    {
      source:
        'Creating Teleport [${resource_type}] [${teleport_id}] for [${integration}] [${resource_type}] [${external_id}] failed',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Creating Teleport [${resource_type}] [${teleport_id}] for [${integration}] [${resource_type}] [${external_id}] succeeded',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Deleting [${integration}] [${resource_type}] [${external_id}] / [${teleport_id}] failed',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Deleting [${integration}] [${resource_type}] [${external_id}] / [${teleport_id}] succeeded',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source: 'Directory Sharing disabled by Teleport RBAC.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/DesktopSession/useDesktopSession.tsx',
    },
    {
      source:
        'Downloading from https://cdn.teleport.dev/teleport-ent-v18.7.4-linux-amd64-bin.tar.gz and extracting teleport to /tmp ...',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source:
        'Fetching Teleport [${resource_type}] [${teleport_id}] for [${integration}] [${resource_type}] [${external_id}] failed',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Fetching Teleport [${resource_type}] [${teleport_id}] for [${integration}] [${resource_type}] [${external_id}] succeeded',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'HiDPI is not supported for this session. The version of Teleport running on the server may be too old.',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/DesktopSession/SessionSettings.tsx',
    },
    {
      source: 'Join Active Sessions With Teleport Enterprise',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Sessions/Sessions.tsx',
    },
    {
      source: 'Join Active Sessions with Teleport Enterprise',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Sessions/SessionList/SessionJoinBtn.tsx',
    },
    {
      source: 'Join as a moderator with Teleport Enterprise',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Sessions/SessionList/SessionJoinBtn.tsx',
    },
    {
      source:
        "PUT https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/example-dev-a1b2c3d4-workload-rg/providers/Microsoft.Compute/virtualMachines/example-dev-a1b2c3d4-vm-1/runCommands/teleport-install: 403 Forbidden: AuthorizationFailed: The client does not have authorization to perform action 'Microsoft.Compute/virtualMachines/runCommands/write' over scope.",
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source:
        'Patching Teleport [${resource_type}] [${teleport_id}] from [${integration}][${resource_type}] [${external_id}] failed',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Patching Teleport [${resource_type}] [${teleport_id}] from [${integration}][${resource_type}] [${external_id}] succeeded',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Proxy specified in update.yaml does not match teleport.yaml. refusing to install with conflicting proxy addresses',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source:
        'Updating Teleport [${resource_type}] [${teleport_id}] from [${integration}][${resource_type}] [${external_id}] failed',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Updating Teleport [${resource_type}] [${teleport_id}] from [${integration}][${resource_type}] [${external_id}] succeeded',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/makeEvent.ts',
    },
    {
      source:
        'Warning: adding an entry for ${e.code} (${e.raw.event}) with no example. Add a test fixture to web/packages/teleport/src/Audit/fixtures/index.ts',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/gen-event-reference/index.ts',
    },
    {
      source: 'arn:aws:iam::1234567890:role/teleport-db-role',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'example.teleport.sh',
      count: 6,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'gke_teleport-a',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'grv_teleport_desktop_hidpi',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from shared/components/DesktopSession/DesktopSession.tsx, teleport/src/services/storageService/types.ts',
    },
    {
      source: 'spiffe://example.teleport.com/bar',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'teleport has been installed successfully',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'teleport-spanner',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'teleport-tdpb-1.0',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/DesktopSession/DesktopSession.tsx',
    },
    {
      source: 'teleport/console',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Console/consoleContext.tsx',
    },
    {
      source: 'teleportdev',
      count: 2,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/Audit/fixtures/index.ts',
    },
    {
      source: 'web/packages/teleport/src/Audit/fixtures/index.ts',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/gen-event-reference/index.ts',
    },
    {
      source: 'web/packages/teleport/src/services/audit/makeEvent.ts',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/gen-event-reference/index.ts',
    },
    {
      source:
        '{/*cSpell:disable*/}\n\n{/* Formatted event examples sometimes include different capitalization than\nwhat we standardize on in the docs*/}\n{/* vale messaging.capitalization = NO */}\n\nTeleport components emit audit events to record activity within the cluster. \n\nAudit event payloads have an \\`event\\` field that describes the event, which is\noften an operation performed against a dynamic resource (e.g.,\n\\`access_list.create\\` for the creation of an Access List) or some other user\nbehavior, such as a local user login (\\`user.login\\`). The \\`code\\` field\nincludes a string with pattern \\`[A-Z0-9]{6}\\` that is unique to an audit event,\nsuch as \\`TAP03I\\` for the creation of an application resource.\n\nIn some cases, an audit event describes both a success state and a failure\nstate, while the \\`event\\` field is the same for both states. In this case, the\n\\`code\\` field differs between states. For example, \\`access_list.create\\`\ndescribes both successful and failed Access List creations, while the success\nevent has code \\`TAL001I\\` and the failure has code \\`TAL001E\\`. For other\nevents, like \\`db.session.query.failed\\` and \\`db.session.query\\`, the event\ntype describes only the success or failure state.\n\nYou can set up Teleport to export audit events to third-party services for\nstorage, visualization, and analysis. For more information, read [Exporting\nTeleport Audit Events](\n../zero-trust-access/export-audit-events/export-audit-events.mdx).',
      count: 1,
      reason:
        'Not yet authored. Upstream wording reaches a user from teleport/src/services/audit/gen-event-reference/index.ts',
    },
  ];
