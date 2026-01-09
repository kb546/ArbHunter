import { MarginScore, TrendVelocity, CompetitionData } from '@/types';

// GEO-specific RPM baselines (estimated AdSense revenue per 1000 impressions)
const GEO_RPM_BASELINE: Record<string, number> = {
  ZA: 2.8, // South Africa
  PH: 1.2, // Philippines
  ID: 0.8, // Indonesia
  NG: 1.5, // Nigeria
  EG: 1.0, // Egypt
  KE: 1.8, // Kenya
  PK: 0.7, // Pakistan
  VN: 0.9, // Vietnam
  BD: 0.6, // Bangladesh
  TH: 1.4, // Thailand
};

// Scoring weights (must sum to 100)
const WEIGHTS = {
  TREND_VELOCITY: 40, // 0-40 points
  COMPETITION_DENSITY: 30, // 0-30 points
  CPC_RPM_SPREAD: 30, // 0-30 points
};

/**
 * Calculate trend velocity score (0-40 points)
 * Based on search volume spike and growth rate
 */
function calculateTrendScore(trendData: TrendVelocity): number {
  const { search_volume, growth_rate, peak_interest } = trendData;

  // Volume score (0-15 points)
  // Higher volume = better opportunity
  let volumeScore = 0;
  if (search_volume > 50000) volumeScore = 15;
  else if (search_volume > 30000) volumeScore = 12;
  else if (search_volume > 15000) volumeScore = 9;
  else if (search_volume > 5000) volumeScore = 6;
  else volumeScore = 3;

  // Growth rate score (0-15 points)
  // Positive growth is good, negative is bad
  let growthScore = 0;
  if (growth_rate > 50) growthScore = 15;
  else if (growth_rate > 30) growthScore = 12;
  else if (growth_rate > 15) growthScore = 9;
  else if (growth_rate > 5) growthScore = 6;
  else if (growth_rate > 0) growthScore = 3;
  else growthScore = 0; // Negative growth = 0 points

  // Peak interest score (0-10 points)
  // Measures current momentum
  const interestScore = Math.floor((peak_interest / 100) * 10);

  return volumeScore + growthScore + interestScore;
}

/**
 * Calculate competition density score (0-30 points)
 * Inverse relationship: fewer advertisers = higher score
 */
function calculateCompetitionScore(competitionData: CompetitionData): number {
  const { advertiser_count, competition_level, market_saturation } = competitionData;

  // Advertiser count score (0-15 points)
  // Fewer advertisers = better opportunity
  let advertiserScore = 0;
  if (advertiser_count < 10) advertiserScore = 15;
  else if (advertiser_count < 20) advertiserScore = 12;
  else if (advertiser_count < 30) advertiserScore = 9;
  else if (advertiser_count < 40) advertiserScore = 6;
  else advertiserScore = 3;

  // Competition level score (0-10 points)
  let levelScore = 0;
  if (competition_level === 'low') levelScore = 10;
  else if (competition_level === 'medium') levelScore = 6;
  else levelScore = 3; // high competition

  // Market saturation score (0-5 points)
  // Lower saturation = better opportunity
  const saturationScore = Math.floor(((100 - market_saturation) / 100) * 5);

  return advertiserScore + levelScore + saturationScore;
}

/**
 * Calculate CPC vs RPM spread score (0-30 points)
 * The "margin" - how much profit potential exists
 */
