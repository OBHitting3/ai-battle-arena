/**
 * FACELESS AUTOMATION PLATFORM - MAIN ENTRY POINT
 *
 * This file demonstrates how to trigger the content creation workflow.
 * In production, this would be called by your FastAPI backend.
 */
import { Connection, Client } from '@temporalio/client';
import { contentCreationWorkflow } from './workflows/content-workflow.js';
/**
 * Trigger a content creation workflow
 */
async function createVideo(input) {
    console.log('🎬 Connecting to Temporal...\n');
    // Connect to Temporal Server
    // In production: Replace with Temporal Cloud connection
    const connection = await Connection.connect({
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
    const client = new Client({ connection });
    console.log('✅ Connected to Temporal\n');
    console.log('🚀 Starting content creation workflow...\n');
    console.log(`   Project ID: ${input.projectId}`);
    console.log(`   Channel ID: ${input.channelId}`);
    console.log(`   Target Duration: ${input.targetDuration}s\n`);
    // Start workflow execution
    const handle = await client.workflow.start(contentCreationWorkflow, {
        taskQueue: 'content-creation',
        workflowId: `content-${input.projectId}-${Date.now()}`,
        args: [input],
    });
    console.log(`📍 Workflow started: ${handle.workflowId}\n`);
    // Wait for result (this could take hours with human approval gates)
    const result = await handle.result();
    return result;
}
/**
 * Example usage
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('   FACELESS AUTOMATION PLATFORM\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    // Example workflow input
    const input = {
        projectId: 'test-project-001',
        clientId: 'client-001',
        channelId: 'channel-001',
        nicheId: 'tech-tips',
        videoIdeaId: 'idea-001',
        voiceCloneId: process.env.ELEVENLABS_VOICE_ID || 'demo-voice',
        targetDuration: 60, // 60 seconds
        channelDNA: {
            style: 'energetic',
            tone: 'friendly',
            pacing: 'fast'
        }
    };
    try {
        const result = await createVideo(input);
        console.log('\n═══════════════════════════════════════════════════════════════\n');
        console.log('   🎉 WORKFLOW COMPLETE!\n');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`Status: ${result.status}`);
        if (result.status === 'completed') {
            console.log(`\n✅ Video Published:`);
            console.log(`   Video ID: ${result.publishedVideoId}`);
            console.log(`   URL: ${result.publishedUrl}\n`);
        }
        else if (result.status === 'failed') {
            console.log(`\n❌ Workflow Failed:`);
            console.log(`   Errors: ${result.errors?.join(', ')}\n`);
        }
        else if (result.status === 'cancelled') {
            console.log(`\n⏸️  Workflow Cancelled:`);
            console.log(`   Reason: ${result.errors?.[0]}\n`);
        }
    }
    catch (error) {
        console.error('\n❌ Error executing workflow:', error.message);
        process.exit(1);
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
export { createVideo };
//# sourceMappingURL=index.js.map