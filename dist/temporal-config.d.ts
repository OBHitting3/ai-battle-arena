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
import { WorkflowClient } from '@temporalio/client';
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
export declare function getTemporalConfig(): TemporalConfig;
/**
 * Create Temporal client connection
 */
export declare function createTemporalClient(): Promise<WorkflowClient>;
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
export declare function getWorkerConfig(): WorkerConfig;
/**
 * Health check for Temporal connection
 */
export declare function checkTemporalConnection(): Promise<boolean>;
/**
 * Example: Start a content workflow
 */
export declare function startContentWorkflow(projectId: string, config: any): Promise<import("@temporalio/client").WorkflowHandleWithStartDetails<import("@temporalio/client").Workflow>>;
/**
 * Query workflow status
 */
export declare function getWorkflowStatus(workflowId: string): Promise<{
    workflowId: string;
    runId: string;
    status: import("@temporalio/client").WorkflowExecutionStatusName;
    startTime: Date;
}>;
/**
 * Cancel workflow
 */
export declare function cancelWorkflow(workflowId: string): Promise<void>;
/**
 * Send signal to workflow (e.g., human approval)
 */
export declare function sendApprovalSignal(workflowId: string, approved: boolean, selectedScriptId: string, selectedThumbnailId: string): Promise<void>;
/**
 * Test Temporal setup
 */
export declare function testTemporalSetup(): Promise<boolean>;
//# sourceMappingURL=temporal-config.d.ts.map