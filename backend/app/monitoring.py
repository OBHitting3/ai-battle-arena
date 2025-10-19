"""
Error monitoring and logging with Sentry

Provides:
- Automatic error tracking
- Performance monitoring
- Custom event tracking
- User context
- Release tracking
"""

import os
import logging
from typing import Optional, Dict, Any
from functools import wraps

# Setup logger
logger = logging.getLogger(__name__)

# ==========================================
# SENTRY CONFIGURATION
# ==========================================

def init_sentry(dsn: Optional[str] = None, environment: str = "development"):
    """
    Initialize Sentry error tracking

    Args:
        dsn: Sentry DSN (Data Source Name)
        environment: Environment name (development, staging, production)
    """
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

        # Get DSN from environment if not provided
        dsn = dsn or os.getenv("SENTRY_DSN")

        if not dsn:
            logger.warning("SENTRY_DSN not set - error monitoring disabled")
            return

        sentry_sdk.init(
            dsn=dsn,
            environment=environment,
            # Performance monitoring
            traces_sample_rate=1.0 if environment == "development" else 0.1,
            # Error sampling
            sample_rate=1.0,
            # Integrations
            integrations=[
                FastApiIntegration(),
                StarletteIntegration(),
                SqlalchemyIntegration(),
            ],
            # Release tracking
            release=os.getenv("RELEASE_VERSION", "dev"),
            # Before send hook (filter sensitive data)
            before_send=before_send_filter,
            # Before breadcrumb hook
            before_breadcrumb=before_breadcrumb_filter,
        )

        logger.info(f"Sentry initialized for environment: {environment}")

    except ImportError:
        logger.warning("sentry-sdk not installed - error monitoring disabled")
        logger.warning("Install with: pip install sentry-sdk")


def before_send_filter(event: dict, hint: dict) -> Optional[dict]:
    """
    Filter sensitive data before sending to Sentry

    Args:
        event: Event dict
        hint: Hint dict with exception info

    Returns:
        Filtered event or None to drop event
    """
    # Remove sensitive keys from request data
    sensitive_keys = {
        "password",
        "token",
        "api_key",
        "secret",
        "authorization",
        "cookie",
        "session",
    }

    if "request" in event and "data" in event["request"]:
        for key in list(event["request"]["data"].keys()):
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                event["request"]["data"][key] = "[REDACTED]"

    # Remove sensitive headers
    if "request" in event and "headers" in event["request"]:
        for key in list(event["request"]["headers"].keys()):
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                event["request"]["headers"][key] = "[REDACTED]"

    return event


def before_breadcrumb_filter(crumb: dict, hint: dict) -> Optional[dict]:
    """
    Filter breadcrumbs before sending to Sentry

    Args:
        crumb: Breadcrumb dict
        hint: Hint dict

    Returns:
        Filtered breadcrumb or None to drop
    """
    # Don't log health check requests
    if crumb.get("category") == "httplib" and "/health" in str(crumb.get("data", {}).get("url", "")):
        return None

    return crumb


# ==========================================
# CUSTOM EVENT TRACKING
# ==========================================

def capture_message(message: str, level: str = "info", **kwargs):
    """
    Capture a custom message in Sentry

    Args:
        message: Message to capture
        level: Log level (debug, info, warning, error, fatal)
        **kwargs: Additional context
    """
    try:
        import sentry_sdk
        sentry_sdk.capture_message(message, level=level, **kwargs)
    except ImportError:
        logger.log(getattr(logging, level.upper(), logging.INFO), message)


def capture_exception(exception: Exception, **kwargs):
    """
    Capture an exception in Sentry

    Args:
        exception: Exception to capture
        **kwargs: Additional context
    """
    try:
        import sentry_sdk
        sentry_sdk.capture_exception(exception, **kwargs)
    except ImportError:
        logger.exception("Exception occurred", exc_info=exception)


def set_user_context(user_id: str, email: Optional[str] = None, **kwargs):
    """
    Set user context for error tracking

    Args:
        user_id: User ID
        email: User email
        **kwargs: Additional user context
    """
    try:
        import sentry_sdk
        sentry_sdk.set_user({
            "id": user_id,
            "email": email,
            **kwargs
        })
    except ImportError:
        pass


def set_tag(key: str, value: str):
    """
    Set a tag for error grouping

    Args:
        key: Tag key
        value: Tag value
    """
    try:
        import sentry_sdk
        sentry_sdk.set_tag(key, value)
    except ImportError:
        pass


