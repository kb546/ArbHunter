/**
 * Competitor Analysis Service
 * Fetches and analyzes competitor ads from Meta Ad Library
 */

export interface CompetitorAd {
  advertiser_name: string;
  page_id: string;
  ad_library_url: string;
  active_ads_count: number;
  ad_preview?: {
    headline?: string;
    description?: string;
    image_url?: string;
    cta?: string;
  };
  first_seen?: string;
  platforms: string[];
}

interface CompetitorAnalysis {
  total_advertisers: number;
  competitors: CompetitorAd[];
  geo: string;
  niche: string;
  analyzed_at: string;
}

/**
 * Generate Meta Ads Library search URL for a niche
 */
export function getMetaAdsLibraryUrl(niche: string, geo: string): string {
  const baseUrl = 'https://www.facebook.com/ads/library';
  const searchTerm = encodeURIComponent(niche);
  const countryCode = geo.toUpperCase();
  
  return `${baseUrl}/?active_status=active&ad_type=all&country=${countryCode}&q=${searchTerm}&search_type=keyword_unordered&media_type=all`;
}

/**
 * Mock competitor data generator
 * In production, this would use Apify to scrape Meta Ads Library
 */
function generateMockCompetitors(geo: string, niche: string): CompetitorAd[] {
  const competitors: CompetitorAd[] = [];
  
  // Generate realistic competitor data based on niche
  const advertiserCount = Math.floor(Math.random() * 15) + 5; // 5-20 advertisers
  
  // Common advertiser name patterns for job niches
  const prefixes = ['Career', 'Jobs', 'Recruit', 'Work', 'Hire', 'Employment'];
  const suffixes = ['Hub', 'Zone', 'Connect', 'Direct', 'Pro', 'Network', 'Plus'];
  
  for (let i = 0; i < advertiserCount; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const advertiserName = `${prefix}${suffix} ${geo.toUpperCase()}`;
    
    // Generate fake page ID (Meta page IDs are numeric)
    const pageId = Math.floor(Math.random() * 900000000000000) + 100000000000000;
    
    const competitor: CompetitorAd = {
      advertiser_name: advertiserName,
      page_id: pageId.toString(),
      ad_library_url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo.toUpperCase()}&view_all_page_id=${pageId}&search_type=page&media_type=all`,
      active_ads_count: Math.floor(Math.random() * 20) + 1,
      ad_preview: {
        headline: `${niche} - Apply Now! 🎯`,
        description: `Join thousands who found their dream job. Quick application process. Start your career today!`,
        cta: Math.random() > 0.5 ? 'Learn More' : 'Apply Now',
      },
      first_seen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      platforms: ['Facebook', 'Instagram'],
    };
    
    competitors.push(competitor);
  }
  
  // Sort by active ads count (most active first)
  return competitors.sort((a, b) => b.active_ads_count - a.active_ads_count);
}

/**
 * Fetch competitor analysis for a niche
 */
export async function analyzeCompetitors(
  geo: string,
  niche: string
): Promise<CompetitorAnalysis> {
  const apiKey = process.env.APIFY_API_KEY;
  
  if (apiKey) {
    try {
      // TODO: Implement real Apify scraping
      console.log('🔑 Using Apify for competitor analysis');
      // const response = await fetch(`https://api.apify.com/v2/acts/...`);
      // For now, fall back to mock data
    } catch (error) {
      console.error('Error fetching from Apify:', error);
    }
  }
  
  // Use mock data
  console.log('🎭 Using mock competitor data');
  const competitors = generateMockCompetitors(geo, niche);
  
  return {
    total_advertisers: competitors.length,
    competitors,
    geo,
    niche,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Get top competitors (most active)
 */
export function getTopCompetitors(
  competitors: CompetitorAd[],
  limit: number = 5
): CompetitorAd[] {
  return competitors.slice(0, limit);
}

/**
 * Analyze competitor ad patterns
 */
export function analyzeAdPatterns(competitors: CompetitorAd[]): {
  common_ctas: string[];
  avg_ads_per_advertiser: number;
  most_active_advertiser: string;
} {
  const ctas = competitors
    .map((c) => c.ad_preview?.cta)
    .filter((cta): cta is string => !!cta);
  
  const uniqueCtas = Array.from(new Set(ctas));
  
  const avgAds =
    competitors.reduce((sum, c) => sum + c.active_ads_count, 0) / competitors.length;
  
  const mostActive = competitors.reduce((prev, current) =>
    prev.active_ads_count > current.active_ads_count ? prev : current
  );
  
  return {
    common_ctas: uniqueCtas.slice(0, 3),
    avg_ads_per_advertiser: Math.round(avgAds * 10) / 10,
    most_active_advertiser: mostActive.advertiser_name,
  };
}


