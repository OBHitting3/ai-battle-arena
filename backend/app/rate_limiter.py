"""
Rate limiting middleware to prevent API abuse

Implements:
- Per-user rate limits
- Per-IP rate limits
- Sliding window algorithm
- Redis-based distributed rate limiting (production)
- In-memory fallback (development)
"""

from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import time

# ==========================================
# CONFIGURATION
# ==========================================

# Rate limits (requests per time window)
RATE_LIMITS = {
    # Anonymous users (by IP)
    "anonymous": {
        "requests": 100,
        "window": 3600,  # 1 hour
    },
    # Authenticated users
    "authenticated": {
        "requests": 1000,
        "window": 3600,  # 1 hour
    },
    # Admin users
    "admin": {
        "requests": 10000,
        "window": 3600,  # 1 hour
    },
    # Specific endpoints (more restrictive)
    "POST /api/projects": {
        "requests": 10,
        "window": 3600,  # 10 projects per hour
    },
    "POST /api/workflows/start": {
        "requests": 20,
        "window": 3600,  # 20 workflow starts per hour
    },
    "POST /api/payments/charge": {
        "requests": 50,
        "window": 3600,  # 50 payment attempts per hour
    },
}

# ==========================================
# IN-MEMORY RATE LIMITER (Development)
# ==========================================

class InMemoryRateLimiter:
    """
    Simple in-memory rate limiter using sliding window
    NOT suitable for distributed systems (production should use Redis)
    """

    def __init__(self):
        # {identifier: [(timestamp, count), ...]}
        self.requests: Dict[str, list[Tuple[float, int]]] = defaultdict(list)

    def is_allowed(self, identifier: str, limit: int, window: int) -> Tuple[bool, dict]:
        """
        Check if request is allowed

        Args:
            identifier: Unique identifier (user ID or IP)
            limit: Maximum requests allowed in window
            window: Time window in seconds

        Returns:
            (is_allowed, rate_limit_info)
        """
        current_time = time.time()
        window_start = current_time - window

        # Clean old requests
        self.requests[identifier] = [
            (ts, count) for ts, count in self.requests[identifier]
            if ts > window_start
        ]

        # Count total requests in current window
        total_requests = sum(count for _, count in self.requests[identifier])

        # Check if limit exceeded
        is_allowed = total_requests < limit

        # Add current request if allowed
        if is_allowed:
            self.requests[identifier].append((current_time, 1))

        # Calculate time until reset
        if self.requests[identifier]:
            oldest_request = min(ts for ts, _ in self.requests[identifier])
            reset_time = oldest_request + window
            retry_after = max(0, int(reset_time - current_time))
        else:
            reset_time = current_time + window
            retry_after = 0

        rate_limit_info = {
            "limit": limit,
            "remaining": max(0, limit - total_requests - 1),
            "reset": int(reset_time),
            "retry_after": retry_after if not is_allowed else None,
        }

        return is_allowed, rate_limit_info


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


# ==========================================
# RATE LIMITER DEPENDENCY
# ==========================================

