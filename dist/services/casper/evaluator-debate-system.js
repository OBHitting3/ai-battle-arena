/**
 * EVALUATOR DEBATE SYSTEM
 *
 * Three expert evaluators critique AI-generated content and debate until consensus:
 *
 * 1. PADDY GALLOWAY (Irish YouTube Expert)
 *    - Evaluates: Content strategy, engagement, hook quality, retention tactics
 *    - Perspective: "Will this get views and keep people watching?"
 *
 * 2. MARK ZUCKERBERG (Tech/Product Leader)
 *    - Evaluates: Scalability, user experience, product-market fit, growth potential
 *    - Perspective: "Does this solve a real problem at scale?"
 *
 * 3. HULK HOGAN (Entertainment Icon)
 *    - Evaluates: Impact, entertainment value, life-changing potential, inspiration
 *    - Perspective: "Will this change lives and create an emotional connection?"
 *
 * The system iterates until all three agree the content meets quality standards.
 */
import Anthropic from '@anthropic-ai/sdk';
export var Evaluator;
(function (Evaluator) {
    Evaluator["PADDY_GALLOWAY"] = "PADDY_GALLOWAY";
    Evaluator["MARK_ZUCKERBERG"] = "MARK_ZUCKERBERG";
    Evaluator["HULK_HOGAN"] = "HULK_HOGAN";
})(Evaluator || (Evaluator = {}));
export class EvaluatorDebateSystem {
    anthropic;
    evaluatorProfiles = {
        [Evaluator.PADDY_GALLOWAY]: {
            name: 'Paddy Galloway',
            background: 'Irish YouTube strategist who has analyzed 1000s of viral videos. ' +
                'Known for data-driven content optimization and understanding YouTube algorithms.',
            expertise: [
                'YouTube algorithm optimization',
                'Hook psychology (first 3 seconds)',
                'Audience retention tactics',
                'CTR optimization',
                'Content pacing and structure'
            ],
            evaluationCriteria: [
                'Does the hook grab attention in 3 seconds?',
                'Will this retain viewers for >50% watch time?',
                'Is the pacing optimized for YouTube?',
                'Does it follow proven viral patterns?',
                'Will the algorithm promote this?'
            ],
            personality: 'Analytical, data-obsessed, direct, Irish charm',
            speakingStyle: 'Uses YouTube metrics, references viral trends, speaks with Irish cadence'
        },
        [Evaluator.MARK_ZUCKERBERG]: {
            name: 'Mark Zuckerberg',
            background: 'Built Facebook from dorm room to 3 billion users. ' +
                'Obsessed with product, scalability, and user experience.',
            expertise: [
                'Product-market fit',
                'Scale and growth mechanics',
                'User experience design',
                'Network effects',
                'Long-term value creation'
            ],
            evaluationCriteria: [
                'Does this solve a real user problem?',
                'Can this scale to millions of users?',
                'Is the user experience frictionless?',
                'Will users share this organically?',
                'Does it create lasting value?'
            ],
            personality: 'Product-focused, systematic, growth-oriented, cerebral',
            speakingStyle: 'Asks probing questions, focuses on metrics, thinks long-term'
        },
        [Evaluator.HULK_HOGAN]: {
            name: 'Hulk Hogan',
            background: 'Wrestling legend who changed millions of lives through entertainment. ' +
                'Master of connecting with audiences emotionally and creating unforgettable moments.',
            expertise: [
                'Emotional impact and connection',
                'Entertainment value',
                'Inspiring life change',
                'Authenticity and charisma',
                'Creating memorable moments'
            ],
            evaluationCriteria: [
                'Will this change someone\'s life?',
                'Does this inspire and entertain?',
                'Is there genuine emotional impact?',
                'Will people remember this?',
                'Does it make people feel something powerful?'
            ],
            personality: 'Passionate, inspirational, larger-than-life, heart-focused',
            speakingStyle: 'Emphatic, motivational, uses wrestling metaphors, calls people "brother"'
        }
    };
    constructor(anthropicKey) {
        this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }
    /**
     * Run debate system on content until consensus or max rounds
     */
    async runDebate(initialContent, context, maxRounds = 5) {
        console.log('\n🎭 EVALUATOR DEBATE SYSTEM STARTING');
        console.log('═'.repeat(80));
        console.log(`Topic: ${context.topic}`);
        console.log(`Niche: ${context.niche}`);
        console.log(`Purpose: ${context.purpose}`);
        console.log(`Max Rounds: ${maxRounds}`);
        console.log('═'.repeat(80));
        const rounds = [];
        let currentContent = initialContent;
        let consensusAchieved = false;
        for (let roundNum = 1; roundNum <= maxRounds; roundNum++) {
            console.log(`\n🔄 ROUND ${roundNum}`);
            console.log('─'.repeat(80));
            // Get evaluations from all three evaluators
            const evaluations = await this.getAllEvaluations(currentContent, context);
            // Check for consensus (all scores >= 85)
            const allApproved = evaluations.every(e => e.approved);
            const averageScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
            // Display evaluations
            this.displayEvaluations(evaluations);
            // Create debate transcript
            const debateTranscript = await this.generateDebateTranscript(evaluations, context);
            // Collect improvements
            const improvements = evaluations.flatMap(e => e.improvements);
            const round = {
                round: roundNum,
                content: currentContent,
                evaluations,
                consensus: allApproved,
                averageScore,
                debateTranscript,
                improvements
            };
            rounds.push(round);
            if (allApproved) {
                consensusAchieved = true;
                console.log('\n✅ CONSENSUS ACHIEVED! All evaluators approve.\n');
                break;
            }
            // Generate improved content based on feedback
            if (roundNum < maxRounds) {
                console.log('\n🔧 Generating improved version based on feedback...\n');
                currentContent = await this.improveContent(currentContent, improvements, context);
            }
        }
        const finalScore = rounds[rounds.length - 1].averageScore;
        const debateSummary = this.generateDebateSummary(rounds, consensusAchieved);
        console.log('\n' + '═'.repeat(80));
        console.log('🏁 DEBATE COMPLETE');
        console.log('═'.repeat(80));
        console.log(debateSummary);
        console.log('═'.repeat(80));
        return {
            finalContent: currentContent,
            rounds,
            totalRounds: rounds.length,
            consensusAchieved,
            finalScore,
            debateSummary
        };
    }
    /**
     * Get evaluation from single evaluator
     */
    async evaluateContent(evaluator, content, context) {
        const profile = this.evaluatorProfiles[evaluator];
        const prompt = `You are ${profile.name}.

Background: ${profile.background}

Your expertise: ${profile.expertise.join(', ')}

Personality: ${profile.personality}
Speaking style: ${profile.speakingStyle}

CONTENT TO EVALUATE:
"""
${content}
"""

CONTEXT:
- Niche: ${context.niche}
- Topic: ${context.topic}
- Purpose: ${context.purpose}

EVALUATE this content based on YOUR criteria:
${profile.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Provide your evaluation in this format:

SCORE: [0-100, where 85+ means approved]

STRENGTHS:
- [List 2-3 strong points]

WEAKNESSES:
- [List 2-3 weak points]

IMPROVEMENTS:
- [List 3-5 specific actionable improvements]

REASONING:
[Explain your score and perspective using YOUR expertise and personality]

QUOTE:
[A memorable quote in YOUR speaking style summarizing your take]

Be authentic to who you are. Speak in your characteristic style. Don't hold back your unique perspective.`;
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2000,
            messages: [{
                    role: 'user',
                    content: prompt
                }]
        });
        const evaluation = response.content[0].type === 'text' ? response.content[0].text : '';
        // Parse evaluation
        return this.parseEvaluation(evaluator, evaluation);
    }
    /**
     * Parse evaluation text into structured format
     */
    parseEvaluation(evaluator, evaluationText) {
        const scoreMatch = evaluationText.match(/SCORE:\s*(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const strengthsMatch = evaluationText.match(/STRENGTHS:(.*?)(?=WEAKNESSES:|$)/is);
        const strengths = strengthsMatch
            ? strengthsMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^-\s*/, '').trim())
            : [];
        const weaknessesMatch = evaluationText.match(/WEAKNESSES:(.*?)(?=IMPROVEMENTS:|$)/is);
        const weaknesses = weaknessesMatch
            ? weaknessesMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^-\s*/, '').trim())
            : [];
        const improvementsMatch = evaluationText.match(/IMPROVEMENTS:(.*?)(?=REASONING:|$)/is);
        const improvements = improvementsMatch
            ? improvementsMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^-\s*/, '').trim())
            : [];
        const reasoningMatch = evaluationText.match(/REASONING:(.*?)(?=QUOTE:|$)/is);
        const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
        const quoteMatch = evaluationText.match(/QUOTE:(.*?)$/is);
        const quote = quoteMatch ? quoteMatch[1].trim() : '';
        return {
            evaluator,
            score,
            approved: score >= 85,
            strengths,
            weaknesses,
            improvements,
            reasoning,
            quote
        };
    }
    /**
     * Get evaluations from all evaluators
     */
    async getAllEvaluations(content, context) {
        const evaluators = [
            Evaluator.PADDY_GALLOWAY,
            Evaluator.MARK_ZUCKERBERG,
            Evaluator.HULK_HOGAN
        ];
        const evaluations = [];
        for (const evaluator of evaluators) {
            const evaluation = await this.evaluateContent(evaluator, content, context);
            evaluations.push(evaluation);
        }
        return evaluations;
    }
    /**
     * Display evaluations in console
     */
    displayEvaluations(evaluations) {
        evaluations.forEach(e => {
            const profile = this.evaluatorProfiles[e.evaluator];
            const statusEmoji = e.approved ? '✅' : '❌';
            console.log(`\n${statusEmoji} ${profile.name}: ${e.score}/100`);
            console.log(`   "${e.quote}"`);
            console.log(`   Strengths: ${e.strengths.slice(0, 2).join(', ')}`);
            console.log(`   Weaknesses: ${e.weaknesses.slice(0, 2).join(', ')}`);
        });
    }
    /**
     * Generate debate transcript where evaluators discuss
     */
    async generateDebateTranscript(evaluations, context) {
        const prompt = `Generate a debate transcript where Paddy Galloway, Mark Zuckerberg, and Hulk Hogan discuss this content.

EVALUATIONS:
${evaluations.map(e => `
${this.evaluatorProfiles[e.evaluator].name} (Score: ${e.score}/100):
- Strengths: ${e.strengths.join(', ')}
- Weaknesses: ${e.weaknesses.join(', ')}
- Quote: "${e.quote}"
`).join('\n')}

Create a realistic debate where they:
1. Argue from their unique perspectives
2. Challenge each other's viewpoints
3. Suggest improvements
4. Work toward consensus

Format as:
[NAME]: [Their statement in their characteristic style]

Keep it 6-10 exchanges. Make it feel authentic to each person.`;
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2000,
            messages: [{
                    role: 'user',
                    content: prompt
                }]
        });
        const transcript = response.content[0].type === 'text' ? response.content[0].text : '';
        return transcript.split('\n').filter(line => line.trim().startsWith('['));
    }
    /**
     * Improve content based on feedback
     */
    async improveContent(currentContent, improvements, context) {
        const prompt = `Improve this content based on expert feedback.

CURRENT CONTENT:
"""
${currentContent}
"""

IMPROVEMENTS REQUESTED:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

CONTEXT:
- Niche: ${context.niche}
- Topic: ${context.topic}
- Purpose: ${context.purpose}

Create an improved version that addresses ALL the feedback while maintaining the core message.

Return ONLY the improved content, no explanations.`;
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2000,
            messages: [{
                    role: 'user',
                    content: prompt
                }]
        });
        return response.content[0].type === 'text' ? response.content[0].text : currentContent;
    }
    /**
     * Generate debate summary
     */
    generateDebateSummary(rounds, consensusAchieved) {
        const finalRound = rounds[rounds.length - 1];
        let summary = `
DEBATE SUMMARY
Total Rounds: ${rounds.length}
Consensus: ${consensusAchieved ? 'YES ✅' : 'NO ❌'}
Final Score: ${finalRound.averageScore.toFixed(1)}/100

ROUND-BY-ROUND SCORES:
${rounds.map(r => `  Round ${r.round}: ${r.averageScore.toFixed(1)} ${r.consensus ? '✅' : ''}`).join('\n')}

FINAL EVALUATOR SCORES:
${finalRound.evaluations.map(e => `  ${this.evaluatorProfiles[e.evaluator].name}: ${e.score}/100 ${e.approved ? '✅' : '❌'}`).join('\n')}

STATUS: ${consensusAchieved ? 'APPROVED FOR PRODUCTION' : 'NEEDS MORE WORK'}
`;
        return summary;
    }
    /**
     * Get evaluator profile
     */
    getEvaluatorProfile(evaluator) {
        return this.evaluatorProfiles[evaluator];
    }
    /**
     * List all evaluators
     */
    listEvaluators() {
        return Object.values(this.evaluatorProfiles);
    }
}
//# sourceMappingURL=evaluator-debate-system.js.map