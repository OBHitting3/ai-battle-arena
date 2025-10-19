/**
 * AI BATTLE ARENA - Web Interface
 *
 * Watch 5 AIs compete in real-time to answer your questions!
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { AIBattleArena, BattleResult } from './ai-battle-arena.js';
import { accessControl } from '../services/access-control.js';
import { pricingRouter } from './pricing-page.js';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Add pricing routes
app.use(pricingRouter);

const arena = new AIBattleArena();

app.get('/', (req, res) => {
  const contestants = arena.getContestants();

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏟️ AI Battle Arena</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      min-height: 100vh;
      padding: 20px;
      position: relative;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
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
      font-size: 56px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      font-weight: 800;
    }

    .subtitle {
      font-size: 20px;
      opacity: 0.95;
      font-weight: 500;
    }

    .contestants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .contestant-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .contestant-card:hover {
      transform: translateY(-5px);
    }

    .contestant-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .contestant-name {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .contestant-model {
      font-size: 14px;
      color: #666;
    }

    .input-panel {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      margin-bottom: 30px;
    }

    .question-input {
      width: 100%;
      min-height: 120px;
      padding: 20px;
      font-size: 18px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      resize: vertical;
      font-family: inherit;
      margin-bottom: 20px;
    }

    .question-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .rounds-selector {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .rounds-selector label {
      font-size: 16px;
      font-weight: 600;
    }

    .rounds-selector select {
      padding: 10px 15px;
      font-size: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
    }

    .battle-btn {
      width: 100%;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .battle-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4);
    }

    .battle-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .battle-arena {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      display: none;
    }

    .battle-arena.active {
      display: block;
    }

    .round-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
    }

    .round-header h2 {
      font-size: 28px;
      margin-bottom: 5px;
    }

    .responses-grid {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
    }

    .ai-response {
      background: #f9fafb;
      border-left: 6px solid;
      padding: 20px;
      border-radius: 10px;
      animation: slideIn 0.5s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .ai-response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .ai-name {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
    }

    .ai-icon {
      font-size: 32px;
    }

    .confidence-badge {
      background: rgba(0,0,0,0.1);
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
    }

    .ai-answer {
      margin-bottom: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .ai-reasoning {
      background: rgba(255,255,255,0.5);
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .winner-banner {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      margin: 30px 0;
    }

    .winner-banner h2 {
      font-size: 36px;
      margin-bottom: 15px;
    }

    .final-report {
      background: #fff9e6;
      border: 3px solid #ffd700;
      padding: 30px;
      border-radius: 15px;
      margin-top: 20px;
    }

    .final-report h3 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #d4af37;
    }

    .final-report-content {
      line-height: 1.8;
      white-space: pre-wrap;
      font-size: 16px;
    }

    .loading {
      text-align: center;
      padding: 60px;
      color: #667eea;
    }

    .spinner {
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .hidden {
      display: none !important;
    }

    .new-battle-btn {
      width: 100%;
      padding: 16px;
      font-size: 18px;
      font-weight: 600;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      margin-top: 30px;
    }

    .new-battle-btn:hover {
      background: #5568d3;
    }

    .voice-control-panel {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      border: 2px solid #667eea;
    }

    .voice-control-panel h4 {
      margin: 0 0 15px 0;
      color: #333;
    }

    #voiceSelect {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #667eea;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }

    .premium-option {
      color: #b8860b;
      font-weight: bold;
    }

    .voice-btn {
      flex: 1;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.3s;
    }

    .voice-btn:hover {
      background: #5568d3;
    }

    .voice-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Access Control */
    .access-panel {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      text-align: center;
    }

    .access-input {
      width: 100%;
      max-width: 400px;
      padding: 16px 20px;
      font-size: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      margin: 15px auto;
      text-align: center;
      font-family: monospace;
    }

    .access-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .access-status {
      margin-top: 15px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      display: inline-block;
    }

    .access-status.granted {
      background: #d4edda;
      color: #155724;
    }

    .access-status.denied {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏟️ AI Battle Arena</h1>
      <p class="subtitle">5 AIs compete to answer your question. The best wins!</p>
    </div>

    <!-- Access Control Panel -->
    <div class="access-panel" id="accessPanel">
      <h3 style="margin-bottom: 10px;">🔐 Access Required</h3>
      <p style="color: #666; margin-bottom: 20px;">Enter your access code or <a href="/pricing" style="color: #667eea; text-decoration: none; font-weight: 600;">get a subscription</a></p>
      <input
        type="password"
        class="access-input"
        id="accessCodeInput"
        placeholder="Enter access code..."
        onkeypress="if(event.key==='Enter') checkAccess()"
      />
      <br>
      <button class="battle-btn" onclick="checkAccess()" style="max-width: 400px; margin: 0 auto;">
        Unlock Arena
      </button>
      <div id="accessStatus"></div>
    </div>

    <!-- Contestants -->
    <div class="contestants-grid" id="mainContent" style="display: none;">
      ${contestants.map(c => `
        <div class="contestant-card">
          <div class="contestant-icon">${c.icon}</div>
          <div class="contestant-name" style="color: ${c.color}">${c.name}</div>
          <div class="contestant-model">${c.model}</div>
        </div>
      `).join('')}
    </div>

    <!-- Input Panel -->
    <div class="input-panel" style="display: none;">
      <textarea
        id="questionInput"
        class="question-input"
        placeholder="Ask any question... The AIs will compete to give you the best answer!

Examples:
- What's the best way to optimize a React application?
- How do I set up a CI/CD pipeline?
- Explain quantum computing in simple terms"
      ></textarea>

      <div class="rounds-selector">
        <label>Battle Rounds:</label>
        <select id="roundsSelect">
          <option value="1">1 Round (Fast)</option>
          <option value="2">2 Rounds (Better)</option>
          <option value="3" selected>3 Rounds (Best)</option>
        </select>
        <span style="color: #666; font-size: 14px;">More rounds = better answers but takes longer</span>
      </div>

      <button class="battle-btn" onclick="startBattle()">
        ⚔️ START THE BATTLE!
      </button>
    </div>

    <!-- Loading -->
    <div id="loading" class="loading hidden">
      <div class="spinner"></div>
      <div style="font-size: 20px; font-weight: 600;">AIs are competing...</div>
      <div style="font-size: 16px; margin-top: 10px;">This may take 30-60 seconds per round</div>
    </div>

    <!-- Battle Arena -->
    <div id="battleArena" class="battle-arena">
      <!-- Results will be displayed here -->
    </div>
  </div>

  <script>
    let currentBattle = null;
    let hasAccess = false;

    // Check if user already has access on page load
    window.addEventListener('load', function() {
      const savedCode = localStorage.getItem('arenaAccessCode');
      if (savedCode) {
        document.getElementById('accessCodeInput').value = savedCode;
        checkAccess();
      }
    });

    async function checkAccess() {
      const code = document.getElementById('accessCodeInput').value.trim();
      const statusDiv = document.getElementById('accessStatus');

      if (!code) {
        statusDiv.innerHTML = '<div class="access-status denied">Please enter an access code</div>';
        return;
      }

      try {
        const response = await fetch('/api/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessCode: code })
        });

        const result = await response.json();

        if (result.hasAccess) {
          // Save to localStorage
          localStorage.setItem('arenaAccessCode', code);
          hasAccess = true;

          // Hide access panel, show main content
          document.getElementById('accessPanel').style.display = 'none';
          document.getElementById('mainContent').style.display = 'grid';
          document.querySelector('.input-panel').style.display = 'block';

          statusDiv.innerHTML = '';
        } else {
          statusDiv.innerHTML = '<div class="access-status denied">❌ Invalid access code. <a href="/pricing">Get a subscription</a></div>';
        }
      } catch (error) {
        statusDiv.innerHTML = '<div class="access-status denied">Error checking access. Please try again.</div>';
        console.error('Access check error:', error);
      }
    }

    async function startBattle() {
      const question = document.getElementById('questionInput').value.trim();
      const rounds = parseInt(document.getElementById('roundsSelect').value);

      if (!question) {
        alert('Please enter a question first!');
        return;
      }

      // Show loading
      document.querySelector('.input-panel').style.display = 'none';
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('battleArena').classList.remove('active');

      try {
        const accessCode = localStorage.getItem('arenaAccessCode');

        const response = await fetch('/battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            rounds,
            accessCode  // Send access code with battle request
          })
        });

        const result = await response.json();
        currentBattle = result;

        console.log('Battle result:', result);

        if (result.error) {
          throw new Error(result.error);
        }

        displayBattleResults(result);

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('battleArena').classList.add('active');

      } catch (error) {
        alert('Battle error: ' + error.message);
        console.error('Full error:', error);
        document.querySelector('.input-panel').style.display = 'block';
        document.getElementById('loading').classList.add('hidden');
      }
    }

    function displayBattleResults(result) {
      const arena = document.getElementById('battleArena');

      // Check if we have responses
      if (!result || !result.responses || result.responses.length === 0) {
        arena.innerHTML = '<div class="loading"><h2>⚠️ No responses received</h2><p>The battle completed but no AIs responded. Check the console for errors.</p></div>';
        return;
      }

      // Group responses by round
      const roundGroups = {};
      result.responses.forEach(r => {
        if (!roundGroups[r.round]) roundGroups[r.round] = [];
        roundGroups[r.round].push(r);
      });

      let html = '<div class="round-header"><h2>📊 Question: ' + escapeHtml(result.question) + '</h2></div>';

      // Display each round
      Object.keys(roundGroups).sort().forEach(round => {
        html += '<div class="round-header"><h2>🔔 Round ' + round + '</h2></div><div class="responses-grid">';

        roundGroups[round].forEach(response => {
          const color = getContestantColor(response.contestant);
          html += '<div class="ai-response" style="border-color: ' + color + '">' +
            '<div class="ai-response-header">' +
              '<div class="ai-name">' +
                '<span class="ai-icon">' + getContestantIcon(response.contestant) + '</span>' +
                '<span style="color: ' + color + '">' + response.contestant + '</span>' +
              '</div>' +
              '<div class="confidence-badge">Confidence: ' + response.confidence + '%</div>' +
            '</div>' +
            '<div class="ai-answer">' + escapeHtml(response.answer) + '</div>' +
            '<div class="ai-reasoning"><strong>Reasoning:</strong><br>' +
              escapeHtml(response.reasoning) +
            '</div>' +
          '</div>';
        });

        html += '</div>';
      });

      // Winner banner
      html += '<div class="winner-banner"><h2>🏆 WINNER: ' + result.winner + '</h2></div>' +
        '<div class="final-report"><h3>📋 Final Synthesized Report</h3>' +
        '<div class="final-report-content">' + escapeHtml(result.finalReport) + '</div></div>' +
        '<div class="final-report" style="background: #e6f7ff; border-color: #1890ff;">' +
        '<h3>⚖️ Judge Reasoning</h3>' +
        '<div class="final-report-content">' + escapeHtml(result.judgeReasoning) + '</div></div>' +
        '<div class="voice-control-panel">' +
          '<h4>💾 Download Results</h4>' +
          '<div style="display: flex; gap: 10px; margin-bottom: 15px;">' +
            '<button class="voice-btn" onclick="downloadAsJSON()">📄 Download JSON</button>' +
            '<button class="voice-btn" onclick="downloadAsText()">📝 Download Text</button>' +
            '<button class="voice-btn" onclick="downloadAsHTML()">🌐 Download HTML</button>' +
          '</div>' +
        '</div>' +
        '<div class="voice-control-panel">' +
          '<h4>🎤 Listen to Results</h4>' +
          '<select id="voiceSelect" onchange="handleVoiceChange()">' +
            '<option value="female-free">👩 Female Voice (FREE)</option>' +
            '<option value="male-free">👨 Male Voice (FREE)</option>' +
            '<option value="british-premium" class="premium-option">💎 British Narrator ($5)</option>' +
            '<option value="movietrailer-premium" class="premium-option">💎 Movie Trailer Guy ($5)</option>' +
            '<option value="newsanchor-premium" class="premium-option">💎 News Anchor ($5)</option>' +
          '</select>' +
          '<div style="display: flex; gap: 10px; margin-top: 10px;">' +
            '<button class="voice-btn" onclick="playReport()" id="playBtn">▶️ Play Report</button>' +
            '<button class="voice-btn" onclick="stopSpeaking()">⏹️ Stop</button>' +
          '</div>' +
          '<p style="font-size: 11px; color: #666; margin-top: 8px; line-height: 1.4;">' +
            '⚖️ Voice synthesis for entertainment only. No celebrity endorsement. By using premium voices, you agree to pay $5 per use.' +
          '</p>' +
        '</div>' +
        '<button class="new-battle-btn" onclick="newBattle()">🆕 New Battle</button>';

      arena.innerHTML = html;
    }

    function newBattle() {
      document.querySelector('.input-panel').style.display = 'block';
      document.getElementById('battleArena').classList.remove('active');
      document.getElementById('questionInput').value = '';
    }

    function getContestantColor(name) {
      const colors = {
        'Claude': '#9b59b6',
        'GPT-4': '#10a37f',
        'Gemini': '#4285f4',
        'Perplexity': '#20b8cd',
        'Grok': '#000000'
      };
      return colors[name] || '#666';
    }

    function getContestantIcon(name) {
      const icons = {
        'Claude': '🧠',
        'GPT-4': '🤖',
        'Gemini': '✨',
        'Perplexity': '🔍',
        'Grok': '🚀'
      };
      return icons[name] || '🤔';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML.replace(/\\n/g, '<br>');
    }

    // Voice playback system
    let currentUtterance = null;
    let userHasPremium = false; // TODO: Connect to actual payment system
    let availableVoices = [];

    // Load voices when available
    function loadVoices() {
      availableVoices = speechSynthesis.getVoices();
      console.log('Available voices loaded:', availableVoices.length);
    }

    // Load voices immediately and on change
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    function handleVoiceChange() {
      const select = document.getElementById('voiceSelect');
      const selectedVoice = select.value;

      if (selectedVoice.includes('premium') && !userHasPremium) {
        const confirmPayment = confirm(
          '💎 PREMIUM VOICE - $5.00\\n\\n' +
          'This premium voice requires a one-time $5 payment.\\n\\n' +
          'Click OK to proceed to payment, or Cancel to select a free voice.'
        );

        if (confirmPayment) {
          // TODO: Integrate Stripe payment here
          alert('🚧 Payment integration coming soon!\\n\\nFor now, premium voices are unlocked for testing.');
          userHasPremium = true;
        } else {
          select.value = 'female-free';
        }
      }
    }

    function playReport() {
      if (!currentBattle) {
        alert('No battle results to read!');
        return;
      }

      stopSpeaking();

      const select = document.getElementById('voiceSelect');
      const selectedVoice = select.value;

      // Construct the text to read
      const text = 'Battle Results. Winner: ' + currentBattle.winner + '. ' +
                   currentBattle.finalReport + '. ' +
                   'Judge Reasoning: ' + currentBattle.judgeReasoning;

      currentUtterance = new SpeechSynthesisUtterance(text);

      // Load voices if not loaded yet
      if (availableVoices.length === 0) {
        availableVoices = speechSynthesis.getVoices();
      }

      // Map selection to actual system voices
      let targetVoice = null;

      if (selectedVoice === 'female-free') {
        // Try to find a pleasant female voice
        targetVoice = availableVoices.find(v =>
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
        );
      } else if (selectedVoice === 'male-free') {
        // Try to find a clear male voice
        targetVoice = availableVoices.find(v =>
          v.name.includes('Daniel') ||
          v.name.includes('Alex') ||
          v.name.includes('Tom') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        );
      } else if (selectedVoice === 'british-premium') {
        // British accent voices
        targetVoice = availableVoices.find(v =>
          v.name.includes('Karen') ||
          v.name.includes('Moira') ||
          v.name.includes('Oliver') ||
          v.lang.startsWith('en-GB')
        );
      } else if (selectedVoice === 'movietrailer-premium') {
        // Deep, dramatic voice
        targetVoice = availableVoices.find(v =>
          v.name.includes('Fred') ||
          v.name.includes('Daniel') ||
          v.name.includes('Alex')
        );
        if (targetVoice) {
          currentUtterance.pitch = 0.8; // Lower pitch for movie trailer effect
          currentUtterance.rate = 0.9;  // Slightly slower
        }
      } else if (selectedVoice === 'newsanchor-premium') {
        // Professional, clear voice
        targetVoice = availableVoices.find(v =>
          v.name.includes('Alex') ||
          v.name.includes('Tom') ||
          v.name.includes('Samantha')
        );
      }

      // Set the voice if found
      if (targetVoice) {
        currentUtterance.voice = targetVoice;
        console.log('Using voice:', targetVoice.name);
      } else {
        console.warn('Target voice not found, using default');
      }

      // Set default rate and pitch (unless modified above)
      if (!currentUtterance.rate) currentUtterance.rate = 1.0;
      if (!currentUtterance.pitch) currentUtterance.pitch = 1.0;

      // Update button state
      const playBtn = document.getElementById('playBtn');
      playBtn.textContent = '⏸️ Playing...';
      playBtn.disabled = true;

      // Handle completion
      currentUtterance.onend = function() {
        playBtn.textContent = '▶️ Play Report';
        playBtn.disabled = false;
      };

      currentUtterance.onerror = function(event) {
        console.error('Speech error:', event);
        playBtn.textContent = '▶️ Play Report';
        playBtn.disabled = false;
        alert('Error playing voice. Please try again.');
      };

      // Start speaking
      speechSynthesis.speak(currentUtterance);
    }

    function stopSpeaking() {
      speechSynthesis.cancel();
      currentUtterance = null;

      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.textContent = '▶️ Play Report';
        playBtn.disabled = false;
      }
    }

    // Download functionality
    function downloadAsJSON() {
      if (!currentBattle) {
        alert('No battle results to download!');
        return;
      }

      const dataStr = JSON.stringify(currentBattle, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'battle-results-' + new Date().toISOString().split('T')[0] + '.json';
      link.click();

      URL.revokeObjectURL(url);
    }

    function downloadAsText() {
      if (!currentBattle) {
        alert('No battle results to download!');
        return;
      }

      let text = '=' .repeat(80) + '\\n';
      text += 'AI BATTLE ARENA RESULTS\\n';
      text += '=' .repeat(80) + '\\n\\n';
      text += 'QUESTION: ' + currentBattle.question + '\\n\\n';
      text += 'WINNER: ' + currentBattle.winner + '\\n';
      text += '=' .repeat(80) + '\\n\\n';

      // Group by rounds
      const roundGroups = {};
      currentBattle.responses.forEach(r => {
        if (!roundGroups[r.round]) roundGroups[r.round] = [];
        roundGroups[r.round].push(r);
      });

      // Add each round
      Object.keys(roundGroups).sort().forEach(round => {
        text += '\\nROUND ' + round + '\\n';
        text += '-' .repeat(80) + '\\n\\n';

        roundGroups[round].forEach(response => {
          text += response.contestant + ' (Confidence: ' + response.confidence + '%)\\n';
          text += 'Answer:\\n' + response.answer + '\\n\\n';
          text += 'Reasoning:\\n' + response.reasoning + '\\n\\n';
          text += '~' .repeat(80) + '\\n\\n';
        });
      });

      text += '\\n' + '=' .repeat(80) + '\\n';
      text += 'FINAL SYNTHESIZED REPORT\\n';
      text += '=' .repeat(80) + '\\n\\n';
      text += currentBattle.finalReport + '\\n\\n';

      text += '=' .repeat(80) + '\\n';
      text += 'JUDGE REASONING\\n';
      text += '=' .repeat(80) + '\\n\\n';
      text += currentBattle.judgeReasoning + '\\n';

      const dataBlob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'battle-results-' + new Date().toISOString().split('T')[0] + '.txt';
      link.click();

      URL.revokeObjectURL(url);
    }

    function downloadAsHTML() {
      if (!currentBattle) {
        alert('No battle results to download!');
        return;
      }

      let html = '<!DOCTYPE html>\\n<html>\\n<head>\\n';
      html += '<meta charset="UTF-8">\\n';
      html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\\n';
      html += '<title>AI Battle Results - ' + currentBattle.question.substring(0, 50) + '</title>\\n';
      html += '<style>\\n';
      html += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; background: #f5f5f5; }\\n';
      html += '.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }\\n';
      html += '.question { font-size: 24px; font-weight: 700; margin-bottom: 10px; }\\n';
      html += '.winner { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; font-size: 28px; font-weight: 700; }\\n';
      html += '.round { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }\\n';
      html += '.round-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #667eea; }\\n';
      html += '.response { border-left: 4px solid #667eea; padding: 15px; margin-bottom: 15px; background: #f9fafb; border-radius: 4px; }\\n';
      html += '.ai-name { font-size: 18px; font-weight: 700; margin-bottom: 10px; }\\n';
      html += '.confidence { display: inline-block; background: rgba(0,0,0,0.1); padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600; }\\n';
      html += '.answer { margin: 15px 0; line-height: 1.6; white-space: pre-wrap; }\\n';
      html += '.reasoning { background: rgba(255,255,255,0.5); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.5; }\\n';
      html += '.report { background: #fff9e6; border: 3px solid #ffd700; padding: 30px; border-radius: 12px; margin: 20px 0; }\\n';
      html += '.report-title { font-size: 22px; font-weight: 700; margin-bottom: 15px; color: #d4af37; }\\n';
      html += '.report-content { line-height: 1.8; white-space: pre-wrap; }\\n';
      html += '</style>\\n</head>\\n<body>\\n';

      html += '<div class="header">\\n';
      html += '<div style="font-size: 32px; font-weight: 800; margin-bottom: 10px;">🏟️ AI Battle Arena Results</div>\\n';
      html += '<div class="question">Question: ' + escapeHtml(currentBattle.question) + '</div>\\n';
      html += '<div>Date: ' + new Date().toLocaleDateString() + '</div>\\n';
      html += '</div>\\n';

      html += '<div class="winner">🏆 WINNER: ' + currentBattle.winner + '</div>\\n';

      // Group by rounds
      const roundGroups = {};
      currentBattle.responses.forEach(r => {
        if (!roundGroups[r.round]) roundGroups[r.round] = [];
        roundGroups[r.round].push(r);
      });

      // Add each round
      Object.keys(roundGroups).sort().forEach(round => {
        html += '<div class="round">\\n';
        html += '<div class="round-title">🔔 Round ' + round + '</div>\\n';

        roundGroups[round].forEach(response => {
          const color = getContestantColor(response.contestant);
          html += '<div class="response" style="border-color: ' + color + '">\\n';
          html += '<div class="ai-name" style="color: ' + color + '">' +
                  getContestantIcon(response.contestant) + ' ' +
                  response.contestant +
                  ' <span class="confidence">Confidence: ' + response.confidence + '%</span></div>\\n';
          html += '<div class="answer">' + escapeHtml(response.answer) + '</div>\\n';
          html += '<div class="reasoning"><strong>Reasoning:</strong><br>' +
                  escapeHtml(response.reasoning) + '</div>\\n';
          html += '</div>\\n';
        });

        html += '</div>\\n';
      });

      html += '<div class="report">\\n';
      html += '<div class="report-title">📋 Final Synthesized Report</div>\\n';
      html += '<div class="report-content">' + escapeHtml(currentBattle.finalReport) + '</div>\\n';
      html += '</div>\\n';

      html += '<div class="report" style="background: #e6f7ff; border-color: #1890ff;">\\n';
      html += '<div class="report-title" style="color: #1890ff;">⚖️ Judge Reasoning</div>\\n';
      html += '<div class="report-content">' + escapeHtml(currentBattle.judgeReasoning) + '</div>\\n';
      html += '</div>\\n';

      html += '</body>\\n</html>';

      const dataBlob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'battle-results-' + new Date().toISOString().split('T')[0] + '.html';
      link.click();

      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>
  `);
});

// Access check endpoint
app.post('/api/check-access', async (req, res) => {
  try {
    const { accessCode, customerId } = req.body;

    const accessResult = await accessControl.verifyAccess(accessCode, customerId);

    res.json(accessResult);
  } catch (error: any) {
    console.error('Access check error:', error);
    res.status(500).json({ hasAccess: false, reason: 'Server error' });
  }
});

// Battle endpoint - PROTECTED
app.post('/battle', async (req, res) => {
  try {
    // Check access from cookie or request body
    const accessCode = req.cookies?.arenaAccessCode || req.body.accessCode;
    const customerId = req.cookies?.customerId || req.body.customerId;

    const accessResult = await accessControl.verifyAccess(accessCode, customerId);

    if (!accessResult.hasAccess) {
      return res.status(403).json({
        error: 'Access denied. Please enter a valid access code or subscribe.',
        reason: accessResult.reason
      });
    }

    const { question, rounds = 3 } = req.body;

    console.log(`\n🏟️  Starting battle: "${question}" with ${rounds} rounds`);
    console.log(`🔑 Access granted via: ${accessResult.reason}`);

    const result = await arena.battle(question, rounds);

    console.log(`\n✅ Battle complete! Winner: ${result.winner}\n`);

    res.json(result);
  } catch (error: any) {
    console.error('❌ Battle error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log('\n🏟️  AI BATTLE ARENA');
  console.log('═'.repeat(80));
  console.log(`📍 Open in browser: http://localhost:${PORT}`);
  console.log('═'.repeat(80));
  console.log('\n🎯 Features:');
  console.log('   • 5 AI contestants compete');
  console.log('   • Multiple rounds of improvement');
  console.log('   • AI judge synthesizes best answer');
  console.log('   • See all reasoning and work');
  console.log('\n⚔️  Let the battles begin!\n');
});
