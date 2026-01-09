/**
 * REAL Competitor Analysis Service
 * Priority: ACCURACY - Uses actual Meta Ads Library data
 * 
 * Methods:
 * 1. Apify Actor (Primary) - Most reliable, uses your $5 credit
 * 2. Playwright Scraper (Backup) - Direct browser automation
 * 3. Mock Data (Fallback) - Only if both fail
 */

import { ApifyClient } from 'apify-client';

export interface RealCompetitorAd {
  advertiser_name: string;
  page_id: string;
  page_name: string;
  ad_library_url: string;
  active_ads_count: number;
  ad_preview?: {
    headline?: string;
    description?: string;
    image_url?: string;
    cta?: string;
    ad_creative_body?: string;
  };
  first_seen?: string;
  last_seen?: string;
  platforms: string[];
  library_id?: string;
  spend_estimate?: string;
}

interface RealCompetitorAnalysis {
  total_advertisers: number;
  competitors: RealCompetitorAd[];
  geo: string;
  niche: string;
  analyzed_at: string;
  data_source: 'apify' | 'playwright' | 'mock';
  meta_library_url: string;
}

/**
 * Generate Meta Ads Library search URL
 */
export function getMetaAdsLibraryUrl(niche: string, geo: string): string {
  const baseUrl = 'https://www.facebook.com/ads/library';
  const searchTerm = encodeURIComponent(niche);
  const countryCode = geo.toUpperCase();
  
  return `${baseUrl}/?active_status=active&ad_type=all&country=${countryCode}&q=${searchTerm}&search_type=keyword_unordered&media_type=all`;
}

/**
 * Method 1: Scrape using Apify Actor (agenscrape/facebook-ad-library-scraper)
 * Cost-effective and accurate - uses direct Meta Ads Library URL
 */
