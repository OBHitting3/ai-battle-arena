/**
 * PHASE 1: GEMINI INTERPRETER
 *
 * For planning conversations between Karl and Claude
 * Gemini organizes Karl's thoughts (doesn't change intent)
 * Karl approves before sending to Claude
 * Everything timestamped and versioned
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface OrganizedMessage {
  version: string;
  timestamp: string;
  original: string;
  organized: string;
  changes: string[];
  approved: boolean;
}

export class Phase1GeminiInterpreter {
  private gemini: GoogleGenAI;
  private messageCount: number = 0;
  private sessionDate: string;
  private history: OrganizedMessage[] = [];

  constructor(geminiKey: string) {
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
    this.sessionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Organize Karl's message (doesn't change intent)
   */
  async organizeMessage(karlInput: string): Promise<OrganizedMessage> {
    this.messageCount++;
    const version = `v${this.messageCount}.00`;
    const timestamp = new Date().toISOString();

    const prompt = `You are Gemini, Karl's personal interpreter for PHASE 1 planning conversations.

CRITICAL RULES:
1. DO NOT change Karl's intention or meaning
2. DO organize his thoughts to be clearer
3. DO make it more direct and effective
4. DO make it easier for Claude to understand immediately
5. DO fix typos and grammar
6. DO structure rambling into organized points
7. DO NOT add new ideas Karl didn't say
8. DO NOT remove anything Karl said

YOUR TASK:
Take Karl's message and organize it so Claude understands immediately.
Think of it like: Karl knows what he wants, you're just making it crystal clear.

KARL'S MESSAGE:
"""
${karlInput}
"""

RESPOND IN THIS EXACT JSON FORMAT:
{
  "organized": "The organized, clear version of Karl's message",
  "changes": [
    "List each change you made (e.g., 'Fixed typo: teh → the')",
    "Another change (e.g., 'Organized rambling into 3 clear points')"
  ]
}

Keep Karl's voice. Keep his intent. Just make it CLEAR.`;

    const result = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt
    });

    const responseText = result.candidates[0].content.parts[0].text;

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini did not return valid JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const organized: OrganizedMessage = {
      version,
      timestamp,
      original: karlInput,
      organized: parsed.organized,
      changes: parsed.changes || [],
      approved: false
    };

    return organized;
  }

  /**
   * Approve and save message
   */
  approveMessage(message: OrganizedMessage): OrganizedMessage {
    message.approved = true;
    this.history.push(message);
    return message;
  }

  /**
   * Get conversation history
   */
  getHistory(): OrganizedMessage[] {
    return this.history;
  }

  /**
   * Get current version number
   */
  getCurrentVersion(): string {
    return `v${this.messageCount}.00`;
  }

  /**
   * Reset for new session
   */
  resetSession(): void {
    this.messageCount = 0;
    this.sessionDate = new Date().toISOString().split('T')[0];
    this.history = [];
  }
}
