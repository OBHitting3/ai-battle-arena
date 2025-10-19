"""
Stripe Connect payment processing router
Revenue sharing between platform and content creators
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..auth import get_current_active_user, TokenData
import os

router = APIRouter()

# Stripe configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
PLATFORM_FEE_PERCENT = 30  # Platform takes 30%, creator gets 70%

# ==========================================
# SCHEMAS
# ==========================================

class StripeConnectOnboardingRequest(BaseModel):
    return_url: str
    refresh_url: str

class StripeConnectOnboardingResponse(BaseModel):
    onboarding_url: str

class PaymentCreateRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    description: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    amount: int
    currency: str
    status: str
    platform_fee: int
    creator_amount: int
    created_at: datetime

class RevenueShareResponse(BaseModel):
    total_revenue: int
    platform_fee: int
    creator_amount: int
    platform_fee_percent: int

# ==========================================
# ENDPOINTS
# ==========================================

@router.post("/connect/onboard", response_model=StripeConnectOnboardingResponse)
async def create_connect_account(
    request: StripeConnectOnboardingRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Create a Stripe Connect account for the user and return onboarding URL
    This allows creators to receive revenue share payments
    """
    # TODO: Initialize Stripe SDK
    # TODO: Create Stripe Connect account
    # TODO: Generate onboarding link
    # TODO: Save stripe_account_id to user record

    # Mock response for now
    return {
        "onboarding_url": "https://connect.stripe.com/setup/s/mock_onboarding_link"
    }

@router.get("/connect/status")
async def get_connect_status(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Check Stripe Connect onboarding status for current user
    """
    # TODO: Query database for user's stripe_account_id
    # TODO: Check account status with Stripe API

    return {
        "connected": False,
        "onboarding_complete": False,
        "payouts_enabled": False
    }

@router.post("/charge", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_charge(
    payment: PaymentCreateRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Create a payment charge (for testing revenue sharing)
    In production, this would charge a customer for video creation services
    """
    # GROK FIX: Validate payment amount
    if payment.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than 0"
        )

    if payment.amount > 1000000:  # Max $10,000
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount exceeds maximum allowed ($10,000)"
        )

    # Calculate revenue split
    platform_fee = int(payment.amount * (PLATFORM_FEE_PERCENT / 100))
    creator_amount = payment.amount - platform_fee

    # GROK FIX: Validate split doesn't exceed 100%
    if platform_fee + creator_amount != payment.amount:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Revenue share calculation error"
        )

    # TODO: Create Stripe PaymentIntent
    # TODO: Transfer creator_amount to connected account
    # TODO: Save payment to database

    return {
        "id": f"payment-{datetime.utcnow().timestamp()}",
        "amount": payment.amount,
        "currency": payment.currency,
        "status": "succeeded",
        "platform_fee": platform_fee,
        "creator_amount": creator_amount,
        "created_at": datetime.utcnow()
    }

@router.get("/revenue-share/calculate")
async def calculate_revenue_share(
    amount: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Calculate revenue share for a given amount
    Helper endpoint for showing users the split
    """
    platform_fee = int(amount * (PLATFORM_FEE_PERCENT / 100))
    creator_amount = amount - platform_fee

    return {
        "total_revenue": amount,
        "platform_fee": platform_fee,
        "creator_amount": creator_amount,
        "platform_fee_percent": PLATFORM_FEE_PERCENT
    }

@router.get("/transactions")
async def list_transactions(
    current_user: TokenData = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    List payment transactions for the current user
    """
    # TODO: Query database for user's payments
    # TODO: Include both charges and transfers

    return {
        "transactions": [],
        "total": 0,
        "skip": skip,
        "limit": limit
    }

@router.post("/webhook/stripe", include_in_schema=False)
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    Used for:
    - Payment confirmations
    - Connect account updates
    - Payout events
    """
    # GROK FIX: Verify webhook signature to prevent spoofing
    import stripe

    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    if not webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured"
        )

    try:
        # CRITICAL: Verify signature before processing
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        # Invalid payload
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        # Invalid signature - POTENTIAL ATTACK
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )

    # TODO: Handle different event types
    # TODO: Update database accordingly

    return {"status": "received"}
