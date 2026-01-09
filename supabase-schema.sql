-- ArbHunter Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Discoveries table: Main table for storing discovery runs
CREATE TABLE IF NOT EXISTS discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geo VARCHAR(100) NOT NULL,
  niche VARCHAR(255) NOT NULL,
  margin_score INTEGER NOT NULL CHECK (margin_score >= 0 AND margin_score <= 100),
  trend_velocity JSONB,
  competition_data JSONB,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend snapshots table: Historical trend data
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(255) NOT NULL,
  geo VARCHAR(100) NOT NULL,
  search_volume INTEGER,
  growth_rate DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competition metrics table: Historical advertiser competition data
CREATE TABLE IF NOT EXISTS competition_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geo VARCHAR(100) NOT NULL,
  niche VARCHAR(255) NOT NULL,
  advertiser_count INTEGER,
  avg_cpc DECIMAL(10, 4),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discoveries_geo ON discoveries(geo);
CREATE INDEX IF NOT EXISTS idx_discoveries_created_at ON discoveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discoveries_margin_score ON discoveries(margin_score DESC);
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_keyword_geo ON trend_snapshots(keyword, geo);
CREATE INDEX IF NOT EXISTS idx_competition_metrics_geo_niche ON competition_metrics(geo, niche);

-- Enable Row Level Security (RLS) - Optional for MVP
-- ALTER TABLE discoveries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competition_metrics ENABLE ROW LEVEL SECURITY;

-- Create a view for recent discoveries with high scores
CREATE OR REPLACE VIEW high_margin_opportunities AS
SELECT 
  id,
  geo,
  niche,
  margin_score,
  trend_velocity,
  competition_data,
  created_at
FROM discoveries
WHERE margin_score >= 70
ORDER BY margin_score DESC, created_at DESC;

COMMENT ON TABLE discoveries IS 'Main table storing ad arbitrage opportunity discovery results';
COMMENT ON TABLE trend_snapshots IS 'Historical Google Trends data for keywords and GEOs';
COMMENT ON TABLE competition_metrics IS 'Historical Meta Ad Library competition metrics';


