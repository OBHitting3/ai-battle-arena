#!/usr/bin/env tsx

/**
 * TEST ALL 5 AI CHIEFS DEBATING TOGETHER
 */

import { ChiefOfStaffSystem, Chief } from './chief-of-staff-system';
import { CollaborativeAISystem } from './collaborative-system';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize with all 5 AIs
  const chiefs = new ChiefOfStaffSystem({
    anthropicKey: process.env.ANTHROPIC_API_KEY!,
    openaiKey: process.env.OPENAI_API_KEY!,
    geminiKey: process.env.GOOGLE_GEMINI_API_KEY!,
    perplexityKey: process.env.PERPLEXITY_API_KEY || 'placeholder',
    grokKey: process.env.GROK_API_KEY!
  });

  const collab = new CollaborativeAISystem(chiefs);

  console.log('👥 ALL CHIEFS DEBATE - FULL TEAM SESSION\n');
  console.log('Running collaborative session with ALL available AI chiefs...\n');

  // Use all chiefs that have valid API keys
  const availableChiefs = [
    Chief.CLAUDE,
    Chief.GPT4,
    Chief.GEMINI,
    Chief.GROK
    // Perplexity will be skipped if no key
  ];

  if (process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY !== 'placeholder') {
    availableChiefs.push(Chief.PERPLEXITY);
  }

  console.log(`Participating chiefs: ${availableChiefs.length}`);
  console.log('─'.repeat(100) + '\n');

  // Deep analysis mode: 3 rounds with all chiefs
  const session = await collab.collaborate(
    'What is the single most important thing I should focus on RIGHT NOW to build a successful faceless automation business?',
    3, // 3 rounds of debate
    availableChiefs
  );

  // Save the session
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  collab.saveSession(session, `all-chiefs-${timestamp}`);

  console.log('\n✅ FULL TEAM DEBATE COMPLETE');
  console.log(`Session saved with ${session.rounds.length} rounds of discussion`);
}

main().catch(console.error);
