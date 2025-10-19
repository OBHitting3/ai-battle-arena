#!/usr/bin/env tsx

/**
 * TEST THE COLLABORATIVE AI SYSTEM
 */

import { ChiefOfStaffSystem } from './chief-of-staff-system';
import { CollaborativeAISystem } from './collaborative-system';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize
  const chiefs = new ChiefOfStaffSystem({
    anthropicKey: process.env.ANTHROPIC_API_KEY!,
    openaiKey: process.env.OPENAI_API_KEY || 'placeholder',
    geminiKey: process.env.GOOGLE_GEMINI_API_KEY || 'placeholder',
    perplexityKey: process.env.PERPLEXITY_API_KEY || 'placeholder',
    grokKey: process.env.GROK_API_KEY || 'placeholder'
  });

  const collab = new CollaborativeAISystem(chiefs);

  console.log('🤝 COLLABORATIVE AI SYSTEM TEST\n');
  console.log('This will run a multi-round debate where AIs actually respond to each other.\n');

  // Example: Quick decision
  const decision = await collab.quickDecision(
    'What is the fastest way to make $10,000 in 30 days with the faceless automation platform?'
  );

  console.log('\n✅ QUICK DECISION COMPLETE\n');
  console.log(decision);
}

main().catch(console.error);
