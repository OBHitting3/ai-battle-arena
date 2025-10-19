/**
 * LLM ROUTER - Poly-Model Strategy
 *
 * Intelligently delegates tasks to the best LLM:
 * - Claude 3.5 Opus: Creative storytelling, educational narratives
 * - GPT-4o: Fact-based, data-heavy content (finance, tech, news)
 *
 * Based on enterprise architecture synthesis
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { LLMProvider, LLMRequest, LLMResponse } from '../../shared/types/index.js';

export class LLMRouter {
  private anthropic: Anthropic;
  private openai: OpenAI;

  // Cost tracking (per 1M tokens)
  private readonly COSTS = {
    claude: {
      input: 3,    // $3 per 1M input tokens
      output: 15   // $15 per 1M output tokens
    },
    gpt4o: {
      input: 2.5,  // $2.50 per 1M input tokens
      output: 10   // $10 per 1M output tokens
    }
  };

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Main routing logic - selects optimal LLM based on content type
   */
  async route(request: LLMRequest): Promise<LLMResponse> {
    const provider = this.selectProvider(request.contentType);
    const startTime = Date.now();

    try {
      if (provider === 'claude') {
        return await this.callClaude(request, startTime);
      } else {
        return await this.callGPT4o(request, startTime);
      }
    } catch (error) {
      console.error(`LLM routing error (${provider}):`, error);

      // Failover to alternative provider
      const fallbackProvider = provider === 'claude' ? 'gpt4o' : 'claude';
      console.log(`Failing over to ${fallbackProvider}`);

      return fallbackProvider === 'claude'
        ? await this.callClaude(request, startTime)
        : await this.callGPT4o(request, startTime);
    }
  }

  /**
   * Provider selection logic
   */
  private selectProvider(contentType: LLMRequest['contentType']): LLMProvider {
    switch (contentType) {
      case 'creative':
        return 'claude'; // Claude excels at storytelling, educational content
      case 'factual':
        return 'gpt4o';  // GPT-4o better at data-heavy, technical content
      case 'mixed':
        // For mixed content, use Claude as it handles nuance better
        return 'claude';
      default:
        return 'claude';
    }
  }

  /**
   * Call Claude 3.5 Sonnet (using latest available)
   */
  private async callClaude(request: LLMRequest, startTime: number): Promise<LLMResponse> {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt || 'You are an expert content creator for faceless YouTube channels.',
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    });

    const content = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;

    return {
      provider: 'claude',
      content,
      tokenCount: {
        input: inputTokens,
        output: outputTokens
      },
      cost: this.calculateCost('claude', inputTokens, outputTokens),
      latency: Date.now() - startTime,
      metadata: {
        model: 'claude-3-5-sonnet-20241022',
        stopReason: message.stop_reason
      }
    };
  }

  /**
   * Call GPT-4o
   */
  private async callGPT4o(request: LLMRequest, startTime: number): Promise<LLMResponse> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: request.maxTokens || 4000,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'system',
          content: request.systemPrompt || 'You are an expert content creator for faceless YouTube channels.'
        },
        {
          role: 'user',
          content: request.prompt
        }
      ]
    });

    const content = completion.choices[0].message.content || '';
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    return {
      provider: 'gpt4o',
      content,
      tokenCount: {
        input: inputTokens,
        output: outputTokens
      },
      cost: this.calculateCost('gpt4o', inputTokens, outputTokens),
      latency: Date.now() - startTime,
      metadata: {
        model: 'gpt-4o',
        finishReason: completion.choices[0].finish_reason
      }
    };
  }

  /**
   * Calculate API cost based on token usage
   */
  private calculateCost(provider: 'claude' | 'gpt4o', inputTokens: number, outputTokens: number): number {
    const costs = this.COSTS[provider];

    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;

    return inputCost + outputCost;
  }

  /**
   * Batch processing for multiple requests (parallel execution)
   */
  async routeBatch(requests: LLMRequest[]): Promise<LLMResponse[]> {
    return Promise.all(requests.map(req => this.route(req)));
  }

  /**
   * Test both providers and return comparison
   * Useful for A/B testing and quality assessment
   */
  async compareProviders(request: LLMRequest): Promise<{
    claude: LLMResponse;
    gpt4o: LLMResponse;
    winner: LLMProvider;
  }> {
    const [claudeResult, gpt4oResult] = await Promise.all([
      this.callClaude(request, Date.now()),
      this.callGPT4o(request, Date.now())
    ]);

    // Simple heuristic: prefer faster response if quality is similar
    // In production, you'd use more sophisticated quality metrics
    const winner = claudeResult.latency < gpt4oResult.latency ? 'claude' : 'gpt4o';

    return {
      claude: claudeResult,
      gpt4o: gpt4oResult,
      winner
    };
  }

  /**
   * Get provider stats (for monitoring dashboard)
   */
  getProviderStats() {
    return {
      providers: ['claude', 'gpt4o'],
      costs: this.COSTS,
      routing: {
        creative: 'claude',
        factual: 'gpt4o',
        mixed: 'claude'
      }
    };
  }
}

// Singleton instance
export const llmRouter = new LLMRouter();
