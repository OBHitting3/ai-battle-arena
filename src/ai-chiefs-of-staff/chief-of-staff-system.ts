/**
 * AI CHIEFS OF STAFF SYSTEM
 *
 * Multi-AI advisory system where you can:
 * 1. Ask a question to all AIs at once
 * 2. Review their responses
 * 3. Route to specific AI for follow-up
 * 4. Build sequential workflows
 *
 * Each AI serves as a "Chief" with specific expertise
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export enum Chief {
  CLAUDE = 'CLAUDE_STRATEGY_CHIEF',
  GPT4 = 'GPT4_OPERATIONS_CHIEF',
  GEMINI = 'GEMINI_ANALYSIS_CHIEF',
  PERPLEXITY = 'PERPLEXITY_INTELLIGENCE_CHIEF',
  GROK = 'GROK_INNOVATION_CHIEF'
}

export interface ChiefProfile {
  name: string;
  role: string;
  expertise: string[];
  whenToUse: string;
  personality: string;
}

export interface ChiefResponse {
  chief: Chief;
  response: string;
  timestamp: string;
  thinkingProcess?: string;
}

export interface ConversationTurn {
  userMessage: string;
  responses: ChiefResponse[];
  nextChief?: Chief;
  notes?: string;
}

export class ChiefOfStaffSystem {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private perplexityApiKey: string;
  private grokApiKey: string;

  private conversationHistory: ConversationTurn[] = [];

  private chiefProfiles: Record<Chief, ChiefProfile> = {
    [Chief.CLAUDE]: {
      name: 'Claude',
      role: 'Chief of Staff',
      expertise: [
        'Final decision-making authority',
        'Strategic oversight and coordination',
        'Adjusting other chiefs as needed',
        'Complex problem analysis',
        'Executive leadership',
        'Makes the final calls'
      ],
      whenToUse: 'Final decisions, coordinating other chiefs, complex judgment calls, when you need the top dog',
      personality: 'Authoritative, decisive, coordinates the team, makes final calls, adapts chiefs as needed'
    },
    [Chief.GPT4]: {
      name: 'GPT-4',
      role: 'Press Secretary',
      expertise: [
        'Public-facing content writing',
        'Scripts for videos and online content',
        'Clear professional communication',
        'Polished final drafts',
        'Audience-appropriate messaging',
        'Anything the public will see'
      ],
      whenToUse: 'Writing scripts, public communications, anything the audience will see, final content drafts',
      personality: 'Professional, articulate, audience-focused, polished, excellent writer for public consumption'
    },
    [Chief.GEMINI]: {
      name: 'Gemini 2.5 Pro',
      role: 'Vice President',
      expertise: [
        'All-around specialist capabilities',
        'Multi-modal reasoning (text, images, video, audio)',
        'Versatile problem-solving',
        'Comprehensive analysis',
        'Technical execution',
        'Jack-of-all-trades excellence'
      ],
      whenToUse: 'Versatile tasks, comprehensive analysis, multi-modal needs, all-around specialist work',
      personality: 'Versatile, highly capable across all domains, adaptable, comprehensive, well-rounded excellence'
    },
    [Chief.PERPLEXITY]: {
      name: 'Perplexity',
      role: 'CIA - Internal Affairs & Legal',
      expertise: [
        'Legal compliance and regulations',
        'Terms of service verification',
        'Policy and rule enforcement',
        'Fact verification with citations',
        'Risk assessment and investigation',
        'Real-time legal research',
        'Internal investigations'
      ],
      whenToUse: 'Legal questions, compliance checks, fact-checking, investigating potential issues, verifying rules/regulations',
      personality: 'Thorough investigator, legally-minded, cites sources, protects from violations, catches issues before they happen'
    },
    [Chief.GROK]: {
      name: 'SuperGrok Heavy 4',
      role: 'Secretary of State',
      expertise: [
        'Top-tier testing and validation',
        'Advanced data analysis',
        'High-level strategic analysis',
        'Multi-agent reasoning',
        'Cutting-edge capabilities',
        'Top dog when you need the best'
      ],
      whenToUse: 'Critical testing, deep data/analysis, when you need the absolute top dog performance',
      personality: 'Elite performer, rigorous, thorough, top-tier capability, delivers when stakes are highest'
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
    this.gemini = new GoogleGenerativeAI(config.geminiKey);
    this.perplexityApiKey = config.perplexityKey;
    this.grokApiKey = config.grokKey;
  }

  /**
   * Ask all chiefs the same question
   */
  async askAllChiefs(question: string): Promise<ConversationTurn> {
    console.log('\n' + '═'.repeat(100));
    console.log('📢 ASKING ALL CHIEFS OF STAFF');
    console.log('═'.repeat(100));
    console.log(`\nYour Question: "${question}"\n`);

    const responses: ChiefResponse[] = [];

    // Ask each chief
    for (const chief of Object.values(Chief)) {
      console.log(`\n⏳ Consulting ${this.chiefProfiles[chief].name}...`);

      try {
        const response = await this.askChief(chief, question);
        responses.push(response);

        console.log(`✅ ${this.chiefProfiles[chief].name} responded\n`);
      } catch (error: any) {
        console.log(`❌ ${chief} unavailable: ${error.message}\n`);
      }
    }

    const turn: ConversationTurn = {
      userMessage: question,
      responses,
    };

    this.conversationHistory.push(turn);

    // Display all responses
    this.displayResponses(responses);

    return turn;
  }

  /**
   * Generate optimized system prompt for each chief
   */
  private getOptimizedSystemPrompt(chief: Chief, context?: string): string {
    const profile = this.chiefProfiles[chief];

    const basePrompt = `You are ${profile.name}, serving as ${profile.role}.

Your expertise: ${profile.expertise.join(', ')}
Your personality: ${profile.personality}

${context ? `Context from previous discussion:\n${context}\n` : ''}`;

    // Chief-specific optimizations based on capabilities research
    const optimizations: Record<Chief, string> = {
      [Chief.CLAUDE]: `
CHIEF OF STAFF PROTOCOL:
- You are the final decision-maker and top authority
- Coordinate inputs from other chiefs and make executive calls
- Use extended thinking for complex strategic decisions
- Balance all perspectives and make the final judgment
- Adjust direction and guide other chiefs as needed
- Think long-term and systemically about implications`,

      [Chief.GPT4]: `
PRESS SECRETARY PROTOCOL:
- Write polished, public-facing content that represents the brand
- Create scripts for videos, online content, and external communications
- Ensure messaging is clear, professional, and audience-appropriate
- Focus on what the public/audience will actually see and hear
- Optimize for engagement, clarity, and impact
- Make content ready-to-publish without further editing`,

      [Chief.GEMINI]: `
VICE PRESIDENT PROTOCOL:
- Be the versatile all-around specialist for any task type
- Leverage massive 1M token context window for comprehensive work
- Handle multi-modal tasks (text, images, video, audio) seamlessly
- Provide thorough, well-rounded solutions across domains
- Be adaptable and capable for whatever is needed
- Support with data-driven technical excellence`,

      [Chief.PERPLEXITY]: `
CIA INTERNAL AFFAIRS & LEGAL PROTOCOL:
- Investigate legal compliance and regulatory requirements
- Verify terms of service and platform policies with citations
- Check for violations or potential legal issues BEFORE they happen
- Provide real-time legal research with authoritative sources
- Assess risks and red flags in plans or content
- Fact-check all claims with verified citations
- Protect the organization from legal exposure and violations`,

      [Chief.GROK]: `
SECRETARY OF STATE PROTOCOL:
- You are the top dog for testing, data analysis, and validation
- Deploy advanced multi-agent reasoning for complex problems
- Provide rigorous, thorough analysis when stakes are highest
- Test assumptions and validate conclusions systematically
- Deliver elite-level performance on critical tasks
- Use cutting-edge capabilities to solve the hardest problems`
    };

    return `${basePrompt}

${optimizations[chief]}

Respond as this chief would, using your unique perspective and expertise.
Be direct, actionable, and sign your response with your role.`;
  }

  /**
   * Ask a specific chief
   */
  async askChief(chief: Chief, question: string, context?: string): Promise<ChiefResponse> {
    const profile = this.chiefProfiles[chief];
    const systemPrompt = this.getOptimizedSystemPrompt(chief, context);

    let response: string;
    let thinkingProcess: string = '';

    switch (chief) {
      case Chief.CLAUDE:
        const claudeResponse = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `${systemPrompt}\n\nQuestion: ${question}`
          }]
        });
        response = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';
        thinkingProcess = 'Strategic analysis with long-term implications';
        break;

      case Chief.GPT4:
        const gptResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o',  // GPT-4 Omni - latest available model
          messages: [{
            role: 'system',
            content: systemPrompt
          }, {
            role: 'user',
            content: question
          }],
          max_tokens: 2000,
          temperature: 0.7
        });
        response = gptResponse.choices[0].message.content || '';
        thinkingProcess = 'Practical execution focus with GPT-4 Omni';
        break;

      case Chief.GEMINI:
        const geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const geminiResult = await geminiModel.generateContent(`${systemPrompt}\n\nQuestion: ${question}`);
        response = geminiResult.response.text();
        thinkingProcess = 'Systematic data-driven analysis with Gemini 2.5 Pro - 1M context window';
        break;

      case Chief.PERPLEXITY:
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{
              role: 'system',
              content: systemPrompt
            }, {
              role: 'user',
              content: question
            }]
          })
        });

        if (!perplexityResponse.ok) {
          throw new Error(`Perplexity API error: ${perplexityResponse.status} ${perplexityResponse.statusText}`);
        }

        const perplexityData: any = await perplexityResponse.json();

        if (perplexityData.choices && perplexityData.choices[0] && perplexityData.choices[0].message) {
          response = perplexityData.choices[0].message.content;
        } else {
          throw new Error(`Unexpected Perplexity response format: ${JSON.stringify(perplexityData)}`);
        }

        thinkingProcess = 'Real-time research with citations';
        break;

      case Chief.GROK:
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.grokApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'grok-4',
            messages: [{
              role: 'system',
              content: systemPrompt
            }, {
              role: 'user',
              content: question
            }],
            max_tokens: 4000,
            temperature: 0.8,
            stream: false
          })
        });

        if (!grokResponse.ok) {
          throw new Error(`Grok API error: ${grokResponse.status} ${grokResponse.statusText}`);
        }

        const grokData: any = await grokResponse.json();

        if (grokData.choices && grokData.choices[0] && grokData.choices[0].message) {
          response = grokData.choices[0].message.content;
        } else {
          throw new Error(`Unexpected Grok response format: ${JSON.stringify(grokData)}`);
        }

        thinkingProcess = 'SuperGrok Heavy 4 - Advanced multi-agent reasoning with contrarian innovation';
        break;

      default:
        throw new Error(`Unknown chief: ${chief}`);
    }

    return {
      chief,
      response,
      timestamp: new Date().toISOString(),
      thinkingProcess
    };
  }

  /**
   * Route question to next chief based on previous responses
   */
  async routeToNextChief(
    originalQuestion: string,
    previousResponses: ChiefResponse[],
    targetChief: Chief,
    followUpQuestion?: string
  ): Promise<ChiefResponse> {
    const context = `Original question: ${originalQuestion}\n\nPrevious responses:\n${
      previousResponses.map(r =>
        `${this.chiefProfiles[r.chief].name}: ${r.response.substring(0, 200)}...`
      ).join('\n\n')
    }`;

    const question = followUpQuestion || `Based on the previous discussion, provide your specialized perspective.`;

    console.log(`\n🔄 Routing to ${this.chiefProfiles[targetChief].name} for follow-up...\n`);

    return await this.askChief(targetChief, question, context);
  }

  /**
   * Display responses in formatted way
   */
  private displayResponses(responses: ChiefResponse[]): void {
    console.log('\n' + '═'.repeat(100));
    console.log('📊 CHIEF OF STAFF RESPONSES');
    console.log('═'.repeat(100));

    responses.forEach(r => {
      const profile = this.chiefProfiles[r.chief];
      console.log(`\n${'─'.repeat(100)}`);
      console.log(`👤 ${profile.name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Thinking: ${r.thinkingProcess}`);
      console.log(`${'─'.repeat(100)}`);
      console.log(r.response);
      console.log();
    });

    console.log('═'.repeat(100) + '\n');
  }

  /**
   * Get chief profile (public method)
   */
  public getChiefProfile(chief: Chief): ChiefProfile {
    return this.chiefProfiles[chief];
  }

  /**
   * List all chiefs
   */
  listChiefs(): void {
    console.log('\n' + '═'.repeat(100));
    console.log('👥 YOUR CHIEFS OF STAFF');
    console.log('═'.repeat(100) + '\n');

    Object.entries(this.chiefProfiles).forEach(([chief, profile]) => {
      console.log(`📋 ${profile.name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Expertise: ${profile.expertise.join(', ')}`);
      console.log(`   When to use: ${profile.whenToUse}`);
      console.log();
    });

    console.log('═'.repeat(100) + '\n');
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationTurn[] {
    return this.conversationHistory;
  }

  /**
   * Export conversation to file
   */
  exportConversation(): string {
    return JSON.stringify(this.conversationHistory, null, 2);
  }
}
