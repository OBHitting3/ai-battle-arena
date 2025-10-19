/**
 * CASPER ORCHESTRATOR
 *
 * The complete CASPER system that integrates:
 * 1. Niche Validator (85+ score threshold)
 * 2. Multi-AI Persona System (5 AI models)
 * 3. Evaluator Debate System (Paddy, Zuck, Hulk)
 * 4. QR Referral System
 *
 * Complete workflow:
 * - Validate niche profitability
 * - Generate content using multiple AI personas
 * - Evaluate and iterate with expert debate
 * - Track referrals and leaderboards
 */
import { AIPersona } from './multi-ai-persona';
import { QRReferralSystem } from './qr-referral-system';
export interface CasperConfig {
    youtubeApiKey: string;
    anthropicKey: string;
    openaiKey: string;
    geminiKey: string;
    perplexityKey: string;
    grokKey: string;
}
export interface VideoCreationRequest {
    niche: string;
    topic: string;
    duration: number;
    aiPersona?: AIPersona;
    requireConsensus?: boolean;
    maxDebateRounds?: number;
}
export interface VideoCreationResult {
    niche: string;
    topic: string;
    nicheValidation: any;
    aiGeneration: any;
    debateResult: any;
    finalScript: string;
    approved: boolean;
    metadata: {
        persona: AIPersona;
        consensusAchieved: boolean;
        totalDebateRounds: number;
        finalScore: number;
    };
}
export interface TestRun {
    runNumber: number;
    niche: string;
    topic: string;
    persona: AIPersona;
    nicheScore: number;
    nicheApproved: boolean;
    finalDebateScore: number;
    consensusAchieved: boolean;
    debateRounds: number;
    success: boolean;
    timestamp: string;
    duration: number;
}
export declare class CasperOrchestrator {
    private nicheValidator;
    private aiPersonaSystem;
    private debateSystem;
    private referralSystem;
    private testResults;
    constructor(config: CasperConfig);
    /**
     * Complete video creation workflow
     */
    createVideo(request: VideoCreationRequest): Promise<VideoCreationResult>;
    /**
     * Test CASPER system 100 times with different configurations
     */
    runComprehensiveTests(iterations?: number): Promise<TestRun[]>;
    /**
     * Generate test cases for comprehensive testing
     */
    private generateTestCases;
    /**
     * Generate comprehensive test report
     */
    private generateTestReport;
    /**
     * Get referral system
     */
    getReferralSystem(): QRReferralSystem;
    /**
     * Get test results
     */
    getTestResults(): TestRun[];
    private average;
}
//# sourceMappingURL=casper-orchestrator.d.ts.map