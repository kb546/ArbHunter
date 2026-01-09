/**
 * Campaign Type Detector Service
 * AI-powered detection of campaign types for ad arbitrage
 * 
 * Supports ALL ad arbitrage verticals:
 * - Recruitment
 * - Free Samples
 * - Government Programs
 * - Credit Cards
 * - Lead Gen
 * - Sweepstakes
 * - Trials
 * - Discounts
 * - Education
 * - Delivery/Gig
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log('✅ Campaign Type Detector initialized');
} else {
  console.warn('⚠️  OPENAI_API_KEY not configured - using fallback detection');
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CampaignType = 
  | 'recruitment'           // Job ads, hiring campaigns
  | 'free_sample'           // Free product samples
  | 'government_program'    // SNAP, Medicaid, housing assistance
  | 'credit_card'           // Credit card offers, financial products
  | 'lead_gen'              // Free quotes, consultations
  | 'trial_offer'           // Free trials, risk-free offers
  | 'sweepstakes'           // Contests, giveaways
  | 'discount_sale'         // Sales, discounts, clearance
  | 'product_launch'        // New product announcements
  | 'education'             // Courses, scholarships
  | 'delivery_gig';         // Delivery jobs, gig economy

export interface CampaignTypeDetectionResult {
  campaignType: CampaignType;
  confidence: number; // 0-100
  reasoning: string;
  subCategory?: string;
  targetAction: string; // "apply", "claim", "sign_up", "download", etc.
}

// ============================================================================
// AI-POWERED DETECTION
// ============================================================================

/**
 * Detects campaign type using GPT-4o-mini (cheap, fast, accurate for classification)
 */
export async function detectCampaignTypeWithAI(
  niche: string,
  geo: string
): Promise<CampaignTypeDetectionResult | null> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback detection');
    return null;
  }

  console.log(`🔍 Detecting campaign type for: "${niche}"`);

  const prompt = `You are an expert in ad arbitrage and digital advertising. Analyze this campaign and determine its type.

CAMPAIGN INPUT:
- Niche: "${niche}"
- Geographic Market: ${geo}

CAMPAIGN TYPES (Choose ONE):
1. recruitment: Job ads, hiring campaigns, employment opportunities
   Examples: "KFC careers", "Amazon warehouse jobs", "Nurse hiring"
   
2. free_sample: Free product samples (user pays shipping or nothing)
   Examples: "Free baby formula samples", "Free dog food samples", "Free makeup samples"
   
3. government_program: Government benefits, assistance programs
   Examples: "Apply for food stamps", "Medicaid eligibility", "Free housing assistance"
   
4. credit_card: Credit card offers, financial products
   Examples: "0% APR credit card", "Cashback rewards", "Travel rewards card"
   
5. lead_gen: Lead generation offers (quotes, consultations, assessments)
   Examples: "Free insurance quote", "Free home value estimate", "Free consultation"
   
6. trial_offer: Free trials, risk-free offers
   Examples: "30-day free trial", "Try risk-free", "Free month subscription"
   
7. sweepstakes: Contests, giveaways, prize draws
   Examples: "Win $1000", "Gift card giveaway", "Prize draw entry"
   
8. discount_sale: Sales, discounts, clearance events
   Examples: "50% off sale", "Black Friday deals", "Clearance event"
   
9. product_launch: New product announcements, releases
   Examples: "New iPhone launch", "Product reveal", "Coming soon"
   
10. education: Courses, scholarships, certifications, training
    Examples: "Free online course", "Scholarship application", "Certification program"
    
11. delivery_gig: Delivery jobs, gig economy opportunities
    Examples: "Drive for Uber", "DoorDash delivery", "Instacart shopper"

ANALYSIS GUIDELINES:
- Consider the primary intent of the campaign
- If multiple types could apply, choose the most specific one
- For job ads related to delivery (DoorDash, Uber), use "delivery_gig" not "recruitment"
- For government-related free programs, use "government_program" not "free_sample"

OUTPUT FORMAT (JSON):
{
  "campaignType": "free_sample",
  "confidence": 95,
  "reasoning": "Campaign offers free product samples to users",
  "subCategory": "baby_products",
  "targetAction": "claim"
}

IMPORTANT:
- Be accurate and confident in your classification
- Provide clear reasoning
- Choose the most specific category
- targetAction should be: "apply", "claim", "sign_up", "download", "enter", "buy", "learn_more", "get_quote"`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper for classification ($0.15/$0.60 per 1M tokens)
      messages: [
        { role: 'system', content: 'You are an expert ad arbitrage analyst. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Low for accuracy
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    const result: CampaignTypeDetectionResult = JSON.parse(content);

    // Calculate cost (gpt-4o-mini: $0.15 input, $0.60 output per 1M tokens)
    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o-mini'
    );

    console.log(`✅ Detected: ${result.campaignType} (${result.confidence}% confidence)`);
    console.log(`   Reasoning: ${result.reasoning}`);
    console.log(`   Cost: $${cost.toFixed(6)}`);

    return result;
  } catch (error: any) {
    console.error(`❌ AI campaign type detection failed:`, error.message);
    return null;
  }
}

