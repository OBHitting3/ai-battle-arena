/**
 * TEMPORAL WORKFLOW: COMPLETE CONTENT CREATION PIPELINE
 *
 * Orchestrates the full faceless video creation process:
 * 1. Tree of Thought (explore narrative paths)
 * 2. Beam Search (generate candidate scripts)
 * 3. Human approval checkpoint
 * 4. Voiceover generation (ElevenLabs)
 * 5. Video assembly (placeholder for Remotion/Runway)
 * 6. Thumbnail generation (placeholder)
 * 7. Human QC checkpoint
 * 8. YouTube upload
 * 9. Analytics tracking
 *
 * This workflow is DURABLE - it will retry on failures, persist state,
 * and can run for days/weeks if needed.
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/content-activities.js';

// Proxy activities with appropriate timeouts
const {
  exploreNarrativePaths,
  generateScriptCandidates,
  waitForScriptApproval,
  generateVoiceover,
  assembleVideo,
  generateThumbnail,
  waitForFinalQC,
  uploadToYouTube,
  trackAnalytics
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 3
  }
});

export interface ContentWorkflowInput {
  projectId: string;
  clientId: string;
  channelId: string;
  nicheId: string;
  videoIdeaId: string;
  voiceCloneId: string;
  channelDNA?: any;
  targetDuration: number; // seconds
}

export interface ContentWorkflowResult {
  projectId: string;
  status: 'completed' | 'failed' | 'cancelled';
  publishedVideoId?: string;
  publishedUrl?: string;
  analytics?: any;
  errors?: string[];
}

/**
 * Main content creation workflow
 * This is the heart of the automation platform
 */
