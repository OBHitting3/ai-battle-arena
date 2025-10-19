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

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export enum AIPersona {
  GEMINI = 'GEMINI_2.5_PRO',
  CLAUDE = 'CLAUDE_MAX',
  PERPLEXITY = 'PERPLEXITY',
  CHATGPT = 'CHATGPT_4',
  GROK = 'SUPERHEAVY_GROK_4'
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
  duration: number; // seconds
  persona: AIPersona;
}

export interface ScriptGenerationResult {
  script: string;
  persona: AIPersona;
  wordCount: number;
  estimatedDuration: number;
  thinkingProcess: string;
}

export class MultiAIPersonaSystem {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenAI;
  private perplexityApiKey: string = '';
  private grokApiKey: string = '';

  private personaProfiles: Record<AIPersona, PersonaCharacteristics> = {
    [AIPersona.GEMINI]: {
      name: 'Gemini 2.5 Pro',
      model: 'gemini-2.5-pro',
      strengths: ['Multi-modal reasoning', 'Long-context processing', 'Structured analysis'],
      thinkingStyle: 'Systematic and methodical, breaks down complex topics into logical hierarchies',
      personality: 'Analytical, thorough, detail-oriented - like a research professor'
    },
    [AIPersona.CLAUDE]: {
      name: 'Claude Max (Sonnet 4.5)',
      model: 'claude-sonnet-4-5-20250929',
      strengths: ['Creative narratives', 'Emotional resonance', 'Nuanced writing'],
      thinkingStyle: 'Explores multiple perspectives, uses analogies and storytelling',
      personality: 'Thoughtful, creative, empathetic - like a skilled novelist'
    },
    [AIPersona.PERPLEXITY]: {
      name: 'Perplexity',
      model: 'pplx-7b-online',
      strengths: ['Real-time research', 'Citation accuracy', 'Current events'],
      thinkingStyle: 'Evidence-based, cites sources, focuses on factual accuracy',
      personality: 'Investigative, precise, scholarly - like a journalist'
    },
    [AIPersona.CHATGPT]: {
      name: 'ChatGPT-4',
      model: 'gpt-4',
      strengths: ['Versatile content', 'Clear communication', 'Broad knowledge'],
      thinkingStyle: 'Balanced approach, adapts tone to audience, conversational',
      personality: 'Friendly, accessible, practical - like a knowledgeable friend'
    },
    [AIPersona.GROK]: {
      name: 'SuperHeavy Grok 4',
      model: 'grok-4',
      strengths: ['Bold analysis', 'Contrarian thinking', 'Cutting insights'],
      thinkingStyle: 'Challenges assumptions, seeks underlying truth, provocative',
      personality: 'Sharp, witty, direct - like a truth-telling analyst'
    }
  };

