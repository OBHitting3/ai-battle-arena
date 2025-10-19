export interface AssetSearchResult {
    url: string;
    downloadUrl: string;
    width: number;
    height: number;
    photographer: string;
    photographerUrl: string;
}
export declare class AssetSourcer {
    private pexelsClient;
    private readonly downloadDir;
    constructor(pexelsApiKey: string);
    /**
     * Search for stock photos based on keywords from script
     */
    searchPhotos(query: string, count?: number): Promise<AssetSearchResult[]>;
    /**
     * Search for stock videos
     */
    searchVideos(query: string, count?: number): Promise<AssetSearchResult[]>;
    /**
     * Download asset to local storage
     */
    downloadAsset(asset: AssetSearchResult, fileName: string): Promise<string>;
    /**
     * Extract visual keywords from script using AI
     */
    extractVisualKeywords(script: string): string[];
    /**
     * Source assets for entire video based on script
     */
    sourceAssetsForScript(script: string, assetsNeeded?: number): Promise<string[]>;
    /**
     * Clean up downloaded assets
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create asset sourcer
 */
export declare function createAssetSourcer(apiKey: string): AssetSourcer;
//# sourceMappingURL=asset-sourcer.d.ts.map