def set_context(name: str, context: Dict[str, Any]):
    """
    Set custom context data

    Args:
        name: Context name
        context: Context data dict
    """
    try:
        import sentry_sdk
        sentry_sdk.set_context(name, context)
    except ImportError:
        pass


# ==========================================
# PERFORMANCE MONITORING
# ==========================================

def start_transaction(name: str, op: str = "http.server"):
    """
    Start a performance transaction

    Args:
        name: Transaction name
        op: Operation type

    Returns:
        Transaction object or None
    """
    try:
        import sentry_sdk
        return sentry_sdk.start_transaction(name=name, op=op)
    except ImportError:
        return None


def start_span(description: str, op: str = "function"):
    """
    Start a performance span

    Args:
        description: Span description
        op: Operation type

    Returns:
        Span object or None
    """
    try:
        import sentry_sdk
        return sentry_sdk.start_span(description=description, op=op)
    except ImportError:
        return None


# ==========================================
# DECORATORS
# ==========================================

def monitor_performance(operation: str = "function"):
    """
    Decorator to monitor function performance

    Args:
        operation: Operation type

    Usage:
        @monitor_performance("database.query")
        async def get_user(user_id: str):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            span = start_span(description=func.__name__, op=operation)
            if span:
                with span:
                    return await func(*args, **kwargs)
            else:
                return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            span = start_span(description=func.__name__, op=operation)
            if span:
                with span:
                    return func(*args, **kwargs)
            else:
                return func(*args, **kwargs)

        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def monitor_errors(reraise: bool = True):
    """
    Decorator to automatically capture exceptions

    Args:
        reraise: Whether to reraise the exception after capturing

    Usage:
        @monitor_errors(reraise=True)
        async def risky_function():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                capture_exception(e)
                if reraise:
                    raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                capture_exception(e)
                if reraise:
                    raise

        # Return appropriate wrapper
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# ==========================================
# WORKFLOW EVENT TRACKING
# ==========================================

def track_workflow_event(
    workflow_id: str,
    event: str,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    **metadata
):
    """
    Track workflow events in Sentry

    Args:
        workflow_id: Temporal workflow ID
        event: Event name (started, completed, failed, etc.)
        project_id: Project ID
        status: Workflow status
        **metadata: Additional metadata
    """
    set_context("workflow", {
        "workflow_id": workflow_id,
        "event": event,
        "project_id": project_id,
        "status": status,
        **metadata
    })

    capture_message(
        f"Workflow {event}: {workflow_id}",
        level="info" if status != "failed" else "error"
    )


def track_payment_event(
    payment_id: str,
    event: str,
    amount: int,
    user_id: str,
    status: str,
    **metadata
):
    """
    Track payment events in Sentry

    Args:
        payment_id: Payment ID
        event: Event name
        amount: Payment amount in cents
        user_id: User ID
        status: Payment status
        **metadata: Additional metadata
    """
    set_context("payment", {
        "payment_id": payment_id,
        "event": event,
        "amount_cents": amount,
        "amount_dollars": amount / 100,
        "user_id": user_id,
        "status": status,
        **metadata
    })

    # Tag for easy filtering
    set_tag("payment.status", status)
    set_tag("payment.event", event)

    capture_message(
        f"Payment {event}: ${amount/100:.2f} - {status}",
        level="info" if status == "succeeded" else "warning"
    )


# ==========================================
# STRUCTURED LOGGING
# ==========================================

class StructuredLogger:
    """
    Structured logger that sends to both console and Sentry
    """

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def debug(self, message: str, **context):
        self.logger.debug(message, extra=context)

    def info(self, message: str, **context):
        self.logger.info(message, extra=context)
        set_context("log", context)

    def warning(self, message: str, **context):
        self.logger.warning(message, extra=context)
        set_context("log", context)
        capture_message(message, level="warning")

    def error(self, message: str, exception: Optional[Exception] = None, **context):
        self.logger.error(message, extra=context, exc_info=exception)
        set_context("log", context)
        if exception:
            capture_exception(exception)
        else:
            capture_message(message, level="error")

    def critical(self, message: str, exception: Optional[Exception] = None, **context):
        self.logger.critical(message, extra=context, exc_info=exception)
        set_context("log", context)
        if exception:
            capture_exception(exception)
        else:
            capture_message(message, level="fatal")


# Create default logger
app_logger = StructuredLogger("faceless-automation")
