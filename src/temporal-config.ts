/**
 * Temporal Cloud Configuration
 *
 * This file configures the connection to Temporal Cloud for workflow orchestration.
 * Temporal Cloud provides managed workflow execution with automatic retries,
 * durable state, and human-in-the-loop capabilities.
 *
 * Setup Instructions:
 * 1. Sign up for Temporal Cloud: https://temporal.io/cloud
 * 2. Create a namespace (e.g., "faceless-automation.a2dd6")
 * 3. Download mTLS certificates
 * 4. Add credentials to .env file
 */

import { Connection, Client } from '@temporalio/client';
import { WorkflowClient } from '@temporalio/client';
import fs from 'fs/promises';
import path from 'path';

export interface TemporalConfig {
  address: string;
  namespace: string;
  clientCertPath?: string;
  clientKeyPath?: string;
  serverRootCACertificate?: Buffer;
}

/**
 * Get Temporal configuration from environment variables
 */
export function getTemporalConfig(): TemporalConfig {
  const isCloud = process.env.TEMPORAL_CLOUD === 'true';

  if (isCloud) {
    // Temporal Cloud configuration
    return {
      address: process.env.TEMPORAL_ADDRESS || '',
      namespace: process.env.TEMPORAL_NAMESPACE || '',
      clientCertPath: process.env.TEMPORAL_CLIENT_CERT_PATH,
      clientKeyPath: process.env.TEMPORAL_CLIENT_KEY_PATH,
    };
  } else {
    // Local Temporal development server
    return {
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    };
  }
}

/**
 * Create Temporal client connection
 */
export async function createTemporalClient(): Promise<WorkflowClient> {
  const config = getTemporalConfig();

  // Connection options
  const connectionOptions: any = {
    address: config.address,
  };

  // Add mTLS if using Temporal Cloud
  if (config.clientCertPath && config.clientKeyPath) {
    console.log('🔐 Connecting to Temporal Cloud with mTLS...');

    const [clientCert, clientKey] = await Promise.all([
      fs.readFile(config.clientCertPath),
      fs.readFile(config.clientKeyPath),
    ]);

    connectionOptions.tls = {
      clientCertPair: {
        crt: clientCert,
        key: clientKey,
      },
    };

    // Add server root CA if provided
    if (config.serverRootCACertificate) {
      connectionOptions.tls.serverRootCACertificate = config.serverRootCACertificate;
    }
  } else {
    console.log('🔧 Connecting to local Temporal server...');
  }

  // Create connection
  const connection = await Connection.connect(connectionOptions);

  // Create client
  const client = new WorkflowClient({
    connection,
    namespace: config.namespace,
  });

  console.log(`✅ Connected to Temporal namespace: ${config.namespace}`);

  return client;
}

/**
 * Temporal Worker configuration
 * Workers execute workflow and activity code
 */
export interface WorkerConfig {
  taskQueue: string;
  workflowsPath: string;
  activitiesPath: string;
  maxConcurrentWorkflows?: number;
  maxConcurrentActivities?: number;
}

export function getWorkerConfig(): WorkerConfig {
  return {
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'content-generation-queue',
    workflowsPath: path.join(__dirname, 'workflows'),
    activitiesPath: path.join(__dirname, 'activities'),
    maxConcurrentWorkflows: parseInt(process.env.MAX_CONCURRENT_WORKFLOWS || '100'),
    maxConcurrentActivities: parseInt(process.env.MAX_CONCURRENT_ACTIVITIES || '200'),
  };
}

/**
 * Health check for Temporal connection
 */
export async function checkTemporalConnection(): Promise<boolean> {
  try {
    const client = await createTemporalClient();
    console.log('✅ Temporal health check passed');
    return true;
  } catch (error) {
    console.error('❌ Temporal health check failed:', error);
    return false;
  }
}

/**
 * Example: Start a content workflow
 */
export async function startContentWorkflow(projectId: string, config: any) {
  const client = await createTemporalClient();
  const workerConfig = getWorkerConfig();

  const handle = await client.start('contentCreationWorkflow', {
    taskQueue: workerConfig.taskQueue,
    workflowId: `content-workflow-${projectId}`,
    args: [{ projectId, config }],
  });

  console.log(`🚀 Started workflow: ${handle.workflowId}`);
  return handle;
}

/**
 * Query workflow status
 */
export async function getWorkflowStatus(workflowId: string) {
  const client = await createTemporalClient();
  const handle = client.getHandle(workflowId);

  try {
    const status = await handle.describe();
    return {
      workflowId: status.workflowId,
      runId: status.runId,
      status: status.status.name,
      startTime: status.startTime,
    };
  } catch (error) {
    console.error(`Failed to get workflow status for ${workflowId}:`, error);
    throw error;
  }
}

/**
 * Cancel workflow
 */
export async function cancelWorkflow(workflowId: string) {
  const client = await createTemporalClient();
  const handle = client.getHandle(workflowId);

  await handle.cancel();
  console.log(`🛑 Cancelled workflow: ${workflowId}`);
}

/**
 * Send signal to workflow (e.g., human approval)
 */
export async function sendApprovalSignal(
  workflowId: string,
  approved: boolean,
  selectedScriptId: string,
  selectedThumbnailId: string
) {
  const client = await createTemporalClient();
  const handle = client.getHandle(workflowId);

  await handle.signal('approveContent', {
    approved,
    selectedScriptId,
    selectedThumbnailId,
  });

  console.log(`📨 Sent approval signal to workflow: ${workflowId}`);
}

/**
 * Test Temporal setup
 */
export async function testTemporalSetup() {
  console.log('🧪 Testing Temporal setup...');
  console.log('');

  const config = getTemporalConfig();
  console.log('📋 Configuration:');
  console.log(`  Address: ${config.address}`);
  console.log(`  Namespace: ${config.namespace}`);
  console.log(`  TLS: ${config.clientCertPath ? 'Enabled' : 'Disabled'}`);
  console.log('');

  const isHealthy = await checkTemporalConnection();

  if (isHealthy) {
    console.log('');
    console.log('✅ Temporal setup complete!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('  1. Start Temporal worker: npm run worker');
    console.log('  2. Create a project via API');
    console.log('  3. Workflow will start automatically');
  } else {
    console.log('');
    console.log('❌ Temporal setup failed');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('  1. Check TEMPORAL_ADDRESS in .env');
    console.log('  2. Verify mTLS certificates are valid');
    console.log('  3. Ensure namespace exists in Temporal Cloud');
    console.log('  4. For local dev: docker-compose up -d');
  }

  return isHealthy;
}