function calculateOpenAICost(promptTokens: number, completionTokens: number, model: string): number {
  const costs: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 },
    'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
  };

  const modelCosts = costs[model] || costs['gpt-4o-mini'];
  return promptTokens * modelCosts.input + completionTokens * modelCosts.output;
}

// ============================================================================
// FALLBACK: KEYWORD-BASED DETECTION
// ============================================================================

/**
 * Fallback detection using keyword matching (when AI unavailable)
 */
export function detectCampaignTypeWithKeywords(niche: string): CampaignTypeDetectionResult {
  const nicheLower = niche.toLowerCase();

  // Recruitment
  if (/\b(job|career|hiring|employment|work|position|opportunity|recruit|apply now|join our team|now hiring)\b/i.test(nicheLower)) {
    // Check if it's delivery/gig specific
    if (/\b(uber|lyft|doordash|instacart|grubhub|postmates|delivery driver|gig|drive for)\b/i.test(nicheLower)) {
      return {
        campaignType: 'delivery_gig',
        confidence: 85,
        reasoning: 'Delivery or gig economy job opportunity',
        subCategory: 'delivery',
        targetAction: 'sign_up',
      };
    }
    return {
      campaignType: 'recruitment',
      confidence: 90,
      reasoning: 'Job or hiring related campaign',
      subCategory: 'general',
      targetAction: 'apply',
    };
  }

  // Free Sample
  if (/\b(free sample|free trial sample|sample kit|try free|free product|complimentary sample)\b/i.test(nicheLower)) {
    return {
      campaignType: 'free_sample',
      confidence: 92,
      reasoning: 'Free product sample offer',
      subCategory: 'product_sample',
      targetAction: 'claim',
    };
  }

  // Government Program
  if (/\b(food stamps?|snap|medicaid|medicare|ebt|housing assistance|government (benefit|program|aid)|welfare|subsidy|wic)\b/i.test(nicheLower)) {
    return {
      campaignType: 'government_program',
      confidence: 95,
      reasoning: 'Government assistance or benefit program',
      subCategory: 'benefits',
      targetAction: 'apply',
    };
  }

  // Credit Card
  if (/\b(credit card|apr|cashback|cash back|rewards card|credit score|balance transfer|credit offer)\b/i.test(nicheLower)) {
    return {
      campaignType: 'credit_card',
      confidence: 93,
      reasoning: 'Credit card or financial product offer',
      subCategory: 'credit',
      targetAction: 'apply',
    };
  }

  // Lead Gen
  if (/\b(free quote|free estimate|free consultation|free assessment|get a quote|request quote|compare rates)\b/i.test(nicheLower)) {
    return {
      campaignType: 'lead_gen',
      confidence: 88,
      reasoning: 'Lead generation offer (quote/consultation)',
      subCategory: 'quote',
      targetAction: 'get_quote',
    };
  }

  // Trial Offer
  if (/\b(free trial|trial period|try (it )?free|risk.free|money.back guarantee|30.day (trial|free)|no commitment)\b/i.test(nicheLower)) {
    return {
      campaignType: 'trial_offer',
      confidence: 90,
      reasoning: 'Free trial or risk-free offer',
      subCategory: 'trial',
      targetAction: 'sign_up',
    };
  }

  // Sweepstakes
  if (/\b(win|giveaway|contest|sweepstakes?|prize|enter to win|gift card (giveaway|draw)|raffle)\b/i.test(nicheLower)) {
    return {
      campaignType: 'sweepstakes',
      confidence: 91,
      reasoning: 'Contest, giveaway, or sweepstakes',
      subCategory: 'contest',
      targetAction: 'enter',
    };
  }

  // Discount/Sale
  if (/\b(sale|discount|% off|\d+% off|clearance|deal|offer|promo|coupon|limited time|flash sale)\b/i.test(nicheLower)) {
    return {
      campaignType: 'discount_sale',
      confidence: 87,
      reasoning: 'Sale, discount, or promotional offer',
      subCategory: 'sale',
      targetAction: 'buy',
    };
  }

  // Education
  if (/\b(course|class|training|certification|scholarship|learn|study|education|degree|diploma|online learning)\b/i.test(nicheLower)) {
    return {
      campaignType: 'education',
      confidence: 86,
      reasoning: 'Educational course or scholarship',
      subCategory: 'course',
      targetAction: 'learn_more',
    };
  }

  // Product Launch
  if (/\b(new product|product launch|coming soon|just launched|now available|introducing|pre.order)\b/i.test(nicheLower)) {
    return {
      campaignType: 'product_launch',
      confidence: 84,
      reasoning: 'New product announcement or launch',
      subCategory: 'launch',
      targetAction: 'learn_more',
    };
  }

  // Default: product (generic)
  return {
    campaignType: 'discount_sale',
    confidence: 60,
    reasoning: 'Generic product or service campaign (fallback)',
    subCategory: 'general',
    targetAction: 'learn_more',
  };
}

// ============================================================================
// MAIN DETECTION FUNCTION (HYBRID)
// ============================================================================

