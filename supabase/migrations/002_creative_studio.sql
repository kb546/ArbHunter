-- Creative Studio Module Database Schema
-- Migration: 002_creative_studio
-- Created: 2026-01-06

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
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

-- ============================================================================
-- GENERATED CREATIVES (IMAGES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Image details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  style TEXT,
  orientation TEXT CHECK (orientation IN ('square', 'portrait', 'landscape')),
  
  -- Generation metadata
  model TEXT DEFAULT 'flux-schnell',
  cost DECIMAL(10, 6),
  dimensions JSONB,
  predicted_score INTEGER CHECK (predicted_score >= 1 AND predicted_score <= 100),
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GENERATED AD COPY
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_copies (
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
  copy_formula TEXT,
  tone_of_voice TEXT,
  
  -- AI predictions
  estimated_ctr DECIMAL(5, 2),
  engagement_score INTEGER CHECK (engagement_score >= 1 AND engagement_score <= 100),
  reasoning TEXT,
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGN VARIATIONS (IMAGE + COPY COMBINATIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES generated_creatives(id) ON DELETE CASCADE,
  copy_id UUID REFERENCES generated_copies(id) ON DELETE CASCADE,
  
  -- Variation metadata
  variation_name TEXT,
  is_control BOOLEAN DEFAULT false,
  predicted_winner BOOLEAN DEFAULT false,
  
  -- Testing status
  status TEXT CHECK (status IN ('untested', 'testing', 'winner', 'loser')) DEFAULT 'untested',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, creative_id, copy_id)
);

-- ============================================================================
-- CAMPAIGN PERFORMANCE (FOR FUTURE USE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id UUID REFERENCES campaign_variations(id) ON DELETE CASCADE,
  
  -- Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated metrics (computed columns)
  ctr DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0 THEN (clicks::DECIMAL / impressions * 100) ELSE 0 END
  ) STORED,
  cpc DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE WHEN clicks > 0 THEN (spend / clicks) ELSE 0 END
  ) STORED,
  
  date DATE DEFAULT CURRENT_DATE,
  
  UNIQUE(variation_id, date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_discovery_id ON campaigns(discovery_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_creatives_campaign_id ON generated_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_generated_creatives_is_favorite ON generated_creatives(is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_generated_copies_campaign_id ON generated_copies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_generated_copies_is_favorite ON generated_copies(is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_campaign_variations_campaign_id ON campaign_variations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_variations_status ON campaign_variations(status);

CREATE INDEX IF NOT EXISTS idx_campaign_performance_variation_id ON campaign_performance(variation_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON campaign_performance(date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: CAMPAIGNS
-- ============================================================================

-- Allow users to view their own campaigns
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own campaigns
CREATE POLICY "Users can create their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own campaigns
CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own campaigns
CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: GENERATED CREATIVES
-- ============================================================================

-- Allow users to view creatives from their campaigns
CREATE POLICY "Users can view creatives from their campaigns"
  ON generated_creatives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_creatives.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to create creatives for their campaigns
CREATE POLICY "Users can create creatives for their campaigns"
  ON generated_creatives FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_creatives.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to update creatives from their campaigns
CREATE POLICY "Users can update creatives from their campaigns"
  ON generated_creatives FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_creatives.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to delete creatives from their campaigns
CREATE POLICY "Users can delete creatives from their campaigns"
  ON generated_creatives FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_creatives.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: GENERATED COPIES
-- ============================================================================

-- Allow users to view copies from their campaigns
CREATE POLICY "Users can view copies from their campaigns"
  ON generated_copies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_copies.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to create copies for their campaigns
CREATE POLICY "Users can create copies for their campaigns"
  ON generated_copies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_copies.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to update copies from their campaigns
CREATE POLICY "Users can update copies from their campaigns"
  ON generated_copies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_copies.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to delete copies from their campaigns
CREATE POLICY "Users can delete copies from their campaigns"
  ON generated_copies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = generated_copies.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: CAMPAIGN VARIATIONS
-- ============================================================================

-- Allow users to view variations from their campaigns
CREATE POLICY "Users can view variations from their campaigns"
  ON campaign_variations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_variations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to create variations for their campaigns
CREATE POLICY "Users can create variations for their campaigns"
  ON campaign_variations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_variations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to update variations from their campaigns
CREATE POLICY "Users can update variations from their campaigns"
  ON campaign_variations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_variations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to delete variations from their campaigns
CREATE POLICY "Users can delete variations from their campaigns"
  ON campaign_variations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_variations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: CAMPAIGN PERFORMANCE
-- ============================================================================

-- Allow users to view performance from their campaign variations
CREATE POLICY "Users can view performance from their variations"
  ON campaign_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_variations
      JOIN campaigns ON campaigns.id = campaign_variations.campaign_id
      WHERE campaign_variations.id = campaign_performance.variation_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to create performance data for their variations
CREATE POLICY "Users can create performance data for their variations"
  ON campaign_performance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_variations
      JOIN campaigns ON campaigns.id = campaign_variations.campaign_id
      WHERE campaign_variations.id = campaign_performance.variation_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Allow users to update performance data for their variations
CREATE POLICY "Users can update performance data for their variations"
  ON campaign_performance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_variations
      JOIN campaigns ON campaigns.id = campaign_variations.campaign_id
      WHERE campaign_variations.id = campaign_performance.variation_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on campaigns
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE campaigns IS 'Stores user-created ad campaigns';
COMMENT ON TABLE generated_creatives IS 'AI-generated ad images/creatives';
COMMENT ON TABLE generated_copies IS 'AI-generated ad copy variations';
COMMENT ON TABLE campaign_variations IS 'Combinations of creatives and copies for A/B testing';
COMMENT ON TABLE campaign_performance IS 'Performance metrics for campaign variations';

COMMENT ON COLUMN campaigns.discovery_id IS 'Optional link to the discovery that inspired this campaign';
COMMENT ON COLUMN generated_creatives.model IS 'AI model used: flux-schnell, dalle3, or sdxl';
COMMENT ON COLUMN generated_copies.copy_formula IS 'Marketing formula used: AIDA, PAS, BAB, etc.';
COMMENT ON COLUMN campaign_variations.predicted_winner IS 'AI prediction of which variation will perform best';


