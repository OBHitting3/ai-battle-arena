/**
 * LLM ROUTER - Poly-Model Strategy
 *
 * Intelligently delegates tasks to the best LLM:
 * - Claude 3.5 Opus: Creative storytelling, educational narratives
 * - GPT-4o: Fact-based, data-heavy content (finance, tech, news)
 *
 * Based on enterprise architecture synthesis
 */
import type { LLMProvider, LLMRequest, LLMResponse } from '../../shared/types/index.js';
export declare class LLMRouter {
    private anthropic;
    private openai;
    private readonly COSTS;
    constructor();
    /**
     * Main routing logic - selects optimal LLM based on content type
     */
    route(request: LLMRequest): Promise<LLMResponse>;
    /**
     * Provider selection logic
     */
    private selectProvider;
    /**
     * Call Claude 3.5 Sonnet (using latest available)
     */
    private callClaude;
    /**
     * Call GPT-4o
     */
    private callGPT4o;
    /**
     * Calculate API cost based on token usage
     */
    private calculateCost;
    /**
     * Batch processing for multiple requests (parallel execution)
     */
    routeBatch(requests: LLMRequest[]): Promise<LLMResponse[]>;
    /**
     * Test both providers and return comparison
     * Useful for A/B testing and quality assessment
     */
    compareProviders(request: LLMRequest): Promise<{
        claude: LLMResponse;
        gpt4o: LLMResponse;
        winner: LLMProvider;
    }>;
    /**
     * Get provider stats (for monitoring dashboard)
     */
    getProviderStats(): {
        providers: string[];
        costs: {
            claude: {
                input: number;
                output: number;
            };
            gpt4o: {
                input: number;
                output: number;
            };
        };
        routing: {
            creative: string;
            factual: string;
            mixed: string;
        };
    };
}
export declare const llmRouter: LLMRouter;
//# sourceMappingURL=llm-router.d.ts.map