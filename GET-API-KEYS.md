# 🔑 GET YOUR API KEYS - QUICK GUIDE

## ✅ ALREADY HAVE (Found in your files)
- ✅ YOUTUBE_API_KEY
- ✅ ADOBE_FIREFLY_API_KEY

---

## 🚨 CRITICAL - NEEDED TO RUN CASPER

### 1. ANTHROPIC API KEY (Claude)
**Why**: Powers the evaluator debate system (Paddy, Zuck, Hulk)
**Get it**: https://console.anthropic.com/
- Sign in
- Go to "API Keys"
- Create key
- Copy and paste into .env

### 2. OPENAI API KEY (ChatGPT)
**Why**: One of the 5 AI personas
**Get it**: https://platform.openai.com/api-keys
- Sign in
- Click "Create new secret key"
- Copy and paste into .env

---

## ⚠️ OPTIONAL - For Full Multi-AI Testing

### 3. GOOGLE GEMINI API KEY
**Why**: Gemini 2.5 Pro persona
**Get it**: https://aistudio.google.com/app/apikey
- Sign in with Google
- Click "Get API key"
- Copy and paste into .env

### 4. PERPLEXITY API KEY
**Why**: Perplexity research persona
**Get it**: https://www.perplexity.ai/settings/api
- Sign in
- Go to API settings
- Generate key
- Copy and paste into .env

### 5. GROK API KEY (X.AI)
**Why**: SuperHeavy Grok 4 persona
**Get it**: https://x.ai/api
- Sign up for access
- Get API key
- Copy and paste into .env

---

## 💡 MINIMAL SETUP TO TEST NOW

You can test CASPER with just **2 keys**:

```bash
# Required minimum:
YOUTUBE_API_KEY=AIzaSyB7UTlBwEtX2KsZM89ceHL6sYHQ2cRTJRw  # ✅ YOU HAVE THIS
ANTHROPIC_API_KEY=sk-ant-...  # ⚠️ GET THIS NOW

# With these 2, you can:
- ✅ Validate niches (YouTube API)
- ✅ Run evaluator debates (Anthropic)
- ✅ Use Claude persona (Anthropic)
- ❌ Can't use other 4 AI personas yet
```

---

## 📝 INSTRUCTIONS

### Step 1: Get Anthropic Key (5 minutes)
1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Click "API Keys" in sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Open `.env` file
7. Replace `sk-ant-YOUR_KEY_HERE` with your actual key

### Step 2: Test CASPER
```bash
cd ~/faceless-automation-platform
npm run test:casper:single
```

### Step 3: Get Other Keys (Optional)
- If the test works, CASPER is functional!
- Get other AI keys later to test all 5 personas
- See links above

---

## 🎯 PRIORITY ORDER

1. **ANTHROPIC_API_KEY** - Critical, get first (5 min)
2. **OPENAI_API_KEY** - Important for ChatGPT persona (5 min)
3. **GOOGLE_GEMINI_API_KEY** - Nice to have (5 min)
4. **PERPLEXITY_API_KEY** - Optional (requires signup)
5. **GROK_API_KEY** - Optional (may require waitlist)

---

## ✅ VERIFICATION

After adding Anthropic key, verify it works:

```bash
# Test CASPER
npm run test:casper:single

# You should see:
# ✅ Niche validation working
# ✅ Evaluator debate running
# ✅ Consensus achieved
```

---

## 💰 COST ESTIMATES

- **Anthropic (Claude)**: ~$0.03 per test
- **OpenAI (GPT-4)**: ~$0.02 per test
- **Google Gemini**: Free tier available
- **YouTube API**: Free (10,000 requests/day)

**Total for 100 tests**: ~$5

---

## 🚨 URGENT: DO THIS NOW

1. Open https://console.anthropic.com/ in browser
2. Get your Anthropic API key
3. Edit `.env` and add the key
4. Run: `npm run test:casper:single`
5. Watch CASPER work!

That's it. 5 minutes to test CASPER.
