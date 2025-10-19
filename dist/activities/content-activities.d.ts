/**
 * TEMPORAL ACTIVITIES: CONTENT CREATION PIPELINE
 *
 * These activities connect the Temporal workflow to actual service implementations.
 * Activities are the "real work" - they call APIs, generate content, and handle I/O.
 */
export interface ExploreNarrativePathsInput {
    projectId: string;
    videoIdeaId: string;
    nicheId: string;
    maxBranches?: number;
    maxDepth?: number;
}
export interface ExploreNarrativePathsResult {
    selectedPath: {
        path: string[];
        score: number;
        reasoning: string;
    };
    totalNodesExplored: number;
    explorationTimeMs: number;
}
/**
 * Activity: Explore narrative paths using Tree of Thought
 */
export declare function exploreNarrativePaths(input: ExploreNarrativePathsInput): Promise<ExploreNarrativePathsResult>;
export interface GenerateScriptCandidatesInput {
    projectId: string;
    videoIdeaId: string;
    selectedNarrative: {
        path: string[];
        score: number;
        reasoning: string;
    };
    nicheId: string;
    channelDNA?: any;
    targetDuration: number;
    beamWidth?: number;
}
export interface GenerateScriptCandidatesResult {
    candidates: Array<{
        scriptId: string;
        content: string;
        score: number;
        wordCount: number;
        estimatedDuration: number;
    }>;
    topCandidate: {
        scriptId: string;
        content: string;
        score: number;
    };
}
/**
 * Activity: Generate candidate scripts using Beam Search
 */
export declare function generateScriptCandidates(input: GenerateScriptCandidatesInput): Promise<GenerateScriptCandidatesResult>;
export interface WaitForScriptApprovalInput {
    projectId: string;
    scriptCandidates: Array<{
        scriptId: string;
        content: string;
        score: number;
    }>;
    timeout: number;
}
export interface WaitForScriptApprovalResult {
    approved: boolean;
    scriptId: string;
    feedback?: string;
}
/**
 * Activity: Wait for human approval of script
 * In production, this would poll a database or use signals
 */
export declare function waitForScriptApproval(input: WaitForScriptApprovalInput): Promise<WaitForScriptApprovalResult>;
export interface GenerateVoiceoverInput {
    projectId: string;
    scriptId: string;
    voiceCloneId: string;
    language: string;
}
export interface GenerateVoiceoverResult {
    voiceoverAssetId: string;
    audioUrl: string;
    duration: number;
    cost: number;
}
/**
 * Activity: Generate voiceover using ElevenLabs
 */
export declare function generateVoiceover(input: GenerateVoiceoverInput): Promise<GenerateVoiceoverResult>;
export interface AssembleVideoInput {
    projectId: string;
    scriptId: string;
    voiceoverAssetId: string;
    nicheId: string;
    channelDNA?: any;
}
export interface AssembleVideoResult {
    videoAssetId: string;
    outputPath: string;
    duration: number;
    fileSizeBytes: number;
}
/**
 * Activity: Assemble video from script, voiceover, and visual assets
 * Uses Remotion for video rendering and Pexels for stock assets
 */
export declare function assembleVideo(input: AssembleVideoInput): Promise<AssembleVideoResult>;
export interface GenerateThumbnailInput {
    projectId: string;
    videoIdeaId: string;
    scriptId: string;
    nicheId: string;
    variantCount: number;
}
export interface GenerateThumbnailResult {
    variants: Array<{
        thumbnailId: string;
        url: string;
        designConcept: string;
    }>;
}
/**
 * Activity: Generate thumbnail variants
 * Uses Adobe Firefly for AI-powered thumbnail generation
 */
export declare function generateThumbnail(input: GenerateThumbnailInput): Promise<GenerateThumbnailResult>;
export interface WaitForFinalQCInput {
    projectId: string;
    videoPath: string;
    thumbnailVariants: Array<{
        thumbnailId: string;
        url: string;
    }>;
    timeout: number;
}
export interface WaitForFinalQCResult {
    approved: boolean;
    selectedThumbnailId: string;
    selectedThumbnailPath: string;
    finalTitle: string;
    finalDescription: string;
    finalTags: string[];
    category: import('../shared/types/index.js').YouTubeCategory;
    privacyStatus: 'public' | 'unlisted' | 'private';
    publishAt?: Date;
}
/**
 * Activity: Wait for final QC approval
 */
export declare function waitForFinalQC(input: WaitForFinalQCInput): Promise<WaitForFinalQCResult>;
export interface UploadToYouTubeInput {
    projectId: string;
    channelId: string;
    videoPath: string;
    thumbnailPath: string;
    metadata: {
        title: string;
        description: string;
        tags: string[];
        category: import('../shared/types/index.js').YouTubeCategory;
        language: string;
        privacyStatus: 'public' | 'unlisted' | 'private';
        aiDisclosure: boolean;
        madeForKids: boolean;
    };
    publishAt?: Date;
}
export interface UploadToYouTubeResult {
    videoId: string;
    url: string;
    status: string;
}
/**
 * Activity: Upload video to YouTube
 */
export declare function uploadToYouTube(input: UploadToYouTubeInput): Promise<UploadToYouTubeResult>;
export interface TrackAnalyticsInput {
    projectId: string;
    channelId: string;
    videoId: string;
    publishedAt: Date;
}
/**
 * Activity: Initialize analytics tracking
 */
export declare function trackAnalytics(input: TrackAnalyticsInput): Promise<void>;
//# sourceMappingURL=content-activities.d.ts.map