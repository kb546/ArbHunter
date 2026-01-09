// Core type definitions for ArbHunter

export interface Discovery {
  id: string;
  geo: string;
  niche: string;
  margin_score: number;
  trend_velocity?: TrendVelocity;
  competition_data?: CompetitionData;
  ai_reasoning?: string;
  created_at: string;
}

export interface TrendVelocity {
  search_volume: number;
  growth_rate: number;
  peak_interest: number;
  related_keywords: string[];
}

export interface CompetitionData {
  advertiser_count: number;
  avg_cpc: number;
  competition_level: 'low' | 'medium' | 'high';
  market_saturation: number;
}

export interface TrendSnapshot {
  id: string;
  keyword: string;
  geo: string;
  search_volume: number;
  growth_rate: number;
  timestamp: string;
}

export interface CompetitionMetric {
  id: string;
  geo: string;
  niche: string;
  advertiser_count: number;
  avg_cpc: number;
  timestamp: string;
}

export interface MarginScore {
  total: number;
  trend_points: number;
  competition_points: number;
  spread_points: number;
  breakdown: {
    trend_velocity: number;
    competition_density: number;
    cpc_rpm_spread: number;
  };
}

export interface GEOData {
  code: string;
  name: string;
  avg_cpc: number;
  avg_rpm: number;
  tier: string;
}

// API Request/Response types
export interface DiscoverRequest {
  geo: string;
  niche: string;
}

export interface DiscoverResponse {
  success: boolean;
  data?: Discovery;
  error?: string;
}

export interface DiscoveriesResponse {
  success: boolean;
  data?: Discovery[];
  error?: string;
}


