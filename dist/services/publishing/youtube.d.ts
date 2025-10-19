/**
 * YOUTUBE PUBLISHING ENGINE
 *
 * Handles complete YouTube workflow:
 * - OAuth authentication
 * - Video uploads with metadata
 * - Scheduled publishing
 * - AI disclosure compliance (2024-2025 YouTube policies)
 * - Analytics retrieval
 * - Quota management (default 10K units/day)
 *
 * CRITICAL: Request quota extension to 1M units/day for production scale
 */
import type { VideoMetadata, PublishedVideo, YouTubeAnalytics } from '../../shared/types/index.js';
interface UploadConfig {
    videoPath: string;
    metadata: VideoMetadata;
    thumbnailPath?: string;
    publishAt?: Date;
    channelId: string;
}
interface AnalyticsQuery {
    videoId: string;
    startDate: string;
    endDate: string;
    metrics: string[];
}
declare class YouTubeService {
    private oauth2Client;
    private quotaUsed;
    private quotaLimit;
    constructor();
    /**
     * Get OAuth URL for user authorization
     * First-time setup for each channel
     */
    getAuthUrl(): string;
    /**
     * Exchange authorization code for tokens
     */
    authorize(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiryDate: number;
    }>;
    /**
     * Upload video to YouTube
     * COST: 1600 quota units per upload
     */
    uploadVideo(config: UploadConfig): Promise<PublishedVideo>;
    /**
     * Upload custom thumbnail
     * COST: 50 quota units
     */
    uploadThumbnail(videoId: string, thumbnailPath: string): Promise<void>;
    /**
     * Build video description with AI disclosure
     * CRITICAL for YouTube compliance (2024-2025 policies)
     */
    private buildDescription;
    /**
     * Map category name to YouTube category ID
     */
    private getCategoryId;
    /**
     * Get video analytics
     * COST: 1 quota unit per request
     */
    getAnalytics(videoId: string): Promise<YouTubeAnalytics>;
    /**
     * Get detailed analytics using YouTube Analytics API
     * Requires separate authentication and quota
     */
    getDetailedAnalytics(query: AnalyticsQuery): Promise<any>;
    /**
     * Update video metadata (after upload)
     * COST: 50 quota units
     */
    updateVideo(videoId: string, updates: Partial<VideoMetadata>): Promise<void>;
    /**
     * Delete video
     * COST: 50 quota units
     */
    deleteVideo(videoId: string): Promise<void>;
    /**
     * Get quota usage stats
     */
    getQuotaStats(): {
        used: number;
        limit: number;
        remaining: number;
        percentage: number;
    };
    /**
     * Reset quota counter (call daily)
     */
    resetQuota(): void;
    /**
     * Check if we have enough quota for an operation
     */
    checkQuota(requiredUnits: number): boolean;
}
export declare const youtubeService: YouTubeService;
export {};
//# sourceMappingURL=youtube.d.ts.map