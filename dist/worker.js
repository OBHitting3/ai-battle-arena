/**
 * Temporal Worker - Executes workflow and activity code
 *
 * This worker:
 * - Connects to Temporal Cloud or local server
 * - Polls for workflow tasks
 * - Executes activities
 * - Handles retries and timeouts
 * - Gracefully shuts down
 */
import { Worker, NativeConnection } from '@temporalio/worker';
import { getWorkerConfig } from './temporal-config.js';
import * as activities from './activities/content-activities.js';
import { readFileSync } from 'fs';
// ==========================================
// WORKER CONFIGURATION
// ==========================================
async function run() {
    console.log('🚀 Starting Temporal Worker...');
    console.log('');
    const config = getWorkerConfig();
    console.log('📋 Worker Configuration:');
    console.log(`  Task Queue: ${config.taskQueue}`);
    console.log(`  Max Concurrent Workflows: ${config.maxConcurrentWorkflows}`);
    console.log(`  Max Concurrent Activities: ${config.maxConcurrentActivities}`);
    console.log('');
    try {
        // Create connection to Temporal
        console.log('🔗 Connecting to Temporal...');
        const isCloud = process.env.TEMPORAL_CLOUD === 'true';
        const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
        const connectionOptions = {
            address,
        };
        // Add mTLS if using Temporal Cloud
        if (isCloud && process.env.TEMPORAL_CLIENT_CERT_PATH && process.env.TEMPORAL_CLIENT_KEY_PATH) {
            console.log('🔐 Using mTLS for Temporal Cloud...');
            const clientCert = readFileSync(process.env.TEMPORAL_CLIENT_CERT_PATH);
            const clientKey = readFileSync(process.env.TEMPORAL_CLIENT_KEY_PATH);
            connectionOptions.tls = {
                clientCertPair: {
                    crt: clientCert,
                    key: clientKey,
                },
            };
        }
        const connection = await NativeConnection.connect(connectionOptions);
        console.log(`✅ Connected to Temporal namespace: ${namespace}`);
        console.log('');
        // Create worker
        console.log('⚙️  Creating worker...');
        const worker = await Worker.create({
            connection,
            namespace,
            taskQueue: config.taskQueue,
            workflowsPath: require.resolve('./workflows'),
            activities,
            maxConcurrentWorkflowTaskExecutions: config.maxConcurrentWorkflows,
            maxConcurrentActivityTaskExecutions: config.maxConcurrentActivities,
            // Graceful shutdown settings
            shutdownGraceTime: '30s',
            // Enable workflow stack traces for debugging
            enableSDKTracing: process.env.NODE_ENV === 'development',
        });
        console.log('✅ Worker created successfully');
        console.log('');
        // Graceful shutdown handling
        const shutdownSignals = ['SIGINT', 'SIGTERM'];
        shutdownSignals.forEach((signal) => {
            process.on(signal, async () => {
                console.log('');
                console.log(`📥 Received ${signal} - starting graceful shutdown...`);
                console.log('⏳ Waiting for running workflows to complete...');
                await worker.shutdown();
                console.log('✅ Worker shutdown complete');
                process.exit(0);
            });
        });
        // Start worker
        console.log('🎯 Worker running and polling for tasks...');
        console.log('');
        console.log('📊 Metrics:');
        console.log('  - Workflows executed: Check Temporal Web UI');
        console.log('  - Activities completed: Check Temporal Web UI');
        console.log('');
        console.log('🌐 Temporal Web UI:');
        console.log(isCloud
            ? '  https://cloud.temporal.io'
            : '  http://localhost:8233');
        console.log('');
        console.log('Press Ctrl+C to gracefully shutdown...');
        console.log('');
        await worker.run();
    }
    catch (error) {
        console.error('');
        console.error('❌ Worker failed to start:');
        console.error(error);
        console.error('');
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error('🔧 Troubleshooting:');
                console.error('  1. Check TEMPORAL_ADDRESS in .env');
                console.error('  2. Ensure Temporal server is running');
                console.error('');
                console.error('For local dev:');
                console.error('  temporal server start-dev');
                console.error('');
                console.error('For Temporal Cloud:');
                console.error('  1. Verify TEMPORAL_CLOUD=true in .env');
                console.error('  2. Check mTLS certificates are valid');
                console.error('  3. Ensure namespace exists');
            }
            if (error.message.includes('certificate')) {
                console.error('🔧 Certificate Error:');
                console.error('  1. Verify certificate paths in .env:');
                console.error('     - TEMPORAL_CLIENT_CERT_PATH');
                console.error('     - TEMPORAL_CLIENT_KEY_PATH');
                console.error('  2. Ensure certificates are in PEM format');
                console.error('  3. Check certificates haven\'t expired');
            }
        }
        process.exit(1);
    }
}
// ==========================================
// WORKER HEALTH CHECK
// ==========================================
/**
 * Start HTTP server for health checks
 * Kubernetes/Docker can use this to verify worker is running
 */
async function startHealthCheckServer() {
    const http = require('http');
    const port = process.env.WORKER_HEALTH_PORT || 8080;
    const server = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString(),
            }));
        }
        else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });
    server.listen(port, () => {
        console.log(`💚 Worker health check server running on port ${port}`);
        console.log(`   Health endpoint: http://localhost:${port}/health`);
        console.log('');
    });
    return server;
}
// ==========================================
// START WORKER
// ==========================================
(async () => {
    try {
        // Start health check server
        await startHealthCheckServer();
        // Start worker
        await run();
    }
    catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=worker.js.map