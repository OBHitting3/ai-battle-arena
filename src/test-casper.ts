#!/usr/bin/env ts-node

/**
 * CASPER TEST RUNNER
 *
 * CLI tool to test the complete CASPER system
 *
 * Usage:
 *   npm run test:casper -- --iterations 100
 *   npm run test:casper -- --single --niche "meditation music" --topic "relaxation" --persona CLAUDE
 */

import { CasperOrchestrator } from './services/casper/casper-orchestrator';
import { AIPersona } from './services/casper/multi-ai-persona';
import * as dotenv from 'dotenv';

dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const argMap: Record<string, string> = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
    argMap[key] = value;
    if (value !== 'true') i++;
  }
}

async function main() {
  console.log('\n👻 CASPER TEST RUNNER\n');

  // Check required API keys
  const requiredKeys = [
    'YOUTUBE_API_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GOOGLE_GEMINI_API_KEY',
    'PERPLEXITY_API_KEY',
    'GROK_API_KEY'
  ];

  const missingKeys: string[] = [];
  requiredKeys.forEach(key => {
    if (!process.env[key]) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    console.error('❌ Missing required API keys:');
    missingKeys.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add these to your .env file.\n');
    process.exit(1);
  }

  // Initialize CASPER
  const casper = new CasperOrchestrator({
    youtubeApiKey: process.env.YOUTUBE_API_KEY!,
    anthropicKey: process.env.ANTHROPIC_API_KEY!,
    openaiKey: process.env.OPENAI_API_KEY!,
    geminiKey: process.env.GOOGLE_GEMINI_API_KEY!,
    perplexityKey: process.env.PERPLEXITY_API_KEY!,
    grokKey: process.env.GROK_API_KEY!
  });

  // Check mode
  if (argMap.single) {
    // Single test mode
    const niche = argMap.niche || 'meditation music';
    const topic = argMap.topic || 'The Ultimate Relaxation Guide';
    const duration = parseInt(argMap.duration || '60');
    const persona = (argMap.persona as AIPersona) || AIPersona.CLAUDE;

    console.log('🎯 SINGLE TEST MODE\n');
    console.log(`Niche: ${niche}`);
    console.log(`Topic: ${topic}`);
    console.log(`Duration: ${duration}s`);
    console.log(`AI Persona: ${persona}\n`);

    try {
      const result = await casper.createVideo({
        niche,
        topic,
        duration,
        aiPersona: persona,
        requireConsensus: argMap.consensus === 'true',
        maxDebateRounds: parseInt(argMap.maxRounds || '5')
      });

      console.log('\n✅ TEST COMPLETE\n');
      console.log('RESULTS:');
      console.log(`   Niche Score: ${result.nicheValidation.score}/100`);
      console.log(`   Niche Approved: ${result.nicheValidation.approved ? 'YES' : 'NO'}`);
      console.log(`   Final Debate Score: ${result.metadata.finalScore.toFixed(1)}/100`);
      console.log(`   Consensus Achieved: ${result.metadata.consensusAchieved ? 'YES' : 'NO'}`);
      console.log(`   Total Debate Rounds: ${result.metadata.totalDebateRounds}`);
      console.log(`   Overall Approval: ${result.approved ? 'YES ✅' : 'NO ❌'}\n`);

      console.log('FINAL SCRIPT:');
      console.log('─'.repeat(80));
      console.log(result.finalScript);
      console.log('─'.repeat(80) + '\n');

    } catch (error: any) {
      console.error(`\n❌ TEST FAILED: ${error.message}\n`);
      process.exit(1);
    }

  } else {
    // Comprehensive test mode
    const iterations = parseInt(argMap.iterations || '10');

    console.log(`🧪 COMPREHENSIVE TEST MODE\n`);
    console.log(`Running ${iterations} iterations...\n`);

    try {
      const results = await casper.runComprehensiveTests(iterations);

      console.log('\n✅ ALL TESTS COMPLETE\n');
      console.log(`Total Runs: ${results.length}`);
      console.log(`Successful: ${results.filter(r => r.success).length}`);
      console.log(`Failed: ${results.filter(r => !r.success).length}\n`);

    } catch (error: any) {
      console.error(`\n❌ TESTING FAILED: ${error.message}\n`);
      process.exit(1);
    }
  }

  console.log('👻 CASPER testing complete!\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
