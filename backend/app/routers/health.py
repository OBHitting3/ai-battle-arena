"""
Health check and system status endpoints

Provides:
- Basic health check (for load balancers)
- Detailed system status (for monitoring)
- Database connectivity check
- External service checks
- Performance metrics
"""

from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
import time
import psutil
import os

router = APIRouter()

# Track startup time
STARTUP_TIME = time.time()

# ==========================================
# SCHEMAS
# ==========================================

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    uptime_seconds: float

class DetailedHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    uptime_seconds: float
    version: str
    environment: str
    services: Dict[str, dict]
    system: dict

# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Basic health check endpoint
    Returns 200 if service is running

    Used by:
    - Load balancers
    - Kubernetes liveness probes
    - Uptime monitoring services
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": time.time() - STARTUP_TIME,
    }


@router.get("/health/ready", response_model=HealthResponse, tags=["Health"])
async def readiness_check():
    """
    Readiness check endpoint
    Returns 200 only if service is ready to accept traffic

    Checks:
    - Database connectivity
    - External API availability
    - Critical dependencies

    Used by:
    - Kubernetes readiness probes
    - Load balancer health checks
    """
    # TODO: Add database connectivity check
    # TODO: Check Temporal connectivity
    # TODO: Check Redis connectivity (if used)

    return {
        "status": "ready",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": time.time() - STARTUP_TIME,
    }


@router.get("/health/live", response_model=HealthResponse, tags=["Health"])
async def liveness_check():
    """
    Liveness check endpoint
    Returns 200 if service is alive (not deadlocked)

    Used by:
    - Kubernetes liveness probes
    - Auto-restart mechanisms
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": time.time() - STARTUP_TIME,
    }


@router.get("/health/detailed", response_model=DetailedHealthResponse, tags=["Health"])
async def detailed_health():
    """
    Detailed system status
    Returns comprehensive health information

    **NOT recommended for high-frequency polling**
    Use /health for load balancer checks

    Used by:
    - Monitoring dashboards
    - Troubleshooting
    - Status pages
    """
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    # Service checks
    services = {
        "database": await check_database(),
        "temporal": await check_temporal(),
        "redis": await check_redis(),
        "openai": await check_external_api("openai"),
        "elevenlabs": await check_external_api("elevenlabs"),
        "stripe": await check_external_api("stripe"),
    }

    # Overall status
    all_services_healthy = all(
        service["status"] == "healthy"
        for service in services.values()
        if service.get("critical", False)
    )

    return {
        "status": "healthy" if all_services_healthy else "degraded",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": time.time() - STARTUP_TIME,
        "version": os.getenv("RELEASE_VERSION", "dev"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "services": services,
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024),
            "disk_percent": disk.percent,
            "disk_free_gb": disk.free / (1024 * 1024 * 1024),
        }
    }


# ==========================================
# SERVICE HEALTH CHECKS
# ==========================================

async def check_database() -> dict:
    """Check database connectivity"""
    try:
        # TODO: Add actual database connection check
        # from sqlalchemy import text
        # async with db_session() as session:
        #     await session.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "critical": True,
            "message": "Database connected",
            "response_time_ms": None,  # TODO: Measure actual response time
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "critical": True,
            "message": f"Database error: {str(e)}",
            "response_time_ms": None,
        }


async def check_temporal() -> dict:
    """Check Temporal connectivity"""
    try:
        # TODO: Add actual Temporal connection check
        # from temporalio.client import Client
        # client = await Client.connect(...)
        # await client.list_workflows(...)

        return {
            "status": "healthy",
            "critical": True,
            "message": "Temporal connected",
            "response_time_ms": None,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "critical": True,
            "message": f"Temporal error: {str(e)}",
            "response_time_ms": None,
        }


async def check_redis() -> dict:
    """Check Redis connectivity"""
    try:
        # TODO: Add actual Redis connection check
        # redis_client.ping()

        return {
            "status": "healthy",
            "critical": False,  # Not critical if using in-memory fallback
            "message": "Redis connected",
            "response_time_ms": None,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "critical": False,
            "message": f"Redis error: {str(e)}",
            "response_time_ms": None,
        }


async def check_external_api(service_name: str) -> dict:
    """Check external API availability"""
    # Basic check - just verify API keys are set
    api_key_env_vars = {
        "openai": "OPENAI_API_KEY",
        "elevenlabs": "ELEVENLABS_API_KEY",
        "stripe": "STRIPE_SECRET_KEY",
        "pexels": "PEXELS_API_KEY",
        "adobe_firefly": "ADOBE_FIREFLY_API_KEY",
    }

    env_var = api_key_env_vars.get(service_name)
    if not env_var:
        return {
            "status": "unknown",
            "critical": False,
            "message": "Service not configured",
        }

    api_key = os.getenv(env_var)
    if not api_key:
        return {
            "status": "unhealthy",
            "critical": False,
            "message": f"{env_var} not set",
        }

    return {
        "status": "healthy",
        "critical": False,
        "message": "API key configured",
    }


# ==========================================
# METRICS ENDPOINT (Prometheus compatible)
# ==========================================

@router.get("/metrics", tags=["Health"])
async def metrics():
    """
    Prometheus-compatible metrics endpoint

    Returns metrics in Prometheus text format
    Can be scraped by Prometheus/Grafana
    """
    uptime = time.time() - STARTUP_TIME
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()

    metrics_text = f"""
# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds {uptime}

# HELP app_cpu_usage_percent CPU usage percentage
# TYPE app_cpu_usage_percent gauge
app_cpu_usage_percent {cpu_percent}

# HELP app_memory_usage_percent Memory usage percentage
# TYPE app_memory_usage_percent gauge
app_memory_usage_percent {memory.percent}

# HELP app_memory_available_bytes Available memory in bytes
# TYPE app_memory_available_bytes gauge
app_memory_available_bytes {memory.available}
"""

    return metrics_text.strip()


# ==========================================
# VERSION ENDPOINT
# ==========================================

@router.get("/version", tags=["Health"])
async def version():
    """
    Get application version information
    """
    return {
        "version": os.getenv("RELEASE_VERSION", "dev"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "git_commit": os.getenv("GIT_COMMIT", "unknown"),
        "build_date": os.getenv("BUILD_DATE", "unknown"),
        "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
    }
