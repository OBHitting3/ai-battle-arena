/**
 * CORE TYPE DEFINITIONS
 * Shared across all microservices
 */

// ============================================
// NICHE & CONTENT TYPES
// ============================================

export interface Niche {
  id: string;
  keyword: string;
  score: number;
  approved: boolean;
  estimatedRevenue: number;
  metrics: {
    avgViews: number;
    medianViews: number;
    engagementRate: number;
    competition: number;
    consistency: number;
  };
  createdAt: Date;
}

export interface VideoIdea {
  id: string;
  nicheId?: string;
  title: string;
  description: string;
  viralityScore?: number;
  keywords?: string[];
  estimatedCTR?: number;
  targetAudience?: string;
  estimatedViews?: number;
  confidenceScore?: number;
  validatedAt?: Date;
  createdAt?: Date;
}

export interface Script {
  id: string;
  videoIdeaId: string;
  content: string;
  wordCount: number;
  estimatedDuration: number; // seconds
  structure: {
    hook: string;
    mainContent: string[];
    callToAction: string;
  };
  visualCues: ScriptVisualCue[];
  reasoningPath: 'creative' | 'factual'; // which LLM was used
  approved: boolean;
  createdAt: Date;
  approvedAt?: Date;
}

export interface ScriptVisualCue {
  timestamp: number; // seconds
  description: string;
  searchQuery: string;
  assetType: 'stock_video' | 'stock_image' | 'ai_generated' | 'text_overlay';
}

// ============================================
// MEDIA ASSET TYPES
// ============================================

export interface VoiceoverAsset {
  id: string;
  scriptId: string;
  audioUrl: string;
  duration: number;
  voiceId: string; // ElevenLabs voice clone ID
  language: string;
  fileSizeBytes: number;
  format: 'mp3' | 'wav';
  createdAt: Date;
}

export interface VisualAsset {
  id: string;
  type: 'video' | 'image';
  source: 'getty' | 'storyblocks' | 'midjourney' | 'runway' | 'firefly';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for videos
  width: number;
  height: number;
  license: string;
  cost: number;
  searchQuery: string;
  createdAt: Date;
}

export interface MusicAsset {
  id: string;
  url: string;
  duration: number;
  mood: string;
  source: 'elevenlabs' | 'custom';
  license: string;
  createdAt: Date;
}

export interface ThumbnailAsset {
  id: string;
  videoId: string;
  url: string;
  width: number;
  height: number;
  designPrompt: string;
  selectedVariant: number; // which of 3-5 generated options was chosen
  createdAt: Date;
}

export interface VideoAsset {
  id: string;
  projectId: string;
  outputPath: string;
  duration: number;
  fileSizeBytes: number;
  format: 'mp4' | 'mov' | 'webm';
  resolution: string;
  createdAt: Date;
}

// ============================================
// VIDEO PRODUCTION TYPES
// ============================================

export interface VideoProject {
  id: string;
  clientId: string;
  channelId: string;
  nicheId: string;
  videoIdeaId: string;
  scriptId: string;
  status: VideoProjectStatus;
  timeline: VideoTimeline;
  renderConfig: RenderConfig;
  outputUrl?: string;
  thumbnailId?: string;
  metadata: VideoMetadata;
  publishSchedule?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoProjectStatus =
  | 'ideation'
  | 'script_generation'
  | 'script_approval_pending'
  | 'voiceover_generation'
  | 'asset_sourcing'
  | 'video_assembly'
  | 'post_production'
  | 'thumbnail_generation'
  | 'thumbnail_approval_pending'
  | 'final_qc_pending'
  | 'scheduled'
  | 'published'
  | 'failed';

export interface VideoTimeline {
  scenes: VideoScene[];
  totalDuration: number;
}

export interface VideoScene {
  startTime: number;
  endTime: number;
  visualAssetId: string;
  voiceoverSegment?: {
    text: string;
    startTime: number;
    endTime: number;
  };
  textOverlays?: TextOverlay[];
  transitions?: Transition;
}

export interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    animation?: 'fade' | 'slide' | 'scale' | 'none';
  };
}

export interface Transition {
  type: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom';
  duration: number;
}

export interface RenderConfig {
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  codec: 'h264' | 'h265' | 'vp9';
  bitrate: number;
  format: 'mp4' | 'mov' | 'webm';
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category: YouTubeCategory;
  language: string;
  privacyStatus: 'public' | 'unlisted' | 'private';
  aiDisclosure: boolean;
  madeForKids: boolean;
}

