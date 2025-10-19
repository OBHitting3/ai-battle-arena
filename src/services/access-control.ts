/**
 * ACCESS CONTROL SERVICE
 *
 * Protects the AI Battle Arena:
 * - Requires paid Stripe subscription OR
 * - Special access code (only Karl has this)
 */

import { stripeService } from './stripe-service.js';

// Karl's secret access code - stored in .env
const MASTER_ACCESS_CODE = process.env.MASTER_ACCESS_CODE || 'EMPIRE_BUILDER_2024';

export interface AccessCheck {
  hasAccess: boolean;
  reason: string;
  customerId?: string;
}

export class AccessControl {
  /**
   * Check if user has access via access code (stored in cookie/session)
   */
  checkAccessCode(code: string): boolean {
    return code === MASTER_ACCESS_CODE;
  }

  /**
   * Check if user has access via Stripe subscription
   */
  async checkStripeAccess(customerId?: string): Promise<boolean> {
    if (!customerId) {
      return false;
    }

    try {
      return await stripeService.hasActiveSubscription(customerId);
    } catch (error) {
      console.error('Error checking Stripe access:', error);
      return false;
    }
  }

  /**
   * Main access check - returns detailed result
   */
  async verifyAccess(
    accessCode?: string,
    customerId?: string
  ): Promise<AccessCheck> {
    // Check access code first (Karl's free access)
    if (accessCode && this.checkAccessCode(accessCode)) {
      return {
        hasAccess: true,
        reason: 'Master access code',
        customerId
      };
    }

    // Check Stripe subscription
    if (customerId) {
      const hasSubscription = await this.checkStripeAccess(customerId);
      if (hasSubscription) {
        return {
          hasAccess: true,
          reason: 'Active subscription',
          customerId
        };
      }
    }

    // No access
    return {
      hasAccess: false,
      reason: 'No active subscription or valid access code'
    };
  }

  /**
   * Get master access code (for testing/setup only)
   */
  getMasterCode(): string {
    return MASTER_ACCESS_CODE;
  }
}

export const accessControl = new AccessControl();
