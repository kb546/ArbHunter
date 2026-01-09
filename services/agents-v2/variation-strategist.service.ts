/**
 * Agent 1: Variation Strategist
 * AI-powered planning of unique ad variation strategies
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export type VisualCategory = 
  // Original (recruitment-focused)
  | 'product'               // Hero product shots
  | 'people'                // Employees/lifestyle
  | 'benefits'              // Graphic-heavy benefits
  | 'uniform'               // Apparel on hanger
  | 'cta-graphic'           // Text-focused CTA
  // NEW (for expanded ad types)
  | 'before-after'          // Transformation visuals
  | 'comparison'            // Side-by-side comparison
  | 'testimonial'           // User reviews/social proof
  | 'urgency'               // Limited time, scarcity
  | 'data-viz'              // Charts, calculators, stats
  | 'lifestyle-scene'       // Product in use/context
  | 'bundle'                // Multiple products
  | 'sample-package'        // Free sample/kit visual
  | 'official-document'     // Government/official aesthetic
  | 'reward-visual';        // Prize, gift card, rewards

export type CampaignType =
  | 'recruitment'           // Job ads
  | 'free_sample'           // Free product samples
  | 'government_program'    // SNAP, Medicaid, housing
  | 'credit_card'           // Credit card offers
  | 'lead_gen'              // Free quotes, consultations
  | 'trial_offer'           // Free trials
  | 'sweepstakes'           // Contests, giveaways
  | 'discount_sale'         // Sales, discounts
  | 'product_launch'        // New products
  | 'education'             // Courses, scholarships
  | 'delivery_gig';         // Delivery jobs, gig economy

export interface VariationStrategy {
  id: string;
  visualStyle: 'minimal' | 'bold' | 'lifestyle' | 'premium' | 'urgent' | 'playful' | 'official' | 'trustworthy';
  visualCategory: VisualCategory;
  headlineApproach: 'benefit' | 'urgency' | 'question' | 'social-proof' | 'direct' | 'emotional' | 'value' | 'curiosity';
  ctaType: 'direct' | 'subtle' | 'urgent' | 'value' | 'curiosity' | 'low-commitment';
  colorScheme: 'brand' | 'contrast' | 'monochrome' | 'vibrant' | 'muted' | 'official';
  layout: 'centered' | 'split' | 'asymmetric' | 'grid' | 'hero' | 'stacked';
  mood: 'professional' | 'energetic' | 'calm' | 'exciting' | 'trustworthy' | 'official' | 'friendly';
  reasoning: string;
}

import type { CreativePreset, CreativePresetConfig } from '../creative-presets.service';

export interface VariationStrategyRequest {
  niche: string;
  geo: string;
  campaignType: CampaignType;
  targetAudience?: string;
  batchSize: number;
  brandName?: string;
  preset: CreativePreset;
  presetConfig: CreativePresetConfig;
}

export interface VariationStrategyResult {
  strategies: VariationStrategy[];
  cost: number;
}

const STRATEGIST_PERSONA = `You are an elite AI Variation Strategist with 15+ years experience in ad creative strategy.

YOUR EXPERTISE:
- Digital advertising across Facebook, Google, TikTok, LinkedIn
- A/B testing methodology and conversion optimization
- Consumer psychology and persuasion principles
- Visual design principles and composition
- Brand positioning and messaging

YOUR MISSION:
Plan UNIQUE variation strategies for batch ad generation. Each variation must be DISTINCTLY DIFFERENT from others to maximize A/B test insights.

CRITICAL REQUIREMENTS:
1. Each variation must test a DIFFERENT hypothesis
2. Variations should cover diverse approaches (not just minor tweaks)
3. Balance safe bets with bold experiments
4. Consider cultural nuances for the target GEO
5. Align with campaign objectives

OUTPUT FORMAT (JSON array):
[
  {
    "id": "strategy-1",
    "visualStyle": "minimal",
    "headlineApproach": "benefit",
    "ctaType": "direct",
    "colorScheme": "brand",
    "layout": "centered",
    "mood": "professional",
    "reasoning": "Clean, professional approach emphasizing key benefit. Safe baseline variation."
  },
  // ... more strategies
]`;

/**
 * Generate AI-powered variation strategies
 */
