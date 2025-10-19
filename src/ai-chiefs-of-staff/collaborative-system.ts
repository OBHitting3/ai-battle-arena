/**
 * COLLABORATIVE AI SYSTEM
 *
 * AIs actually debate and build on each other's ideas
 * Not just separate responses - real collaboration
 */

import { ChiefOfStaffSystem, Chief, ChiefResponse } from './chief-of-staff-system';

export interface DebateRound {
  roundNumber: number;
  responses: ChiefResponse[];
  consensus?: string;
}

export interface CollaborativeSession {
  topic: string;
  rounds: DebateRound[];
  finalDecision?: string;
  savedPath?: string;
}

export class CollaborativeAISystem {
  private chiefs: ChiefOfStaffSystem;

  constructor(chiefs: ChiefOfStaffSystem) {
    this.chiefs = chiefs;
  }

  /**
   * Run a collaborative session where AIs debate and build on each other's ideas
   */
  async collaborate(
    topic: string,
    maxRounds: number = 3,
    participatingChiefs: Chief[] = [Chief.CLAUDE, Chief.GPT4, Chief.GEMINI, Chief.GROK]
  ): Promise<CollaborativeSession> {
    console.log('\n' + '═'.repeat(100));
    console.log('🤝 COLLABORATIVE AI SESSION STARTING');
    console.log('═'.repeat(100));
    console.log(`\nTopic: "${topic}"`);
    console.log(`Participants: ${participatingChiefs.length} chiefs`);
    console.log(`Max rounds: ${maxRounds}\n`);

    const session: CollaborativeSession = {
      topic,
      rounds: []
    };

    // Round 1: Initial perspectives
    console.log('\n📍 ROUND 1: Initial Perspectives');
    console.log('─'.repeat(100));

    const round1Responses: ChiefResponse[] = [];

    for (const chief of participatingChiefs) {
      try {
        console.log(`\n⏳ Asking ${this.chiefs.getChiefProfile(chief).name}...`);
        const response = await this.chiefs.askChief(chief, topic);
        round1Responses.push(response);
        console.log(`✅ Response received`);
      } catch (error: any) {
        console.log(`❌ ${chief} unavailable: ${error.message}`);
      }
    }

    session.rounds.push({
      roundNumber: 1,
      responses: round1Responses
    });

    this.displayRound(1, round1Responses);

    // Subsequent rounds: AIs respond to each other
    for (let round = 2; round <= maxRounds; round++) {
      console.log(`\n📍 ROUND ${round}: Building on Previous Ideas`);
      console.log('─'.repeat(100));

      const previousRound = session.rounds[session.rounds.length - 1];
      const contextSummary = this.buildContextSummary(previousRound.responses);

      const roundResponses: ChiefResponse[] = [];

      for (const chief of participatingChiefs) {
        try {
          const prompt = `Previous discussion:\n${contextSummary}\n\nBased on what the other chiefs said, provide your response. Build on good ideas, challenge weak points, and suggest improvements.`;

          console.log(`\n⏳ ${this.chiefs.getChiefProfile(chief).name} responding to the group...`);
          const response = await this.chiefs.askChief(chief, prompt);
          roundResponses.push(response);
          console.log(`✅ Response received`);
        } catch (error: any) {
          console.log(`❌ ${chief} unavailable: ${error.message}`);
        }
      }

      session.rounds.push({
        roundNumber: round,
        responses: roundResponses
      });

      this.displayRound(round, roundResponses);

      // Check for consensus
      if (round === maxRounds) {
        session.finalDecision = await this.synthesizeDecision(session);
      }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('🎯 FINAL DECISION');
    console.log('═'.repeat(100));
    console.log(session.finalDecision);
    console.log('\n' + '═'.repeat(100) + '\n');

    return session;
  }

  /**
   * Build a summary of previous responses for context
   */
  private buildContextSummary(responses: ChiefResponse[]): string {
    return responses.map(r => {
      const profile = this.chiefs.getChiefProfile(r.chief);
      return `${profile.name} said:\n${r.response.substring(0, 500)}...\n`;
    }).join('\n');
  }

  /**
   * Synthesize final decision from all rounds
   */
  private async synthesizeDecision(session: CollaborativeSession): Promise<string> {
    console.log('\n⏳ Synthesizing final decision from all rounds...');

    const allResponses = session.rounds.flatMap(r => r.responses);
    const summary = allResponses.map(r => {
      const profile = this.chiefs.getChiefProfile(r.chief);
      return `${profile.name}: ${r.response.substring(0, 300)}...`;
    }).join('\n\n');

    const synthesisPrompt = `You are synthesizing a collaborative AI discussion on: "${session.topic}"

Here's what was discussed across ${session.rounds.length} rounds:

${summary}

Provide a clear, actionable final decision that incorporates the best ideas from all perspectives. Be specific and direct.`;

    // Use Claude for synthesis (best at nuanced thinking)
    try {
      const synthesis = await this.chiefs.askChief(Chief.CLAUDE, synthesisPrompt);
      return synthesis.response;
    } catch (error) {
      // Fallback to Grok if Claude fails
      try {
        const synthesis = await this.chiefs.askChief(Chief.GROK, synthesisPrompt);
        return synthesis.response;
      } catch (error2) {
        return 'Unable to synthesize decision - check API keys';
      }
    }
  }

  /**
   * Display a round of responses
   */
  private displayRound(roundNumber: number, responses: ChiefResponse[]): void {
    console.log('\n' + '─'.repeat(100));
    console.log(`ROUND ${roundNumber} RESPONSES`);
    console.log('─'.repeat(100));

    responses.forEach(r => {
      const profile = this.chiefs.getChiefProfile(r.chief);
      console.log(`\n👤 ${profile.name}:`);
      console.log(r.response);
      console.log();
    });
  }

  /**
   * Save session to file for later use
   */
  saveSession(session: CollaborativeSession, filename: string): string {
    const fs = require('fs');
    const path = require('path');

    const dir = path.join(process.cwd(), 'ai-sessions');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, `${filename}.json`);
    fs.writeFileSync(filepath, JSON.stringify(session, null, 2));

    session.savedPath = filepath;

    console.log(`\n💾 Session saved to: ${filepath}`);
    return filepath;
  }