async function scrapeWithApify(geo: string, niche: string): Promise<RealCompetitorAd[]> {
  const apifyToken = process.env.APIFY_API_KEY;
  
  if (!apifyToken) {
    throw new Error('Apify API key not configured');
  }

  console.log(`🔑 Starting Apify scraper for "${niche}" in ${geo}`);
  
  const client = new ApifyClient({ token: apifyToken });

  try {
    // Using agenscrape/facebook-ad-library-scraper - Cost-effective and accurate
    const actorId = 'agenscrape/facebook-ad-library-scraper';
    
    // Build the Meta Ads Library URL with proper parameters
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo.toUpperCase()}&is_targeted_country=false&media_type=all&q=${encodeURIComponent(niche)}&search_type=keyword_unordered`;
    
    const input = {
      adLibraryUrl,
      maxResults: 50, // Limit for cost control
    };

    console.log(`⚙️  Apify input:`, JSON.stringify(input, null, 2));

    // Run the actor
    const run = await client.actor(actorId).call(input, {
      waitSecs: 120, // Wait up to 2 minutes
      memory: 4096, // 4GB memory for better performance
    });

    console.log(`✅ Apify run completed: ${run.id}, status: ${run.status}`);

    if (run.status !== 'SUCCEEDED') {
      throw new Error(`Apify run failed with status: ${run.status}`);
    }

    // Get results from dataset
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`📦 Retrieved ${dataset.items.length} items from dataset`);

    if (dataset.items.length === 0) {
      console.log(`⚠️  Apify returned 0 results for "${niche}" in ${geo}`);
      return [];
    }

    // Process results
    return processApifyResultsFromAgenScrape(dataset.items, geo, niche);
    
  } catch (error) {
    console.error(`❌ Apify scraping failed for "${niche}" in ${geo}:`, error);
    throw error;
  }
}

/**
 * Process Apify results from agenscrape/facebook-ad-library-scraper
 * Data structure: { ad_archive_id, page_name, ad_title, ad_body, link_url, impressions, is_active, start_date }
 */
function processApifyResultsFromAgenScrape(items: any[], geo: string, niche: string): RealCompetitorAd[] {
  console.log(`📊 Processing ${items.length} ads from AgenScrape for "${niche}" in ${geo}`);
  
  // Log first item to understand structure
  if (items.length > 0) {
    console.log('📝 Sample ad structure:', JSON.stringify(items[0], null, 2));
  }

  // Group ads by page/advertiser name
  const byAdvertiser = new Map<string, any[]>();
  let skippedInactive = 0;
  let skippedNoPage = 0;
  
  items.forEach((ad, index) => {
    // Extract advertiser name
    const advertiserName = ad.page_name || ad.pageName || ad.advertiser || ad.Page;
    
    if (!advertiserName) {
      console.warn(`⚠️  Ad #${index} missing advertiser name`);
      skippedNoPage++;
      return;
    }

    // Only include active ads
    const isActive = ad.is_active === true || 
                     ad.isActive === true ||
                     ad.Active === '✓' ||
                     ad.active === true;
    
    if (isActive === false) {
      console.log(`⏭️  Skipping inactive ad from ${advertiserName}`);
      skippedInactive++;
      return;
    }

    if (!byAdvertiser.has(advertiserName)) {
      byAdvertiser.set(advertiserName, []);
    }
    byAdvertiser.get(advertiserName)!.push(ad);
  });

  console.log(`👥 Found ${byAdvertiser.size} unique active advertisers (skipped ${skippedInactive} inactive, ${skippedNoPage} without page name)`);

  // Convert to our format
  const competitors: RealCompetitorAd[] = [];

  byAdvertiser.forEach((ads, advertiserName) => {
    const firstAd = ads[0];
    
    // Extract ad ID for library URL
    const adArchiveId = firstAd.ad_archive_id || firstAd.adArchiveID || firstAd.Ad_ID || firstAd['Ad ID'];
    
    // Build Meta Ads Library URL with country filter
    const adLibraryUrl = adArchiveId
      ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo.toUpperCase()}&id=${adArchiveId}`
      : `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo.toUpperCase()}&q=${encodeURIComponent(advertiserName)}&search_type=keyword_unordered`;

    competitors.push({
      advertiser_name: advertiserName,
      page_name: advertiserName,
      page_id: adArchiveId || `page-${advertiserName.replace(/\s+/g, '-').toLowerCase()}`,
      ad_library_url: adLibraryUrl,
      active_ads_count: ads.length,
      ad_preview: {
        headline: firstAd.ad_title || firstAd.Title || firstAd.linkTitle || '',
        description: firstAd.ad_body || firstAd.Body || firstAd.body || '',
        image_url: firstAd.link_url || firstAd.Link || firstAd.linkUrl || '',
        cta: firstAd.cta || 'Learn More',
        ad_creative_body: firstAd.ad_body || firstAd.Body || '',
      },
      first_seen: firstAd.start_date || firstAd.Started || firstAd.startDate,
      last_seen: undefined,
      platforms: ['Facebook', 'Instagram'], // Default platforms
      library_id: adArchiveId,
      spend_estimate: firstAd.impressions || firstAd.Impressions,
    });
  });

  // Sort by active ads count (most active first)
  competitors.sort((a, b) => b.active_ads_count - a.active_ads_count);

  console.log(`✅ Final competitors: ${competitors.map(c => `${c.advertiser_name} (${c.active_ads_count} ads)`).join(', ')}`);

  return competitors;
}

/**
 * Extract platform information from ad data
 */
function extractPlatforms(ad: any): string[] {
  const platforms: Set<string> = new Set();
  
  if (ad.platforms) {
    if (Array.isArray(ad.platforms)) {
      ad.platforms.forEach((p: string) => platforms.add(p));
    } else {
      platforms.add(ad.platforms);
    }
  }
  
  if (ad.publisher_platform) {
    if (Array.isArray(ad.publisher_platform)) {
      ad.publisher_platform.forEach((p: string) => platforms.add(p));
    } else {
      platforms.add(ad.publisher_platform);
    }
  }

  // Default if none found
  if (platforms.size === 0) {
    platforms.add('Facebook');
    platforms.add('Instagram');
  }

  return Array.from(platforms);
}

/**
 * Method 2: Scrape using Playwright (Browser Automation)
 * Primary method - most accurate and reliable
 */
async function scrapeWithPlaywright(geo: string, niche: string): Promise<RealCompetitorAd[]> {
  console.log(`🎭 Starting Playwright scraper for "${niche}" in ${geo}`);
  
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    // Navigate to Meta Ads Library
    const url = getMetaAdsLibraryUrl(niche, geo);
    console.log(`🌐 Loading: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait for content to load
    console.log('⏳ Waiting for ads to load...');
    await page.waitForTimeout(3000); // Give time for dynamic content

    // Try multiple selectors for ad containers
    const adSelectors = [
      '[data-pagelet*="AdCard"]',
      '[role="article"]',
      'div[class*="AdCard"]',
      'div[data-testid*="ad"]'
    ];

    let adsFound = false;
    for (const selector of adSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ Found ${count} ads using selector: ${selector}`);
        adsFound = true;
        break;
      }
    }

    if (!adsFound) {
      console.warn('⚠️  No ads found with any selector. Page may require login or has changed structure.');
    }

    // Scroll to load more ads
    console.log('📜 Scrolling to load more ads...');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }

    // Extract ad data from page
    console.log('📊 Extracting ad data...');
    const adsData = await page.evaluate((searchNiche) => {
      const ads: any[] = [];
      
      // Try multiple strategies to find ad containers
      const adContainers = [
        ...Array.from(document.querySelectorAll('[data-pagelet*="AdCard"]')),
        ...Array.from(document.querySelectorAll('[role="article"]')),
        ...Array.from(document.querySelectorAll('div[class*="AdCard"]')),
      ];

      // Deduplicate
      const uniqueContainers = Array.from(new Set(adContainers));
      
      uniqueContainers.forEach((adEl, index) => {
        try {
          // Try multiple selectors for advertiser name
          const advertiserSelectors = [
            '[data-tooltip-display="overflow"]',
            'a[role="link"] span',
            'span[dir="auto"]',
            'div[class*="advertiser"] span',
          ];

          let advertiserName = '';
          for (const selector of advertiserSelectors) {
            const el = adEl.querySelector(selector);
            if (el?.textContent?.trim()) {
              advertiserName = el.textContent.trim();
              break;
            }
          }

          // Extract ad text - try multiple selectors
          const textSelectors = [
            'div[dir="auto"]',
            'span[dir="auto"]',
            '[data-ad-preview="message"]',
          ];

          let adText = '';
          for (const selector of textSelectors) {
            const el = adEl.querySelector(selector);
            if (el?.textContent?.trim() && el.textContent.length > 20) {
              adText = el.textContent.trim();
              break;
            }
          }

          // Extract page ID from links
          const links = adEl.querySelectorAll('a[href]');
          let pageId = '';
          for (const link of Array.from(links)) {
            const href = (link as HTMLAnchorElement).href;
            const match = href.match(/(?:page_id=|pages\/)(\d+)/);
            if (match) {
              pageId = match[1];
              break;
            }
          }

          // Extract image
          const imgEl = adEl.querySelector('img');
          const imageUrl = imgEl?.src || '';

          if (advertiserName && advertiserName.length > 2) {
            ads.push({
              advertiser_name: advertiserName,
              page_id: pageId || `ad-${index}`,
              ad_text: adText,
              image_url: imageUrl,
            });
          }
        } catch (err) {
          // Skip this ad
        }
      });

      return ads;
    }, niche);

    await browser.close();

    console.log(`📊 Playwright extracted ${adsData.length} ads`);

    if (adsData.length === 0) {
      console.warn(`⚠️  No ads found for "${niche}" in ${geo}. This could mean:`);
      console.warn('   1. No active ads for this keyword/region');
      console.warn('   2. Meta Ads Library requires login');
      console.warn('   3. Page structure has changed');
      return [];
    }

    // Group by advertiser
    const byAdvertiser = new Map<string, any[]>();
    adsData.forEach(ad => {
      const name = ad.advertiser_name;
      if (!byAdvertiser.has(name)) {
        byAdvertiser.set(name, []);
      }
      byAdvertiser.get(name)!.push(ad);
    });

    console.log(`👥 Found ${byAdvertiser.size} unique advertisers`);

    const competitors: RealCompetitorAd[] = [];
    byAdvertiser.forEach((ads, name) => {
      const firstAd = ads[0];
      const pageId = firstAd.page_id;

      competitors.push({
        advertiser_name: name,
        page_name: name,
        page_id: pageId,
        ad_library_url: pageId && pageId !== `ad-${0}` && !pageId.startsWith('ad-')
          ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo}&view_all_page_id=${pageId}`
          : `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo}&q=${encodeURIComponent(name)}&search_type=keyword_unordered`,
        active_ads_count: ads.length,
        ad_preview: {
          headline: firstAd.ad_text?.slice(0, 100) || name,
          description: firstAd.ad_text || '',
          image_url: firstAd.image_url || '',
          cta: 'Learn More',
        },
        platforms: ['Facebook', 'Instagram'],
      });
    });

    competitors.sort((a, b) => b.active_ads_count - a.active_ads_count);

    console.log(`✅ Competitors: ${competitors.map(c => `${c.advertiser_name} (${c.active_ads_count})`).join(', ')}`);

    return competitors;

  } catch (error) {
    console.error(`❌ Playwright scraping failed for "${niche}" in ${geo}:`, error);
    await browser.close().catch(() => {});
    throw error;
  }
}

