# Creative Studio - Implementation Guide

## 🎯 Architecture: Option B + Workflow Button

### User Flow:
```
1. User finds opportunity in Discovery Results
2. Clicks "Create Campaign" button in Discovery Detail Modal
3. → Redirects to /creative-studio?discovery={id}
4. Pre-filled with niche, geo, competitor insights
5. Generate creatives & copy
6. Save to library / Export
```

### Alternative Entry:
```
1. User navigates to /creative-studio directly
2. Can select from past discoveries OR
3. Enter details manually
4. Generate & save
```

---

## 📁 Project Structure

```
app/
├── creative-studio/
│   ├── page.tsx                    # Main Creative Studio page
│   ├── [campaignId]/
│   │   └── page.tsx               # Edit existing campaign
│   └── loading.tsx
├── api/
│   └── creative-studio/
│       ├── generate-image/
│       │   └── route.ts           # Image generation endpoint
│       ├── generate-copy/
│       │   └── route.ts           # Copy generation endpoint
│       ├── campaigns/
│       │   └── route.ts           # CRUD for campaigns
│       └── export/
│           └── route.ts           # Export campaigns

components/
└── creative-studio/
    ├── CampaignSetup.tsx          # Campaign details form
    ├── ImageGenerator.tsx         # Image generation UI
    ├── CopyGenerator.tsx          # Copy generation UI
    ├── CreativeGrid.tsx           # Display generated assets
    ├── CopyVariations.tsx         # Display copy variations
    ├── ExportOptions.tsx          # Export functionality
    └── CreativeLibrary.tsx        # Campaign management

services/
├── image-generation.service.ts    # FAL.ai / Flux.1 integration
├── copy-generation.service.ts     # Claude integration
└── creative-storage.service.ts    # Supabase storage

types/
└── creative-studio.ts             # TypeScript interfaces
```

---

## 🗄️ Database Schema

```sql
-- supabase/migrations/002_creative_studio.sql

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id UUID REFERENCES discoveries(id) ON DELETE SET NULL,
  
  -- Campaign details
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  geo TEXT NOT NULL,
  target_audience TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated creatives (images)
CREATE TABLE generated_creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Image details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  style TEXT, -- "professional", "casual", "lifestyle", etc.
  orientation TEXT CHECK (orientation IN ('square', 'portrait', 'landscape')),
  
  -- Generation metadata
  model TEXT DEFAULT 'flux-schnell', -- "flux-schnell", "dalle3", "sdxl"
  cost DECIMAL(10, 6),
  dimensions JSONB, -- {"width": 1024, "height": 1024}
  predicted_score INTEGER, -- 1-100
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated ad copy
CREATE TABLE generated_copies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Copy content
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  description TEXT,
  call_to_action TEXT,
  
  -- Extended content
  landing_page_headline TEXT,
  landing_page_body TEXT,
  hashtags TEXT[],
  
  -- Metadata
  copy_formula TEXT, -- "AIDA", "PAS", "BAB"
  tone_of_voice TEXT, -- "professional", "casual", "urgent"
  
  -- AI predictions
  estimated_ctr DECIMAL(5, 2), -- Estimated click-through rate
  engagement_score INTEGER, -- 1-100
  reasoning TEXT,
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign variations (image + copy combinations)
CREATE TABLE campaign_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES generated_creatives(id) ON DELETE CASCADE,
  copy_id UUID REFERENCES generated_copies(id) ON DELETE CASCADE,
  
  -- Variation metadata
  variation_name TEXT, -- "Variation A", "Variation B"
  is_control BOOLEAN DEFAULT false,
  predicted_winner BOOLEAN DEFAULT false,
  
  -- Testing status
  status TEXT CHECK (status IN ('untested', 'testing', 'winner', 'loser')) DEFAULT 'untested',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, creative_id, copy_id)
);

-- Performance tracking (optional for MVP, but good to have structure)
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id UUID REFERENCES campaign_variations(id) ON DELETE CASCADE,
  
  -- Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated metrics
  ctr DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0 THEN (clicks::DECIMAL / impressions * 100) ELSE 0 END
  ) STORED,
  cpc DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE WHEN clicks > 0 THEN (spend / clicks) ELSE 0 END
  ) STORED,
  
  date DATE DEFAULT CURRENT_DATE,
  
  UNIQUE(variation_id, date)
);

-- Indexes for performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_discovery_id ON campaigns(discovery_id);
CREATE INDEX idx_generated_creatives_campaign_id ON generated_creatives(campaign_id);
CREATE INDEX idx_generated_copies_campaign_id ON generated_copies(campaign_id);
CREATE INDEX idx_campaign_variations_campaign_id ON campaign_variations(campaign_id);

-- Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables (tied to campaigns.user_id)
-- ... (add for generated_creatives, generated_copies, etc.)
```

---

## 🎨 TypeScript Interfaces

