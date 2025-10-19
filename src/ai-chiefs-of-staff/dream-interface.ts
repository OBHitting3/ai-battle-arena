/**
 * DREAM OF CLAUDIFICATION - Web Interface
 *
 * Karl's thoughts → 4 Claude-optimized formats → Send to Claude
 */

import express from 'express';
import { Claudification, ClaudeFormat } from './claudification.js';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const claudifier = new Claudification(
  process.env.GOOGLE_GEMINI_API_KEY!,
  process.env.ANTHROPIC_API_KEY!
);

app.get('/', (req, res) => {
  const sessionDate = claudifier.getSessionDate();
  const nextVersion = claudifier.getCurrentVersion();

  // Disable caching completely
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dream of Claudification v2.0</title>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 25px;
    }

    .header h1 {
      font-size: 52px;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      font-weight: 800;
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.95;
      font-weight: 500;
    }

    /* Input Section */
    .input-panel {
      background: white;
      border-radius: 20px 20px 0 0;
      padding: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    textarea {
      width: 100%;
      min-height: 140px;
      padding: 20px;
      font-size: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      resize: vertical;
      font-family: inherit;
      transition: all 0.3s;
    }

    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .claudify-btn {
      width: 100%;
      margin-top: 15px;
      padding: 18px;
      font-size: 20px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .claudify-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .claudify-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Version Bar */
    .version-bar {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      padding: 18px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 3px solid #667eea;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .version-item {
      font-size: 15px;
      color: #4c1d95;
      font-weight: 600;
    }

    .version-value {
      color: #667eea;
      font-weight: 700;
      margin-left: 8px;
    }

    /* Format Tabs */
    .formats-container {
      background: white;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border-top: 1px solid #e5e7eb;
    }

    .format-tab {
      padding: 20px;
      text-align: center;
      cursor: pointer;
      border-right: 1px solid #e5e7eb;
      transition: all 0.3s;
      background: #f9fafb;
    }

    .format-tab:last-child {
      border-right: none;
    }

    .format-tab:hover {
      background: #f3f4f6;
    }

    .format-tab.active {
      background: white;
      border-bottom: 4px solid #667eea;
    }

    .format-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .format-name {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    /* Output Panel */
    .output-panel {
      background: white;
      padding: 35px;
      min-height: 300px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .output-content {
      color: #1f2937;
      line-height: 1.8;
      font-size: 15px;
      white-space: pre-wrap;
    }

    .output-content.hidden {
      display: none;
    }

    /* Action Buttons */
    .action-buttons {
      background: white;
      padding: 25px 35px;
      border-radius: 0 0 20px 20px;
      display: flex;
      gap: 15px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .action-btn {
      flex: 1;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .send-btn {
      background: #22c55e;
      color: white;
    }

    .send-btn:hover {
      background: #16a34a;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .edit-btn {
      background: #f59e0b;
      color: white;
    }

    .edit-btn:hover {
      background: #d97706;
    }

    .copy-btn {
      background: #3b82f6;
      color: white;
    }

    .copy-btn:hover {
      background: #2563eb;
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
      display: none;
    }

    /* Conversation Panel */
    .conversation-panel {
      background: white;
      border-radius: 20px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      height: 700px;
      margin-top: 20px;
    }

    .conversation-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .conversation-header h2 {
      margin: 0;
      font-size: 24px;
    }

    .conversation-actions {
      display: flex;
      gap: 10px;
    }

    .back-btn, .clear-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .back-btn:hover, .clear-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .conversation-messages {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
      background: #f9fafb;
    }

    .message {
      margin-bottom: 20px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-message .message-label {
      color: #667eea;
    }

    .claude-message .message-label {
      color: #764ba2;
    }

    .message-content {
      background: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      line-height: 1.6;
      white-space: pre-wrap;
      font-size: 15px;
    }

    .user-message .message-content {
      border-left: 4px solid #667eea;
    }

    .claude-message .message-content {
      border-left: 4px solid #764ba2;
    }

    .listen-btn {
      margin-top: 10px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.3s;
    }

    .listen-btn:hover {
      opacity: 0.9;
    }

    .listen-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .conversation-input {
      padding: 20px 30px;
      background: white;
      border-radius: 0 0 20px 20px;
      border-top: 2px solid #e5e7eb;
    }

    .conversation-input textarea {
      width: 100%;
      min-height: 80px;
      padding: 15px;
      font-size: 15px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      resize: vertical;
      font-family: inherit;
      margin-bottom: 10px;
    }

    .conversation-input textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .send-followup-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .send-followup-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .send-followup-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #22c55e;
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-weight: 600;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Dream of Claudification</h1>
      <p class="subtitle">Transform your thoughts into Claude's perfect formats</p>
    </div>

    <!-- Input Section -->
    <div id="inputSection" class="input-panel">
      <textarea
        id="karlInput"
        placeholder="Type what you want to tell Claude... I'll convert it into the perfect format for maximum efficiency."
      ></textarea>
      <button class="claudify-btn" onclick="claudify()">
        🧠 Claudify
      </button>
    </div>

    <!-- Loading -->
    <div id="loading" class="loading hidden">
      <div class="spinner"></div>
      <div style="font-size: 18px; font-weight: 600;">Gemini is Claudifying your message...</div>
    </div>

    <!-- Results -->
    <div id="results" class="hidden">
      <!-- Version Bar -->
      <div class="version-bar">
        <div class="version-item">
          📅 Session: <span class="version-value">${sessionDate}</span>
        </div>
        <div class="version-item">
          🔢 Version: <span class="version-value" id="messageVersion">${nextVersion}</span>
        </div>
        <div class="version-item">
          🕐 Time: <span class="version-value" id="messageTime"></span>
        </div>
      </div>

      <!-- Format Tabs -->
      <div class="formats-container">
        <div class="format-tab active" onclick="selectFormat('execBrief')">
          <div class="format-icon">🎯</div>
          <div class="format-name">Executive Brief</div>
        </div>
        <div class="format-tab" onclick="selectFormat('techSpec')">
          <div class="format-icon">🏗️</div>
          <div class="format-name">Tech Spec</div>
        </div>
        <div class="format-tab" onclick="selectFormat('researchQuery')">
          <div class="format-icon">🔍</div>
          <div class="format-name">Research Query</div>
        </div>
        <div class="format-tab" onclick="selectFormat('debugReport')">
          <div class="format-icon">🐛</div>
          <div class="format-name">Debug Report</div>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="output-panel">
        <div id="execBrief" class="output-content"></div>
        <div id="techSpec" class="output-content hidden"></div>
        <div id="researchQuery" class="output-content hidden"></div>
        <div id="debugReport" class="output-content hidden"></div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn send-btn" onclick="sendToClaude()">
          🚀 Send to Claude
        </button>
        <button class="action-btn edit-btn" onclick="editAgain()">
          ✏️ Edit Original
        </button>
        <button class="action-btn new-query-btn" onclick="startNewQuery()">
          🏠 New Query
        </button>
        <button class="action-btn copy-btn" onclick="copyMessage()">
          📋 Copy Message
        </button>
      </div>
    </div>
  </div>

  <script>
    // VERSION 2.0 - FIXED TEMPLATE LITERALS
    let currentData = null;
    let selectedFormat = 'execBrief';

    async function claudify() {
      const input = document.getElementById('karlInput').value.trim();

      if (!input) {
        alert('Please enter a message first!');
        return;
      }

      // Show loading
      document.getElementById('inputSection').classList.add('hidden');
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('results').classList.add('hidden');

      try {
        const response = await fetch('/claudify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });

        const data = await response.json();
        currentData = data;

        // Populate all formats
        document.getElementById('execBrief').textContent = data.formats.execBrief;
        document.getElementById('techSpec').textContent = data.formats.techSpec;
        document.getElementById('researchQuery').textContent = data.formats.researchQuery;
        document.getElementById('debugReport').textContent = data.formats.debugReport;

        // Update version info
        document.getElementById('messageVersion').textContent = data.version;
        document.getElementById('messageTime').textContent = new Date(data.timestamp).toLocaleTimeString();

        // Show results
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');

      } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
        document.getElementById('inputSection').classList.remove('hidden');
        document.getElementById('loading').classList.add('hidden');
      }
    }

    function selectFormat(format) {
      selectedFormat = format;

      // Update tabs
      document.querySelectorAll('.format-tab').forEach(tab => tab.classList.remove('active'));
      event.target.closest('.format-tab').classList.add('active');

      // Show selected content
      document.querySelectorAll('.output-content').forEach(content => content.classList.add('hidden'));
      document.getElementById(format).classList.remove('hidden');
    }

    async function sendToClaude() {
      if (!currentData) return;

      const message = currentData.formats[selectedFormat];

      // Show loading state
      const sendBtn = document.querySelector('.send-btn');
      const originalText = sendBtn.textContent;
      sendBtn.textContent = '⏳ Sending to Claude...';
      sendBtn.disabled = true;

      try {
        const response = await fetch('/send-to-claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (response.ok) {
          // Show Claude's response
          showClaudeResponse(message, data.response);
          showToast('✅ Claude responded!');
        } else {
          throw new Error(data.error || 'Failed to send to Claude');
        }
      } catch (error) {
        alert('Error sending to Claude: ' + error.message);
        console.error(error);
      } finally {
        sendBtn.textContent = originalText;
        sendBtn.disabled = false;
      }
    }

    function showClaudeResponse(userMessage, claudeResponse) {
      // Hide the format selection and show conversation view
      document.getElementById('results').classList.add('hidden');

      // Create or show conversation panel
      let conversationPanel = document.getElementById('conversationPanel');
      if (!conversationPanel) {
        conversationPanel = document.createElement('div');
        conversationPanel.id = 'conversationPanel';
        conversationPanel.className = 'conversation-panel';
        conversationPanel.innerHTML = '<div class="conversation-header">' +
          '<h2>💬 Conversation with Claude</h2>' +
          '<div class="conversation-actions">' +
            '<button onclick="startNewQuery()" class="new-query-btn">🏠 New Query</button>' +
            '<button onclick="backToFormats()" class="back-btn">← Back to Formats</button>' +
            '<button onclick="clearConversation()" class="clear-btn">🗑️ Clear</button>' +
          '</div>' +
        '</div>' +
        '<div class="conversation-messages" id="conversationMessages"></div>' +
        '<div class="conversation-input">' +
          '<textarea id="followupInput" placeholder="Type your response to Claude..."></textarea>' +
          '<button onclick="sendFollowup()" class="send-followup-btn">Send to Claude</button>' +
        '</div>';
        document.querySelector('.container').appendChild(conversationPanel);
      }

      conversationPanel.classList.remove('hidden');

      // Add messages to conversation
      const messagesDiv = document.getElementById('conversationMessages');
      messagesDiv.innerHTML += '<div class="message user-message">' +
        '<div class="message-label">You (Claudified)</div>' +
        '<div class="message-content">' + escapeHtml(userMessage) + '</div>' +
      '</div>' +
      '<div class="message claude-message" data-message-text="' + claudeResponse.replace(/"/g, '&quot;') + '">' +
        '<div class="message-label">Claude</div>' +
        '<div class="message-content">' + escapeHtml(claudeResponse) + '</div>' +
        '<button class="listen-btn" onclick="speakClaudeMessage(this)">🎤 Listen</button>' +
      '</div>';

      // Scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendFollowup() {
      const input = document.getElementById('followupInput');
      const message = input.value.trim();

      if (!message) {
        alert('Please enter a message first!');
        return;
      }

      const sendBtn = document.querySelector('.send-followup-btn');
      sendBtn.textContent = '⏳ Sending...';
      sendBtn.disabled = true;
      input.disabled = true;

      try {
        // First, claudify the followup message
        const claudifyResponse = await fetch('/claudify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: message })
        });

        const claudifyData = await claudifyResponse.json();
        const formattedMessage = claudifyData.formats.execBrief; // Use exec brief for followups

        // Then send to Claude
        const claudeResponse = await fetch('/send-to-claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: formattedMessage })
        });

        const claudeData = await claudeResponse.json();

        if (claudeResponse.ok) {
          // Add to conversation
          const messagesDiv = document.getElementById('conversationMessages');
          messagesDiv.innerHTML += '<div class="message user-message">' +
            '<div class="message-label">You (Claudified)</div>' +
            '<div class="message-content">' + escapeHtml(formattedMessage) + '</div>' +
          '</div>' +
          '<div class="message claude-message" data-message-text="' + claudeData.response.replace(/"/g, '&quot;') + '">' +
            '<div class="message-label">Claude</div>' +
            '<div class="message-content">' + escapeHtml(claudeData.response) + '</div>' +
            '<button class="listen-btn" onclick="speakClaudeMessage(this)">🎤 Listen</button>' +
          '</div>';

          messagesDiv.scrollTop = messagesDiv.scrollHeight;
          input.value = '';
          showToast('✅ Claude responded!');
        } else {
          throw new Error(claudeData.error || 'Failed to send to Claude');
        }
      } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
      } finally {
        sendBtn.textContent = 'Send to Claude';
        sendBtn.disabled = false;
        input.disabled = false;
      }
    }

    function startNewQuery() {
      document.getElementById('conversationPanel').classList.add('hidden');
      document.getElementById('results').classList.add('hidden');
      document.getElementById('inputSection').classList.remove('hidden');
      document.getElementById('karlInput').value = '';
      currentData = null;
    }

    function backToFormats() {
      document.getElementById('conversationPanel').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
    }

    async function clearConversation() {
      if (!confirm('Clear the entire conversation with Claude?')) return;

      try {
        await fetch('/clear-conversation', { method: 'POST' });
        document.getElementById('conversationMessages').innerHTML = '';
        showToast('🗑️ Conversation cleared');
      } catch (error) {
        alert('Error clearing conversation: ' + error.message);
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML.replace(/\\n/g, '<br>');
    }

    // Voice playback system
    let currentUtterance = null;
    let availableVoices = [];

    // Load voices when available
    function loadVoices() {
      availableVoices = speechSynthesis.getVoices();
      console.log('Dream: Available voices loaded:', availableVoices.length);
    }

    // Load voices immediately and on change
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    function speakClaudeMessage(buttonElement) {
      // Stop any current speech
      speechSynthesis.cancel();

      // Get the message text from the parent claude-message div
      const messageDiv = buttonElement.closest('.claude-message');
      const messageText = messageDiv.getAttribute('data-message-text');

      if (!messageText) {
        alert('No message to read!');
        return;
      }

      // Create utterance
      currentUtterance = new SpeechSynthesisUtterance(messageText);

      // Load voices if not loaded yet
      if (availableVoices.length === 0) {
        availableVoices = speechSynthesis.getVoices();
      }

      // Try to find a pleasant voice
      const voice = availableVoices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Victoria') ||
        (v.lang.startsWith('en') && !v.name.includes('Google'))
      );

      if (voice) {
        currentUtterance.voice = voice;
      }

      currentUtterance.rate = 1.0;
      currentUtterance.pitch = 1.0;

      // Update button
      buttonElement.textContent = '⏸️ Playing...';
      buttonElement.disabled = true;

      // Handle completion
      currentUtterance.onend = function() {
        buttonElement.textContent = '🎤 Listen';
        buttonElement.disabled = false;
      };

      currentUtterance.onerror = function(event) {
        console.error('Speech error:', event);
        buttonElement.textContent = '🎤 Listen';
        buttonElement.disabled = false;
        alert('Error playing voice. Please try again.');
      };

      // Start speaking
      speechSynthesis.speak(currentUtterance);
    }

    function editAgain() {
      document.getElementById('results').classList.add('hidden');
      document.getElementById('inputSection').classList.remove('hidden');
    }

    function copyMessage() {
      if (!currentData) return;

      const message = currentData.formats[selectedFormat];
      navigator.clipboard.writeText(message);
      showToast('📋 Copied to clipboard!');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // Allow Cmd/Ctrl + Enter to claudify
    document.getElementById('karlInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        claudify();
      }
    });
  </script>
</body>
</html>
  `);
});

// Claudify endpoint
app.post('/claudify', async (req, res) => {
  try {
    console.log('\n📥 Received claudify request');
    const { input } = req.body;
    console.log('📝 Input:', input);
    const result = await claudifier.claudify(input);
    console.log('✅ Claudification complete');
    res.json(result);
  } catch (error: any) {
    console.error('❌ Error in /claudify endpoint:', error);
    console.error('Full error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Send to Claude endpoint
app.post('/send-to-claude', async (req, res) => {
  try {
    console.log('\n🚀 Sending to Claude');
    const { message } = req.body;
    console.log('📝 Formatted message:', message.substring(0, 100) + '...');

    // Get Claude's response
    const claudeResponse = await claudifier.sendToClaude(message);
    console.log('✅ Claude response received');

    // Translate back through Gemini for Karl
    console.log('🔄 Translating through Gemini for Karl...');
    const karlFriendlyResponse = await claudifier.translateForKarl(claudeResponse);
    console.log('✅ Karl-friendly response ready');

    res.json({
      response: karlFriendlyResponse,
      claudeOriginal: claudeResponse,  // Keep original for reference
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error in /send-to-claude endpoint:', error);
    console.error('Full error:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history endpoint
app.get('/conversation', (req, res) => {
  try {
    const history = claudifier.getConversationHistory();
    res.json({ history });
  } catch (error: any) {
    console.error('❌ Error in /conversation endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation endpoint
app.post('/clear-conversation', (req, res) => {
  try {
    claudifier.clearConversation();
    console.log('🗑️ Conversation cleared');
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in /clear-conversation endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log('\n✨ DREAM OF CLAUDIFICATION');
  console.log('═'.repeat(80));
  console.log(`📍 Open in browser: http://localhost:${PORT}`);
  console.log('═'.repeat(80));
  console.log('\n🎯 4 Formats Available:');
  console.log('   • Executive Brief - Quick tasks');
  console.log('   • Tech Spec - Building things');
  console.log('   • Research Query - Investigation');
  console.log('   • Debug Report - Fixing issues');
  console.log('\n✅ Ready to Claudify!\n');
});