/**
 * Main function: Try methods in order of reliability
 * NOTE: Apify actor (whoareyouanas/meta-ad-scraper) has been found to return
 * inaccurate results (same data for different countries/keywords).
 * Using Playwright as primary method for now.
 */
export async function analyzeRealCompetitors(
  geo: string,
  niche: string
): Promise<RealCompetitorAnalysis> {
  let competitors: RealCompetitorAd[] = [];
  let dataSource: 'apify' | 'playwright' | 'mock' = 'mock';

  // Use Playwright as primary method (Apify actor is unreliable)
  console.log('🎭 Using Playwright for accurate, real-time scraping');
  try {
    competitors = await scrapeWithPlaywright(geo, niche);
    dataSource = 'playwright';
    console.log(`✅ Successfully scraped ${competitors.length} competitors with Playwright`);
  } catch (playwrightError) {
    console.error('❌ Playwright scraping failed:', playwrightError);
    
    // Fallback to Apify if Playwright fails (though it's less accurate)
    if (process.env.APIFY_API_KEY) {
      console.log('⚠️  Trying Apify as fallback (may be inaccurate)...');
      try {
        competitors = await scrapeWithApify(geo, niche);
        dataSource = 'apify';
        console.log('✅ Apify scraping completed (verify accuracy)');
      } catch (apifyError) {
        console.error('❌ Both Playwright and Apify failed');
      }
    }
  }

  return {
    total_advertisers: competitors.length,
    competitors,
    geo,
    niche,
    analyzed_at: new Date().toISOString(),
    data_source: dataSource,
    meta_library_url: getMetaAdsLibraryUrl(niche, geo),
  };
}

