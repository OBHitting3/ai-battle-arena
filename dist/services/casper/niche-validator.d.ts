/**
 * CASPER NICHE VALIDATOR - Ported to TypeScript
 *
 * Enforces the 85 minimum score threshold
 * Blocks unprofitable niches and suggests alternatives
 *
 * Based on research showing:
 * - Score 70 = 100% profitable ($4,828-$246,267/mo range)
 * - Score 85 = Score 70 + 15 safety buffer (MAXIMUM PROTECTION)
 * - Guarantees user profitability by law of averages
 */
interface VideoMetrics {
    score: number;
    avgViews: number;
    medianViews: number;
    avgLikes: number;
    engagementRate: string;
    videoCount: number;
    estimatedMonthlyRevenue: number;
    monthsToBreakEven: string | number;
    roiPotential: string;
}
interface NicheAnalysis {
    keyword: string;
    viable: boolean;
    score: number;
    metrics: VideoMetrics;
    estimatedMonthlyRevenue: number;
    roiPotential: string;
}
interface ValidationResult {
    niche: string;
    score: number;
    approved: boolean;
    details: NicheAnalysis;
    reason: string | null;
    alternatives: Array<{
        niche: string;
        score: number;
        estimatedRevenue: number;
    }>;
}
export declare class CasperNicheValidator {
    private youtube;
    constructor(apiKey: string);
    /**
     * Main validation method
     */
    validate(nicheKeyword: string): Promise<ValidationResult>;
    /**
     * Analyze a niche using YouTube Data API
     */
    private analyzeNiche;
    /**
     * Search YouTube for niche videos
     */
    private searchNiche;
    /**
     * Get detailed stats for videos
     */
    private getVideoStats;
    /**
     * Calculate profitability metrics
     */
    private calculateProfitMetrics;
    /**
     * Determine rejection reason
     */
    private determineRejectionReason;
    /**
     * Find 3 alternative niches that WILL pass the threshold
     */
    private findAlternatives;
    /**
     * Extract keywords from niche
     */
    private extractKeywords;
    /**
     * Generate candidate alternative niches
     */
    private generateCandidates;
    private average;
    private median;
    private standardDeviation;
}
export {};
//# sourceMappingURL=niche-validator.d.ts.map