async def check_rate_limit(
    request: Request,
    user_id: str = None,
    user_role: str = "anonymous"
) -> dict:
    """
    Check if request should be rate-limited

    Args:
        request: FastAPI request object
        user_id: User ID if authenticated
        user_role: User role (anonymous, authenticated, admin)

    Returns:
        Rate limit info dict

    Raises:
        HTTPException: If rate limit exceeded
    """
    # Determine identifier (user ID or IP)
    if user_id:
        identifier = f"user:{user_id}"
        role = user_role
    else:
        # Use IP address for anonymous users
        client_ip = request.client.host if request.client else "unknown"
        identifier = f"ip:{client_ip}"
        role = "anonymous"

    # Get endpoint-specific rate limit if exists
    endpoint_key = f"{request.method} {request.url.path}"
    if endpoint_key in RATE_LIMITS:
        limit_config = RATE_LIMITS[endpoint_key]
    else:
        # Use role-based rate limit
        limit_config = RATE_LIMITS.get(role, RATE_LIMITS["anonymous"])

    # Check rate limit
    is_allowed, rate_limit_info = rate_limiter.is_allowed(
        identifier=identifier,
        limit=limit_config["requests"],
        window=limit_config["window"]
    )

    # Add rate limit headers to response
    request.state.rate_limit_info = rate_limit_info

    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Too many requests. Try again in {rate_limit_info['retry_after']} seconds.",
                "limit": rate_limit_info["limit"],
                "retry_after": rate_limit_info["retry_after"],
            },
            headers={
                "X-RateLimit-Limit": str(rate_limit_info["limit"]),
                "X-RateLimit-Remaining": str(rate_limit_info["remaining"]),
                "X-RateLimit-Reset": str(rate_limit_info["reset"]),
                "Retry-After": str(rate_limit_info["retry_after"]),
            }
        )

    return rate_limit_info


# ==========================================
# MIDDLEWARE (Add to FastAPI app)
# ==========================================

async def rate_limit_middleware(request: Request, call_next):
    """
    Middleware to add rate limit headers to all responses
    """
    response = await call_next(request)

    # Add rate limit headers if available
    if hasattr(request.state, "rate_limit_info"):
        info = request.state.rate_limit_info
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset"])

    return response


# ==========================================
# REDIS RATE LIMITER (Production)
# ==========================================

class RedisRateLimiter:
    """
    Redis-based distributed rate limiter
    Use in production for multi-instance deployments
    """

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize Redis connection

        Args:
            redis_url: Redis connection URL
        """
        try:
            import redis
            self.redis = redis.from_url(redis_url, decode_responses=True)
        except ImportError:
            raise ImportError("redis package not installed. Run: pip install redis")

    def is_allowed(self, identifier: str, limit: int, window: int) -> Tuple[bool, dict]:
        """
        Check if request is allowed using Redis

        Args:
            identifier: Unique identifier (user ID or IP)
            limit: Maximum requests allowed in window
            window: Time window in seconds

        Returns:
            (is_allowed, rate_limit_info)
        """
        key = f"rate_limit:{identifier}"
        current_time = time.time()

        # Use Redis sorted set with timestamp scores
        # Remove old entries
        self.redis.zremrangebyscore(key, 0, current_time - window)

        # Count current requests
        request_count = self.redis.zcard(key)

        # Check if limit exceeded
        is_allowed = request_count < limit

        if is_allowed:
            # Add current request
            self.redis.zadd(key, {str(current_time): current_time})
            # Set expiry on key
            self.redis.expire(key, window)

        # Calculate reset time
        oldest_timestamp = self.redis.zrange(key, 0, 0, withscores=True)
        if oldest_timestamp:
            reset_time = oldest_timestamp[0][1] + window
            retry_after = max(0, int(reset_time - current_time))
        else:
            reset_time = current_time + window
            retry_after = 0

        rate_limit_info = {
            "limit": limit,
            "remaining": max(0, limit - request_count - 1),
            "reset": int(reset_time),
            "retry_after": retry_after if not is_allowed else None,
        }

        return is_allowed, rate_limit_info


# ==========================================
# USAGE EXAMPLE
# ==========================================

"""
# In main.py:

from fastapi import FastAPI, Depends
from app.rate_limiter import check_rate_limit, rate_limit_middleware
from app.auth import get_current_user

app = FastAPI()

# Add middleware
app.middleware("http")(rate_limit_middleware)

# Protected endpoint example
@app.post("/api/projects")
async def create_project(
    project: ProjectCreate,
    current_user: TokenData = Depends(get_current_user),
    rate_limit: dict = Depends(lambda request: check_rate_limit(
        request,
        user_id=current_user.user_id,
        user_role=current_user.role
    ))
):
    # Rate limit already checked by dependency
    # Create project...
    pass
"""
