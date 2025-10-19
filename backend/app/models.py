"""
Database models for the Faceless Automation Platform
Using SQLAlchemy ORM
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

# ==========================================
# ENUMS
# ==========================================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLIENT = "client"
    VIEWER = "viewer"

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    SCRIPT_GENERATION = "script_generation"
    AWAITING_SCRIPT_APPROVAL = "awaiting_script_approval"
    VOICEOVER_GENERATION = "voiceover_generation"
    VIDEO_ASSEMBLY = "video_assembly"
    AWAITING_FINAL_QC = "awaiting_final_qc"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# ==========================================
# MODELS
# ==========================================

class User(Base):
    """User accounts (clients and admins)"""
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)

    # Profile
    avatar_url = Column(String, nullable=True)  # S3 or local storage URL

    # Stripe Connect
    stripe_account_id = Column(String, nullable=True)
    stripe_onboarded = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    projects = relationship("Project", back_populates="owner")
    payments = relationship("Payment", back_populates="user")


class Project(Base):
    """Content generation projects"""
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Project details
    title = Column(String, nullable=False)
    niche_id = Column(String, nullable=False)
    channel_id = Column(String, nullable=True)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT)

    # Content configuration
    target_duration = Column(Integer, default=60)  # seconds
    voice_clone_id = Column(String, nullable=True)
    channel_dna = Column(JSON, nullable=True)  # Stored as JSON

    # Temporal workflow
    temporal_workflow_id = Column(String, nullable=True)
    temporal_run_id = Column(String, nullable=True)

    # Generated assets
    script_id = Column(String, nullable=True)
    voiceover_asset_id = Column(String, nullable=True)
    video_asset_id = Column(String, nullable=True)
    thumbnail_asset_id = Column(String, nullable=True)

    # Publishing
    published_video_id = Column(String, nullable=True)
    published_url = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    owner = relationship("User", back_populates="projects")
    scripts = relationship("Script", back_populates="project")
    analytics = relationship("Analytics", back_populates="project", uselist=False)


class Script(Base):
    """Generated script candidates"""
    __tablename__ = "scripts"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    # Script content
    content = Column(String, nullable=False)
    word_count = Column(Integer, nullable=False)
    estimated_duration = Column(Integer, nullable=False)  # seconds

    # Metadata
    score = Column(Float, default=0.0)
    reasoning_path = Column(String, nullable=False)  # 'creative' or 'analytical'
    visual_cues = Column(JSON, nullable=True)

    # Approval
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    feedback = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="scripts")


class Analytics(Base):
    """Video performance analytics"""
    __tablename__ = "analytics"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)

    # YouTube metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    watch_time_hours = Column(Float, default=0.0)
    ctr = Column(Float, default=0.0)  # Click-through rate
    avg_view_duration = Column(Float, default=0.0)

    # Revenue
    estimated_revenue = Column(Float, default=0.0)

    # Timestamps
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="analytics")


class Payment(Base):
    """Payment transactions (Stripe)"""
    __tablename__ = "payments"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Stripe details
    stripe_payment_intent_id = Column(String, nullable=False)
    stripe_transfer_id = Column(String, nullable=True)

    # Payment info
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, default="usd")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)

    # Revenue sharing
    platform_fee = Column(Integer, default=0)  # Amount in cents
    creator_amount = Column(Integer, default=0)  # Amount in cents

    # Metadata
    description = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="payments")