function calculateSpreadScore(
  geo: string,
  avgCpc: number,
  estimatedRpm?: number
): number {
  // Get estimated RPM for the GEO
  const rpm = estimatedRpm || GEO_RPM_BASELINE[geo] || 1.0;

  // Calculate CTR assumption (typical for arbitrage: 1-3%)
  const assumedCtr = 0.02; // 2% CTR

  // Calculate estimated revenue per click
  // RPM = revenue per 1000 impressions
  // With 2% CTR, 1000 impressions = 20 clicks
  // So revenue per click = RPM / 20
  const revenuePerClick = rpm / (1000 * assumedCtr);

  // Calculate profit margin per click
  const profitMargin = revenuePerClick - avgCpc;

  // Calculate margin percentage
  const marginPercent = avgCpc > 0 ? (profitMargin / avgCpc) * 100 : 0;

  // Score based on margin percentage
  // We want at least 50% margin for good arbitrage
  let spreadScore = 0;
  if (marginPercent > 200) spreadScore = 30; // 3x return!
  else if (marginPercent > 150) spreadScore = 25;
  else if (marginPercent > 100) spreadScore = 20; // 2x return
  else if (marginPercent > 75) spreadScore = 15;
  else if (marginPercent > 50) spreadScore = 10;
  else if (marginPercent > 25) spreadScore = 5;
  else if (marginPercent > 0) spreadScore = 2;
  else spreadScore = 0; // Negative margin = no points

  return spreadScore;
}

/**
 * Calculate the overall margin potential score (1-100)
 * Combines trend velocity, competition density, and CPC/RPM spread
 */
export function calculateMarginScore(
  geo: string,
  trendData: TrendVelocity,
  competitionData: CompetitionData
): MarginScore {
  // Calculate individual component scores
  const trendPoints = calculateTrendScore(trendData);
  const competitionPoints = calculateCompetitionScore(competitionData);
  const spreadPoints = calculateSpreadScore(geo, competitionData.avg_cpc);

  // Calculate total score
  const total = Math.min(100, Math.round(trendPoints + competitionPoints + spreadPoints));

  return {
    total,
    trend_points: trendPoints,
    competition_points: competitionPoints,
    spread_points: spreadPoints,
    breakdown: {
      trend_velocity: trendPoints,
      competition_density: competitionPoints,
      cpc_rpm_spread: spreadPoints,
    },
  };
}

/**
 * Get a human-readable interpretation of the margin score
 */
export function getScoreInterpretation(score: number): {
  label: string;
  description: string;
  recommendation: string;
} {
  if (score >= 80) {
    return {
      label: 'Excellent',
      description: 'High-margin opportunity with strong demand and low competition',
      recommendation: 'Launch campaign immediately with aggressive budget',
    };
  } else if (score >= 60) {
    return {
      label: 'Good',
      description: 'Solid opportunity with profitable potential',
      recommendation: 'Launch campaign with moderate budget and monitor closely',
    };
  } else if (score >= 40) {
    return {
      label: 'Fair',
      description: 'Moderate opportunity with some risk',
      recommendation: 'Test with small budget first, optimize before scaling',
    };
  } else if (score >= 20) {
    return {
      label: 'Poor',
      description: 'Low-margin opportunity with high risk',
      recommendation: 'Not recommended unless you have specific advantages',
    };
  } else {
    return {
      label: 'Very Poor',
      description: 'Unprofitable or highly competitive market',
      recommendation: 'Avoid - focus on other opportunities',
    };
  }
}

/**
 * Apply configurable weight adjustments to scoring
 * Useful for fine-tuning the algorithm based on market conditions
 */
export function calculateWeightedScore(
  scores: { trend: number; competition: number; spread: number },
  customWeights?: { trend: number; competition: number; spread: number }
): number {
  const weights = customWeights || {
    trend: WEIGHTS.TREND_VELOCITY,
    competition: WEIGHTS.COMPETITION_DENSITY,
    spread: WEIGHTS.CPC_RPM_SPREAD,
  };

  // Normalize weights to sum to 100
  const total = weights.trend + weights.competition + weights.spread;
  const normalized = {
    trend: (weights.trend / total) * 100,
    competition: (weights.competition / total) * 100,
    spread: (weights.spread / total) * 100,
  };

  // Calculate weighted score
  const weightedScore =
    (scores.trend / WEIGHTS.TREND_VELOCITY) * normalized.trend +
    (scores.competition / WEIGHTS.COMPETITION_DENSITY) * normalized.competition +
    (scores.spread / WEIGHTS.CPC_RPM_SPREAD) * normalized.spread;

  return Math.min(100, Math.round(weightedScore));
}


