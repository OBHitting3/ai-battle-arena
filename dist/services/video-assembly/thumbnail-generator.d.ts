export interface ThumbnailRequest {
    title: string;
    style?: string;
    aspectRatio?: '16:9' | '4:3' | '1:1';
    additionalContext?: string;
}
export interface ThumbnailResult {
    imagePath: string;
    prompt: string;
    fireflySeed?: number;
}
export declare class ThumbnailGenerator {
    private readonly apiKey;
    private readonly outputDir;
    private readonly baseUrl;
    constructor(fireflyApiKey: string);
    /**
     * Generate thumbnail using Adobe Firefly API
     */
    generateThumbnail(request: ThumbnailRequest): Promise<ThumbnailResult>;
    /**
     * Construct optimized prompt for YouTube thumbnail
     */
    private constructPrompt;
    /**
     * Call Adobe Firefly Text-to-Image API
     */
    private callFireflyAPI;
    /**
     * Get image dimensions based on aspect ratio
     */
    private getImageDimensions;
    /**
     * Download image from URL and save to disk
     */
    private downloadImage;
    /**
     * Generate multiple thumbnail variations
     */
    generateVariations(request: ThumbnailRequest, count?: number): Promise<ThumbnailResult[]>;
    /**
     * Clean up generated thumbnails
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create thumbnail generator
 */
export declare function createThumbnailGenerator(apiKey: string): ThumbnailGenerator;
/**
 * Generate thumbnail from video title
 */
export declare function generateThumbnailFromTitle(title: string, apiKey: string): Promise<string>;
//# sourceMappingURL=thumbnail-generator.d.ts.map