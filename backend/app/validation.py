"""
Input validation and sanitization module

Prevents:
- SQL injection
- XSS attacks
- Command injection
- Path traversal
- Oversized inputs
"""

import re
from typing import Optional
from fastapi import HTTPException, status
import bleach

# ==========================================
# VALIDATION RULES
# ==========================================

# String length limits
MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 5000
MAX_SCRIPT_LENGTH = 50000
MAX_NICHE_LENGTH = 100
MAX_EMAIL_LENGTH = 255

# Numeric limits
MIN_VIDEO_DURATION = 10  # 10 seconds
MAX_VIDEO_DURATION = 3600  # 1 hour
MIN_TARGET_VIEWS = 0
MAX_TARGET_VIEWS = 10_000_000

# Regex patterns
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PROJECT_ID_REGEX = re.compile(r'^[a-zA-Z0-9_-]+$')
YOUTUBE_VIDEO_ID_REGEX = re.compile(r'^[a-zA-Z0-9_-]{11}$')

# SQL injection patterns to block
SQL_INJECTION_PATTERNS = [
    r"(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+",
    r"(;|--|\\/\\*|\\*\\/)",
    r"(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bUNION\b|\bSELECT\b)\s",
    r"(xp_|sp_|exec\s|execute\s)",
]

# XSS patterns to block
XSS_PATTERNS = [
    r"<script",
    r"javascript:",
    r"onerror\s*=",
    r"onload\s*=",
    r"<iframe",
]

# ==========================================
# VALIDATION FUNCTIONS
# ==========================================

def sanitize_string(value: str, max_length: int = 1000, allow_html: bool = False) -> str:
    """
    Sanitize a string input

    Args:
        value: Input string
        max_length: Maximum allowed length
        allow_html: Whether to allow HTML (will be sanitized)

    Returns:
        Sanitized string

    Raises:
        HTTPException: If validation fails
    """
    if not isinstance(value, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input must be a string"
        )

    # Check length
    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input too long (max {max_length} characters)"
        )

    # Check for SQL injection attempts
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid characters detected"
            )

    # Check for XSS attempts
    for pattern in XSS_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid characters detected"
            )

    # Sanitize HTML if allowed
    if allow_html:
        # Allow only safe HTML tags
        allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br']
        value = bleach.clean(value, tags=allowed_tags, strip=True)
    else:
        # Strip all HTML
        value = bleach.clean(value, tags=[], strip=True)

    # Trim whitespace
    value = value.strip()

    return value


def validate_email(email: str) -> str:
    """
    Validate and sanitize email address

    Args:
        email: Email address

    Returns:
        Sanitized email

    Raises:
        HTTPException: If validation fails
    """
    email = sanitize_string(email, max_length=MAX_EMAIL_LENGTH)

    if not EMAIL_REGEX.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    return email.lower()


def validate_project_id(project_id: str) -> str:
    """
    Validate project ID format

    Args:
        project_id: Project ID

    Returns:
        Validated project ID

    Raises:
        HTTPException: If validation fails
    """
    if not PROJECT_ID_REGEX.match(project_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format"
        )

    if len(project_id) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ID too long"
        )

    return project_id


def validate_title(title: str) -> str:
    """
    Validate and sanitize project/video title

    Args:
        title: Title string

    Returns:
        Sanitized title

    Raises:
        HTTPException: If validation fails
    """
    title = sanitize_string(title, max_length=MAX_TITLE_LENGTH)

    if len(title) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title too short (minimum 3 characters)"
        )

    return title


def validate_description(description: Optional[str]) -> Optional[str]:
    """
    Validate and sanitize description

    Args:
        description: Description string (optional)

    Returns:
        Sanitized description or None

    Raises:
        HTTPException: If validation fails
    """
    if description is None:
        return None

    return sanitize_string(description, max_length=MAX_DESCRIPTION_LENGTH, allow_html=True)


def validate_script(script: str) -> str:
    """
    Validate and sanitize video script

    Args:
        script: Script content

    Returns:
        Sanitized script

    Raises:
        HTTPException: If validation fails
    """
    script = sanitize_string(script, max_length=MAX_SCRIPT_LENGTH, allow_html=False)

    if len(script) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Script too short (minimum 50 characters)"
        )

    return script


def validate_duration(duration: int) -> int:
    """
    Validate video duration

    Args:
        duration: Duration in seconds

    Returns:
        Validated duration

    Raises:
        HTTPException: If validation fails
    """
    if not isinstance(duration, int):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duration must be an integer"
        )

    if duration < MIN_VIDEO_DURATION or duration > MAX_VIDEO_DURATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duration must be between {MIN_VIDEO_DURATION} and {MAX_VIDEO_DURATION} seconds"
        )

    return duration


def validate_niche(niche: str) -> str:
    """
    Validate and sanitize niche name

    Args:
        niche: Niche name

    Returns:
        Sanitized niche

    Raises:
        HTTPException: If validation fails
    """
    niche = sanitize_string(niche, max_length=MAX_NICHE_LENGTH)

    if len(niche) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Niche name too short"
        )

    return niche


def validate_pagination(skip: int, limit: int) -> tuple[int, int]:
    """
    Validate pagination parameters

    Args:
        skip: Number of items to skip
        limit: Maximum number of items to return

    Returns:
        Validated (skip, limit) tuple

    Raises:
        HTTPException: If validation fails
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip must be non-negative"
        )

    if limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be positive"
        )

    if limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit too large (maximum 1000)"
        )

    return skip, limit


def validate_amount(amount: int, min_amount: int = 1, max_amount: int = 1_000_000_00) -> int:
    """
    Validate payment amount (in cents)

    Args:
        amount: Amount in cents
        min_amount: Minimum amount in cents
        max_amount: Maximum amount in cents

    Returns:
        Validated amount

    Raises:
        HTTPException: If validation fails
    """
    if not isinstance(amount, int):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be an integer"
        )

    if amount < min_amount or amount > max_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Amount must be between ${min_amount/100:.2f} and ${max_amount/100:.2f}"
        )

    return amount


def validate_youtube_video_id(video_id: str) -> str:
    """
    Validate YouTube video ID format

    Args:
        video_id: YouTube video ID

    Returns:
        Validated video ID

    Raises:
        HTTPException: If validation fails
    """
    if not YOUTUBE_VIDEO_ID_REGEX.match(video_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube video ID format"
        )

    return video_id


# ==========================================
# FILE UPLOAD VALIDATION
# ==========================================

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi'}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a'}

# File size limits (in bytes)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50 MB


def validate_file_extension(filename: str, allowed_extensions: set[str]) -> str:
    """
    Validate file extension

    Args:
        filename: Filename
        allowed_extensions: Set of allowed extensions

    Returns:
        Validated filename

    Raises:
        HTTPException: If validation fails
    """
    import os

    # Get extension
    _, ext = os.path.splitext(filename.lower())

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )

    # Sanitize filename (remove path traversal attempts)
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\s\-\.]', '', filename)

    return filename


def validate_file_size(file_size: int, max_size: int) -> int:
    """
    Validate file size

    Args:
        file_size: File size in bytes
        max_size: Maximum allowed size in bytes

    Returns:
        Validated file size

    Raises:
        HTTPException: If validation fails
    """
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large (max {max_size / (1024*1024):.1f} MB)"
        )

    return file_size
