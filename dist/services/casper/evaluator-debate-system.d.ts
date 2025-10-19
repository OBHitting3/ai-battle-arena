/**
 * EVALUATOR DEBATE SYSTEM
 *
 * Three expert evaluators critique AI-generated content and debate until consensus:
 *
 * 1. PADDY GALLOWAY (Irish YouTube Expert)
 *    - Evaluates: Content strategy, engagement, hook quality, retention tactics
 *    - Perspective: "Will this get views and keep people watching?"
 *
 * 2. MARK ZUCKERBERG (Tech/Product Leader)
 *    - Evaluates: Scalability, user experience, product-market fit, growth potential
 *    - Perspective: "Does this solve a real problem at scale?"
 *
 * 3. HULK HOGAN (Entertainment Icon)
 *    - Evaluates: Impact, entertainment value, life-changing potential, inspiration
 *    - Perspective: "Will this change lives and create an emotional connection?"
 *
 * The system iterates until all three agree the content meets quality standards.
 */
export declare enum Evaluator {
    PADDY_GALLOWAY = "PADDY_GALLOWAY",
    MARK_ZUCKERBERG = "MARK_ZUCKERBERG",
    HULK_HOGAN = "HULK_HOGAN"
}
export interface EvaluatorProfile {
    name: string;
    background: string;
    expertise: string[];
    evaluationCriteria: string[];
    personality: string;
    speakingStyle: string;
}
export interface Evaluation {
    evaluator: Evaluator;
    score: number;
    approved: boolean;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    reasoning: string;
    quote: string;
}
export interface DebateRound {
    round: number;
    content: string;
    evaluations: Evaluation[];
    consensus: boolean;
    averageScore: number;
    debateTranscript: string[];
    improvements: string[];
}
export interface DebateResult {
    finalContent: string;
    rounds: DebateRound[];
    totalRounds: number;
    consensusAchieved: boolean;
    finalScore: number;
    debateSummary: string;
}
export declare class EvaluatorDebateSystem {
    private anthropic;
    private evaluatorProfiles;
    constructor(anthropicKey: string);
    /**
     * Run debate system on content until consensus or max rounds
     */
    runDebate(initialContent: string, context: {
        niche: string;
        topic: string;
        purpose: string;
    }, maxRounds?: number): Promise<DebateResult>;
    /**
     * Get evaluation from single evaluator
     */
    private evaluateContent;
    /**
     * Parse evaluation text into structured format
     */
    private parseEvaluation;
    /**
     * Get evaluations from all evaluators
     */
    private getAllEvaluations;
    /**
     * Display evaluations in console
     */
    private displayEvaluations;
    /**
     * Generate debate transcript where evaluators discuss
     */
    private generateDebateTranscript;
    /**
     * Improve content based on feedback
     */
    private improveContent;
    /**
     * Generate debate summary
     */
    private generateDebateSummary;
    /**
     * Get evaluator profile
     */
    getEvaluatorProfile(evaluator: Evaluator): EvaluatorProfile;
    /**
     * List all evaluators
     */
    listEvaluators(): EvaluatorProfile[];
}
//# sourceMappingURL=evaluator-debate-system.d.ts.map