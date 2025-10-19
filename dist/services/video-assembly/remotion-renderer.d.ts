export interface VideoAsset {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    startFrame: number;
    durationFrames: number;
    position?: {
        x: number;
        y: number;
    };
    style?: Record<string, any>;
}
export interface VideoComposition extends Record<string, unknown> {
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
    assets: VideoAsset[];
    voiceoverPath: string;
    backgroundMusic?: string;
}
export declare class RemotionRenderer {
    private readonly outputDir;
    private readonly tempDir;
    constructor();
    /**
     * Render a video from composition
     */
    renderVideo(composition: VideoComposition, outputFileName: string): Promise<string>;
    /**
     * Create Remotion composition file
     */
    private createCompositionFile;
    /**
     * Create video template component
     */
    private createVideoTemplate;
    /**
     * Clean up temporary files
     */
    cleanup(): Promise<void>;
}
/**
 * Helper function to create composition from script
 */
export declare function createCompositionFromScript(script: any, voiceoverPath: string, assetUrls: string[], durationSeconds?: number): Promise<VideoComposition>;
//# sourceMappingURL=remotion-renderer.d.ts.map