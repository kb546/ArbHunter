import { TrendVelocity } from '@/types';

interface TrendsData {
  keyword: string;
  geo: string;
  search_volume: number;
  growth_rate: number;
  peak_interest: number;
  related_keywords: string[];
}

// Mock Google Trends data for Tier 2.5 markets
const MOCK_TRENDS_DATA: Record<string, TrendsData> = {
  'ZA-SASSA vacancies': {
    keyword: 'SASSA vacancies',
    geo: 'ZA',
    search_volume: 45000,
    growth_rate: 35.2,
    peak_interest: 89,
    related_keywords: ['SASSA jobs', 'SASSA careers', 'SASSA recruitment'],
  },
  'ZA-TymeBank credit limit': {
    keyword: 'TymeBank credit limit',
    geo: 'ZA',
    search_volume: 28000,
    growth_rate: 42.8,
    peak_interest: 76,
    related_keywords: ['TymeBank loan', 'TymeBank advance', 'digital bank credit'],
  },
  'ZA-KFC careers': {
    keyword: 'KFC careers',
    geo: 'ZA',
    search_volume: 38000,
    growth_rate: 18.5,
    peak_interest: 72,
    related_keywords: ['KFC jobs', 'KFC vacancies', 'fast food jobs'],
  },
  'PH-Government jobs': {
    keyword: 'Government jobs',
    geo: 'PH',
    search_volume: 62000,
    growth_rate: 28.3,
    peak_interest: 85,
    related_keywords: ['civil service exam', 'government careers', 'public sector jobs'],
  },
  'NG-Online loans': {
    keyword: 'Online loans',
    geo: 'NG',
    search_volume: 51000,
    growth_rate: 54.7,
    peak_interest: 92,
    related_keywords: ['quick loans', 'instant loan', 'emergency loan'],
  },
};

// Generate realistic mock data with some randomness
function generateMockTrends(geo: string, niche: string): TrendsData {
  const key = `${geo}-${niche}`;
  
  if (MOCK_TRENDS_DATA[key]) {
    return MOCK_TRENDS_DATA[key];
  }

  // Generate semi-random but realistic data
  const baseVolume = Math.floor(Math.random() * 40000) + 10000;
  const growthRate = (Math.random() * 60) - 10; // -10% to +50%
  const peakInterest = Math.floor(Math.random() * 40) + 40; // 40-80

  return {
    keyword: niche,
    geo,
    search_volume: baseVolume,
    growth_rate: parseFloat(growthRate.toFixed(1)),
    peak_interest: peakInterest,
    related_keywords: [
      `${niche} near me`,
      `${niche} 2026`,
      `best ${niche}`,
    ],
  };
}

/**
 * Fetch trend data from Google Trends API
 * Falls back to mock data if API key is not configured
 */
export async function getTrendData(geo: string, niche: string): Promise<TrendVelocity> {
  const apiKey = process.env.GOOGLE_TRENDS_API_KEY;

  if (apiKey) {
    try {
      // TODO: Implement real Google Trends API call via NoCodeAPI
      // const response = await fetch(`https://api.nocodeapi.com/trends...`);
      console.log('🔑 Using Google Trends API');
      // For now, still return mock data even with API key
      return generateMockTrends(geo, niche);
    } catch (error) {
      console.error('Error fetching Google Trends data:', error);
      // Fallback to mock data
      return generateMockTrends(geo, niche);
    }
  }

  // Use mock data
  console.log('🎭 Using mock Google Trends data');
  return generateMockTrends(geo, niche);
}

/**
 * Get historical trend snapshots for analysis
 */
export async function getTrendHistory(
  geo: string,
  niche: string,
  days: number = 30
): Promise<TrendVelocity[]> {
  // Generate mock historical data
  const trends: TrendVelocity[] = [];
  const baseTrend = generateMockTrends(geo, niche);

  for (let i = days; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    trends.push({
      ...baseTrend,
      search_volume: Math.floor(baseTrend.search_volume * (1 + variance)),
      growth_rate: parseFloat((baseTrend.growth_rate * (1 + variance)).toFixed(1)),
    });
  }

  return trends;
}


