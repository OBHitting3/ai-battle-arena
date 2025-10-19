/**
 * TEMPORAL ACTIVITIES: CONTENT CREATION PIPELINE
 *
 * These activities connect the Temporal workflow to actual service implementations.
 * Activities are the "real work" - they call APIs, generate content, and handle I/O.
 */
import { elevenLabs } from '../services/content-generation/elevenlabs.js';
import { youtubeService } from '../services/publishing/youtube.js';
/**
 * Activity: Explore narrative paths using Tree of Thought
 */
export async function exploreNarrativePaths(input) {
    console.log(`\n🌳 [Activity] Exploring narrative paths for project: ${input.projectId}`);
    // In production, fetch video idea from database
    // For now, using mock data
    const videoIdea = {
        id: input.videoIdeaId,
        title: 'Sample Video Idea',
        description: 'Sample description for testing',
        targetAudience: 'General',
        estimatedViews: 10000,
        confidenceScore: 0.85,
        validatedAt: new Date()
    };
    // Create custom ToT instance with desired configuration
    const customToT = new (await import('../services/content-generation/tree-of-thought.js')).TreeOfThoughtEngine({
        maxBranches: input.maxBranches || 5,
        maxDepth: input.maxDepth || 3
    });
    const result = await customToT.explore(videoIdea, input.nicheId);
    return {
        selectedPath: {
            path: [result.selectedPath.content],
            score: result.selectedPath.score,
            reasoning: result.selectedPath.content
        },
        totalNodesExplored: result.totalNodesExplored,
        explorationTimeMs: 0 // Not tracked in current implementation
    };
}
/**
 * Activity: Generate candidate scripts using Beam Search
 */
export async function generateScriptCandidates(input) {
    console.log(`\n📝 [Activity] Generating script candidates for project: ${input.projectId}`);
    const videoIdea = {
        id: input.videoIdeaId,
        title: 'Sample Video Idea',
        description: input.selectedNarrative.reasoning,
        targetAudience: 'General',
        estimatedViews: 10000,
        confidenceScore: 0.85,
        validatedAt: new Date(),
        keywords: ['sample', 'test', 'video']
    };
    // Create narrative node for beam search
    const narrativeNode = {
        id: 'narrative-1',
        content: input.selectedNarrative.reasoning,
        score: input.selectedNarrative.score,
        depth: 0,
        children: [],
        isPruned: false,
        isSelected: true
    };
    // Create custom beam search instance with desired configuration
    const customBeamSearch = new (await import('../services/content-generation/beam-search-script.js')).BeamSearchEngine({
        beamWidth: input.beamWidth || 3,
        targetDuration: input.targetDuration
    });
    const result = await customBeamSearch.generate(videoIdea, narrativeNode, input.nicheId, input.channelDNA);
    return {
        candidates: result.candidates.map(c => ({
            scriptId: c.id,
            content: c.content,
            score: c.score,
            wordCount: c.metadata.wordCount || 0,
            estimatedDuration: c.metadata.estimatedDuration || 0
        })),
        topCandidate: {
            scriptId: result.topCandidate.id,
            content: result.topCandidate.content,
            score: result.topCandidate.score
        }
    };
}
/**
 * Activity: Wait for human approval of script
 * In production, this would poll a database or use signals
 */