export async function contentCreationWorkflow(
  input: ContentWorkflowInput
): Promise<ContentWorkflowResult> {
  const errors: string[] = [];

  try {
    console.log(`\n🎬 Starting content workflow for project: ${input.projectId}`);
    console.log(`   Channel: ${input.channelId}`);
    console.log(`   Target duration: ${input.targetDuration}s\n`);

    // ==========================================
    // PHASE 1: IDEATION & SCRIPT GENERATION
    // ==========================================

    console.log('📍 PHASE 1: Tree of Thought + Beam Search\n');

    // Step 1: Explore narrative paths with Tree of Thought
    const narrativeResult = await exploreNarrativePaths({
      projectId: input.projectId,
      videoIdeaId: input.videoIdeaId,
      nicheId: input.nicheId,
      maxBranches: 5,
      maxDepth: 3
    });

    console.log(`✅ Explored ${narrativeResult.totalNodesExplored} narrative paths`);
    console.log(`   Selected path score: ${narrativeResult.selectedPath.score.toFixed(2)}\n`);

    // Step 2: Generate candidate scripts with Beam Search
    const scriptResult = await generateScriptCandidates({
      projectId: input.projectId,
      videoIdeaId: input.videoIdeaId,
      selectedNarrative: narrativeResult.selectedPath,
      nicheId: input.nicheId,
      channelDNA: input.channelDNA,
      targetDuration: input.targetDuration,
      beamWidth: 3
    });

    console.log(`✅ Generated ${scriptResult.candidates.length} candidate scripts`);
    console.log(`   Top candidate score: ${scriptResult.topCandidate.score.toFixed(2)}\n`);

    // Step 3: Human approval checkpoint
    console.log('⏸️  CHECKPOINT: Awaiting script approval from client...\n');

    const approvedScript = await waitForScriptApproval({
      projectId: input.projectId,
      scriptCandidates: scriptResult.candidates,
      timeout: 7 * 24 * 60 * 60 * 1000 // 7 days max
    });

    if (!approvedScript.approved) {
      return {
        projectId: input.projectId,
        status: 'cancelled',
        errors: ['Script approval timeout or rejection']
      };
    }

    console.log(`✅ Script approved: "${approvedScript.scriptId}"\n`);

    // ==========================================
    // PHASE 2: VOICEOVER GENERATION
    // ==========================================

    console.log('📍 PHASE 2: Voiceover Generation\n');

    const voiceoverResult = await generateVoiceover({
      projectId: input.projectId,
      scriptId: approvedScript.scriptId,
      voiceCloneId: input.voiceCloneId,
      language: 'en'
    });

    console.log(`✅ Voiceover generated: ${voiceoverResult.duration}s`);
    console.log(`   File: ${voiceoverResult.audioUrl}`);
    console.log(`   Cost: $${voiceoverResult.cost.toFixed(4)}\n`);

    // ==========================================
    // PHASE 3: VIDEO ASSEMBLY
    // ==========================================

    console.log('📍 PHASE 3: Video Assembly\n');

    const videoResult = await assembleVideo({
      projectId: input.projectId,
      scriptId: approvedScript.scriptId,
      voiceoverAssetId: voiceoverResult.voiceoverAssetId,
      nicheId: input.nicheId,
      channelDNA: input.channelDNA
    });

    console.log(`✅ Video assembled: ${videoResult.outputPath}`);
    console.log(`   Duration: ${videoResult.duration}s`);
    console.log(`   Size: ${(videoResult.fileSizeBytes / 1024 / 1024).toFixed(2)} MB\n`);

    // ==========================================
    // PHASE 4: THUMBNAIL GENERATION
    // ==========================================

    console.log('📍 PHASE 4: Thumbnail Generation\n');

    const thumbnailResult = await generateThumbnail({
      projectId: input.projectId,
      videoIdeaId: input.videoIdeaId,
      scriptId: approvedScript.scriptId,
      nicheId: input.nicheId,
      variantCount: 3
    });

    console.log(`✅ Generated ${thumbnailResult.variants.length} thumbnail variants\n`);

    // ==========================================
    // PHASE 5: FINAL QC CHECKPOINT
    // ==========================================

    console.log('📍 PHASE 5: Final Quality Control\n');
    console.log('⏸️  CHECKPOINT: Awaiting final QC approval...\n');

    const qcResult = await waitForFinalQC({
      projectId: input.projectId,
      videoPath: videoResult.outputPath,
      thumbnailVariants: thumbnailResult.variants,
      timeout: 3 * 24 * 60 * 60 * 1000 // 3 days max
    });

    if (!qcResult.approved) {
      return {
        projectId: input.projectId,
        status: 'cancelled',
        errors: ['Final QC rejection or timeout']
      };
    }

    console.log(`✅ Final QC approved`);
    console.log(`   Selected thumbnail: ${qcResult.selectedThumbnailId}\n`);

    // ==========================================
    // PHASE 6: YOUTUBE UPLOAD
    // ==========================================

    console.log('📍 PHASE 6: YouTube Upload\n');

    const uploadResult = await uploadToYouTube({
      projectId: input.projectId,
      channelId: input.channelId,
      videoPath: videoResult.outputPath,
      thumbnailPath: qcResult.selectedThumbnailPath,
      metadata: {
        title: qcResult.finalTitle,
        description: qcResult.finalDescription,
        tags: qcResult.finalTags,
        category: qcResult.category,
        language: 'en',
        privacyStatus: qcResult.privacyStatus,
        aiDisclosure: true, // ALWAYS true for our platform
        madeForKids: false
      },
      publishAt: qcResult.publishAt
    });

    console.log(`✅ Video uploaded to YouTube!`);
    console.log(`   Video ID: ${uploadResult.videoId}`);
    console.log(`   URL: ${uploadResult.url}`);
    if (qcResult.publishAt) {
      console.log(`   Scheduled for: ${qcResult.publishAt.toISOString()}`);
    }
    console.log();

    // ==========================================
    // PHASE 7: ANALYTICS TRACKING
    // ==========================================

    console.log('📍 PHASE 7: Analytics Tracking Setup\n');

    await trackAnalytics({
      projectId: input.projectId,
      channelId: input.channelId,
      videoId: uploadResult.videoId,
      publishedAt: new Date()
    });

    console.log(`✅ Analytics tracking initialized\n`);

    // ==========================================
    // WORKFLOW COMPLETE
    // ==========================================

    console.log('🎉 CONTENT WORKFLOW COMPLETE!\n');
    console.log(`   Project: ${input.projectId}`);
    console.log(`   Video URL: ${uploadResult.url}`);
    console.log(`   Ready for monetization\n`);

    return {
      projectId: input.projectId,
      status: 'completed',
      publishedVideoId: uploadResult.videoId,
      publishedUrl: uploadResult.url,
      analytics: {
        trackingEnabled: true,
        videoId: uploadResult.videoId
      },
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error: any) {
    console.error(`\n❌ Workflow failed for project ${input.projectId}:`, error.message);

    errors.push(error.message);

    return {
      projectId: input.projectId,
      status: 'failed',
      errors
    };
  }
}
