#!/usr/bin/env tsx

/**
 * AI CHIEFS OF STAFF - WEB SERVER
 *
 * Simple web interface to consult your AI advisory team
 */

import express from 'express';
import { ChiefOfStaffSystem, Chief } from './chief-of-staff-system';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Initialize Chiefs system
const chiefs = new ChiefOfStaffSystem({
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  openaiKey: process.env.OPENAI_API_KEY || 'placeholder',
  geminiKey: process.env.GOOGLE_GEMINI_API_KEY || 'placeholder',
  perplexityKey: process.env.PERPLEXITY_API_KEY || 'placeholder',
  grokKey: process.env.GROK_API_KEY || 'placeholder'
});

// HTML interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AI Chiefs of Staff</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    h1 {
      color: #667eea;
      font-size: 32px;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
    }

    .chiefs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .chief-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
      border: 3px solid transparent;
    }

    .chief-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .chief-card.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .chief-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .chief-role {
      font-size: 12px;
      color: #666;
    }

    .input-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    textarea {
      width: 100%;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      margin-bottom: 15px;
    }

    textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .button-group {
      display: flex;
      gap: 10px;
    }

    button {
      flex: 1;
      padding: 15px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .responses {
      display: grid;
      gap: 20px;
    }

    .response-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .response-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .response-icon {
      font-size: 32px;
      margin-right: 15px;
    }

    .response-title {
      flex: 1;
    }

    .response-chief {
      font-weight: bold;
      color: #667eea;
      font-size: 18px;
    }

    .response-role {
      color: #666;
      font-size: 14px;
    }

    .response-content {
      color: #333;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: white;
      font-size: 18px;
    }

    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👔 AI Chiefs of Staff</h1>
      <p class="subtitle">Your executive AI advisory team is ready to serve</p>
    </div>

    <div class="chiefs-grid">
      <div class="chief-card" data-chief="all">
        <div class="chief-name">🎯 All Chiefs</div>
        <div class="chief-role">Ask everyone</div>
      </div>
      <div class="chief-card" data-chief="claude">
        <div class="chief-name">🧠 Claude</div>
        <div class="chief-role">Chief of Staff</div>
      </div>
      <div class="chief-card" data-chief="gpt4">
        <div class="chief-name">📝 GPT-4</div>
        <div class="chief-role">Press Secretary</div>
      </div>
      <div class="chief-card" data-chief="gemini">
        <div class="chief-name">⭐ Gemini 2.5 Pro</div>
        <div class="chief-role">Vice President</div>
      </div>
      <div class="chief-card" data-chief="grok">
        <div class="chief-name">🎖️ SuperGrok Heavy 4</div>
        <div class="chief-role">Secretary of State</div>
      </div>
      <div class="chief-card" data-chief="perplexity">
        <div class="chief-name">🕵️ Perplexity</div>
        <div class="chief-role">CIA - Internal Affairs & Legal</div>
      </div>
    </div>

    <div class="input-section">
      <textarea id="question" placeholder="Ask your chiefs a question..."></textarea>
      <div class="button-group">
        <button id="askBtn">Ask Selected Chief(s)</button>
      </div>
    </div>

    <div id="responses" class="responses"></div>
  </div>

  <script>
    let selectedChief = 'all';

    // Chief selection
    document.querySelectorAll('.chief-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.chief-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedChief = card.dataset.chief;
      });
    });

    // Select "All Chiefs" by default
    document.querySelector('[data-chief="all"]').classList.add('selected');

    // Ask question
    document.getElementById('askBtn').addEventListener('click', async () => {
      const question = document.getElementById('question').value.trim();
      if (!question) {
        alert('Please enter a question');
        return;
      }

      const btn = document.getElementById('askBtn');
      const responsesDiv = document.getElementById('responses');

      btn.disabled = true;
      btn.textContent = 'Consulting chiefs...';

      responsesDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Your chiefs are thinking...</div>';

      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, chief: selectedChief })
        });

        const data = await response.json();

        if (data.error) {
          responsesDiv.innerHTML = \`<div class="response-card"><div class="response-content" style="color: red;">Error: \${data.error}</div></div>\`;
        } else {
          displayResponses(data.responses);
        }
      } catch (error) {
        responsesDiv.innerHTML = \`<div class="response-card"><div class="response-content" style="color: red;">Error: \${error.message}</div></div>\`;
      }

      btn.disabled = false;
      btn.textContent = 'Ask Selected Chief(s)';
    });

    function displayResponses(responses) {
      const responsesDiv = document.getElementById('responses');
      responsesDiv.innerHTML = '';

      const icons = {
        'CLAUDE_STRATEGY_CHIEF': '🧠',
        'GPT4_OPERATIONS_CHIEF': '⚙️',
        'GEMINI_ANALYSIS_CHIEF': '📊',
        'PERPLEXITY_INTELLIGENCE_CHIEF': '🔍',
        'GROK_INNOVATION_CHIEF': '💡'
      };

      const names = {
        'CLAUDE_STRATEGY_CHIEF': 'Claude (Strategy Chief)',
        'GPT4_OPERATIONS_CHIEF': 'GPT-4 (Operations Chief)',
        'GEMINI_ANALYSIS_CHIEF': 'Gemini (Analysis Chief)',
        'PERPLEXITY_INTELLIGENCE_CHIEF': 'Perplexity (Intelligence Chief)',
        'GROK_INNOVATION_CHIEF': 'SuperGrok Heavy 4 (Innovation Chief)'
      };

      responses.forEach(r => {
        const card = document.createElement('div');
        card.className = 'response-card';
        card.innerHTML = \`
          <div class="response-header">
            <div class="response-icon">\${icons[r.chief] || '🤖'}</div>
            <div class="response-title">
              <div class="response-chief">\${names[r.chief] || r.chief}</div>
              <div class="response-role">\${r.thinkingProcess}</div>
            </div>
          </div>
          <div class="response-content">\${r.response}</div>
        \`;
        responsesDiv.appendChild(card);
      });
    }

    // Enter to submit
    document.getElementById('question').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.metaKey) {
        document.getElementById('askBtn').click();
      }
    });
  </script>
</body>
</html>
  `);
});

// API endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question, chief } = req.body;

    if (!question) {
      return res.json({ error: 'Question is required' });
    }

    let responses;

    if (chief === 'all') {
      const turn = await chiefs.askAllChiefs(question);
      responses = turn.responses;
    } else {
      const chiefMap: Record<string, Chief> = {
        'claude': Chief.CLAUDE,
        'gpt4': Chief.GPT4,
        'gemini': Chief.GEMINI,
        'perplexity': Chief.PERPLEXITY,
        'grok': Chief.GROK
      };

      const response = await chiefs.askChief(chiefMap[chief], question);
      responses = [response];
    }

    res.json({ responses });
  } catch (error: any) {
    console.error('Error:', error);
    res.json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🌐 AI Chiefs of Staff Web Interface`);
  console.log(`📍 Open in browser: http://localhost:${PORT}`);
  console.log(`\n✅ Ready to serve!\n`);
});
