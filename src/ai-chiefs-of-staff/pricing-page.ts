/**
 * PRICING PAGE
 *
 * Stripe checkout integration for AI Empire Builder Pro
 */

import express from 'express';
import { stripeService } from '../services/stripe-service.js';

export const pricingRouter = express.Router();

// Pricing page HTML
pricingRouter.get('/pricing', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>AI Empire Builder - Pricing</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
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
      margin-bottom: 60px;
      padding-top: 40px;
    }

    .header h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .header p {
      font-size: 20px;
      opacity: 0.9;
    }

    .pricing-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .price {
      font-size: 64px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .price span {
      font-size: 24px;
      color: #666;
      font-weight: 400;
    }

    .billing-period {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
    }

    .features {
      list-style: none;
      margin-bottom: 40px;
    }

    .features li {
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #333;
    }

    .features li:last-child {
      border-bottom: none;
    }

    .features li:before {
      content: '✓';
      display: inline-block;
      width: 24px;
      height: 24px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-right: 12px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .cta-button {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }

    .cta-button:active {
      transform: translateY(0);
    }

    .guarantee {
      text-align: center;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }

    .back-link {
      text-align: center;
      margin-top: 32px;
    }

    .back-link a {
      color: white;
      text-decoration: none;
      font-size: 16px;
      opacity: 0.9;
    }

    .back-link a:hover {
      opacity: 1;
      text-decoration: underline;
    }

    .loading {
      display: none;
      text-align: center;
      margin-top: 16px;
      color: #666;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 36px;
      }

      .pricing-card {
        padding: 32px 24px;
      }

      .price {
        font-size: 48px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI Empire Builder</h1>
      <p>Get the best AI answers, every time</p>
    </div>

    <div class="pricing-card">
      <div class="badge">PRO PLAN</div>

      <div class="price">
        $29<span>/mo</span>
      </div>

      <div class="billing-period">
        Billed monthly • Cancel anytime
      </div>

      <ul class="features">
        <li>Unlimited AI Battles</li>
        <li>5 Leading AI Models (Claude, GPT-4, Gemini, Perplexity, Grok)</li>
        <li>Multi-Round Refinement</li>
        <li>Expert AI Judge & Synthesis</li>
        <li>Voice Playback (Premium Voices +$5)</li>
        <li>Full Conversation History</li>
        <li>Priority Support</li>
      </ul>

      <button class="cta-button" onclick="startCheckout()">
        Start Pro Subscription
      </button>

      <div class="loading" id="loading">
        Creating secure checkout...
      </div>

      <div class="guarantee">
        🔒 Secure payment via Stripe • 30-day money-back guarantee
      </div>
    </div>

    <div class="back-link">
      <a href="/">← Back to Battle Arena</a>
    </div>
  </div>

  <script>
    async function startCheckout() {
      const button = document.querySelector('.cta-button');
      const loading = document.getElementById('loading');

      button.disabled = true;
      button.textContent = 'Creating checkout...';
      loading.style.display = 'block';

      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Error starting checkout. Please try again.');
        button.disabled = false;
        button.textContent = 'Start Pro Subscription';
        loading.style.display = 'none';
      }
    }
  </script>
</body>
</html>
  `);
});

// Create checkout session API
pricingRouter.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripeService.createCheckoutSession(
      undefined, // email (optional)
      `${req.protocol}://${req.get('host')}/success`,
      `${req.protocol}://${req.get('host')}/pricing`
    );

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Success page
pricingRouter.get('/success', (req, res) => {
  const sessionId = req.query.session_id;

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to AI Empire Builder Pro!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .success-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .success-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 16px;
    }

    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }

    .cta-button:hover {
      transform: translateY(-2px);
    }

    .session-id {
      margin-top: 24px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="success-card">
    <div class="success-icon">🎉</div>
    <h1>Welcome to Pro!</h1>
    <p>
      Your subscription is now active. You have unlimited access to all 5 AI models
      and can start running battles right away.
    </p>
    <a href="/" class="cta-button">Start Your First Battle</a>
    ${sessionId ? `<div class="session-id">Session: ${sessionId}</div>` : ''}
  </div>
</body>
</html>
  `);
});
