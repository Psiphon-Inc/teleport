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
 * Brand catalog leaf: bots, machine ID and workload identity.
 *
 * One authoring child owns this file. Add an entry to `BOTS_WORKLOAD_IDENTITY_ENTRIES` and
 * remove the matching entry from `BOTS_WORKLOAD_IDENTITY_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const BOTS_WORKLOAD_IDENTITY_ENTRIES: readonly BrandPhrase[] = [];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const BOTS_WORKLOAD_IDENTITY_BASELINE: readonly BrandBaselineEntry[] = [
  {
    source:
      '# This file contains a GitHub Actions workflow which enrolls with Teleport in\n# order to access a Kubernetes cluster using kubectl or other tools compatible\n# with kubeconfig, such as Helm.\n\n# Save this file to your GitHub repository in \\`.github/workflows\\`. You can edit\n# the events that trigger your workflow, such as when pushing to a named branch\n# or triggering it manually.\n\n# Note: the workflow file may need to exist on the "main branch" in your repo\n# before it will appear in GitHub Actions.\n\n# For more information about using GitHub Actions read the getting started\n# guide; https://docs.github.com/en/actions/get-started/quickstart\n\non: workflow_dispatch\n\nenv:\n  TELEPORT_PROXY_ADDR: :cluster_public_url\n  TELEPORT_JOIN_TOKEN_NAME: :token_name\n  TELEPORT_K8S_CLUSTER_NAME: :kubernetes_cluster\n\njobs:\n  demo:\n    permissions:\n      # The "id-token: write" permission is required or \\`tbot\\` will not be able\n      # to authenticate with the cluster.\n      id-token: write\n      contents: read\n    name: Teleport Kubernetes Access\n    runs-on: ubuntu-latest\n\n    steps:\n    - name: Checkout repository\n      uses: actions/checkout@v5\n\n    - name: Fetch Teleport binaries\n      uses: teleport-actions/setup@v1\n      with:\n        version: auto\n        proxy: \\${{ env.TELEPORT_PROXY_ADDR }}\n\n    - name: Fetch credentials using Machine & Workload Identity\n      uses: teleport-actions/auth-k8s@v2\n      with:\n        proxy: \\${{ env.TELEPORT_PROXY_ADDR }}\n        token: \\${{ env.TELEPORT_JOIN_TOKEN_NAME }}\n        kubernetes-cluster: \\${{ env.TELEPORT_K8S_CLUSTER_NAME }}\n        # Enable the submission of anonymous usage telemetry. This helps us\n        # shape the future development of \\`tbot\\`. You can disable this by\n        # omitting this.\n        anonymous-telemetry: 1\n\n    # Use kubectl or other compatible tools to interact with your Kubernetes\n    # cluster.\n    - name: List pods\n      run: kubectl version\n',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/templates.ts',
  },
  {
    source:
      'GitHub Actions is a popular CI/CD platform that works as a part of the larger GitHub ecosystem. Teleport Machine ID allows GitHub Actions to securely interact with Teleport protected resources without the need for long-lived credentials. Through this integration, Teleport will create a bot-specific role that scopes its permissions in your Teleport instance to the necessary resources and provide inputs for your GitHub Actions YAML configuration.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/ConfigureBot.tsx',
  },
  {
    source:
      'GitHub Enterprise Server Host requires Teleport Enterprise. Please use a repository hosted at github.com or',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/ConnectGitHub.tsx',
  },
  {
    source:
      'GitHub Enterprise Server configuration requires Teleport Enterprise. Please use a repository hosted at github.com or',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/ConnectGitHub.tsx, teleport/src/JoinTokens/JoinTokenGithubForm.tsx',
  },
  {
    source:
      'Instances requiring an upgrade are running one major version behind the Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Dashboard/BotInstanceDashboard.tsx',
  },
  {
    source:
      'Instances with a patch available are running the same major version as the Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Dashboard/BotInstanceDashboard.tsx',
  },
  {
    source:
      'Insufficient permissions. Reach out to your Teleport administrator\n    to request bot creation permissions.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/List/Bots.tsx',
  },
  {
    source:
      'Specifying a branch is recommended to prevent workflows running from unintended branches (such as PR branches) from accessing your Teleport resources.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/ConnectGitHub.tsx',
  },
  {
    source: 'Teleport Kubernetes Access Controls',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/ConfigureAccess.tsx',
  },
  {
    source: 'Teleport Labels',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/KubernetesLabelsSelect.tsx',
  },
  {
    source:
      'Teleport Machine & Workload Identity replaces passwords, API, and static keys with short-lived SSH and X.509 certificates.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/List/EmptyState/EmptyState.tsx',
  },
  {
    source:
      'Teleport Machine & Workload Identity replaces shared credentials and secrets with short-lived X.509 or SSH certificates and gives you a unified plan to register, define access policies, and audit all your workflows.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/List/EmptyState/EmptyState.tsx',
  },
  {
    source:
      'Teleport Machine ID replaces passwords, API, and static keys with short-lived SSH and x.509 certificates.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/List/EmptyState/EmptyState.tsx',
  },
  {
    source: 'Teleport Workload Identity is compatible with the open-source',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/WorkloadIdentity/WorkloadIdentities.tsx',
  },
  {
    source:
      'Teleport has created a role, a bot, and a join token. Below is an example GitHub Actions workflow to help you get started. You can find this again from the bot’s options dropdown.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/AddBotToWorkflow.tsx',
  },
  {
    source:
      'Teleport supports secure joining on both GitHub-hosted and self-hosted GitHub Actions runners as well as GitHub Enterprise Server.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/ConfigureBot.tsx',
  },
  {
    source:
      'These first fields will enable Teleport to scope access to only what is needed by your GitHub Actions workflow.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/ConfigureBot.tsx',
  },
  {
    source: 'This instance is running using the Teleport Kubernetes Operator.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Details/InfoTab.tsx',
  },
  {
    source: 'This instance is running using the Teleport Terraform Provider.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Details/InfoTab.tsx',
  },
  {
    source:
      'Unsupported instances are running two or more major versions behind the Teleport cluster, or are running a newer version.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Dashboard/BotInstanceDashboard.tsx',
  },
  {
    source:
      'Up-to-date instances are running the same version as the Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/Dashboard/BotInstanceDashboard.tsx',
  },
  {
    source:
      'Use Machine & Workload Identity (MWI) to authenticate Spacelift runs with Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/AddBotsPicker.tsx',
  },
  {
    source:
      'Use Machine & Workload Identity (MWI) to grant GitHub Actions CI/CD access to Teleport resources.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/AddBotsPicker.tsx',
  },
  {
    source:
      'Use the options below to further restrict which workflows can access your Teleport resources.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/ConnectGitHub.tsx',
  },
  {
    source:
      'When using GitHub Enterprise Server (GHES), allows the JSON Web Key Set (JWKS) used to verify the token issued by GitHub Actions to be overridden. This can be used in scenarios where the Teleport Auth Service is unable to reach a GHE server.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/ConnectGitHub.tsx',
  },
  {
    source:
      'You don’t have sufficient permissions to create bots. Reach out to your Teleport administrator to request additional permissions.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/AddBotsPicker.tsx',
  },
  {
    source: 'Your Bot is Added to Teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/Finish.tsx',
  },
  {
    source:
      'are identities a machine can use to authenticate to the Teleport cluster. This allows processes like automated tests, Infrastructure-as-Code/provisioning tools like Terraform or Ansible and scripts to',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/InfoGuide.tsx',
  },
  {
    source: 'clients interacting with their Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/BotInstances/InfoGuide.tsx',
  },
  {
    source:
      'docs for information about setting up and using IaC with Teleport.',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/Finish.tsx, teleport/src/Bots/Add/GitHubActionsK8s/Welcome.tsx',
  },
  {
    source:
      "gha-${state.info?.owner ?? 'gravitational'}-${state.info?.repository ?? 'teleport'}",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsK8s/useGitHubK8sFlow.tsx',
  },
  {
    source: 'has been successfully added to this Teleport Cluster. You can see',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/Finish.tsx',
  },
  {
    source:
      'on:\n  push:\n    branches:\n    - main\njobs:\n  demo:\n    permissions:\n      # The "id-token: write" permission is required or Machine ID will not be\n      # able to authenticate with the cluster.\n      id-token: write\n      contents: read\n    ${includeNameComment ? \'# if you added a workflow name in the previous step, make sure you use the same value here\' : \'\'}\n    name: ${botName}-example\n    runs-on: ubuntu-latest\n    steps:\n    - name: Checkout repository\n      uses: actions/checkout@v3\n    - name: Fetch Teleport binaries\n      uses: teleport-actions/setup@v1\n      with:\n        version: ${version}\n    # server access example\n    - name: Fetch credentials using Machine & Workload Identity\n      id: auth\n      uses: teleport-actions/auth@v2\n      with:\n        proxy: ${proxyAddr}\n        token: ${tokenName}\n        # Enable the submission of anonymous usage telemetry. This\n        # helps us shape the future development of \\`tbot\\`. You can disable this\n        # by omitting this.\n        anonymous-telemetry: 1\n    - name: List nodes (tsh)\n      # Enters a command from the cluster, in this case "tsh ls" using Machine\n      # ID credentials to list remote SSH nodes.\n      run: tsh ls',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/Add/GitHubActionsSsh/AddBotToWorkflow.tsx',
  },
  {
    source: 'protected by the Teleport proxy.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Bots/InfoGuide.tsx',
  },
  {
    source: 'teleport.internal/resource-id',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/joinToken/makeJoinToken.ts',
  },
  {
    source: 'teleport.internal/ui-flow',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/services/bot/consts.ts',
  },
];
