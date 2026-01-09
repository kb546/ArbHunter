/**
 * Creative Studio Module - TypeScript Interfaces
 * Defines all types for campaigns, creatives, copies, and variations
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type VariationStatus = 'untested' | 'testing' | 'winner' | 'loser';
export type CreativeOrientation = 'square' | 'portrait' | 'landscape';
export type ImageModel = 'flux-schnell' | 'dalle3' | 'sdxl' | 'gemini';
export type CopyFormula = 'AIDA' | 'PAS' | 'BAB' | 'Custom';
export type ToneOfVoice = 'professional' | 'casual' | 'urgent' | 'friendly' | 'authoritative';
export type CreativeStyle = 
  | 'studio'       // NEW: Clean product-focused studio shots (like your prompts!)
  | 'professional'
  | 'casual'
  | 'lifestyle'
  | 'urgency'
  | 'minimal'
  | 'bold'
  | 'vibrant'
  | 'dark';

// ============================================================================
// V3 TYPES (AdCreative.ai Style)
// ============================================================================

export interface BrandKit {
  name: string;
  logo?: string | File; // URL or File object
  colors: {
    primary: string;   // HEX color
    secondary: string; // HEX color
  };
  savedAt?: string;
}

export type CampaignType = 'recruitment' | 'product' | 'sale';

export interface CampaignData {
  name: string;
  type: CampaignType;
  niche: string;
  geo: string;
  targetAudience: string;
  keyMessage?: string;
}

export type GenerationMode = 'fast' | 'pro';
export type GeminiModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';

export interface GenerationSettings {
  size: 'square' | 'portrait' | 'landscape';
  model: 'auto' | 'fast' | 'pro';
  variations?: number;
}

export interface GeneratedCreativeV3 {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  headline: string;
  subheadline?: string;
  cta?: string;
  predictedCTR: number;
  visualScore: number;
  brandScore: number;
  textScore: number;
  model: GeminiModel;
  prompt: string;
  generatedAt: string;
}

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Campaign {
  id: string;
  user_id?: string;
  discovery_id?: string | null;
  name: string;
  niche: string;
  geo: string;
  target_audience?: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface GeneratedCreative {
  id: string;
  campaign_id: string;
  image_url: string;
  thumbnail_url?: string | null;
  prompt: string;
  style: string;
  orientation: CreativeOrientation;
  model: ImageModel;
  cost: number;
  dimensions: {
    width: number;
    height: number;
  };
  predicted_score?: number | null;
  user_rating?: number | null;
  is_favorite: boolean;
  generated_at: string;
}

export interface GeneratedCopy {
  id: string;
  campaign_id: string;
  headline: string;
  primary_text: string;
  description?: string | null;
  call_to_action: string;
  landing_page_headline?: string | null;
  landing_page_body?: string | null;
  hashtags?: string[] | null;
  copy_formula: string;
  tone_of_voice: string;
  estimated_ctr?: number | null;
  engagement_score?: number | null;
  reasoning?: string | null;
  user_rating?: number | null;
  is_favorite: boolean;
  generated_at: string;
}

export interface CampaignVariation {
  id: string;
  campaign_id: string;
  creative_id: string;
  copy_id: string;
  variation_name: string;
  is_control: boolean;
  predicted_winner: boolean;
  status: VariationStatus;
  created_at: string;
  // Populated relations
  creative?: GeneratedCreative;
  copy?: GeneratedCopy;
}

export interface CampaignPerformance {
  id: string;
  variation_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number; // Calculated
  cpc: number; // Calculated
  date: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ImageGenerationRequest {
  campaignId: string;
  niche: string;
  geo: string;
  style: CreativeStyle;
  orientation: CreativeOrientation;
  variations: number; // 1-5
  brandColors?: string[];
  targetAudience?: string;
  competitorInsights?: {
    topAdvertisers: string[];
    commonThemes: string[];
  };
}

export interface ImageGenerationResponse {
  success: boolean;
  creatives: GeneratedCreative[];
  totalCost: number;
  message?: string;
}

export interface CopyGenerationRequest {
  campaignId: string;
  niche: string;
  geo: string;
  targetAudience: string;
  toneOfVoice: ToneOfVoice;
  callToAction: string;
  variations: number; // 3-10
  adFormat?: 'single_image' | 'carousel' | 'video' | 'story';
  competitorInsights?: {
    topAdvertisers: string[];
    commonThemes: string[];
    avgAdLength: number;
  };
}

export interface CopyGenerationResponse {
  success: boolean;
  copies: GeneratedCopy[];
  totalCost: number;
  message?: string;
}

export interface CreateCampaignRequest {
  name: string;
  niche: string;
  geo: string;
  target_audience?: string;
  discovery_id?: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  campaign: Campaign;
  message?: string;
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface CampaignSetupFormData {
  name: string;
  niche: string;
  geo: string;
  targetAudience: string;
}

export interface ImageGenerationFormData {
  style: CreativeStyle;
  orientation: CreativeOrientation;
  variations: number;
  brandColors: string[];
}

export interface CopyGenerationFormData {
  toneOfVoice: ToneOfVoice;
  callToAction: string;
  variations: number;
  adFormat: 'single_image' | 'carousel' | 'video' | 'story';
}

// ============================================================================
// EXTENDED TYPES (WITH RELATIONS)
// ============================================================================

export interface CampaignWithAssets extends Campaign {
  creatives: GeneratedCreative[];
  copies: GeneratedCopy[];
  variations: CampaignVariation[];
  discovery?: {
    id: string;
    niche: string;
    geo: string;
    margin_score: number;
  };
}

export interface VariationWithAssets extends CampaignVariation {
  creative: GeneratedCreative;
  copy: GeneratedCopy;
  performance?: CampaignPerformance[];
}

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

export interface ImagePromptTemplate {
  name: string;
  style: CreativeStyle;
  template: string;
  variables: string[];
}

export interface CopyPromptTemplate {
  name: string;
  formula: CopyFormula;
  template: string;
  variables: string[];
}

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'meta_csv' | 'images_zip';
  includeCreatives: boolean;
  includeCopies: boolean;
  includeVariations: boolean;
}

export interface ExportData {
  campaign: Campaign;
  creatives?: GeneratedCreative[];
  copies?: GeneratedCopy[];
  variations?: CampaignVariation[];
}

// ============================================================================
// TESTING & RECOMMENDATIONS
// ============================================================================

export interface TestingRecommendation {
  campaignId: string;
  recommendedVariations: VariationWithAssets[];
  budgetAllocation: {
    totalBudget: number;
    perVariation: number;
    distribution: 'equal' | 'weighted' | 'dynamic';
  };
  testingStrategy: {
    phase: 'broad' | 'refinement' | 'scaling';
    duration: number; // days
    primaryTest: string;
    secondaryTest: string;
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

export interface GenerationProgress {
  stage: 'preparing' | 'generating' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  currentItem?: number;
  totalItems?: number;
}

export interface GenerationError {
  code: string;
  message: string;
  details?: any;
}

