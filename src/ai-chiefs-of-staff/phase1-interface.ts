/**
 * PHASE 1: PLANNING INTERFACE
 * Karl → Gemini (organizes) → Karl approves → Claude (executes)
 */

import express from 'express';
import { Phase1GeminiInterpreter } from './phase1-gemini.js';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const interpreter = new Phase1GeminiInterpreter(process.env.GOOGLE_GEMINI_API_KEY!);

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 1: Planning with Gemini</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
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

    .phase-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
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
    }

    .version-info {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: #f3f4f6;
      border-radius: 10px;
      margin-bottom: 30px;
      font-size: 14px;
      color: #666;
    }

    .version-badge {
      font-weight: bold;
      color: #667eea;
    }

    .input-section {
      margin-bottom: 30px;
    }

    .label {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      display: block;
    }

    textarea {
      width: 100%;
      min-height: 150px;
      padding: 20px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 12px;
      resize: vertical;
      font-family: inherit;
    }

    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .button-group {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    button {
      flex: 1;
      padding: 15px 25px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .organize-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .organize-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .clear-btn {
      background: #f3f4f6;
      color: #666;
      flex: 0.3;
    }

    .clear-btn:hover {
      background: #e5e7eb;
    }

    .comparison-view {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }

    .panel {
      background: #f9fafb;
      padding: 25px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
    }

    .panel-header {
      font-size: 16px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-content {
      color: #374151;
      line-height: 1.8;
      white-space: pre-wrap;
      font-size: 15px;
    }

    .changes-section {
      margin-top: 20px;
      padding: 20px;
      background: #fffbeb;
      border: 2px solid #fbbf24;
      border-radius: 10px;
    }

    .changes-header {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .change-item {
      padding: 8px 0;
      color: #78350f;
      font-size: 14px;
    }

    .change-item:before {
      content: "•";
      margin-right: 8px;
      font-weight: bold;
    }

    .approval-section {
      background: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
    }

    .approval-text {
      font-size: 20px;
      font-weight: bold;
      color: #166534;
      margin-bottom: 20px;
    }

    .approval-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .approve-btn {
      background: #22c55e;
      color: white;
      padding: 15px 40px;
      font-size: 18px;
    }

    .approve-btn:hover {
      background: #16a34a;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(34, 197, 94, 0.4);
    }

    .edit-btn {
      background: #f59e0b;
      color: white;
      padding: 15px 40px;
      font-size: 18px;
    }

    .edit-btn:hover {
      background: #d97706;
    }

    .reject-btn {
      background: #ef4444;
      color: white;
      padding: 15px 40px;
      font-size: 18px;
    }

    .reject-btn:hover {
      background: #dc2626;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #667eea;
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

    .success-message {
      background: #22c55e;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="phase-badge">⚙️ PHASE 1: PLANNING</div>
      <h1>⭐ Gemini Interpreter</h1>
      <p class="subtitle">Organize your thoughts → Approve → Send to Claude</p>
    </div>

    <div class="main-panel">
      <div class="version-info">
        <div>
          <strong>Session:</strong> <span id="sessionDate"></span>
        </div>
        <div>
          <strong>Next Version:</strong> <span class="version-badge" id="nextVersion">v1.00</span>
        </div>
      </div>

      <div id="inputSection">
        <div class="input-section">
          <label class="label">💬 Tell Gemini what you want to discuss with Claude:</label>
          <textarea id="karlInput" placeholder="Type naturally... Gemini will organize your thoughts and show you what it changed before sending to Claude.

Example: 'I want to build a youtube automation thing but im not sure exactly what features we need maybe something with thumbnails and scripts and i dont know just make it good'"></textarea>
        </div>

        <div class="button-group">
          <button class="organize-btn" onclick="organizeMessage()">⭐ Organize with Gemini</button>
          <button class="clear-btn" onclick="clearAll()">🗑️ Clear</button>
        </div>
      </div>

      <div id="loading" class="loading hidden">
        <div class="spinner"></div>
        <div>Gemini is organizing your message...</div>
      </div>

      <div id="comparisonView" class="hidden">
        <div class="comparison-view">
          <div class="panel">
            <div class="panel-header">
              📝 Your Original Message
            </div>
            <div class="panel-content" id="originalMessage"></div>
          </div>

          <div class="panel">
            <div class="panel-header">
              ⭐ Gemini's Organized Version
            </div>
            <div class="panel-content" id="organizedMessage"></div>
          </div>
        </div>

        <div class="changes-section">
          <div class="changes-header">
            📋 What Gemini Changed
          </div>
          <div id="changesList"></div>
        </div>

        <div class="approval-section">
          <div class="approval-text">
            ✅ Does this look good? Approve to send to Claude
          </div>
          <div class="approval-buttons">
            <button class="approve-btn" onclick="approveAndSend()">
              ✅ Approve & Send to Claude
            </button>
            <button class="edit-btn" onclick="editMore()">
              ✏️ Edit Original
            </button>
            <button class="reject-btn" onclick="reject()">
              ❌ Start Over
            </button>
          </div>
        </div>
      </div>

      <div id="successMessage" class="success-message hidden">
        ✅ Approved! Message sent to Claude for Phase 2 execution.
      </div>
    </div>
  </div>

  <script>
    let currentOrganized = null;

    // Set session date
    document.getElementById('sessionDate').textContent = new Date().toLocaleDateString();

    async function organizeMessage() {
      const input = document.getElementById('karlInput').value.trim();

      if (!input) {
        alert('Please enter a message first!');
        return;
      }

      // Show loading
      document.getElementById('inputSection').classList.add('hidden');
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('comparisonView').classList.add('hidden');

      try {
        const response = await fetch('/organize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });

        const data = await response.json();
        currentOrganized = data;

        // Show comparison
        document.getElementById('originalMessage').textContent = data.original;
        document.getElementById('organizedMessage').textContent = data.organized;

        const changesList = document.getElementById('changesList');
        changesList.innerHTML = (data.changes || [])
          .map(change => \`<div class="change-item">\${change}</div>\`)
          .join('');

        // Update version
        document.getElementById('nextVersion').textContent = data.version;

        // Hide loading, show comparison
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('comparisonView').classList.remove('hidden');

      } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
        document.getElementById('inputSection').classList.remove('hidden');
        document.getElementById('loading').classList.add('hidden');
      }
    }

    async function approveAndSend() {
      if (!currentOrganized) return;

      try {
        await fetch('/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentOrganized)
        });

        // Show success
        document.getElementById('comparisonView').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');

        // Reset after 3 seconds
        setTimeout(() => {
          clearAll();
          document.getElementById('successMessage').classList.add('hidden');
        }, 3000);

      } catch (error) {
        alert('Error approving: ' + error.message);
      }
    }

    function editMore() {
      // Put organized version back in input for editing
      document.getElementById('karlInput').value = currentOrganized.organized;
      document.getElementById('comparisonView').classList.add('hidden');
      document.getElementById('inputSection').classList.remove('hidden');
    }

    function reject() {
      currentOrganized = null;
      document.getElementById('comparisonView').classList.add('hidden');
      document.getElementById('inputSection').classList.remove('hidden');
    }

    function clearAll() {
      document.getElementById('karlInput').value = '';
      currentOrganized = null;
      document.getElementById('comparisonView').classList.add('hidden');
      document.getElementById('inputSection').classList.remove('hidden');
    }

    // Allow Cmd/Ctrl + Enter to organize
    document.getElementById('karlInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        organizeMessage();
      }
    });
  </script>
</body>
</html>
  `);
});

// Organize message endpoint
app.post('/organize', async (req, res) => {
  try {
    const { input } = req.body;
    const organized = await interpreter.organizeMessage(input);
    res.json(organized);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve and save endpoint
app.post('/approve', async (req, res) => {
  try {
    const message = req.body;
    const approved = interpreter.approveMessage(message);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ MESSAGE APPROVED');
    console.log('═'.repeat(80));
    console.log(`Version: ${approved.version}`);
    console.log(`Timestamp: ${approved.timestamp}`);
    console.log(`\nApproved Message:\n${approved.organized}`);
    console.log('═'.repeat(80));
    console.log('\n🧠 Ready for Phase 2: Claude execution\n');

    res.json({ success: true, message: approved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get history endpoint
app.get('/history', (req, res) => {
  res.json(interpreter.getHistory());
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log('\n⭐ PHASE 1: GEMINI INTERPRETER');
  console.log('═'.repeat(80));
  console.log(`📍 Open in browser: http://localhost:${PORT}`);
  console.log('═'.repeat(80));
  console.log('\n💡 How Phase 1 works:');
  console.log('   1. You type naturally to Gemini');
  console.log('   2. Gemini organizes your thoughts (doesn\'t change intent)');
  console.log('   3. You see what changed and approve');
  console.log('   4. Approved message goes to Claude for Phase 2 execution');
  console.log('\n✅ Ready for planning!\n');
});
