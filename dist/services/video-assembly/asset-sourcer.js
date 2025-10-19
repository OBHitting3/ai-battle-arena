import { createClient } from 'pexels';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
export class AssetSourcer {
    pexelsClient;
    downloadDir;
    constructor(pexelsApiKey) {
        this.pexelsClient = createClient(pexelsApiKey);
        this.downloadDir = path.join(process.cwd(), 'assets', 'downloaded');
    }
    /**
     * Search for stock photos based on keywords from script
     */
    async searchPhotos(query, count = 10) {
        // GROK FIX: Sanitize query input
        if (!query || query.trim().length === 0) {
            throw new Error('Search query cannot be empty');
        }
        if (query.length > 500) {
            throw new Error('Search query too long (max 500 characters)');
        }
        // GROK FIX: Validate and limit count to prevent rate limiting
        const safeCount = Math.min(Math.max(1, count), 80); // Pexels max is 80
        // GROK FIX: Sanitize query to prevent injection attempts
        const sanitizedQuery = query
            .replace(/[;<>'"]/g, '') // Remove dangerous characters
            .trim();
        try {
            const response = await this.pexelsClient.photos.search({
                query: sanitizedQuery,
                per_page: safeCount,
                orientation: 'landscape',
            });
            if ('photos' in response) {
                return response.photos.map((photo) => ({
                    url: photo.src.original,
                    downloadUrl: photo.src.large2x,
                    width: photo.width || 1920,
                    height: photo.height || 1080,
                    photographer: photo.photographer,
                    photographerUrl: photo.photographer_url,
                }));
            }
            return [];
        }
        catch (error) {
            console.error('Error searching Pexels:', error);
            throw new Error(`Failed to search assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Search for stock videos
     */
    async searchVideos(query, count = 5) {
        try {
            const response = await this.pexelsClient.videos.search({
                query,
                per_page: count,
                orientation: 'landscape',
            });
            if ('videos' in response) {
                return response.videos.map((video) => {
                    const hdFile = video.video_files.find((f) => f.quality === 'hd') || video.video_files[0];
                    return {
                        url: hdFile.link,
                        downloadUrl: hdFile.link,
                        width: hdFile.width || 1920,
                        height: hdFile.height || 1080,
                        photographer: video.user.name,
                        photographerUrl: video.user.url,
                    };
                });
            }
            return [];
        }
        catch (error) {
            console.error('Error searching Pexels videos:', error);
            throw new Error(`Failed to search video assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Download asset to local storage
     */
    async downloadAsset(asset, fileName) {
        try {
            await fs.mkdir(this.downloadDir, { recursive: true });
            const response = await axios.get(asset.downloadUrl, {
                responseType: 'arraybuffer',
            });
            // GROK FIX: Check disk space before writing large files
            const fileSize = response.data.byteLength;
            const requiredSpace = fileSize * 2; // 2x buffer for safety
            try {
                const { statfs } = await import('fs/promises');
                const stats = await statfs(this.downloadDir);
                const availableSpace = stats.bavail * stats.bsize;
                if (availableSpace < requiredSpace) {
                    throw new Error(`Insufficient disk space: need ${Math.round(requiredSpace / 1024 / 1024)}MB, ` +
                        `have ${Math.round(availableSpace / 1024 / 1024)}MB available`);
                }
            }
            catch (diskError) {
                // If statfs not available (Windows), skip check but log warning
                console.warn('Disk space check not available on this platform');
            }
            const filePath = path.join(this.downloadDir, fileName);
            await fs.writeFile(filePath, response.data);
            console.log(`Asset downloaded: ${filePath}`);
            return filePath;
        }
        catch (error) {
            console.error('Error downloading asset:', error);
            throw new Error(`Failed to download asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Extract visual keywords from script using AI
     */
    extractVisualKeywords(script) {
        // Simple keyword extraction - in production, use AI to analyze script
        const keywords = [];
        // Extract nouns and important terms (basic implementation)
        const words = script.toLowerCase().split(/\s+/);
        const visualTerms = words.filter(word => word.length > 4 &&
            !['about', 'their', 'would', 'could', 'should', 'these', 'those'].includes(word));
        // Return unique keywords
        return [...new Set(visualTerms)].slice(0, 5);
    }
    /**
     * Source assets for entire video based on script
     */
    async sourceAssetsForScript(script, assetsNeeded = 10) {
        try {
            const keywords = this.extractVisualKeywords(script);
            console.log(`Extracted keywords: ${keywords.join(', ')}`);
            const allAssets = [];
            // Search for assets for each keyword
            for (const keyword of keywords) {
                const assets = await this.searchPhotos(keyword, Math.ceil(assetsNeeded / keywords.length));
                allAssets.push(...assets);
            }
            // Download assets
            const downloadedPaths = [];
            for (let i = 0; i < Math.min(assetsNeeded, allAssets.length); i++) {
                const asset = allAssets[i];
                const fileName = `asset-${i + 1}-${Date.now()}.jpg`;
                const filePath = await this.downloadAsset(asset, fileName);
                downloadedPaths.push(filePath);
            }
            return downloadedPaths;
        }
        catch (error) {
            console.error('Error sourcing assets for script:', error);
            throw error;
        }
    }
    /**
     * Clean up downloaded assets
     */
    async cleanup() {
        try {
            await fs.rm(this.downloadDir, { recursive: true, force: true });
        }
        catch (error) {
            console.error('Error cleaning up assets:', error);
        }
    }
}
/**
 * Factory function to create asset sourcer
 */
export function createAssetSourcer(apiKey) {
    return new AssetSourcer(apiKey);
}
//# sourceMappingURL=asset-sourcer.js.map