"""
User profile management router
Handles avatar upload, profile updates, and user settings
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..auth import get_current_active_user, TokenData, UserResponse
import os
import uuid
from pathlib import Path
import shutil

router = APIRouter()

# Configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads/avatars"))
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================
# SCHEMAS
# ==========================================

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get current user's profile
    """
    # TODO: Query database for full user profile
    # Mock response for now
    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "full_name": "Demo User",
        "role": current_user.role or "client",
        "avatar_url": None,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login_at": None
    }

@router.put("/me", response_model=UserProfileResponse)
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Update current user's profile
    """
    # TODO: Update database with new profile data
    # Validate email uniqueness if email is being changed
    # Mock response for now
    return {
        "id": current_user.user_id,
        "email": profile.email or current_user.email,
        "full_name": profile.full_name or "Demo User",
        "role": current_user.role or "client",
        "avatar_url": None,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login_at": None
    }

@router.post("/me/avatar", status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Upload user avatar image
    Accepts: JPG, PNG, WEBP (max 5MB)
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {MAX_AVATAR_SIZE / 1024 / 1024}MB"
        )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{current_user.user_id}_{file_id}{file_ext}"
    file_path = UPLOAD_DIR / filename

    try:
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Generate URL (in production, use CDN or S3)
        avatar_url = f"/uploads/avatars/{filename}"

        # TODO: Update database with avatar_url
        # TODO: Delete old avatar file if exists

        return {
            "avatar_url": avatar_url,
            "message": "Avatar uploaded successfully"
        }

    except Exception as e:
        # Clean up file if database update fails
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )

@router.delete("/me/avatar", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Delete user's avatar
    """
    # TODO: Query database for current avatar_url
    # TODO: Delete file from storage
    # TODO: Update database to set avatar_url to NULL

    # Mock response for now
    return None

@router.get("/me/settings")
async def get_user_settings(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get user settings and preferences
    """
    # TODO: Query database for user settings
    return {
        "notifications_enabled": True,
        "email_notifications": True,
        "auto_publish": False,
        "default_niche": None,
        "timezone": "UTC"
    }

@router.put("/me/settings")
async def update_user_settings(
    settings: dict,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Update user settings
    """
    # TODO: Validate settings schema
    # TODO: Update database

    return {
        "message": "Settings updated successfully",
        "settings": settings
    }
