#!/usr/bin/env ts-node

/**
 * AI CHIEFS OF STAFF - CLI INTERFACE
 *
 * Interactive command-line interface to consult your AI advisory team
 */

import { ChiefOfStaffSystem, Chief } from './chief-of-staff-system';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('\n' + '═'.repeat(100));
  console.log('👔 AI CHIEFS OF STAFF - INTERACTIVE CONSOLE');
  console.log('═'.repeat(100));
  console.log('\nYour AI advisory team is ready to serve.\n');

  // Initialize system
  const chiefs = new ChiefOfStaffSystem({
    anthropicKey: process.env.ANTHROPIC_API_KEY!,
    openaiKey: process.env.OPENAI_API_KEY || 'placeholder',
    geminiKey: process.env.GOOGLE_GEMINI_API_KEY || 'placeholder',
    perplexityKey: process.env.PERPLEXITY_API_KEY || 'placeholder',
    grokKey: process.env.GROK_API_KEY || 'placeholder'
  });

  // Show available chiefs
  chiefs.listChiefs();

  console.log('COMMANDS:');
  console.log('  ask <question>     - Ask all chiefs at once');
  console.log('  claude <question>  - Ask Claude (Strategy Chief) specifically');
  console.log('  gpt <question>     - Ask GPT-4 (Operations Chief) specifically');
  console.log('  gemini <question>  - Ask Gemini (Analysis Chief) specifically');
  console.log('  perplexity <question> - Ask Perplexity (Intelligence Chief) specifically');
  console.log('  grok <question>    - Ask Grok (Innovation Chief) specifically');
  console.log('  list               - List all chiefs');
  console.log('  history            - Show conversation history');
  console.log('  exit               - Exit\n');

  let lastResponses: any[] = [];

  while (true) {
    const input = await ask('\n👤 You: ');

    if (!input.trim()) continue;

    const [command, ...rest] = input.trim().split(' ');
    const question = rest.join(' ');

    switch (command.toLowerCase()) {
      case 'exit':
      case 'quit':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
        break;

      case 'list':
        chiefs.listChiefs();
        break;

      case 'history':
        const history = chiefs.getHistory();
        console.log('\n📜 CONVERSATION HISTORY');
        console.log('═'.repeat(100));
        history.forEach((turn, i) => {
          console.log(`\n[${i + 1}] You: ${turn.userMessage}`);
          console.log(`    Responses: ${turn.responses.length} chiefs responded`);
        });
        console.log();
        break;

      case 'ask':
        if (!question) {
          console.log('⚠️  Usage: ask <your question>');
          break;
        }
        try {
          const turn = await chiefs.askAllChiefs(question);
          lastResponses = turn.responses;

          console.log('\n💡 NEXT STEPS:');
          console.log('  - Type "claude <followup>" to route to Claude for deeper analysis');
          console.log('  - Type "gpt <followup>" to route to GPT-4 for execution plan');
          console.log('  - Type "ask <new question>" to ask all chiefs again\n');

        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      case 'claude':
      case 'strategy':
        if (!question) {
          console.log('⚠️  Usage: claude <your question>');
          break;
        }
        try {
          const response = await chiefs.askChief(Chief.CLAUDE, question);
          console.log(`\n${chiefs.getChiefProfile(Chief.CLAUDE).name}:`);
          console.log('─'.repeat(100));
          console.log(response.response);
          console.log();
        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      case 'gpt':
      case 'gpt4':
      case 'operations':
        if (!question) {
          console.log('⚠️  Usage: gpt <your question>');
          break;
        }
        try {
          const response = await chiefs.askChief(Chief.GPT4, question);
          console.log(`\n${chiefs.getChiefProfile(Chief.GPT4).name}:`);
          console.log('─'.repeat(100));
          console.log(response.response);
          console.log();
        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      case 'gemini':
      case 'analysis':
        if (!question) {
          console.log('⚠️  Usage: gemini <your question>');
          break;
        }
        try {
          const response = await chiefs.askChief(Chief.GEMINI, question);
          console.log(`\n${chiefs.getChiefProfile(Chief.GEMINI).name}:`);
          console.log('─'.repeat(100));
          console.log(response.response);
          console.log();
        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      case 'perplexity':
      case 'research':
      case 'intel':
        if (!question) {
          console.log('⚠️  Usage: perplexity <your question>');
          break;
        }
        try {
          const response = await chiefs.askChief(Chief.PERPLEXITY, question);
          console.log(`\n${chiefs.getChiefProfile(Chief.PERPLEXITY).name}:`);
          console.log('─'.repeat(100));
          console.log(response.response);
          console.log();
        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      case 'grok':
      case 'innovation':
        if (!question) {
          console.log('⚠️  Usage: grok <your question>');
          break;
        }
        try {
          const response = await chiefs.askChief(Chief.GROK, question);
          console.log(`\n${chiefs.getChiefProfile(Chief.GROK).name}:`);
          console.log('─'.repeat(100));
          console.log(response.response);
          console.log();
        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;

      default:
        // Assume it's a question to all chiefs
        try {
          const turn = await chiefs.askAllChiefs(input);
          lastResponses = turn.responses;

          console.log('\n💡 NEXT STEPS:');
          console.log('  - Type "claude <followup>" to route to Claude');
          console.log('  - Type "gpt <followup>" to route to GPT-4');
          console.log('  - Type "ask <new question>" to ask all chiefs again\n');

        } catch (error: any) {
          console.log(`\n❌ Error: ${error.message}\n`);
        }
        break;
    }
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
