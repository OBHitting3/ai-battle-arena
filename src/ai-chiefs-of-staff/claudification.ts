/**
 * DREAM OF CLAUDIFICATION
 *
 * Phase 1: Planning interface optimized for Claude
 * Converts Karl's thoughts into Claude's preferred formats
 */

import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export enum ClaudeFormat {
  EXEC_BRIEF = 'EXEC_BRIEF',
  TECH_SPEC = 'TECH_SPEC',
  RESEARCH_QUERY = 'RESEARCH_QUERY',
  DEBUG_REPORT = 'DEBUG_REPORT'
}

export interface ClaudifiedMessage {
  version: string;
  timestamp: string;
  original: string;
  formats: {
    execBrief: string;
    techSpec: string;
    researchQuery: string;
    debugReport: string;
  };
  selectedFormat: ClaudeFormat;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class Claudification {
  private gemini: GoogleGenAI;
  private claude: Anthropic;
  private messageCount: number = 0;
  private sessionDate: string;
  private conversationHistory: ConversationMessage[] = [];

  constructor(geminiKey: string, claudeKey: string) {
    // Use Vertex AI (Google Cloud with $300 credits) instead of Gemini API (exhausted quota)
    // VERIFIED from node_modules/@google/genai/dist/node/node.d.ts:
    // - Line 3375: GoogleGenAIOptions interface
    // - Line 3385: vertexai?: boolean
    // - Line 3394: project?: string
    // - Line 3402: location?: string
    this.gemini = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT || 'casper-faceless-ghost',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });
    this.claude = new Anthropic({
      apiKey: claudeKey
    });
    this.sessionDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Convert Karl's message into all 4 Claude-optimized formats
   */
  async claudify(karlInput: string): Promise<ClaudifiedMessage> {
    this.messageCount++;
    const version = `v${this.messageCount}.00`;
    const timestamp = new Date().toISOString();

    const prompt = `You are Gemini, converting Karl's message into Claude's 4 preferred formats.

KARL'S MESSAGE:
"""
${karlInput}
"""

CONVERT TO ALL 4 FORMATS:

1. EXECUTIVE BRIEF (Best for quick tasks)
   - Clear objective (1 sentence)
   - Key requirements (3-5 bullets)
   - Success criteria (what done looks like)
   - Constraints (if any)

2. TECHNICAL SPEC (Best for building)
   - What to build
   - Technical requirements
   - File structure needed
   - Dependencies

3. RESEARCH QUERY (Best for investigation)
   - Question to answer
   - What to research
   - Sources to check
   - Depth needed (quick/medium/deep)

4. DEBUG REPORT (Best for fixing)
   - Problem description
   - Expected behavior
   - Actual behavior
   - Error messages (if any)

RESPOND IN JSON:
{
  "execBrief": "formatted executive brief",
  "techSpec": "formatted technical spec",
  "researchQuery": "formatted research query",
  "debugReport": "formatted debug report"
}

Make each format PERFECT for Claude to execute immediately.`;

    const result = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });

    const responseText = result.candidates[0].content.parts[0].text;

    console.log('\n🔍 Gemini Response:', responseText.substring(0, 500));

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Gemini response');
      throw new Error('Gemini did not return valid JSON');
    }

    let formats;
    try {
      formats = JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error('Failed to parse Gemini response as JSON');
    }

    // Validate formats exist
    if (!formats.execBrief || !formats.techSpec || !formats.researchQuery || !formats.debugReport) {
      throw new Error('Gemini response missing required format fields');
    }

    return {
      version,
      timestamp,
      original: karlInput,
      formats,
      selectedFormat: ClaudeFormat.EXEC_BRIEF // Default
    };
  }

  /**
   * Send formatted message to Claude and get response
   */
  async sendToClaude(formattedMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: formattedMessage,
      timestamp: new Date().toISOString()
    });

    // Call Claude API
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8096,
      messages: this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Add Claude's response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString()
    });

    return assistantMessage;
  }

  /**
   * Translate Claude's response back to Karl-friendly format via Gemini
   */
  async translateForKarl(claudeResponse: string): Promise<string> {
    const prompt = `You are Gemini, translating Claude's technical response into a simple, friendly format for Karl.

CLAUDE'S RESPONSE:
"""
${claudeResponse}
"""

YOUR JOB:
1. Simplify technical jargon into plain English
2. Keep it conversational and friendly
3. Highlight key takeaways in bullet points
4. Make it scannable - Karl is busy
5. Keep the essential information but make it digestible

FORMAT:
- Start with a friendly 1-sentence summary
- List 3-5 key points
- Add any important details
- End with next steps if applicable

Keep it under 300 words unless absolutely necessary.`;

    const result = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });

    return result.candidates[0].content.parts[0].text;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    this.conversationHistory = [];
  }

  getCurrentVersion(): string {
    return `v${this.messageCount + 1}.00`;
  }

  getSessionDate(): string {
    return this.sessionDate;
  }
}
