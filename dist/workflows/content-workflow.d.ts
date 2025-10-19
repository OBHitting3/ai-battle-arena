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
export interface ContentWorkflowInput {
    projectId: string;
    clientId: string;
    channelId: string;
    nicheId: string;
    videoIdeaId: string;
    voiceCloneId: string;
    channelDNA?: any;
    targetDuration: number;
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
export declare function contentCreationWorkflow(input: ContentWorkflowInput): Promise<ContentWorkflowResult>;
//# sourceMappingURL=content-workflow.d.ts.map