export async function waitForScriptApproval(input) {
    console.log(`\n⏸️  [Activity] Waiting for script approval for project: ${input.projectId}`);
    console.log(`   Timeout: ${input.timeout / 1000 / 60 / 60 / 24} days`);
    // In production:
    // 1. Save candidates to database with status 'pending_approval'
    // 2. Send notification to client dashboard
    // 3. Poll database or wait for Temporal signal
    // 4. Return approval status
    // For now, auto-approve the top candidate for testing
    console.log(`   ⚠️  AUTO-APPROVING for testing (implement real approval in production)`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate wait
    return {
        approved: true,
        scriptId: input.scriptCandidates[0].scriptId,
        feedback: 'Auto-approved for testing'
    };
}
/**
 * Activity: Generate voiceover using ElevenLabs
 */
export async function generateVoiceover(input) {
    console.log(`\n🗣️  [Activity] Generating voiceover for script: ${input.scriptId}`);
    // In production, fetch script from database
    const mockScript = {
        id: input.scriptId,
        videoIdeaId: 'video-idea-1',
        content: 'This is a sample script for voiceover generation. In production, this would be the actual approved script content.',
        wordCount: 150,
        estimatedDuration: 60,
        structure: {
            hook: 'Sample hook',
            mainContent: ['Point 1', 'Point 2', 'Point 3'],
            callToAction: 'Sample CTA'
        },
        visualCues: [],
        reasoningPath: 'creative',
        approved: true,
        createdAt: new Date(),
        approvedAt: new Date()
    };
    const result = await elevenLabs.generateVoiceover(input.scriptId, mockScript, input.voiceCloneId, input.language);
    return {
        voiceoverAssetId: result.id,
        audioUrl: result.audioUrl,
        duration: result.duration,
        cost: (mockScript.content.length / 1000) * 0.18 // ElevenLabs pricing
    };
}
/**
 * Activity: Assemble video from script, voiceover, and visual assets
 * Uses Remotion for video rendering and Pexels for stock assets
 */
export async function assembleVideo(input) {
    console.log(`\n🎬 [Activity] Assembling video for project: ${input.projectId}`);
    try {
        // Import video assembly services
        const { RemotionRenderer, createCompositionFromScript } = await import('../services/video-assembly/remotion-renderer.js');
        const { AssetSourcer } = await import('../services/video-assembly/asset-sourcer.js');
        // In production, fetch script and voiceover from database
        const mockScript = 'This is a sample script for video assembly. In production, this would be the actual approved script content.';
        const voiceoverPath = `/tmp/voiceover-${input.voiceoverAssetId}.mp3`; // In production, fetch from storage
        // Initialize services
        const pexelsApiKey = process.env.PEXELS_API_KEY;
        if (!pexelsApiKey) {
            throw new Error('PEXELS_API_KEY not configured - required for asset sourcing');
        }
        const assetSourcer = new AssetSourcer(pexelsApiKey);
        const renderer = new RemotionRenderer();
        // Step 1: Source visual assets based on script
        console.log('   📸 Sourcing visual assets from Pexels...');
        const assetPaths = await assetSourcer.sourceAssetsForScript(mockScript, 10);
        console.log(`   ✅ Sourced ${assetPaths.length} assets`);
        // Step 2: Create video composition
        console.log('   🎞️  Creating video composition...');
        const composition = await createCompositionFromScript(mockScript, voiceoverPath, assetPaths);
        console.log(`   ✅ Composition created: ${composition.durationInFrames} frames at ${composition.fps} FPS`);
        // Step 3: Render video
        const outputFileName = `video-${input.projectId}.mp4`;
        console.log('   🎬 Rendering video with Remotion...');
        const outputPath = await renderer.renderVideo(composition, outputFileName);
        // Step 4: Get file size
        const fs = await import('fs/promises');
        const stats = await fs.stat(outputPath);
        // Cleanup temporary assets
        await assetSourcer.cleanup();
        await renderer.cleanup();
        console.log(`   ✅ Video rendered successfully: ${outputPath}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        return {
            videoAssetId: `video-${Date.now()}`,
            outputPath,
            duration: composition.durationInFrames / composition.fps,
            fileSizeBytes: stats.size
        };
    }
    catch (error) {
        console.error(`   ❌ Video assembly failed: ${error.message}`);
        throw error;
    }
}
/**
 * Activity: Generate thumbnail variants
 * Uses Adobe Firefly for AI-powered thumbnail generation
 */
export async function generateThumbnail(input) {
    console.log(`\n🖼️  [Activity] Generating ${input.variantCount} thumbnail variants`);
    try {
        // Import thumbnail generator
        const { ThumbnailGenerator } = await import('../services/video-assembly/thumbnail-generator.js');
        // Initialize Firefly API
        const fireflyApiKey = process.env.ADOBE_FIREFLY_API_KEY;
        if (!fireflyApiKey) {
            throw new Error('ADOBE_FIREFLY_API_KEY not configured - required for thumbnail generation');
        }
        const generator = new ThumbnailGenerator(fireflyApiKey);
        // In production, fetch video idea and script from database
        const videoTitle = 'Sample Video Title'; // Fetch from database
        // Generate thumbnail variants
        console.log('   🎨 Generating thumbnails with Adobe Firefly...');
        const results = await generator.generateVariations({
            title: videoTitle,
            style: 'bold, high-contrast, professional YouTube thumbnail',
            aspectRatio: '16:9'
        }, input.variantCount);
        const variants = results.map((result, i) => ({
            thumbnailId: `thumb-${Date.now()}-${i}`,
            url: result.imagePath,
            designConcept: result.prompt
        }));
        console.log(`   ✅ Generated ${variants.length} thumbnail variants`);
        return { variants };
    }
    catch (error) {
        console.error(`   ❌ Thumbnail generation failed: ${error.message}`);
        throw error;
    }
}
/**
 * Activity: Wait for final QC approval
 */
export async function waitForFinalQC(input) {
    console.log(`\n⏸️  [Activity] Waiting for final QC approval for project: ${input.projectId}`);
    // In production:
    // 1. Display video + thumbnail variants in dashboard
    // 2. Client reviews and approves
    // 3. Client sets metadata (title, description, tags, schedule)
    // 4. Poll or wait for signal
    // For now, auto-approve for testing
    console.log(`   ⚠️  AUTO-APPROVING for testing (implement real QC in production)`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
        approved: true,
        selectedThumbnailId: input.thumbnailVariants[0].thumbnailId,
        selectedThumbnailPath: input.thumbnailVariants[0].url,
        finalTitle: 'Sample Video Title - Test Upload',
        finalDescription: 'This is a sample video description for testing the automation platform.',
        finalTags: ['automation', 'ai', 'content', 'test'],
        category: 'Education',
        privacyStatus: 'private', // Keep private for testing
        publishAt: undefined // Publish immediately
    };
}
/**
 * Activity: Upload video to YouTube
 */
export async function uploadToYouTube(input) {
    console.log(`\n📤 [Activity] Uploading to YouTube for project: ${input.projectId}`);
    try {
        const result = await youtubeService.uploadVideo({
            channelId: input.channelId,
            videoPath: input.videoPath,
            thumbnailPath: input.thumbnailPath,
            metadata: input.metadata,
            publishAt: input.publishAt
        });
        return {
            videoId: result.platformVideoId,
            url: result.url,
            status: result.status
        };
    }
    catch (error) {
        console.error(`   ❌ Upload failed: ${error.message}`);
        throw error;
    }
}
/**
 * Activity: Initialize analytics tracking
 */
export async function trackAnalytics(input) {
    console.log(`\n📊 [Activity] Initializing analytics tracking for video: ${input.videoId}`);
    // In production:
    // 1. Create database record for tracking
    // 2. Schedule periodic analytics pulls (daily)
    // 3. Set up BigQuery export
    // 4. Initialize performance metrics dashboard
    console.log(`   ✅ Analytics tracking initialized`);
    console.log(`   Note: Implement periodic polling in production`);
}
//# sourceMappingURL=content-activities.js.map