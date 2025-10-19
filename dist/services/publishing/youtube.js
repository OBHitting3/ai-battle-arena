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
import { google } from 'googleapis';
import fs from 'fs';
const youtube = google.youtube('v3');
class YouTubeService {
    oauth2Client;
    quotaUsed = 0;
    quotaLimit = 10000; // Default daily quota
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback');
        // Set credentials if we have a refresh token
        if (process.env.YOUTUBE_REFRESH_TOKEN) {
            this.oauth2Client.setCredentials({
                refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
            });
        }
    }
    /**
     * Get OAuth URL for user authorization
     * First-time setup for each channel
     */
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly'
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent' // Force consent to get refresh token
        });
    }
    /**
     * Exchange authorization code for tokens
     */
    async authorize(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
        };
    }
    /**
     * Upload video to YouTube
     * COST: 1600 quota units per upload
     */
    async uploadVideo(config) {
        console.log(`\n📤 Uploading video to YouTube`);
        console.log(`   Channel: ${config.channelId}`);
        console.log(`   Title: "${config.metadata.title}"`);
        console.log(`   Privacy: ${config.metadata.privacyStatus}`);
        if (config.publishAt) {
            console.log(`   Scheduled for: ${config.publishAt.toISOString()}`);
        }
        console.log();
        try {
            // Build video metadata with AI disclosure
            const snippet = {
                title: config.metadata.title,
                description: this.buildDescription(config.metadata),
                tags: config.metadata.tags,
                categoryId: this.getCategoryId(config.metadata.category),
                defaultLanguage: config.metadata.language
            };
            const status = {
                privacyStatus: config.publishAt ? 'private' : config.metadata.privacyStatus,
                selfDeclaredMadeForKids: config.metadata.madeForKids,
                publishAt: config.publishAt?.toISOString()
            };
            // Upload video
            const response = await youtube.videos.insert({
                auth: this.oauth2Client,
                part: ['snippet', 'status'],
                requestBody: {
                    snippet,
                    status
                },
                media: {
                    body: fs.createReadStream(config.videoPath)
                }
            });
            const videoId = response.data.id;
            console.log(`✅ Video uploaded successfully!`);
            console.log(`   Video ID: ${videoId}`);
            console.log(`   URL: https://youtube.com/watch?v=${videoId}`);
            // Upload thumbnail if provided
            if (config.thumbnailPath) {
                await this.uploadThumbnail(videoId, config.thumbnailPath);
            }
            // Track quota usage
            this.quotaUsed += 1600;
            const publishedVideo = {
                id: `pub-${Date.now()}`,
                videoProjectId: config.channelId,
                platform: 'youtube',
                platformVideoId: videoId,
                url: `https://youtube.com/watch?v=${videoId}`,
                publishedAt: new Date(),
                status: 'processing'
            };
            return publishedVideo;
        }
        catch (error) {
            console.error('YouTube upload error:', error.message);
            throw new Error(`YouTube upload failed: ${error.message}`);
        }
    }
    /**
     * Upload custom thumbnail
     * COST: 50 quota units
     */
    async uploadThumbnail(videoId, thumbnailPath) {
        console.log(`\n🖼️  Uploading thumbnail for video: ${videoId}`);
        try {
            await youtube.thumbnails.set({
                auth: this.oauth2Client,
                videoId,
                media: {
                    body: fs.createReadStream(thumbnailPath)
                }
            });
            console.log(`✅ Thumbnail uploaded successfully\n`);
            this.quotaUsed += 50;
        }
        catch (error) {
            console.error('Thumbnail upload error:', error.message);
            // Don't throw - thumbnail is not critical
            console.log('   Continuing without custom thumbnail\n');
        }
    }
    /**
     * Build video description with AI disclosure
     * CRITICAL for YouTube compliance (2024-2025 policies)
     */
    buildDescription(metadata) {
        let description = metadata.description;
        // Add AI disclosure if required
        if (metadata.aiDisclosure) {
            const aiDisclosure = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ AI DISCLOSURE:
This video was created with AI-assisted tools for content generation, voiceover, and video production. All information has been verified for accuracy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            description += aiDisclosure;
        }
        return description;
    }
    /**
     * Map category name to YouTube category ID
     */
    getCategoryId(category) {
        const categoryMap = {
            'Film & Animation': '1',
            'Autos & Vehicles': '2',
            'Music': '10',
            'Pets & Animals': '15',
            'Sports': '17',
            'Travel & Events': '19',
            'Gaming': '20',
            'People & Blogs': '22',
            'Comedy': '23',
            'Entertainment': '24',
            'News & Politics': '25',
            'Howto & Style': '26',
            'Education': '27',
            'Science & Technology': '28',
            'Nonprofits & Activism': '29'
        };
        return categoryMap[category] || '22'; // Default to 'People & Blogs'
    }
    /**
     * Get video analytics
     * COST: 1 quota unit per request
     */
    async getAnalytics(videoId) {
        console.log(`\n📊 Fetching analytics for video: ${videoId}`);
        try {
            // Get video statistics
            const videoResponse = await youtube.videos.list({
                auth: this.oauth2Client,
                part: ['statistics', 'contentDetails'],
                id: [videoId]
            });
            const video = videoResponse.data.items?.[0];
            if (!video || !video.statistics) {
                throw new Error('Video not found or statistics unavailable');
            }
            const stats = video.statistics;
            // Note: Estimated revenue requires YouTube Analytics API (separate)
            // This is a simplified version using only Data API v3
            const analytics = {
                videoId,
                views: parseInt(stats.viewCount || '0'),
                likes: parseInt(stats.likeCount || '0'),
                comments: parseInt(stats.commentCount || '0'),
                shares: 0, // Not available in Data API v3
                watchTimeMinutes: 0, // Requires Analytics API
                averageViewPercentage: 0, // Requires Analytics API
                clickThroughRate: 0, // Requires Analytics API
                impressions: 0, // Requires Analytics API
                estimatedRevenue: 0, // Requires Analytics API with monetization access
                subscribersGained: 0, // Requires Analytics API
                retentionGraph: [], // Requires Analytics API
                trafficSources: [], // Requires Analytics API
                lastUpdated: new Date()
            };
            console.log(`✅ Analytics retrieved:`);
            console.log(`   Views: ${analytics.views.toLocaleString()}`);
            console.log(`   Likes: ${analytics.likes.toLocaleString()}`);
            console.log(`   Comments: ${analytics.comments.toLocaleString()}\n`);
            this.quotaUsed += 1;
            return analytics;
        }
        catch (error) {
            console.error('Analytics error:', error.message);
            throw new Error(`Failed to get analytics: ${error.message}`);
        }
    }
    /**
     * Get detailed analytics using YouTube Analytics API
     * Requires separate authentication and quota
     */
    async getDetailedAnalytics(query) {
        console.log(`\n📈 Fetching detailed analytics via YouTube Analytics API`);
        console.log(`   Video ID: ${query.videoId}`);
        console.log(`   Date range: ${query.startDate} to ${query.endDate}`);
        console.log(`   Metrics: ${query.metrics.join(', ')}\n`);
        try {
            const youtubeAnalytics = google.youtubeAnalytics('v2');
            const response = await youtubeAnalytics.reports.query({
                auth: this.oauth2Client,
                ids: 'channel==MINE',
                startDate: query.startDate,
                endDate: query.endDate,
                metrics: query.metrics.join(','),
                dimensions: 'video',
                filters: `video==${query.videoId}`
            });
            console.log(`✅ Detailed analytics retrieved\n`);
            return response.data;
        }
        catch (error) {
            console.error('Detailed analytics error:', error.message);
            throw new Error(`Failed to get detailed analytics: ${error.message}`);
        }
    }
    /**
     * Update video metadata (after upload)
     * COST: 50 quota units
     */
    async updateVideo(videoId, updates) {
        console.log(`\n✏️  Updating video: ${videoId}`);
        try {
            const snippet = {};
            if (updates.title)
                snippet.title = updates.title;
            if (updates.description)
                snippet.description = this.buildDescription(updates);
            if (updates.tags)
                snippet.tags = updates.tags;
            const status = {};
            if (updates.privacyStatus)
                status.privacyStatus = updates.privacyStatus;
            await youtube.videos.update({
                auth: this.oauth2Client,
                part: ['snippet', 'status'],
                requestBody: {
                    id: videoId,
                    snippet: snippet,
                    status: status
                }
            });
            console.log(`✅ Video updated successfully\n`);
            this.quotaUsed += 50;
        }
        catch (error) {
            console.error('Video update error:', error.message);
            throw new Error(`Failed to update video: ${error.message}`);
        }
    }
    /**
     * Delete video
     * COST: 50 quota units
     */
    async deleteVideo(videoId) {
        console.log(`\n🗑️  Deleting video: ${videoId}`);
        try {
            await youtube.videos.delete({
                auth: this.oauth2Client,
                id: videoId
            });
            console.log(`✅ Video deleted successfully\n`);
            this.quotaUsed += 50;
        }
        catch (error) {
            console.error('Video delete error:', error.message);
            throw new Error(`Failed to delete video: ${error.message}`);
        }
    }
    /**
     * Get quota usage stats
     */
    getQuotaStats() {
        return {
            used: this.quotaUsed,
            limit: this.quotaLimit,
            remaining: this.quotaLimit - this.quotaUsed,
            percentage: (this.quotaUsed / this.quotaLimit) * 100
        };
    }
    /**
     * Reset quota counter (call daily)
     */
    resetQuota() {
        this.quotaUsed = 0;
        console.log('✅ YouTube quota counter reset');
    }
    /**
     * Check if we have enough quota for an operation
     */
    checkQuota(requiredUnits) {
        return (this.quotaUsed + requiredUnits) <= this.quotaLimit;
    }
}
// Export singleton
export const youtubeService = new YouTubeService();
//# sourceMappingURL=youtube.js.map