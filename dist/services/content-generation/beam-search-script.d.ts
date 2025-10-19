/**
 * BEAM SEARCH SCRIPT GENERATOR
 *
 * Generates multiple candidate scripts and ranks them by predicted performance.
 * Works in conjunction with Tree of Thought to ensure optimal content quality.
 *
 * Beam width (3-5 candidates) balances quality vs. API cost.
 */
import type { BeamSearchCandidate, Script, VideoIdea, TreeOfThoughtNode } from '../../shared/types/index.js';
interface BeamSearchConfig {
    beamWidth: number;
    minWordCount: number;
    maxWordCount: number;
    targetDuration: number;
    contentType: 'creative' | 'factual' | 'mixed';
}
export declare class BeamSearchScriptGenerator {
    private config;
    constructor(config?: Partial<BeamSearchConfig>);
    /**
     * Generate multiple candidate scripts and rank them
     */
    generate(videoIdea: VideoIdea, selectedNarrative: TreeOfThoughtNode, niche: string, channelDNA?: any): Promise<{
        candidates: BeamSearchCandidate[];
        topCandidate: BeamSearchCandidate;
        costTotal: number;
    }>;
    /**
     * Generate a single candidate script
     */
    private generateCandidate;
    /**
     * Parse script into structured components
     */
    private parseScript;
    /**
     * Rank candidates by predicted performance
     */
    private rankCandidates;
    /**
     * Build style instructions from channel DNA
     */
    private buildStyleInstructions;
    /**
     * Convert top candidate to Script type
     */
    convertToScript(candidate: BeamSearchCandidate, videoIdeaId: string, reasoningPath: 'creative' | 'factual'): Partial<Script>;
}
export declare const beamSearchScriptGenerator: BeamSearchScriptGenerator;
export { BeamSearchScriptGenerator as BeamSearchEngine };
//# sourceMappingURL=beam-search-script.d.ts.map