  /**
   * Load a previous session
   */
  loadSession(filename: string): CollaborativeSession {
    const fs = require('fs');
    const path = require('path');

    const filepath = path.join(process.cwd(), 'ai-sessions', `${filename}.json`);
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Quick decision: AIs debate and reach consensus fast (1-2 rounds)
   */
  async quickDecision(question: string): Promise<string> {
    console.log('\n⚡ QUICK DECISION MODE');
    console.log('Running fast 2-round debate...\n');

    const session = await this.collaborate(question, 2, [Chief.CLAUDE, Chief.GROK]);
    return session.finalDecision || 'No decision reached';
  }

  /**
   * Deep analysis: AIs debate thoroughly (3-5 rounds)
   */
  async deepAnalysis(question: string): Promise<CollaborativeSession> {
    console.log('\n🔬 DEEP ANALYSIS MODE');
    console.log('Running thorough 5-round debate...\n');

    return await this.collaborate(
      question,
      5,
      [Chief.CLAUDE, Chief.GPT4, Chief.GEMINI, Chief.GROK]
    );
  }

  /**
   * Use collaborative session to build something
   * This is your "flexible tool for building what we build"
   */
  async buildWithAI(
    buildGoal: string,
    steps: string[],
    saveResults: boolean = true
  ): Promise<CollaborativeSession> {
    console.log('\n🔨 BUILD MODE');
    console.log(`Goal: ${buildGoal}`);
    console.log(`Steps: ${steps.length}\n`);

    const session: CollaborativeSession = {
      topic: buildGoal,
      rounds: []
    };

    // Each step gets collaborative input
    for (let i = 0; i < steps.length; i++) {
      console.log(`\n📍 STEP ${i + 1}/${steps.length}: ${steps[i]}`);
      console.log('─'.repeat(100));

      const stepSession = await this.collaborate(
        `${buildGoal}\n\nCurrent step: ${steps[i]}`,
        2, // 2 rounds per step
        [Chief.CLAUDE, Chief.GROK] // Fast duo
      );

      session.rounds.push(...stepSession.rounds);
    }

    // Final synthesis
    session.finalDecision = await this.synthesizeDecision(session);

    if (saveResults) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.saveSession(session, `build-${timestamp}`);
    }

    return session;
  }
}
