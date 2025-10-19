/**
 * TEMPORAL WORKER: CONTENT CREATION
 *
 * This worker executes content creation workflows and activities.
 * It polls Temporal Cloud for tasks and executes them using our services.
 *
 * In production:
 * - Deploy as AWS Lambda or long-running EC2 instance
 * - Scale horizontally based on workload
 * - Connect to Temporal Cloud namespace
 */
import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from '../activities/content-activities.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function run() {
    console.log('🚀 Starting Temporal Content Worker...\n');
    // Connect to Temporal Server
    // In production: Replace with Temporal Cloud connection
    const connection = await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        // For Temporal Cloud:
        // address: 'your-namespace.tmprl.cloud:7233',
        // tls: {
        //   clientCertPair: {
        //     crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT || ''),
        //     key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY || '')
        //   }
        // }
    });
    const worker = await Worker.create({
        connection,
        namespace: process.env.TEMPORAL_NAMESPACE || 'default',
        taskQueue: 'content-creation',
        workflowsPath: join(__dirname, '../workflows'),
        activities,
        // Worker tuning for production
        maxConcurrentActivityTaskExecutions: 10,
        maxConcurrentWorkflowTaskExecutions: 10,
    });
    console.log('✅ Worker connected to Temporal');
    console.log(`   Task Queue: content-creation`);
    console.log(`   Namespace: ${process.env.TEMPORAL_NAMESPACE || 'default'}`);
    console.log(`   Address: ${process.env.TEMPORAL_ADDRESS || 'localhost:7233'}\n`);
    console.log('👂 Listening for workflow tasks...\n');
    await worker.run();
}
run().catch((err) => {
    console.error('❌ Worker error:', err);
    process.exit(1);
});
//# sourceMappingURL=content-worker.js.map