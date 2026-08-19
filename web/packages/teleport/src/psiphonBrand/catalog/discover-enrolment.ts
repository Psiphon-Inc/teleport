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
 * Brand catalog leaf: the Discover resource enrolment flow.
 *
 * One authoring child owns this file. Add an entry to `DISCOVER_ENROLMENT_ENTRIES` and
 * remove the matching entry from `DISCOVER_ENROLMENT_BASELINE` in the same commit. The
 * gate raises RATCHET_FAIL when a phrase is in both, and UNKNOWN_PHRASE when a
 * phrase is in neither.
 */

import type { BrandBaselineEntry, BrandPhrase } from '../brandCatalog';

/** Catalog entries for this area. Empty until an authoring child fills it. */
export const DISCOVER_ENROLMENT_ENTRIES: readonly BrandPhrase[] = [];

/**
 * Phrases in this area that reach a user and that no catalog entry covers yet.
 * Measured against commit 410659d70d0 on 2026-08-19 by `brandGate.ts`.
 * The baseline can only shrink (ratchet rule).
 */
export const DISCOVER_ENROLMENT_BASELINE: readonly BrandBaselineEntry[] = [
  {
    source:
      ') to pull the public Teleport image and to reach your Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source:
      '*Only required if your database is configured with a certificate signed by a third-party CA. Adding a copy allows Teleport to trust it.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/MutualTls/MutualTls.tsx',
  },
  {
    source: '. Reach out to your Teleport administrator to enable',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/PermissionsErrorMessage.tsx',
  },
  {
    source:
      '. Reach out to your Teleport administrator to request additional permissions.',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/PermissionsErrorMessage.tsx, teleport/src/Integrations/Enroll/IntegrationTiles/IntegrationTiles.tsx',
  },
  {
    source: '1. Installing Teleport agent',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/AgentWaitingDialog.tsx',
  },
  {
    source: '1. Installing Teleport agent...',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/EnrollmentDialog.tsx',
  },
  {
    source: '2. Waiting for the Teleport agent to come online (1-5 minutes)',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/EnrollmentDialog.tsx',
  },
  {
    source: '2. Waiting for the Teleport agent to come online (1-5 minutes)...',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/AgentWaitingDialog.tsx',
  },
  {
    source:
      'AWS Management Console will launch in another tab. You should see your Teleport user name as a federated login with the selected role in the top-right corner of the AWS Console.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/AwsMangementConsole/TestConnection/TestConnection.tsx',
  },
  {
    source: 'Add teleport-agent chart to your charts repository',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/ManualHelmDialog.tsx, teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source:
      'After running the command above, we&apos;ll automatically detect your new Teleport database service.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/ManualDeploy/ManualDeploy.tsx',
  },
  {
    source:
      'After running the command above, we&apos;ll automatically detect your new Teleport instance.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DownloadScript/DownloadScript.tsx',
  },
  {
    source: 'Already have Teleport Connect? Skip to the next step.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source: 'An identifier name for this new database for Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/CreateDatabase/CreateDatabase.tsx',
  },
  {
    source:
      'Ask your Teleport administrator to update your role with the following:',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/AwsAccount/AwsAccount.tsx',
  },
  {
    source: 'Configure Teleport Discovery Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryService.tsx',
  },
  {
    source: 'Create a teleport.yaml file',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'Defaulted to your teleport username',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/TestConnection/TestConnection.tsx',
  },
  {
    source: 'Deploy Teleport Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source: 'Deploy the Teleport Database Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source:
      'Discovery config defines the setup that enables Teleport to automatically discover and register instances.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.tsx',
  },
  {
    source: 'Download and Install Teleport Connect',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source: 'Enable Access to AWS with Teleport Application Access',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/AwsMangementConsole/CreateAppAccess/CreateAppAccess.tsx',
  },
  {
    source:
      'Generate a command to automatically configure and install the teleport-agent namespace',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source:
      'Install Teleport Service in your cluster via Helm to easily connect your Kubernetes cluster with Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source: 'Install and configure the Teleport SSH Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DownloadScript/DownloadScript.tsx',
  },
  {
    source:
      'Instead of storing long-lived static credentials, Teleport will request short-lived credentials from AWS to perform operations automatically.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/AwsAccount/AwsAccount.tsx',
  },
  {
    source:
      'List of Kubernetes users and groups you want Teleport users to be able to authenticate as.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source: 'Log into your Teleport cluster',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/TestConnection/TestConnection.tsx',
  },
  {
    source: 'Log into your Teleport cluster:',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/AwsMangementConsole/TestConnection/TestConnection.tsx, teleport/src/Discover/Database/TestConnection/TestConnection.tsx',
  },
  {
    source:
      'Name an IAM role for the Teleport Database Service and generate a configuration command. The generated command will create the role and configure permissions for it in your AWS account.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source: 'Name shown to Teleport users connecting to the cluster',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source: 'Network egress from your Kubernetes cluster to Teleport.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source:
      'Note: Ensure that you have no higher-priority md5 authentication rules that will match, otherwise PostgreSQL will offer them first, and the certificate-based Teleport login will fail.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/SetupAccess/SetupAccess.tsx',
  },
  {
    source:
      'On the host where you will run the Discovery Service, create a systemd service configuration for Teleport, enable the Teleport service, and start Teleport:',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source:
      'On the host where you will run the Discovery Service, enable and start Teleport:',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source:
      'On the host where you will run the Teleport Database Service, execute the generated command that will install and start Teleport with the appropriate configuration.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/ManualDeploy/ManualDeploy.tsx',
  },
  {
    source:
      'Once you’ve downloaded Teleport Connect, run the installer to add it to your computer’s applications.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source:
      'Please ask your Teleport administrator to update your role and add the',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/CreateDatabase/CreateDatabase.tsx, teleport/src/Discover/Database/MutualTls/MutualTls.tsx, teleport/src/Discover/Shared/ConnectionDiagnostic/ConnectionDiagnosticResult.tsx',
  },
  {
    source:
      'Please ask your Teleport administrator to update your role and add the required',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/SetupAccess/AccessInfo.tsx',
  },
  {
    source: 'Please ask your Teleport administrator to update your role:',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/SetupAccess/AccessInfo.tsx',
  },
  {
    source: 'Redeploy Teleport Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source:
      'Resource [${agentMeta.resourceName}] has been successfully added to\n      this Teleport Cluster. ${resourceText}',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/Finished/Finished.tsx',
  },
  {
    source:
      'Run the command below on the server running your Kubernetes cluster. It may take up to a minute for the Teleport Service to join after running the command.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source:
      'Run the command below on the server your target EKS cluster is at. It may take up to a minute for the Teleport Service to join after running the command.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/ManualHelmDialog.tsx',
  },
  {
    source:
      "Run the command below to download Teleport's CA and generate cert/key pair.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/MutualTls/MutualTls.tsx',
  },
  {
    source:
      'Run the following command against your Teleport Auth Service and save it in',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source:
      'SSH or tsh access to the server running the database, and ability to either SCP files, or run a command to retrieve TLS certificates from the Teleport cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source:
      "Select ECS security groups to assign to the Fargate service that will be running the Teleport Database Service. If you don't select any security groups, the default one for the VPC will be used.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/SelectSecurityGroups.tsx',
  },
  {
    source:
      'Select ECS subnets to assign to the Fargate service that will be running the Teleport Database Service. All of the subnets you select must have an outbound internet route and a local route to the database subnets.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/SelectSubnetIds.tsx',
  },
  {
    source:
      "Self-hosted databases must be configured with Teleport's certificate authority to be able to verify client certificates. They also need a certificate/key pair that Teleport can verify.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/MutualTls/MutualTls.tsx',
  },
  {
    source: 'Set Up Teleport Connect',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx, teleport/src/Discover/ConnectMyComputer/index.ts',
  },
  {
    source: 'Setup Discovery Config for Teleport Discovery Service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.tsx',
  },
  {
    source: 'Successfully detected your new Teleport database service.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/ManualDeploy/ManualDeploy.tsx',
  },
  {
    source: 'Successfully detected your new Teleport instance.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DownloadScript/DownloadScript.tsx',
  },
  {
    source:
      'Teleport Connect is a native desktop application for browsing and accessing your resources. It can also connect your computer to the cluster as an SSH resource.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source: 'Teleport RBAC',
    count: 4,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ResourceLabelTooltip/ResourceLabelTooltip.tsx',
  },
  {
    source: 'Teleport Service Namespace',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source: 'Teleport as IDP',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/resources/resources.tsx',
  },
  {
    source:
      'Teleport can integrate with most, if not all, of your infrastructure. Search below for resources you want to add.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/SelectResource.tsx',
  },
  {
    source:
      'Teleport could not detect your new database in time. Please try again.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/CreateDatabase/const.ts',
  },
  {
    source: 'Teleport is currently deploying a database service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source:
      'Teleport needs AWS IAM permissions to be able to discover and register RDS instances and configure IAM authentications.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/IamPolicy/IamPolicy.tsx',
  },
  {
    source:
      'Teleport needs a database service to be able to connect to your database. Teleport can configure the permissions required to spin up an ECS Fargate container (2vCPU, 4GB memory) in your Amazon account with the ability to access databases in this region (',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/AutoDeploy/AutoDeploy.tsx',
  },
  {
    source: 'Teleport service installation',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/Shared.tsx',
  },
  {
    source: 'Teleport uses AWS IAM authentication to connect to RDS databases.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/SetupAccess/AwsRdsAuthRequirements.tsx',
  },
  {
    source:
      'Teleport will automatically retry enrolling these resources in the next discovery scan.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/MarkAsResolvedDialog.tsx',
  },
  {
    source:
      "Teleport's Kubernetes App Discovery will automatically identify and enroll to Teleport HTTP applications running inside a Kubernetes cluster.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/EnrollEksCluster.tsx',
  },
  {
    source:
      'The Teleport Discovery Service can connect to Amazon EC2 and automatically discover and enroll EC2 instances.',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.tsx, teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryService.tsx',
  },
  {
    source:
      'The Teleport Discovery Service can connect to Amazon RDS and automatically discover and enroll RDS instances and clusters.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryService.tsx',
  },
  {
    source:
      'The Teleport Service could not join this Teleport cluster. Check the logs for errors by running',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/AgentWaitingDialog.tsx, teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx, teleport/src/Discover/Server/DownloadScript/DownloadScript.tsx',
  },
  {
    source:
      'The Teleport agent started by Teleport Connect could not join this Teleport cluster. Check if the Connect My Computer tab in Teleport Connect shows any error messages.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source:
      'The Teleport database service could not join this Teleport cluster. Check the logs for errors by running',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/ManualDeploy/ManualDeploy.tsx',
  },
  {
    source:
      'The button below will open Teleport Connect. Once you are logged in, Teleport Connect will prompt you to connect your computer.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source:
      'The computer you are trying to add has already joined the Teleport cluster before you entered this page. If that&apos;s the case, you can go back to the',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source:
      "The default wildcard label allows this database service to match any database. If you're unsure about how label matching works in Teleport, leave this for now.",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/common.tsx',
  },
  {
    source:
      'This guide configures mTLS between your Teleport proxy and your target database.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source:
      'This guide sets up a single server in your Teleport cluster for SSH access. It uses a short-lived, randomly generated',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source:
      'This guide uses Helm to install the Teleport agent into a cluster, and by default turns on auto-discovery of all apps in the cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/Overview.tsx',
  },
  {
    source:
      'This issue will reappear if the underlying problem is not fixed. Teleport will automatically retry enrolling these resources in the next discovery scan.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/UserTaskDrawer.tsx',
  },
  {
    source:
      'Use Terraform to connect your AWS, Azure, or GCP accounts to Teleport and automatically discover your resources.',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/SelectResource.tsx, teleport/src/components/Empty/Empty.tsx',
  },
  {
    source:
      'You can filter for EC2 instances by their tags. If no tags are added, Teleport will enroll all EC2 instances.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.tsx',
  },
  {
    source:
      'You cannot add new resources. Reach out to your Teleport administrator for additional permissions.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/SelectResource.tsx',
  },
  {
    source: 'You did not start Connect My Computer in Teleport Connect yet.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/SetupConnect/SetupConnect.tsx',
  },
  {
    source: 'Your Teleport Enterprise license does not include',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/SelectResource/PermissionsErrorMessage.tsx',
  },
  {
    source: 'already exists but there are no Teleport agents proxying it',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/CreateDatabase/const.ts',
  },
  {
    source:
      'cat << EOF > prod-cluster-values.yaml\nroles: ${yamlRoles}\nauthToken: ${data.tokenId}\nproxyAddr: ${data.proxyAddr}\nkubeClusterName: ${data.clusterName}\nlabels:\n    teleport.internal/resource-id: ${data.resourceId}${joinLabelsText}\n${extraYAMLConfig}EOF\n\nhelm install teleport-agent teleport/teleport-kube-agent -f prod-cluster-values.yaml --version ${deployVersion} \\\\\n--create-namespace --namespace ${data.namespace}',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source:
      "curl ${cfg.baseUrl}/${requestUrl}\\\n -d '${requestData}'\\\n -H 'Authorization: Bearer ${token}'\\\n -H 'Content-Type: application/json' -OJ;\\\n tar -xvf teleport_mTLS_${hostname}.tar.gz\n  ",
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/MutualTls/useMutualTls.ts',
  },
  {
    source:
      'helm repo add teleport https://charts.releases.teleport.dev && helm repo update',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/ManualHelmDialog.tsx, teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source: 'in Teleport Connect.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/ConnectMyComputer/TestConnection/TestConnection.tsx',
  },
  {
    source: 'journalctl -fu teleport',
    count: 3,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Database/DeployService/ManualDeploy/ManualDeploy.tsx, teleport/src/Discover/Server/DownloadScript/DownloadScript.tsx, teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'kubectl logs -l app=teleport-agent -n',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/SelfHosted/HelmChart/HelmChart.tsx',
  },
  {
    source: 'kubectl logs -l app=teleport-kube-agent -n teleport-agent',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/AgentWaitingDialog.tsx',
  },
  {
    source: 'module from your Terraform configuration will remove Teleport and',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/DeleteIntegrationSection.tsx',
  },
  {
    source:
      'resources in Teleport. To remove resources from Teleport, delete them via the Teleport UI or CLI.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Overview/DeleteIntegrationSection.tsx',
  },
  {
    source: 'sudo systemctl enable teleport',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'sudo systemctl start teleport',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source:
      'sudo teleport install systemd -o /etc/systemd/system/teleport.service',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'systemctl status teleport',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'teleport-agent',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/EnrollEksCluster.tsx',
  },
  {
    source: 'teleport-kube-agent is already installed on the cluster',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Kubernetes/EnrollEKSCluster/EnrollEksCluster.tsx',
  },
  {
    source: 'teleport.yaml',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
  {
    source: 'that will install Teleport, start it and join the cluster.',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Server/DiscoveryConfigSsm/DiscoveryConfigSsm.tsx',
  },
  {
    source:
      'that you require, please ask your Teleport administrator to update your role:',
    count: 2,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/SetupAccess/AccessInfo.tsx',
  },
  {
    source: 'the Teleport service installation flow',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryService.tsx',
  },
  {
    source:
      'version: v3\nteleport:\n  join_params:\n    token_name: "<YOUR_JOIN_TOKEN_FROM_STEP_1>"\n    method: token\n  proxy_server: "${clusterPublicUrl}"\nauth_service:\n  enabled: off\nproxy_service:\n  enabled: off\nssh_service:\n  enabled: off\ndiscovery_service:\n  enabled: "yes"\n  discovery_group: "${discoveryGroupName}"',
    count: 1,
    reason:
      'Not yet authored. Upstream wording reaches a user from teleport/src/Discover/Shared/ConfigureDiscoveryService/ConfigureDiscoveryServiceDirections.tsx',
  },
];
