-- Migration: Brand Cache Table
-- Purpose: Cache AI-detected brand information for performance and cost savings
-- Created: 2026-01-07

-- Create brand_cache table
CREATE TABLE IF NOT EXISTS public.brand_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_key TEXT NOT NULL UNIQUE, -- Normalized niche (e.g., "tacobell", "kfccareers")
  brand_name TEXT NOT NULL,
  full_name TEXT,
  industry TEXT,
  
  -- Brand colors
  color_primary TEXT NOT NULL,
  color_secondary TEXT,
  color_name_primary TEXT,
  color_name_secondary TEXT,
  
  -- Hero product
  hero_product_name TEXT,
  hero_product_description TEXT,
  hero_product_visual TEXT,
  
  -- Logo
  logo_description TEXT,
  logo_placement TEXT,
  
  -- Uniform (optional)
  uniform_description TEXT,
  uniform_colors JSONB, -- Array of hex colors
  
  -- AI metadata
  confidence NUMERIC(5,2), -- 0.00 to 100.00
  detected_by TEXT DEFAULT 'ai', -- 'ai' | 'manual' | 'template'
  ai_cost NUMERIC(10,6), -- Cost of AI detection
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usage stats
  usage_count INTEGER DEFAULT 1
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_brand_cache_niche_key ON public.brand_cache(niche_key);
CREATE INDEX IF NOT EXISTS idx_brand_cache_brand_name ON public.brand_cache(brand_name);
CREATE INDEX IF NOT EXISTS idx_brand_cache_last_used ON public.brand_cache(last_used_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_brand_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_cache_updated_at
  BEFORE UPDATE ON public.brand_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_cache_updated_at();

-- Enable Row Level Security
ALTER TABLE public.brand_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read brand cache (public data)
CREATE POLICY "Brand cache is publicly readable" ON public.brand_cache
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert/update
CREATE POLICY "Authenticated users can insert brand cache" ON public.brand_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brand cache" ON public.brand_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.brand_cache IS 'Caches AI-detected brand information to reduce API costs and improve performance';

-- Insert sample data (optional, for testing)
INSERT INTO public.brand_cache (
  niche_key, brand_name, full_name, industry,
  color_primary, color_secondary, color_name_primary, color_name_secondary,
  hero_product_name, hero_product_description, hero_product_visual,
  logo_description, logo_placement,
  confidence, detected_by, ai_cost
) VALUES
  ('tacobell', 'Taco Bell', 'Taco Bell Corp.', 'Fast Food / QSR',
   '#702082', '#FFC72C', 'Taco Bell Purple', 'Yellow',
   'Crunchy Taco', 'Classic crunchy taco with seasoned beef', 'Taco Bell crunchy taco, professional food photography',
   'Purple and yellow Taco Bell logo', 'Top-left corner',
   95.0, 'manual', 0.0),
   
  ('burgerking', 'Burger King', 'Burger King Corporation', 'Fast Food / QSR',
   '#F5811E', '#512F2E', 'Burger King Orange', 'Brown',
   'Whopper', 'Flame-grilled Whopper burger', 'Whopper burger with flame-grilled patty, fresh ingredients',
   'Orange and brown Burger King logo with buns', 'Top-center',
   93.0, 'manual', 0.0),
   
  ('wendys', 'Wendys', 'Wendys International', 'Fast Food / QSR',
   '#E51636', '#FFC72C', 'Wendys Red', 'Yellow',
   'Daves Single', 'Fresh beef hamburger', 'Fresh, never frozen beef burger with square patty',
   'Red Wendys logo with pigtail girl', 'Top-left',
   92.0, 'manual', 0.0)
ON CONFLICT (niche_key) DO NOTHING;


