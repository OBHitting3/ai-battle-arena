/**
 * AI BATTLE ARENA
 *
 * Multiple AIs compete to answer your question:
 * - Claude (Anthropic)
 * - GPT-4 (OpenAI)
 * - Gemini (Google Vertex AI)
 * - Perplexity
 * - Grok (xAI)
 *
 * They defend their answers, show their work, and get multiple chances.
 * The best answer wins and gets synthesized into a final report.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface AIContestant {
  name: string;
  model: string;
  color: string;
  icon: string;
}

export interface AIResponse {
  contestant: string;
  answer: string;
  reasoning: string;
  sources: string[];
  confidence: number;
  round: number;
  timestamp: string;
}

export interface BattleResult {
  question: string;
  responses: AIResponse[];
  winner: string;
  finalReport: string;
  judgeReasoning: string;
  timestamp: string;
}

export class AIBattleArena {
  private claude: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenAI;

  private contestants: AIContestant[] = [
    { name: 'Claude Sonnet 4.5', model: 'claude-sonnet-4-5-20250929', color: '#9b59b6', icon: '🧠' },
    { name: 'ChatGPT o1', model: 'o1-2024-12-17', color: '#10a37f', icon: '🤖' },
    { name: 'Gemini 2.5 Pro', model: 'gemini-2.5-pro', color: '#4285f4', icon: '✨' },
    { name: 'Perplexity Sonar', model: 'sonar', color: '#20b8cd', icon: '🔍' },
    { name: 'Grok 4 Fast', model: 'grok-4-fast-reasoning', color: '#000000', icon: '🚀' }
  ];

  constructor() {
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.gemini = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT || 'casper-faceless-ghost',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });
  }

  /**
   * Main battle: All AIs compete to answer the question
   */
  async battle(question: string, rounds: number = 3): Promise<BattleResult> {
    console.log(`\n🏟️  AI BATTLE ARENA - Question: "${question}"`);
    console.log(`📊 Contestants: ${this.contestants.length} | Rounds: ${rounds}\n`);

    const allResponses: AIResponse[] = [];

    // Round 1: Initial answers
    console.log('🔔 ROUND 1: Initial Answers');
    const round1Responses = await this.getRound1Answers(question);
    allResponses.push(...round1Responses);

    // Round 2: Defend and improve (seeing others' answers)
    if (rounds >= 2) {
      console.log('\n🔔 ROUND 2: Defend & Improve');
      const round2Responses = await this.getRound2Improvements(question, round1Responses);
      allResponses.push(...round2Responses);
    }

    // Round 3: Final refinement
    if (rounds >= 3) {
      console.log('\n🔔 ROUND 3: Final Refinement');
      const round3Responses = await this.getRound3Refinements(question, allResponses);
      allResponses.push(...round3Responses);
    }

    // Judge and synthesize
    console.log('\n⚖️  JUDGING & SYNTHESIS');
    const judgeResult = await this.judgeAndSynthesize(question, allResponses);

    return {
      question,
      responses: allResponses,
      winner: judgeResult.winner,
      finalReport: judgeResult.finalReport,
      judgeReasoning: judgeResult.reasoning,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Round 1: Each AI gives their initial answer
   */
  private async getRound1Answers(question: string): Promise<AIResponse[]> {
    const prompt = `You are competing against other AIs to provide the BEST answer.

QUESTION: ${question}

REQUIREMENTS:
1. Give your BEST, most comprehensive answer
2. Show ALL your work and reasoning
3. Cite sources if applicable
4. Explain WHY your answer is superior
5. Rate your confidence (0-100)

Format your response as:
ANSWER:
[Your detailed answer]

REASONING:
[Why this is the best approach]

SOURCES:
[Any sources or data used]

CONFIDENCE: [0-100]`;

    const responses = await Promise.all([
      this.askClaude(prompt, 1),
      this.askGPT4(prompt, 1),
      this.askGemini(prompt, 1),
      this.askPerplexity(prompt, 1),
      this.askGrok(prompt, 1)
    ]);

    return responses.filter(r => r !== null) as AIResponse[];
  }

  /**
   * Round 2: See competitors' answers and improve
   */
  private async getRound2Improvements(
    question: string,
    round1Responses: AIResponse[]
  ): Promise<AIResponse[]> {
    const competitorSummary = round1Responses
      .map(r => `${r.contestant}: ${r.answer.substring(0, 200)}...`)
      .join('\n\n');

    const prompt = `You are in Round 2 of an AI competition.

ORIGINAL QUESTION: ${question}

YOUR COMPETITORS' ANSWERS:
${competitorSummary}

NOW:
1. Review the competition's answers
2. Find weaknesses in their responses
3. IMPROVE your answer to beat them
4. Show why yours is NOW the best
5. Update your confidence

Format your response as before:
ANSWER:
[Your improved answer]

REASONING:
[Why you now beat the competition]

SOURCES:
[Sources]

CONFIDENCE: [0-100]`;

    const responses = await Promise.all([
      this.askClaude(prompt, 2),
      this.askGPT4(prompt, 2),
      this.askGemini(prompt, 2),
      this.askPerplexity(prompt, 2),
      this.askGrok(prompt, 2)
    ]);

    return responses.filter(r => r !== null) as AIResponse[];
  }

  /**
   * Round 3: Final refinement
   */
  private async getRound3Refinements(
    question: string,
    allPreviousResponses: AIResponse[]
  ): Promise<AIResponse[]> {
    const bestSoFar = allPreviousResponses
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(r => `${r.contestant} (R${r.round}): ${r.answer.substring(0, 150)}...`)
      .join('\n\n');

    const prompt = `FINAL ROUND of AI competition!

QUESTION: ${question}

TOP 3 ANSWERS SO FAR:
${bestSoFar}

This is your LAST CHANCE to win:
1. Give your ABSOLUTE BEST answer
2. Address any remaining gaps
3. Make it PERFECT
4. Final confidence rating

ANSWER:
[Your final, best answer]

REASONING:
[Why this wins]

SOURCES:
[Sources]

CONFIDENCE: [0-100]`;

    const responses = await Promise.all([
      this.askClaude(prompt, 3),
      this.askGPT4(prompt, 3),
      this.askGemini(prompt, 3),
      this.askPerplexity(prompt, 3),
      this.askGrok(prompt, 3)
    ]);

    return responses.filter(r => r !== null) as AIResponse[];
  }

  /**
   * Judge all responses and create final synthesis
   */
  private async judgeAndSynthesize(
    question: string,
    allResponses: AIResponse[]
  ): Promise<{ winner: string; finalReport: string; reasoning: string }> {
    const responsesSummary = allResponses
      .map(r => `${r.contestant} (Round ${r.round}, Confidence: ${r.confidence}):
Answer: ${r.answer}
Reasoning: ${r.reasoning}
`)
      .join('\n---\n');

    const judgePrompt = `You are the JUDGE in an AI competition.

QUESTION ASKED: ${question}

ALL RESPONSES FROM ALL ROUNDS:
${responsesSummary}

YOUR JOB:
1. Evaluate each response for accuracy, completeness, and quality
2. Declare a WINNER
3. Create a FINAL SYNTHESIZED REPORT combining the best parts
4. Explain your judging criteria

Format:
WINNER: [AI Name and why]

FINAL REPORT:
[Synthesized best answer using insights from all AIs]

JUDGING REASONING:
[How you decided]`;

    const judgeResponse = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8096,
      messages: [{
        role: 'user',
        content: judgePrompt
      }]
    });

    const result = judgeResponse.content[0].type === 'text'
      ? judgeResponse.content[0].text
      : '';

    // Parse the result
    const winnerMatch = result.match(/WINNER:\s*(.+?)(?=\n\n)/s);
    const reportMatch = result.match(/FINAL (?:SYNTHESIZED )?REPORT:\s*(.+?)(?=\n\n##\s+JUDGING REASONING|$)/s);
    const reasoningMatch = result.match(/##\s+JUDGING REASONING:\s*(.+?)(?=\n\n##|$)/s);

    return {
      winner: winnerMatch ? winnerMatch[1].trim() : 'Unknown',
      finalReport: reportMatch ? reportMatch[1].trim() : result,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : result
    };
  }

  /**
   * Ask Claude
   */
  private async askClaude(prompt: string, round: number): Promise<AIResponse | null> {
    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return this.parseResponse('Claude', text, round);
    } catch (error) {
      console.error('Claude error:', error);
      return null;
    }
  }

  /**
   * Ask GPT-4
   */
  private async askGPT4(prompt: string, round: number): Promise<AIResponse | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o1-2024-12-17',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 4096
      });

      const text = response.choices[0].message.content || '';
      return this.parseResponse('ChatGPT o1', text, round);
    } catch (error) {
      console.error('GPT-4 error:', error);
      return null;
    }
  }

  /**
   * Ask Gemini
   */
  private async askGemini(prompt: string, round: number): Promise<AIResponse | null> {
    try {
      const result = await this.gemini.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
      });

      const text = result.candidates[0].content.parts[0].text;
      return this.parseResponse('Gemini', text, round);
    } catch (error) {
      console.error('Gemini error:', error);
      return null;
    }
  }

  /**
   * Ask Perplexity
   */
  private async askPerplexity(prompt: string, round: number): Promise<AIResponse | null> {
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar',
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data.choices[0].message.content;
      return this.parseResponse('Perplexity', text, round);
    } catch (error) {
      console.error('Perplexity error:', error);
      return null;
    }
  }

  /**
   * Ask Grok
   */
  private async askGrok(prompt: string, round: number): Promise<AIResponse | null> {
    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-4-fast-reasoning',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data.choices[0].message.content;
      return this.parseResponse('Grok', text, round);
    } catch (error) {
      console.error('Grok error:', error);
      return null;
    }
  }

  /**
   * Parse AI response into structured format
   */
  private parseResponse(contestant: string, text: string, round: number): AIResponse {
    const answerMatch = text.match(/ANSWER:\s*(.+?)(?=\n(?:REASONING|SOURCES|CONFIDENCE):|$)/s);
    const reasoningMatch = text.match(/REASONING:\s*(.+?)(?=\n(?:SOURCES|CONFIDENCE):|$)/s);
    const sourcesMatch = text.match(/SOURCES:\s*(.+?)(?=\nCONFIDENCE:|$)/s);
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/);

    return {
      contestant,
      answer: answerMatch ? answerMatch[1].trim() : text,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
      sources: sourcesMatch ? [sourcesMatch[1].trim()] : [],
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
      round,
      timestamp: new Date().toISOString()
    };
  }

  getContestants(): AIContestant[] {
    return this.contestants;
  }
}