export async function generateVariationStrategies(
  request: VariationStrategyRequest
): Promise<VariationStrategyResult> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback strategies');
    return generateFallbackStrategies(request);
  }

  const { niche, geo, campaignType, targetAudience, batchSize, brandName } = request;

  console.log(`\n🎯 Agent 1: Variation Strategist`);
  console.log(`   Planning ${batchSize} unique strategies for ${niche} (${geo})`);

  const userPrompt = `
CAMPAIGN CONTEXT:
- Niche: ${niche}
- Brand: ${brandName || 'Generic'}
- Geographic Market: ${geo}
- Campaign Type: ${campaignType}
- Target Audience: ${targetAudience || 'General audience'}
- Required Variations: ${batchSize}

YOUR TASK:
Plan ${batchSize} UNIQUE ad variation strategies. Each must:
1. Test a different creative hypothesis
2. Be distinctly different from others
3. Cover diverse approaches (visual style, messaging, layout)
4. Consider ${geo} market preferences
5. Align with ${campaignType} campaign objectives

STRATEGY MIX GUIDELINES:
- ${Math.ceil(batchSize * 0.4)} variations: Safe, proven approaches (baseline)
- ${Math.ceil(batchSize * 0.4)} variations: Moderate risk, creative approaches
- ${Math.ceil(batchSize * 0.2)} variations: Bold experiments

${campaignType === 'recruitment' ? `
RECRUITMENT-SPECIFIC:
- Emphasize benefits (pay, flexibility, growth)
- Build trust (brand reputation, testimonials)
- Remove friction (easy apply, quick start)
- Create urgency (limited positions, start soon)
` : ''}

${campaignType === 'discount_sale' ? `
SALE-SPECIFIC:
- Highlight savings (discount %, dollar amount)
- Create urgency (limited time, scarcity)
- Show value (before/after, comparison)
- Strong CTAs (SHOP NOW, LIMITED TIME)
` : ''}

${campaignType === 'free_sample' ? `
FREE SAMPLE-SPECIFIC:
- Emphasize "FREE" prominently
- Minimize friction (just pay shipping)
- Create urgency (limited supply)
- Show product value
` : ''}

${campaignType === 'government_program' ? `
GOVERNMENT PROGRAM-SPECIFIC:
- Build trust (official, legitimate)
- Simplify eligibility (quick check)
- Emphasize benefits (dollar amounts)
- Remove stigma (you deserve this)
` : ''}

${campaignType === 'credit_card' ? `
CREDIT CARD-SPECIFIC:
- Highlight key benefit (0% APR, cashback)
- Build trust (secure, established brand)
- Show value (rewards, bonuses)
- Clear CTA (apply now, check offers)
` : ''}

OUTPUT: JSON array of ${batchSize} strategies with clear reasoning for each.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: STRATEGIST_PERSONA },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8, // Higher for creative diversity
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    const strategies: VariationStrategy[] = Array.isArray(parsed.strategies)
      ? parsed.strategies
      : parsed.variations || [];

    if (strategies.length === 0) {
      throw new Error('No strategies returned from AI');
    }

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Generated ${strategies.length} unique strategies`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      strategies: strategies.slice(0, batchSize), // Ensure exact count
      cost,
    };
  } catch (error: any) {
    console.error('❌ Variation Strategist failed:', error.message);
    console.log('⚠️  Falling back to template strategies');
    return generateFallbackStrategies(request);
  }
}

/**
 * Fallback: Template-based strategies (no AI)
 */
function generateFallbackStrategies(request: VariationStrategyRequest): VariationStrategyResult {
  const { batchSize, campaignType } = request;

  const visualStyles: VariationStrategy['visualStyle'][] = ['minimal', 'bold', 'lifestyle', 'premium', 'urgent', 'playful', 'official', 'trustworthy'];
  const headlineApproaches: VariationStrategy['headlineApproach'][] = ['benefit', 'urgency', 'question', 'social-proof', 'direct', 'emotional', 'value', 'curiosity'];
  const ctaTypes: VariationStrategy['ctaType'][] = ['direct', 'subtle', 'urgent', 'value', 'curiosity', 'low-commitment'];
  const colorSchemes: VariationStrategy['colorScheme'][] = ['brand', 'contrast', 'monochrome', 'vibrant', 'muted', 'official'];
  const layouts: VariationStrategy['layout'][] = ['centered', 'split', 'asymmetric', 'grid', 'hero', 'stacked'];
  const moods: VariationStrategy['mood'][] = ['professional', 'energetic', 'calm', 'exciting', 'trustworthy', 'official', 'friendly'];

  // CAMPAIGN-SPECIFIC VISUAL CATEGORY DISTRIBUTION
  const categoryDistribution: VisualCategory[] = getCategoryDistribution(campaignType, batchSize);

  // Shuffle for variety
  categoryDistribution.sort(() => Math.random() - 0.5);

  const strategies: VariationStrategy[] = Array.from({ length: batchSize }, (_, idx) => ({
    id: `strategy-${idx + 1}`,
    visualStyle: visualStyles[idx % visualStyles.length],
    visualCategory: categoryDistribution[idx] || 'product',
    headlineApproach: headlineApproaches[idx % headlineApproaches.length],
    ctaType: ctaTypes[idx % ctaTypes.length],
    colorScheme: 'brand', // ALWAYS use brand colors
    layout: layouts[idx % layouts.length],
    mood: moods[idx % moods.length],
    reasoning: `Template strategy ${idx + 1}: ${categoryDistribution[idx] || 'product'} visual with ${visualStyles[idx % visualStyles.length]} style`,
  }));

  return {
    strategies,
    cost: 0,
  };
}

/**
 * Get campaign-specific visual category distribution
 */