/**
 * Main campaign type detection function
 * Uses AI if available, falls back to keywords
 */
export async function detectCampaignType(
  niche: string,
  geo: string
): Promise<CampaignTypeDetectionResult> {
  console.log(`\n🔍 Campaign Type Detection`);
  console.log(`   Input: "${niche}" in ${geo}`);

  // Step 1: Try AI detection (most accurate)
  const aiResult = await detectCampaignTypeWithAI(niche, geo);
  if (aiResult && aiResult.confidence >= 75) {
    console.log(`   ✅ AI detection: ${aiResult.campaignType} (${aiResult.confidence}%)`);
    return aiResult;
  }

  // Step 2: Fallback to keyword matching
  console.log(`   ℹ️  Using keyword-based detection (AI unavailable or low confidence)`);
  const keywordResult = detectCampaignTypeWithKeywords(niche);
  console.log(`   ✅ Keyword detection: ${keywordResult.campaignType} (${keywordResult.confidence}%)`);
  
  return keywordResult;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get campaign type metadata (for UI and copy generation)
 */
export function getCampaignTypeMetadata(campaignType: CampaignType) {
  const metadata: Record<CampaignType, {
    name: string;
    description: string;
    primaryCTA: string;
    secondaryCTA: string;
    urgencyLevel: 'low' | 'medium' | 'high';
    trustLevel: 'low' | 'medium' | 'high';
  }> = {
    recruitment: {
      name: 'Recruitment',
      description: 'Job ads and hiring campaigns',
      primaryCTA: 'Apply Now',
      secondaryCTA: 'Learn More',
      urgencyLevel: 'medium',
      trustLevel: 'high',
    },
    free_sample: {
      name: 'Free Sample',
      description: 'Free product sample offers',
      primaryCTA: 'Claim Free Sample',
      secondaryCTA: 'Get Yours Now',
      urgencyLevel: 'high',
      trustLevel: 'medium',
    },
    government_program: {
      name: 'Government Program',
      description: 'Government benefits and assistance',
      primaryCTA: 'Check Eligibility',
      secondaryCTA: 'Apply Now',
      urgencyLevel: 'low',
      trustLevel: 'high',
    },
    credit_card: {
      name: 'Credit Card',
      description: 'Credit card and financial offers',
      primaryCTA: 'Apply Now',
      secondaryCTA: 'Learn More',
      urgencyLevel: 'medium',
      trustLevel: 'high',
    },
    lead_gen: {
      name: 'Lead Generation',
      description: 'Free quotes and consultations',
      primaryCTA: 'Get Free Quote',
      secondaryCTA: 'Request Info',
      urgencyLevel: 'low',
      trustLevel: 'medium',
    },
    trial_offer: {
      name: 'Trial Offer',
      description: 'Free trials and risk-free offers',
      primaryCTA: 'Start Free Trial',
      secondaryCTA: 'Try Risk-Free',
      urgencyLevel: 'medium',
      trustLevel: 'medium',
    },
    sweepstakes: {
      name: 'Sweepstakes',
      description: 'Contests and giveaways',
      primaryCTA: 'Enter Now',
      secondaryCTA: 'Claim Entry',
      urgencyLevel: 'high',
      trustLevel: 'low',
    },
    discount_sale: {
      name: 'Discount/Sale',
      description: 'Sales and promotional offers',
      primaryCTA: 'Shop Now',
      secondaryCTA: 'View Deals',
      urgencyLevel: 'high',
      trustLevel: 'medium',
    },
    product_launch: {
      name: 'Product Launch',
      description: 'New product announcements',
      primaryCTA: 'Pre-Order Now',
      secondaryCTA: 'Learn More',
      urgencyLevel: 'medium',
      trustLevel: 'medium',
    },
    education: {
      name: 'Education',
      description: 'Courses and scholarships',
      primaryCTA: 'Enroll Now',
      secondaryCTA: 'Learn More',
      urgencyLevel: 'low',
      trustLevel: 'high',
    },
    delivery_gig: {
      name: 'Delivery/Gig',
      description: 'Delivery and gig economy jobs',
      primaryCTA: 'Sign Up',
      secondaryCTA: 'Start Earning',
      urgencyLevel: 'medium',
      trustLevel: 'medium',
    },
  };

  return metadata[campaignType];
}

/**
 * Get recommended visual style for campaign type
 */
export function getRecommendedVisualStyle(campaignType: CampaignType): string {
  const visualStyles: Record<CampaignType, string> = {
    recruitment: 'professional, trustworthy, aspirational',
    free_sample: 'exciting, value-focused, urgent',
    government_program: 'trustworthy, official, clear',
    credit_card: 'premium, trustworthy, professional',
    lead_gen: 'clean, professional, informative',
    trial_offer: 'inviting, low-risk, friendly',
    sweepstakes: 'exciting, eye-catching, fun',
    discount_sale: 'bold, urgent, value-focused',
    product_launch: 'innovative, exciting, modern',
    education: 'professional, inspiring, informative',
    delivery_gig: 'energetic, flexible, opportunity-focused',
  };

  return visualStyles[campaignType];
}
