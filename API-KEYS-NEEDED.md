# GET THESE API KEYS (30 minutes total)

Copy/paste these links and sign up:

## 1. OpenAI (REQUIRED - $5 setup)
**Link:** https://platform.openai.com/api-keys
**Steps:**
1. Sign up with email
2. Add credit card ($5 minimum)
3. Click "Create new secret key"
4. Copy key (starts with `sk-proj-`)
5. Paste in `.env` as `OPENAI_API_KEY=sk-proj-YOUR_KEY`

**Cost:** ~$0.10 per video (script generation)

---

## 2. Pexels (FREE - 2 minutes)
**Link:** https://www.pexels.com/api/
**Steps:**
1. Click "Get Started"
2. Sign up with email
3. Instant API key shown
4. Copy key
5. Paste in `.env` as `PEXELS_API_KEY=YOUR_KEY`

**Limit:** 200 requests/hour (free forever)

---

## 3. ElevenLabs (REQUIRED - $30/month)
**Link:** https://elevenlabs.io/api
**Steps:**
1. Sign up
2. Subscribe to Pro plan ($30/month)
3. Go to Profile → API Keys
4. Copy your API key
5. Paste in `.env` as `ELEVENLABS_API_KEY=YOUR_KEY`

**Cost:** $30/month unlimited voices

---

## 4. YouTube Data API (FREE - 10 minutes)
**Link:** https://console.cloud.google.com/apis/credentials
**Steps:**
1. Create new Google Cloud Project
2. Enable "YouTube Data API v3"
3. Create OAuth 2.0 credentials
4. Download JSON file
5. Put in `backend/credentials/youtube_oauth.json`

**Then:**
```bash
# First video upload will open browser for OAuth
# After that it's automatic
```

---

## 5. Stripe (FREE test mode - 5 minutes)
**Link:** https://dashboard.stripe.com/apikeys
**Steps:**
1. Sign up for Stripe
2. Go to Developers → API Keys
3. Copy "Secret key" (starts with `sk_test_`)
4. Paste in `.env` as `STRIPE_SECRET_KEY=sk_test_YOUR_KEY`

**Note:** Test mode is free, switch to live mode when ready to charge

---

## 6. Already Have (Don't need to get)
✅ Adobe Firefly: `218dfce1f0794f71b7e975c39153f98f`
✅ Anthropic (Claude): You already have this

---

## AFTER YOU GET KEYS

1. Copy `.env.example` to `.env`:
```bash
cd ~/faceless-automation-platform
cp .env.example .env
```

2. Edit `.env` and paste your keys:
```bash
nano .env
```

3. Test it works:
```bash
npm run test:e2e
```

Should see: ✅ ALL STAGES PASSED

---

## TOTAL COST
- OpenAI: $5 setup + ~$0.10/video
- Pexels: FREE
- ElevenLabs: $30/month
- YouTube: FREE
- Stripe: FREE (test mode)
- **Total: $35 to start testing**

**Revenue from 1 video:** $50-500/month
**Pays for itself in 1 video.**