function getCategoryDistribution(campaignType: CampaignType, batchSize: number): VisualCategory[] {
  const distribution: VisualCategory[] = [];
  
  // Campaign-specific category preferences
  const categoryMixes: Record<CampaignType, { category: VisualCategory; weight: number }[]> = {
    recruitment: [
      { category: 'product', weight: 0.30 },     // Hero product (30%)
      { category: 'people', weight: 0.25 },      // Employees (25%)
      { category: 'benefits', weight: 0.20 },    // Benefits graphic (20%)
      { category: 'uniform', weight: 0.15 },     // Uniform (15%)
      { category: 'cta-graphic', weight: 0.10 }, // CTA-focused (10%)
    ],
    free_sample: [
      { category: 'sample-package', weight: 0.40 },  // Sample box (40%)
      { category: 'product', weight: 0.30 },         // Product shot (30%)
      { category: 'urgency', weight: 0.20 },         // Limited supply (20%)
      { category: 'cta-graphic', weight: 0.10 },     // "FREE" text (10%)
    ],
    government_program: [
      { category: 'official-document', weight: 0.35 }, // Official look (35%)
      { category: 'benefits', weight: 0.30 },          // Benefit amounts (30%)
      { category: 'people', weight: 0.20 },            // Families helped (20%)
      { category: 'data-viz', weight: 0.15 },          // Eligibility calculator (15%)
    ],
    credit_card: [
      { category: 'product', weight: 0.35 },          // Card visual (35%)
      { category: 'data-viz', weight: 0.25 },         // Savings calculator (25%)
      { category: 'benefits', weight: 0.20 },         // Benefits list (20%)
      { category: 'comparison', weight: 0.20 },       // Before/after credit score (20%)
    ],
    lead_gen: [
      { category: 'data-viz', weight: 0.30 },         // Quote calculator (30%)
      { category: 'comparison', weight: 0.25 },       // Price comparison (25%)
      { category: 'testimonial', weight: 0.25 },      // Reviews (25%)
      { category: 'cta-graphic', weight: 0.20 },      // Strong CTA (20%)
    ],
    trial_offer: [
      { category: 'product', weight: 0.30 },          // Product hero (30%)
      { category: 'lifestyle-scene', weight: 0.25 },  // Product in use (25%)
      { category: 'benefits', weight: 0.25 },         // What's included (25%)
      { category: 'urgency', weight: 0.20 },          // Limited time (20%)
    ],
    sweepstakes: [
      { category: 'reward-visual', weight: 0.40 },    // Prize visual (40%)
      { category: 'urgency', weight: 0.30 },          // Enter now (30%)
      { category: 'cta-graphic', weight: 0.20 },      // "WIN" text (20%)
      { category: 'testimonial', weight: 0.10 },      // Winners (10%)
    ],
    discount_sale: [
      { category: 'product', weight: 0.30 },          // Product (30%)
      { category: 'urgency', weight: 0.30 },          // Sale ends soon (30%)
      { category: 'bundle', weight: 0.20 },           // Multiple products (20%)
      { category: 'comparison', weight: 0.20 },       // Before/after price (20%)
    ],
    product_launch: [
      { category: 'product', weight: 0.40 },          // Hero product (40%)
      { category: 'lifestyle-scene', weight: 0.25 },  // Product in use (25%)
      { category: 'benefits', weight: 0.20 },         // Key features (20%)
      { category: 'cta-graphic', weight: 0.15 },      // "NEW" badge (15%)
    ],
    education: [
      { category: 'people', weight: 0.30 },           // Students/teachers (30%)
      { category: 'data-viz', weight: 0.25 },         // Course details (25%)
      { category: 'testimonial', weight: 0.25 },      // Student success (25%)
      { category: 'benefits', weight: 0.20 },         // What you'll learn (20%)
    ],
    delivery_gig: [
      { category: 'people', weight: 0.30 },           // Drivers (30%)
      { category: 'benefits', weight: 0.30 },         // Earnings/flexibility (30%)
      { category: 'lifestyle-scene', weight: 0.20 },  // Delivery in action (20%)
      { category: 'cta-graphic', weight: 0.20 },      // "Start Earning" (20%)
    ],
  };

  const mix = categoryMixes[campaignType] || categoryMixes.recruitment;
  
  // Calculate counts based on weights
  for (const { category, weight } of mix) {
    const count = Math.max(1, Math.round(batchSize * weight));
    for (let i = 0; i < count && distribution.length < batchSize; i++) {
      distribution.push(category);
    }
  }
  
  // Fill remaining slots if any
  while (distribution.length < batchSize) {
    distribution.push(mix[0].category);
  }
  
  return distribution.slice(0, batchSize);
}

/**
 * OpenAI cost calculator
 */
function calculateOpenAICost(promptTokens: number, completionTokens: number, model: string): number {
  const costs: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025 / 1000, output: 0.01 / 1000 },
    'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  };

  const modelCosts = costs[model] || costs['gpt-4o'];
  return promptTokens * modelCosts.input + completionTokens * modelCosts.output;
}

