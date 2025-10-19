/**
 * BEAM SEARCH SCRIPT GENERATOR
 *
 * Generates multiple candidate scripts and ranks them by predicted performance.
 * Works in conjunction with Tree of Thought to ensure optimal content quality.
 *
 * Beam width (3-5 candidates) balances quality vs. API cost.
 */
import { llmRouter } from './llm-router.js';
export class BeamSearchScriptGenerator {
    config;
    constructor(config) {
        this.config = {
            beamWidth: config?.beamWidth || 3,
            minWordCount: config?.minWordCount || 300,
            maxWordCount: config?.maxWordCount || 2000,
            targetDuration: config?.targetDuration || 60,
            contentType: config?.contentType || 'creative'
        };
    }
    /**
     * Generate multiple candidate scripts and rank them
     */
    async generate(videoIdea, selectedNarrative, niche, channelDNA) {
        console.log(`\n📝 Generating ${this.config.beamWidth} candidate scripts via Beam Search`);
        console.log(`   Target duration: ${this.config.targetDuration}s\n`);
        // Generate candidates in parallel
        const candidatePromises = Array.from({ length: this.config.beamWidth }, (_, index) => this.generateCandidate(videoIdea, selectedNarrative, niche, index, channelDNA));
        const candidates = await Promise.all(candidatePromises);
        // Rank candidates
        const rankedCandidates = await this.rankCandidates(candidates, videoIdea, niche);
        // Calculate total cost
        const costTotal = rankedCandidates.reduce((sum, candidate) => sum + (candidate.metadata.generationCost || 0), 0);
        console.log(`\n✅ Script generation complete:`);
        rankedCandidates.forEach((candidate, index) => {
            console.log(`   ${index + 1}. Score: ${candidate.score.toFixed(2)} | Words: ${candidate.metadata.wordCount}`);
        });
        console.log(`   Total cost: $${costTotal.toFixed(4)}\n`);
        return {
            candidates: rankedCandidates,
            topCandidate: rankedCandidates[0],
            costTotal
        };
    }
    /**
     * Generate a single candidate script
     */
    async generateCandidate(videoIdea, narrative, niche, index, channelDNA) {
        const wordsPerSecond = 2.5; // Average speaking rate
        const targetWords = Math.round(this.config.targetDuration * wordsPerSecond);
        // Build prompt with channel DNA if available
        const styleInstructions = channelDNA
            ? this.buildStyleInstructions(channelDNA)
            : 'Use an engaging, conversational tone.';
        const prompt = `You are an expert YouTube scriptwriter for faceless channels.

VIDEO DETAILS:
- Title: "${videoIdea.title}"
- Niche: ${niche}
- Narrative Direction: "${narrative.content}"
- Target Duration: ${this.config.targetDuration} seconds (~${targetWords} words)

REQUIREMENTS:
1. Structure the script with clear sections:
   - [HOOK] (first 3-5 seconds - must grab attention immediately)
   - [MAIN CONTENT] (deliver value, tell the story)
   - [CALL TO ACTION] (encourage engagement - like, subscribe, comment)

2. ${styleInstructions}

3. Word count: ${this.config.minWordCount}-${this.config.maxWordCount} words

4. Include visual cues in square brackets like:
   [VISUAL: Show an aerial view of a city at night]

5. Use retention techniques:
   - Pattern interrupts every 10-15 seconds
   - Curiosity gaps ("But here's what most people don't know...")
   - Emotional triggers

6. Optimize for YouTube algorithm:
   - Front-load key information
   - Use keywords naturally: ${videoIdea.keywords?.join(', ') || 'N/A'}
   - Create shareable moments

Write the complete script now. Make it unique and compelling.`;
        const startTime = Date.now();
        const response = await llmRouter.route({
            prompt,
            contentType: this.config.contentType,
            temperature: 0.7 + (index * 0.1), // Vary temperature slightly for diversity
            maxTokens: 3000
        });
        // Parse script structure
        const parsedScript = this.parseScript(response.content);
        return {
            id: `candidate-${index}`,
            content: response.content,
            score: 0, // Will be scored in ranking phase
            rank: 0,
            metadata: {
                wordCount: parsedScript.wordCount,
                estimatedDuration: parsedScript.wordCount / wordsPerSecond,
                structure: parsedScript.structure,
                visualCues: parsedScript.visualCues,
                generationTime: Date.now() - startTime,
                generationCost: response.cost,
                provider: response.provider,
                temperature: 0.7 + (index * 0.1)
            }
        };
    }
    /**
     * Parse script into structured components
     */
    parseScript(content) {
        const hookMatch = content.match(/\[HOOK\]([\s\S]*?)(?=\[|$)/i);
        const mainContentMatch = content.match(/\[MAIN CONTENT\]([\s\S]*?)(?=\[CALL TO ACTION\]|$)/i);
        const ctaMatch = content.match(/\[CALL TO ACTION\]([\s\S]*?)$/i);
        const visualCueMatches = content.matchAll(/\[VISUAL:([^\]]+)\]/gi);
        const visualCues = Array.from(visualCueMatches).map(match => match[1].trim());
        const wordCount = content
            .replace(/\[.*?\]/g, '') // Remove visual cues
            .split(/\s+/)
            .filter(word => word.length > 0).length;
        return {
            wordCount,
            structure: {
                hook: hookMatch ? hookMatch[1].trim() : '',
                mainContent: mainContentMatch ? mainContentMatch[1].trim() : '',
                callToAction: ctaMatch ? ctaMatch[1].trim() : ''
            },
            visualCues
        };
    }
    /**
     * Rank candidates by predicted performance
     */
    async rankCandidates(candidates, videoIdea, niche) {
        const scorePromises = candidates.map(async (candidate) => {
            const prompt = `You are a YouTube performance analyst.

VIDEO TITLE: "${videoIdea.title}"
NICHE: ${niche}
SCRIPT EXCERPT: "${candidate.content.substring(0, 500)}..."

Rate this script on a scale of 0.0 to 1.0 based on:
1. Hook strength (will it capture attention in first 3 seconds?)
2. Retention potential (will viewers watch to the end?)
3. Call-to-action effectiveness
4. SEO optimization (natural keyword usage)
5. Emotional engagement
6. Shareability

Return ONLY a single number between 0.0 and 1.0, representing the overall predicted performance score.`;
            const response = await llmRouter.route({
                prompt,
                contentType: 'factual', // Use GPT-4o for analytical scoring
                temperature: 0.2,
                maxTokens: 10
            });
            const scoreMatch = response.content.match(/0\.\d+|1\.0|0|1/);
            const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0.5;
            return {
                ...candidate,
                score
            };
        });
        const scoredCandidates = await Promise.all(scorePromises);
        // Sort by score descending and assign ranks
        return scoredCandidates
            .sort((a, b) => b.score - a.score)
            .map((candidate, index) => ({
            ...candidate,
            rank: index + 1
        }));
    }
    /**
     * Build style instructions from channel DNA
     */
    buildStyleInstructions(channelDNA) {
        const { tone, pacing, vocabulary } = channelDNA.styleGuide || {};
        let instructions = '';
        if (tone) {
            instructions += `Tone: ${tone}. `;
        }
        if (pacing) {
            const pacingMap = {
                fast: 'Keep sentences short and punchy. Move quickly between points.',
                medium: 'Use a balanced mix of short and longer sentences.',
                slow: 'Take time to explain concepts thoroughly. Use longer, more detailed sentences.'
            };
            instructions += pacingMap[pacing] || '';
        }
        if (vocabulary) {
            const vocabMap = {
                simple: 'Use simple, everyday language. Avoid jargon.',
                technical: 'Use industry-specific terminology where appropriate.',
                mixed: 'Balance technical terms with simple explanations.'
            };
            instructions += vocabMap[vocabulary] || '';
        }
        return instructions || 'Use an engaging, conversational tone.';
    }
    /**
     * Convert top candidate to Script type
     */
    convertToScript(candidate, videoIdeaId, reasoningPath) {
        const parsed = this.parseScript(candidate.content);
        return {
            videoIdeaId,
            content: candidate.content,
            wordCount: parsed.wordCount,
            estimatedDuration: candidate.metadata.estimatedDuration,
            structure: {
                hook: parsed.structure.hook,
                mainContent: [parsed.structure.mainContent],
                callToAction: parsed.structure.callToAction
            },
            visualCues: parsed.visualCues.map((description, index) => ({
                timestamp: index * 10, // Rough estimate - will be refined later
                description,
                searchQuery: description,
                assetType: 'stock_video'
            })),
            reasoningPath,
            approved: false
        };
    }
}
// Export singleton with default config
export const beamSearchScriptGenerator = new BeamSearchScriptGenerator();
// Export class for custom configurations
export { BeamSearchScriptGenerator as BeamSearchEngine };
//# sourceMappingURL=beam-search-script.js.map