```typescript
// types/creative-studio.ts

export interface Campaign {
  id: string;
  user_id?: string;
  discovery_id?: string;
  name: string;
  niche: string;
  geo: string;
  target_audience?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface GeneratedCreative {
  id: string;
  campaign_id: string;
  image_url: string;
  thumbnail_url?: string;
  prompt: string;
  style: CreativeStyle;
  orientation: 'square' | 'portrait' | 'landscape';
  model: 'flux-schnell' | 'dalle3' | 'sdxl';
  cost: number;
  dimensions: { width: number; height: number };
  predicted_score?: number;
  user_rating?: number;
  is_favorite: boolean;
  generated_at: string;
}

export interface GeneratedCopy {
  id: string;
  campaign_id: string;
  headline: string;
  primary_text: string;
  description?: string;
  call_to_action: string;
  landing_page_headline?: string;
  landing_page_body?: string;
  hashtags?: string[];
  copy_formula: 'AIDA' | 'PAS' | 'BAB' | 'Custom';
  tone_of_voice: 'professional' | 'casual' | 'urgent' | 'friendly';
  estimated_ctr?: number;
  engagement_score?: number;
  reasoning?: string;
  user_rating?: number;
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
  status: 'untested' | 'testing' | 'winner' | 'loser';
  created_at: string;
  // Populated relations
  creative?: GeneratedCreative;
  copy?: GeneratedCopy;
}

export type CreativeStyle = 
  | 'professional'
  | 'casual'
  | 'lifestyle'
  | 'urgency'
  | 'minimal'
  | 'bold';

export interface ImageGenerationRequest {
  niche: string;
  geo: string;
  style: CreativeStyle;
  orientation: 'square' | 'portrait' | 'landscape';
  variations: number;
  brandColors?: string[];
  targetAudience?: string;
  competitorInsights?: {
    topAdvertisers: string[];
    commonThemes: string[];
  };
}

export interface CopyGenerationRequest {
  niche: string;
  geo: string;
  targetAudience: string;
  toneOfVoice: 'professional' | 'casual' | 'urgent' | 'friendly';
  callToAction: string;
  variations: number;
  competitorInsights?: {
    topAdvertisers: string[];
    commonThemes: string[];
    avgAdLength: number;
  };
}
```

---

## 🚀 Implementation Steps

### Step 1: Database Setup
```bash
# Create migration file
npx supabase migration new creative_studio

# Add schema from above
# Run migration
npx supabase db push
```

### Step 2: Install Dependencies
```bash
npm install @fal-ai/serverless-client
# FAL.ai SDK for Flux.1 (already have @anthropic-ai/sdk for Claude)
```

### Step 3: Environment Variables
```env
# .env.local (add to existing)

# Image Generation
FAL_AI_API_KEY=your_fal_ai_key_here

# Alternative: OpenAI for DALL-E 3 (already have)
# OPENAI_API_KEY=already_set

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=creative-assets
```

---

## 🎯 Phase 1 MVP: What We're Building First

### 1. Creative Studio Page (`/creative-studio`)
- Campaign setup form
- Image generation panel
- Copy generation panel
- Preview generated assets
- Save to library
- Download images & copy text

### 2. Workflow Button Integration
- Add "Create Campaign" button to Discovery Detail Modal
- Pass discovery data to Creative Studio page via URL params
- Auto-populate fields

### 3. Basic API Endpoints
- `/api/creative-studio/generate-image` - Flux.1 integration
- `/api/creative-studio/generate-copy` - Claude integration
- `/api/creative-studio/campaigns` - CRUD operations

### 4. Simple Creative Library
- View saved campaigns
- Download generated assets
- Basic organization

---

## 📊 File-by-File Implementation Order

1. ✅ Database migration
2. ✅ TypeScript types
3. ✅ Image generation service
4. ✅ Copy generation service
5. ✅ API routes
6. ✅ UI components
7. ✅ Creative Studio page
8. ✅ Workflow button in Discovery Modal
9. ✅ Testing & polish

---

## 🎨 UI Preview

### Creative Studio Page Layout:
```
┌────────────────────────────────────────────────────────┐
│  ArbHunter                              [User Menu]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ← Back to Discoveries     Creative Studio            │
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Campaign Setup                                  │ │
│  │                                                 │ │
│  │ Campaign Name: [KFC Careers - ZA Campaign   ] │ │
│  │ Niche:        [KFC careers                  ] │ │
│  │ Location:     [ZA ▼]                         │ │
│  │ Audience:     [Young adults 18-25           ] │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  Image Generation    │  │  Copy Generation     │  │
│  │                      │  │                      │  │
│  │  Style: Professional │  │  Tone: Professional  │  │
│  │  Format: Square      │  │  CTA: Apply Now      │  │
│  │  Variations: [3]     │  │  Variations: [5]     │  │
│  │                      │  │                      │  │
│  │  [Generate Images]   │  │  [Generate Copy]     │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                        │
│  Generated Creatives (3)                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │         │ │         │ │         │                │
│  │ Image 1 │ │ Image 2 │ │ Image 3 │                │
│  │ ⭐⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐⭐ │                │
│  │ [↓][♥] │ │ [↓][♥] │ │ [↓][♥] │                │
│  └─────────┘ └─────────┘ └─────────┘                │
│                                                        │
│  Generated Ad Copy (5 variations)                     │
│  ┌───────────────────────────────────────────────┐   │
│  │ Variation 1: Benefit-Focused                  │   │
│  │                                                 │   │
│  │ Headline: "Join KFC Today - Grow Your Career" │   │
│  │ Body: "Looking for more than just a job?..."  │   │
│  │ CTA: "Apply Now"                              │   │
│  │                                                 │   │
│  │ Predicted CTR: 2.8%  Score: 85/100            │   │
│  │ [Copy Text] [Favorite] [Use This]             │   │
│  └───────────────────────────────────────────────┘   │
│  ... (4 more variations)                              │
│                                                        │
│  [Save Campaign] [Export CSV] [Download All]          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🎬 Next: Start Building?

Everything is planned and ready to implement. Should we start with:

1. **Database migration** (create tables)
2. **Image generation service** (FAL.ai integration)
3. **Copy generation service** (Claude prompts)
4. **API endpoints**
5. **UI components**

**Which would you like me to start building first?** 🚀


