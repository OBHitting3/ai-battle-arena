/**
 * MULTI-AI PERSONA SYSTEM
 *
 * Integrates 5 AI models as distinct personas:
 * 1. Gemini 2.5 Pro - Google's reasoning powerhouse
 * 2. Claude Max (Sonnet 4.5) - Creative narrative expert
 * 3. Perplexity - Real-time research specialist
 * 4. ChatGPT (GPT-4) - Versatile content creator
 * 5. SuperHeavy Grok 4 - X.AI's analytical engine
 *
 * Each persona has unique "thinking and skills" that influence content generation
 */
export declare enum AIPersona {
    GEMINI = "GEMINI_2.5_PRO",
    CLAUDE = "CLAUDE_MAX",
    PERPLEXITY = "PERPLEXITY",
    CHATGPT = "CHATGPT_4",
    GROK = "SUPERHEAVY_GROK_4"
}
export interface PersonaCharacteristics {
    name: string;
    model: string;
    strengths: string[];
    thinkingStyle: string;
    personality: string;
}
export interface ScriptGenerationRequest {
    niche: string;
    topic: string;
    duration: number;
    persona: AIPersona;
}
export interface ScriptGenerationResult {
    script: string;
    persona: AIPersona;
    wordCount: number;
    estimatedDuration: number;
    thinkingProcess: string;
}
export declare class MultiAIPersonaSystem {
    private anthropic;
    private openai;
    private gemini;
    private perplexityApiKey;
    private grokApiKey;
    private personaProfiles;
    constructor(config: {
        anthropicKey: string;
        openaiKey: string;
        geminiKey: string;
        perplexityKey: string;
        grokKey: string;
    });
    /**
     * Generate script using specified AI persona
     */
    generateScript(request: ScriptGenerationRequest): Promise<ScriptGenerationResult>;
    /**
     * Build personalized prompt based on persona characteristics
     */
    private buildPersonalizedPrompt;
    /**
     * Generate with Gemini
     */
    private generateWithGemini;
    /**
     * Generate with Claude
     */
    private generateWithClaude;
    /**
     * Generate with Perplexity
     */
    private generateWithPerplexity;
    /**
     * Generate with ChatGPT
     */
    private generateWithChatGPT;
    /**
     * Generate with Grok
     */
    private generateWithGrok;
    /**
     * Compare all 5 personas generating the same topic
     */
    comparePersonas(niche: string, topic: string, duration: number): Promise<Record<AIPersona, ScriptGenerationResult>>;
    /**
     * Get persona profile
     */
    getPersonaProfile(persona: AIPersona): PersonaCharacteristics;
    /**
     * List all personas
     */
    listPersonas(): PersonaCharacteristics[];
}
//# sourceMappingURL=multi-ai-persona.d.ts.map