/**
 * STRIPE PAYMENT SERVICE
 *
 * Handles all Stripe integration:
 * - Subscription checkout
 * - Webhook events
 * - Customer management
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

// Product & Price Configuration
const PRODUCT_CONFIG = {
  name: 'AI Empire Builder - Pro',
  description: 'Unlimited AI battles with 5 leading models. Get the best answers, every time.',
  monthlyPrice: 2900, // $29.00 in cents
  currency: 'usd'
};

export class StripeService {
  private stripe: Stripe;
  private priceId: string | null = null;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Get or create the subscription product and price
   */
  async getOrCreatePrice(): Promise<string> {
    if (this.priceId) {
      return this.priceId;
    }

    // Check if product already exists
    const products = await this.stripe.products.list({
      active: true,
      limit: 100
    });

    let product = products.data.find(p => p.name === PRODUCT_CONFIG.name);

    if (!product) {
      // Create product
      product = await this.stripe.products.create({
        name: PRODUCT_CONFIG.name,
        description: PRODUCT_CONFIG.description,
        metadata: {
          service: 'ai-empire-builder'
        }
      });
      console.log('✅ Created Stripe product:', product.id);
    }

    // Get or create price
    const prices = await this.stripe.prices.list({
      product: product.id,
      active: true
    });

    let price = prices.data.find(p =>
      p.recurring?.interval === 'month' &&
      p.unit_amount === PRODUCT_CONFIG.monthlyPrice
    );

    if (!price) {
      price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: PRODUCT_CONFIG.monthlyPrice,
        currency: PRODUCT_CONFIG.currency,
        recurring: {
          interval: 'month'
        }
      });
      console.log('✅ Created Stripe price:', price.id);
    }

    this.priceId = price.id;
    return this.priceId;
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    customerEmail?: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<Stripe.Checkout.Session> {
    const priceId = await this.getOrCreatePrice();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl || 'http://localhost:3004?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'http://localhost:3004',
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        service: 'ai-empire-builder'
      }
    });

    return session;
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(customerId: string, returnUrl?: string): Promise<Stripe.BillingPortal.Session> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'http://localhost:3004'
    });

    return session;
  }

  /**
   * Check if a customer has an active subscription
   */
  async hasActiveSubscription(customerId: string): Promise<boolean> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    return subscriptions.data.length > 0;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    const customers = await this.stripe.customers.list({
      email,
      limit: 1
    });

    return customers.data[0] || null;
  }

  /**
   * Get Stripe instance for custom operations
   */
  getStripe(): Stripe {
    return this.stripe;
  }
}

export const stripeService = new StripeService();