export type YouTubeCategory =
  | 'Film & Animation'
  | 'Autos & Vehicles'
  | 'Music'
  | 'Pets & Animals'
  | 'Sports'
  | 'Travel & Events'
  | 'Gaming'
  | 'People & Blogs'
  | 'Comedy'
  | 'Entertainment'
  | 'News & Politics'
  | 'Howto & Style'
  | 'Education'
  | 'Science & Technology'
  | 'Nonprofits & Activism';

// ============================================
// PUBLISHING TYPES
// ============================================

export interface PublishedVideo {
  id: string;
  videoProjectId: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  platformVideoId: string;
  url: string;
  publishedAt: Date;
  status: 'processing' | 'live' | 'failed' | 'removed';
}

export interface YouTubeAnalytics {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeMinutes: number;
  averageViewPercentage: number;
  clickThroughRate: number;
  impressions: number;
  estimatedRevenue: number;
  subscribersGained: number;
  retentionGraph: RetentionDataPoint[];
  trafficSources: TrafficSource[];
  lastUpdated: Date;
}

export interface RetentionDataPoint {
  timestamp: number; // seconds
  percentage: number; // 0-100
}

export interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
}

// ============================================
// CLIENT & BILLING TYPES
// ============================================

export interface Client {
  id: string;
  email: string;
  name: string;
  stripeCustomerId: string;
  channels: Channel[];
  subscription: Subscription;
  billingAddress?: Address;
  createdAt: Date;
}

export interface Channel {
  id: string;
  clientId: string;
  name: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  platformChannelId: string;
  nicheId: string;
  channelDNA: ChannelDNA;
  voiceCloneId: string; // unique ElevenLabs voice
  totalVideos: number;
  totalRevenue: number;
  status: 'active' | 'paused' | 'pending_setup';
  createdAt: Date;
}

export interface ChannelDNA {
  styleGuide: {
    tone: 'casual' | 'professional' | 'educational' | 'entertaining' | 'inspirational';
    pacing: 'fast' | 'medium' | 'slow';
    vocabulary: 'simple' | 'technical' | 'mixed';
    brandColors: string[];
    fontPreferences: string[];
  };
  contentPreferences: {
    preferredVideoLength: number; // seconds
    preferredTopics: string[];
    avoidTopics: string[];
    targetAudience: string;
  };
  visualStyle: {
    transitionPreference: Transition['type'];
    textOverlayStyle: 'minimal' | 'frequent' | 'none';
    colorGrading: 'vibrant' | 'muted' | 'cinematic' | 'natural';
  };
}

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  monthlyFee: number;
  revenueSharePercentage: number; // e.g., 20
  status: 'active' | 'paused' | 'cancelled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'revenue_share';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId: string;
  metadata: {
    period?: string;
    channelId?: string;
    videoCount?: number;
    totalRevenue?: number;
  };
  createdAt: Date;
}

// ============================================
// REASONING & QC TYPES
// ============================================

export interface TreeOfThoughtNode {
  id: string;
  parentId?: string;
  content: string;
  score: number;
  depth: number;
  children: TreeOfThoughtNode[];
  isPruned: boolean;
  isSelected: boolean;
}

export interface BeamSearchCandidate {
  id: string;
  content: string;
  score: number;
  rank: number;
  wordCount?: number;
  estimatedDuration?: number;
  metadata: Record<string, any>;
}

export interface ASCoTResult {
  originalContent: string;
  correctedContent: string;
  corrections: Array<{
    type: 'factual' | 'logical' | 'stylistic';
    original: string;
    corrected: string;
    reasoning: string;
  }>;
  confidence: number;
}

export interface RedTeamTestResult {
  testId: string;
  round: number;
  testType: 'content_quality' | 'policy_compliance' | 'monetization_risk' | 'security';
  passed: boolean;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  timestamp: Date;
}

// ============================================
// WORKFLOW TYPES
// ============================================

export interface WorkflowState {
  projectId: string;
  currentStage: VideoProjectStatus;
  checkpoints: {
    scriptApproved: boolean;
    thumbnailApproved: boolean;
    finalQCApproved: boolean;
  };
  retryCount: number;
  errors: WorkflowError[];
}

export interface WorkflowError {
  stage: VideoProjectStatus;
  message: string;
  stack?: string;
  timestamp: Date;
  resolved: boolean;
}

// ============================================
// LLM ROUTER TYPES
// ============================================

export type LLMProvider = 'claude' | 'gpt4o' | 'gemini';

export interface LLMRequest {
  prompt: string;
  contentType: 'creative' | 'factual' | 'mixed';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  provider: LLMProvider;
  content: string;
  tokenCount: {
    input: number;
    output: number;
  };
  cost: number;
  latency: number; // ms
  metadata: Record<string, any>;
}
