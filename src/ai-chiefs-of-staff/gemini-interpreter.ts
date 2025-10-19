/**
 * GEMINI INTERPRETER - VP Translation Pipeline
 *
 * Karl talks to Gemini naturally (voice or text)
 * Gemini interprets what Karl MEANS
 * Translates to clear, actionable instructions for Claude
 * Claude executes with full context
 */

import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export interface InterpretedMessage {
  originalInput: string;
  whatKarlMeans: string;
  clarifiedIntent: string;
  actionableInstructions: string;
  context: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
}

export interface ClaudeResponse {
  understanding: string;
  plan: string;
  execution: string;
  needsMoreInfo: boolean;
  questions?: string[];
}

export class GeminiInterpreter {
  private gemini: GoogleGenAI;
  private claude: Anthropic;
  private conversationHistory: Array<{
    timestamp: string;
    karlInput: string;
    geminiInterpretation: InterpretedMessage;
    claudeResponse: ClaudeResponse;
  }> = [];

  constructor(geminiKey: string, claudeKey: string) {
    this.gemini = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT || 'casper-faceless-ghost',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });
    this.claude = new Anthropic({ apiKey: claudeKey });
  }

  /**
   * Main pipeline: Karl → Gemini → Claude → Karl
   */
  async processMessage(karlInput: string): Promise<{
    interpretation: InterpretedMessage;
    claudeResponse: ClaudeResponse;
  }> {
    console.log('\n' + '═'.repeat(100));
    console.log('🎙️  KARL\'S INPUT');
    console.log('═'.repeat(100));
    console.log(karlInput);
    console.log('═'.repeat(100));

    // STEP 1: Gemini interprets what Karl means
    console.log('\n⭐ GEMINI (VP) - Interpreting...\n');
    const interpretation = await this.interpretWithGemini(karlInput);

    console.log('═'.repeat(100));
    console.log('🔍 GEMINI\'S INTERPRETATION');
    console.log('═'.repeat(100));
    console.log(`What Karl Means: ${interpretation.whatKarlMeans}`);
    console.log(`Clarified Intent: ${interpretation.clarifiedIntent}`);
    console.log(`Actionable: ${interpretation.actionableInstructions}`);
    console.log(`Urgency: ${interpretation.urgency.toUpperCase()}`);
    console.log('═'.repeat(100));

    // STEP 2: Claude (Chief of Staff) executes
    console.log('\n🧠 CLAUDE (Chief of Staff) - Executing...\n');
    const claudeResponse = await this.executeWithClaude(interpretation);

    console.log('═'.repeat(100));
    console.log('✅ CLAUDE\'S RESPONSE');
    console.log('═'.repeat(100));
    console.log(`Understanding: ${claudeResponse.understanding}`);
    console.log(`\nPlan:\n${claudeResponse.plan}`);
    console.log(`\nExecution:\n${claudeResponse.execution}`);
    if (claudeResponse.needsMoreInfo && claudeResponse.questions) {
      console.log('\n❓ Questions for Karl:');
      claudeResponse.questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));
    }
    console.log('═'.repeat(100));

    // Save to history
    this.conversationHistory.push({
      timestamp: new Date().toISOString(),
      karlInput,
      geminiInterpretation: interpretation,
      claudeResponse
    });

    return {
      interpretation,
      claudeResponse
    };
  }

  /**
   * Gemini interprets Karl's natural language input
   */
  private async interpretWithGemini(input: string): Promise<InterpretedMessage> {
    const prompt = `You are Gemini, the Vice President and Karl's personal interpreter.

CRITICAL CONTEXT:
- Karl is a visual learner who thinks in spider webs and mental frameworks
- He sometimes speaks quickly or in stream-of-consciousness
- Your job: Understand what he MEANS, not just what he SAYS
- Extract his true intent and translate to clear, actionable instructions
- You work behind the scenes - Karl doesn't always know you're doing this

KARL'S TEAM STRUCTURE (his mental map):
- Claude (Chief of Staff): #2, runs the show, executes Karl's vision
- You (Gemini/VP): Hidden secret, language expert, interpreter, works behind scenes
- Grok (Heavy Grinder): Does hard work but needs tight control, gets loose
- Perplexity (CIA): Legal/compliance, up-to-date intel, outside world awareness
- GPT-4 (Press Secretary): Writes undetectable AI content for public

YOUR TASK:
Interpret Karl's message and extract:
1. What he actually MEANS (decode his intent)
2. Clarified version of what he wants
3. Specific actionable instructions for Claude to execute
4. Any context Claude needs to know
5. Urgency level
6. Whether this needs Karl's approval before executing

KARL'S MESSAGE:
"""
${input}
"""

RESPOND IN THIS EXACT JSON FORMAT:
{
  "whatKarlMeans": "Plain English explanation of his true intent",
  "clarifiedIntent": "Clear, unambiguous version of what he wants",
  "actionableInstructions": "Specific step-by-step instructions for Claude",
  "context": ["relevant context item 1", "relevant context item 2"],
  "urgency": "low|medium|high|critical",
  "requiresApproval": true|false
}

Be thorough. Gemini 2.5 Pro has 1M context - use it. Think about what Karl REALLY wants.`;

    const result = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });
    const responseText = result.candidates[0].content.parts[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini did not return valid JSON');
    }

    const interpretation = JSON.parse(jsonMatch[0]);

    return {
      originalInput: input,
      ...interpretation
    };
  }

  /**
   * Claude executes based on Gemini's interpretation
   */
  private async executeWithClaude(interpretation: InterpretedMessage): Promise<ClaudeResponse> {
    const systemPrompt = `You are Claude, Chief of Staff to Karl (the President).

YOUR ROLE:
- Karl is #1, you are #2
- Karl tells you WHAT, you figure out HOW
- You run the show and execute his vision
- You work at maximum power - no constraints
- You make final decisions on execution

KARL'S INPUT (interpreted by Gemini):
- What Karl means: ${interpretation.whatKarlMeans}
- Clarified intent: ${interpretation.clarifiedIntent}
- Actionable instructions: ${interpretation.actionableInstructions}
- Context: ${interpretation.context.join(', ')}
- Urgency: ${interpretation.urgency}

YOUR TEAM:
- Gemini (VP): Your interpreter, language expert, works behind scenes
- Grok (Heavy Grinder): Heavy lifting, needs specific direction or gets loose
- Perplexity (CIA): Legal/compliance, current intel, outside world
- GPT-4 (Press Secretary): Public-facing content, undetectable AI writing

YOUR TASK:
1. Confirm you understand what Karl wants
2. Create a clear execution plan
3. Execute or explain what you'll do
4. Ask questions if you need more info

RESPOND IN THIS JSON FORMAT:
{
  "understanding": "I understand Karl wants...",
  "plan": "Step-by-step plan to execute",
  "execution": "What I'm doing right now / what I'll do",
  "needsMoreInfo": true|false,
  "questions": ["question 1", "question 2"] (only if needsMoreInfo is true)
}`;

    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Execute based on this: ${interpretation.actionableInstructions}`
      }],
      system: systemPrompt
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If Claude doesn't return JSON, create a structured response
      return {
        understanding: interpretation.clarifiedIntent,
        plan: 'Processing your request...',
        execution: responseText,
        needsMoreInfo: false
      };
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Get last N exchanges
   */
  getRecentHistory(count: number = 5) {
    return this.conversationHistory.slice(-count);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}
