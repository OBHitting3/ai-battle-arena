# 🎯 How to Use Dream Conversation - Quick Guide

## 🌐 Open the Interface

1. Make sure the server is running:
   \`\`\`bash
   npm run dream
   \`\`\`

2. Open in your browser:
   \`\`\`
   http://localhost:3003
   \`\`\`

---

## 💬 Start Your First Conversation

### Step 1: Type Your Thought
In the input box at the top, type what you want to tell Claude:
\`\`\`
Example: "Help me optimize my React application"
\`\`\`

Press **Cmd+Enter** or click **"Claudify"**

---

### Step 2: Pick Your Format
Gemini will show you 4 different formats:

- **🎯 Executive Brief** - Quick tasks and requests
- **🏗️ Tech Spec** - Building features and implementations
- **🔍 Research Query** - Investigation and analysis
- **🐛 Debug Report** - Problem-solving and fixes

Click on the tab you want to use.

---

### Step 3: Send to Claude
Click the **"🚀 Send to Claude"** button.

The interface will:
1. Show "⏳ Sending to Claude..."
2. Wait for Claude's response
3. Switch to conversation view
4. Show both your message and Claude's response

---

### Step 4: Continue the Conversation
In the conversation view, you'll see:
- **Your message** (formatted by Gemini)
- **Claude's response**
- **A new input box** at the bottom

Type your followup in the input box:
\`\`\`
Example: "Great! Now show me how to implement that"
\`\`\`

Click **"Send to Claude"** again.

Your followup will:
1. Automatically get formatted by Gemini
2. Get sent to Claude
3. Appear in the conversation
4. Show Claude's new response

**Keep going back and forth as much as you want!**

---

## 🔄 Navigation

### Back to Formats
Click **"← Back to Formats"** to see the format options for your original message again.

### Clear Conversation
Click **"🗑️ Clear"** to start a completely new conversation with Claude.

### Start Over
Click **"✏️ Edit Original"** on the formats page to type a new thought.

---

## 💡 Pro Tips

1. **Use Different Formats for Different Tasks**
   - Planning → Executive Brief
   - Coding → Tech Spec
   - Understanding → Research Query
   - Fixing → Debug Report

2. **Conversation Context is Preserved**
   - Claude remembers everything in the current conversation
   - Perfect for iterative development
   - Clear conversation when switching topics

3. **Keyboard Shortcuts**
   - Cmd+Enter in input box = Claudify
   - Tab between format options = Quick navigation

4. **Copy Messages**
   - Click **"📋 Copy Message"** to copy the formatted text
   - Useful for sharing or saving

---

## 🎬 Example Session

### You Start:
\`\`\`
"I need to add dark mode to my app"
\`\`\`

### After Claudify → Pick Tech Spec → Send to Claude:

**Your Message (Formatted):**
\`\`\`
## TECHNICAL SPECIFICATION

**What to Build:**
Dark mode theme switcher for application

**Technical Requirements:**
- Theme state management
- CSS variable system
- Persistent storage
- Toggle component

[... more details ...]
\`\`\`

**Claude's Response:**
\`\`\`
I'll help you implement dark mode. Here's a comprehensive solution:

1. First, let's set up the theme context...
[... detailed implementation ...]
\`\`\`

### You Follow Up:
\`\`\`
"Can you show me the CSS variables approach?"
\`\`\`

### Claude Responds:
\`\`\`
Absolutely! Here's the CSS variables approach:

[... specific CSS implementation ...]
\`\`\`

**And the conversation continues!**

---

## 🚨 Troubleshooting

### Server Not Running?
\`\`\`bash
npm run dream
\`\`\`

### Claude Not Responding?
Check your `.env` file has:
\`\`\`
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

### Gemini Not Formatting?
Make sure Google Cloud is authenticated:
\`\`\`bash
gcloud auth application-default login
\`\`\`

---

## ✨ That's It!

You now have a two-way conversation interface with Claude, powered by Gemini's smart formatting!

**Enjoy your $300 of Vertex AI credits!** 🎉
