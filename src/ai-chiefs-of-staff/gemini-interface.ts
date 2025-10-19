/**
 * GEMINI INTERPRETER WEB INTERFACE
 *
 * Karl talks to Gemini → Gemini interprets → Claude executes
 */

import express from 'express';
import { GeminiInterpreter } from './gemini-interpreter.js';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.text());

const interpreter = new GeminiInterpreter(
  process.env.GOOGLE_GEMINI_API_KEY!,
  process.env.ANTHROPIC_API_KEY!
);

// Serve the interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Talk to Gemini (Your VP Interpreter)</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 48px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }

    .main-panel {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      margin-bottom: 30px;
    }

    .input-area {
      margin-bottom: 30px;
    }

    .input-label {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      display: block;
    }

    #karlInput {
      width: 100%;
      min-height: 150px;
      padding: 20px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 15px;
      resize: vertical;
      font-family: inherit;
    }

    #karlInput:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .button-group {
      display: flex;
      gap: 15px;
    }

    button {
      flex: 1;
      padding: 18px 30px;
      font-size: 18px;
      font-weight: bold;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .send-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .clear-btn {
      background: #f3f4f6;
      color: #666;
    }

    .clear-btn:hover {
      background: #e5e7eb;
    }

    .pipeline-view {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 30px;
    }

    .panel {
      background: #f9fafb;
      padding: 25px;
      border-radius: 15px;
      border: 2px solid #e5e7eb;
    }

    .panel-header {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .panel-icon {
      font-size: 24px;
    }

    .panel-content {
      color: #374151;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 8px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #667eea;
      font-size: 18px;
    }

    .spinner {
      border: 4px solid rgba(102, 126, 234, 0.3);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .hidden {
      display: none;
    }

    .urgency-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .urgency-low { background: #d1fae5; color: #065f46; }
    .urgency-medium { background: #fed7aa; color: #92400e; }
    .urgency-high { background: #fecaca; color: #991b1b; }
    .urgency-critical { background: #dc2626; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Talk to Gemini</h1>
      <p class="subtitle">Your VP Interpreter → Translates to Claude (Chief of Staff)</p>
    </div>

    <div class="main-panel">
      <div class="input-area">
        <label class="input-label">💬 Tell Gemini what you want (speak naturally):</label>
        <textarea id="karlInput" placeholder="Type or paste what you want to say... Gemini will interpret what you MEAN and translate it for Claude to execute.

Example: 'I need to build something that helps me with YouTube but I'm not sure exactly what just make it good'"></textarea>
      </div>

      <div class="button-group">
        <button class="send-btn" onclick="sendToGemini()">🚀 Send to Gemini</button>
        <button class="clear-btn" onclick="clearAll()">🗑️ Clear</button>
      </div>

      <div id="loading" class="loading hidden">
        <div class="spinner"></div>
        <div>Gemini is interpreting your message...</div>
      </div>

      <div id="results" class="pipeline-view hidden">
        <div class="panel">
          <div class="panel-header">
            <span class="panel-icon">⭐</span>
            <span>Gemini's Interpretation</span>
          </div>
          <div class="panel-content">
            <div class="section">
              <div class="section-title">What You Mean:</div>
              <div id="whatKarlMeans"></div>
            </div>
            <div class="section">
              <div class="section-title">Clarified Intent:</div>
              <div id="clarifiedIntent"></div>
            </div>
            <div class="section">
              <div class="section-title">Instructions for Claude:</div>
              <div id="actionable"></div>
            </div>
            <div class="section">
              <div class="section-title">Urgency:</div>
              <span id="urgency"></span>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <span class="panel-icon">🧠</span>
            <span>Claude's Response</span>
          </div>
          <div class="panel-content">
            <div class="section">
              <div class="section-title">Understanding:</div>
              <div id="understanding"></div>
            </div>
            <div class="section">
              <div class="section-title">Plan:</div>
              <div id="plan"></div>
            </div>
            <div class="section">
              <div class="section-title">Execution:</div>
              <div id="execution"></div>
            </div>
            <div id="questionsSection" class="section hidden">
              <div class="section-title">Questions for You:</div>
              <div id="questions"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function sendToGemini() {
      const input = document.getElementById('karlInput').value.trim();

      if (!input) {
        alert('Please enter a message first!');
        return;
      }

      // Show loading
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('results').classList.add('hidden');
      document.querySelector('.send-btn').disabled = true;

      try {
        const response = await fetch('/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });

        const data = await response.json();

        // Populate Gemini's interpretation
        document.getElementById('whatKarlMeans').textContent = data.interpretation.whatKarlMeans;
        document.getElementById('clarifiedIntent').textContent = data.interpretation.clarifiedIntent;
        document.getElementById('actionable').textContent = data.interpretation.actionableInstructions;

        const urgencyBadge = document.getElementById('urgency');
        urgencyBadge.textContent = data.interpretation.urgency;
        urgencyBadge.className = 'urgency-badge urgency-' + data.interpretation.urgency;

        // Populate Claude's response
        document.getElementById('understanding').textContent = data.claudeResponse.understanding;
        document.getElementById('plan').textContent = data.claudeResponse.plan;
        document.getElementById('execution').textContent = data.claudeResponse.execution;

        // Show questions if any
        if (data.claudeResponse.needsMoreInfo && data.claudeResponse.questions) {
          const questionsDiv = document.getElementById('questions');
          questionsDiv.innerHTML = data.claudeResponse.questions
            .map((q, i) => \`<div>\${i + 1}. \${q}</div>\`)
            .join('');
          document.getElementById('questionsSection').classList.remove('hidden');
        } else {
          document.getElementById('questionsSection').classList.add('hidden');
        }

        // Show results
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');

      } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
      } finally {
        document.querySelector('.send-btn').disabled = false;
      }
    }

    function clearAll() {
      document.getElementById('karlInput').value = '';
      document.getElementById('results').classList.add('hidden');
    }

    // Allow Enter + Cmd/Ctrl to submit
    document.getElementById('karlInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        sendToGemini();
      }
    });
  </script>
</body>
</html>
  `);
});

// API endpoint to process message
app.post('/interpret', async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'No input provided' });
    }

    const result = await interpreter.processMessage(input);

    res.json(result);
  } catch (error: any) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
app.get('/history', (req, res) => {
  res.json(interpreter.getHistory());
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log('\n⭐ GEMINI INTERPRETER INTERFACE');
  console.log('═'.repeat(60));
  console.log(`📍 Open in browser: http://localhost:${PORT}`);
  console.log('═'.repeat(60));
  console.log('\n💡 How it works:');
  console.log('   1. You type naturally to Gemini');
  console.log('   2. Gemini interprets what you MEAN');
  console.log('   3. Claude (Chief of Staff) executes');
  console.log('\n✅ Ready to interpret!\n');
});