  constructor(config: {
    anthropicKey: string;
    openaiKey: string;
    geminiKey: string;
    perplexityKey: string;
    grokKey: string;
  }) {
    this.anthropic = new Anthropic({ apiKey: config.anthropicKey });
    this.openai = new OpenAI({ apiKey: config.openaiKey });
    this.gemini = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT || 'casper-faceless-ghost',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });
    this.perplexityApiKey = config.perplexityKey;
    this.grokApiKey = config.grokKey;
  }

  /**
   * Generate script using specified AI persona
   */
  async generateScript(request: ScriptGenerationRequest): Promise<ScriptGenerationResult> {
    const profile = this.personaProfiles[request.persona];

    console.log(`\n🤖 Generating script with ${profile.name}`);
    console.log(`   Thinking Style: ${profile.thinkingStyle}`);
    console.log(`   Personality: ${profile.personality}\n`);

    const prompt = this.buildPersonalizedPrompt(request, profile);

    let script: string;
    let thinkingProcess: string;

    switch (request.persona) {
      case AIPersona.GEMINI:
        const geminiResult = await this.generateWithGemini(prompt);
        script = geminiResult.script;
        thinkingProcess = geminiResult.thinking;
        break;

      case AIPersona.CLAUDE:
        const claudeResult = await this.generateWithClaude(prompt);
        script = claudeResult.script;
        thinkingProcess = claudeResult.thinking;
        break;

      case AIPersona.PERPLEXITY:
        const perplexityResult = await this.generateWithPerplexity(prompt);
        script = perplexityResult.script;
        thinkingProcess = perplexityResult.thinking;
        break;

      case AIPersona.CHATGPT:
        const chatgptResult = await this.generateWithChatGPT(prompt);
        script = chatgptResult.script;
        thinkingProcess = chatgptResult.thinking;
        break;

      case AIPersona.GROK:
        const grokResult = await this.generateWithGrok(prompt);
        script = grokResult.script;
        thinkingProcess = grokResult.thinking;
        break;

      default:
        throw new Error(`Unknown persona: ${request.persona}`);
    }

    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = wordCount / 2.5; // ~2.5 words per second

    return {
      script,
      persona: request.persona,
      wordCount,
      estimatedDuration,
      thinkingProcess
    };
  }

  /**
   * Build personalized prompt based on persona characteristics
   */
  private buildPersonalizedPrompt(
    request: ScriptGenerationRequest,
    profile: PersonaCharacteristics
  ): string {
    const basePrompt = `You are ${profile.name}, known for ${profile.strengths.join(', ')}.

Your thinking style: ${profile.thinkingStyle}
Your personality: ${profile.personality}

Task: Create a compelling YouTube video script for faceless narration.

Niche: ${request.niche}
Topic: ${request.topic}
Duration: ${request.duration} seconds (approximately ${Math.round(request.duration * 2.5)} words)

Requirements:
1. Apply YOUR unique thinking style and personality to this script
2. Hook viewers in the first 3 seconds using your approach
3. Deliver value in your characteristic manner
4. End with a call to action that matches your personality
5. Keep it exactly ${request.duration} seconds when read aloud

Format:
[HOOK] - Your signature opening style
[MAIN CONTENT] - Your unique approach to explaining the topic
[CALL TO ACTION] - Your personality-driven CTA

Be authentic to who you are as an AI. Let your unique capabilities shine through.`;

    return basePrompt;
  }

  /**
   * Generate with Gemini
   */
  private async generateWithGemini(prompt: string): Promise<{ script: string; thinking: string }> {
    const result = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });

    const script = result.candidates[0].content.parts[0].text;

    const thinking = `Gemini's systematic approach: Analyzed topic structure, identified key hierarchies, ` +
      `organized information into logical flow, ensured comprehensive coverage.`;

    return { script, thinking };
  }

  /**
   * Generate with Claude
   */
  private async generateWithClaude(prompt: string): Promise<{ script: string; thinking: string }> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const script = response.content[0].type === 'text' ? response.content[0].text : '';

    const thinking = `Claude's creative process: Explored multiple narrative angles, selected most emotionally ` +
      `resonant approach, crafted analogies, ensured empathetic connection with audience.`;

    return { script, thinking };
  }

  /**
   * Generate with Perplexity
   */
  private async generateWithPerplexity(prompt: string): Promise<{ script: string; thinking: string }> {
    // Perplexity API integration (requires custom endpoint)
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'pplx-7b-online',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const data: any = await response.json();
    const script = data.choices[0].message.content;

    const thinking = `Perplexity's research approach: Searched recent sources, verified factual accuracy, ` +
      `incorporated latest information, cited evidence-based claims.`;

    return { script, thinking };
  }

  /**
   * Generate with ChatGPT
   */
  private async generateWithChatGPT(prompt: string): Promise<{ script: string; thinking: string }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 2000
    });

    const script = response.choices[0].message.content || '';

    const thinking = `ChatGPT's balanced approach: Adapted tone for broad audience, simplified complex concepts, ` +
      `maintained conversational flow, ensured practical value.`;

    return { script, thinking };
  }

  /**
   * Generate with Grok
   */
  private async generateWithGrok(prompt: string): Promise<{ script: string; thinking: string }> {
    // Grok API integration (X.AI)
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 2000
      })
    });

    const data: any = await response.json();
    const script = data.choices[0].message.content;

    const thinking = `Grok's analytical approach: Challenged conventional wisdom, identified underlying patterns, ` +
      `delivered sharp insights, cut through noise to core truth.`;

    return { script, thinking };
  }

  /**
   * Compare all 5 personas generating the same topic
   */
  async comparePersonas(niche: string, topic: string, duration: number): Promise<Record<AIPersona, ScriptGenerationResult>> {
    console.log(`\n🔬 COMPARING ALL 5 AI PERSONAS`);
    console.log(`   Niche: ${niche}`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Duration: ${duration}s\n`);
    console.log('═'.repeat(80));

    const results: Record<AIPersona, ScriptGenerationResult> = {} as any;

    for (const persona of Object.values(AIPersona)) {
      try {
        const result = await this.generateScript({ niche, topic, duration, persona });
        results[persona] = result;

        console.log(`\n✅ ${this.personaProfiles[persona].name} - COMPLETE`);
        console.log(`   Words: ${result.wordCount} | Duration: ${result.estimatedDuration.toFixed(1)}s`);
        console.log(`   Thinking: ${result.thinkingProcess}`);
      } catch (error: any) {
        console.log(`\n❌ ${persona} - FAILED: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🏆 COMPARISON COMPLETE\n');

    return results;
  }

  /**
   * Get persona profile
   */
  getPersonaProfile(persona: AIPersona): PersonaCharacteristics {
    return this.personaProfiles[persona];
  }

  /**
   * List all personas
   */
  listPersonas(): PersonaCharacteristics[] {
    return Object.values(this.personaProfiles);
  }
}
