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
  // Batch grouping context (1–3 creatives per batch)
  batchId?: string;
  batchLabel?: string;
  scene?: string;
  environment?: string;
  targetPersona?: string;
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
  batches: Array<{
    id: string;
    label: string;
    scene: string;
    environment: string;
    targetPersona: string;
    strategyIds: string[];
  }>;
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

OUTPUT FORMAT (JSON object):
{
  "batches": [
    {
      "id": "batch-1",
      "label": "Batch 1: Workplace culture",
      "scene": "What is happening in the ad (short)",
      "environment": "Where the ad is set (short)",
      "targetPersona": "Who this batch targets (short)",
      "strategies": [
        {
          "id": "strategy-1",
          "visualStyle": "minimal",
          "visualCategory": "product",
          "headlineApproach": "benefit",
          "ctaType": "direct",
          "colorScheme": "brand",
          "layout": "centered",
          "mood": "professional",
          "reasoning": "Why this strategy should win and what it tests"
        }
      ]
    }
  ]
}`;

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
Plan ${batchSize} UNIQUE ad strategies, grouped into batches. Each batch must:
1. Represent a distinct creative direction (scene + environment + target persona)
2. Contain 1–3 strategies (creatives) that share that direction but still vary

Each STRATEGY must:
1. Test a different creative hypothesis
2. Be distinctly different from others
3. Cover diverse approaches (visual style, messaging, layout)
4. Consider ${geo} market preferences
5. Align with ${campaignType} campaign objectives

HARD RULES:
- Total strategies across all batches MUST equal ${batchSize}
- Each batch must have 1–3 strategies (no more)
- Each strategy MUST include a visualCategory
- Include batch fields: label, scene, environment, targetPersona

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

OUTPUT: JSON object with "batches" array containing the grouped strategies.
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

    const batchesRaw = Array.isArray(parsed?.batches) ? parsed.batches : [];
    const flattened: VariationStrategy[] = [];
    const batches: VariationStrategyResult['batches'] = [];

    if (batchesRaw.length > 0) {
      for (const b of batchesRaw) {
        const bid = String(b?.id || '');
        const label = String(b?.label || `Batch ${batches.length + 1}`);
        const scene = String(b?.scene || '');
        const environment = String(b?.environment || '');
        const targetPersona = String(b?.targetPersona || '');
        const strategiesRaw = Array.isArray(b?.strategies) ? b.strategies : [];

        const ids: string[] = [];
        for (const s of strategiesRaw) {
          const sid = String(s?.id || `strategy-${flattened.length + 1}`);
          ids.push(sid);
          flattened.push({
            id: sid,
            visualStyle: s.visualStyle,
            visualCategory: s.visualCategory,
            headlineApproach: s.headlineApproach,
            ctaType: s.ctaType,
            colorScheme: s.colorScheme,
            layout: s.layout,
            mood: s.mood,
            reasoning: s.reasoning,
            batchId: bid || `batch-${batches.length + 1}`,
            batchLabel: label,
            scene,
            environment,
            targetPersona,
          } as VariationStrategy);
        }

        if (ids.length > 0) {
          batches.push({
            id: bid || `batch-${batches.length + 1}`,
            label,
            scene,
            environment,
            targetPersona,
            strategyIds: ids,
          });
        }
      }
    } else {
      // Back-compat: accept older strategist output that returns a flat strategies array.
      const legacy: any[] = Array.isArray(parsed?.strategies)
        ? parsed.strategies
        : Array.isArray(parsed?.variations)
          ? parsed.variations
          : [];

      if (legacy.length > 0) {
        const chunkSizes = [2, 1, 3];
        let cursor = 0;
        let bIdx = 0;
        while (cursor < legacy.length && flattened.length < batchSize) {
          const size = Math.min(chunkSizes[bIdx % chunkSizes.length], legacy.length - cursor, batchSize - flattened.length);
          const slice = legacy.slice(cursor, cursor + size);
          const ctx = getFallbackBatchContext(campaignType, bIdx);
          const batchId = `batch-${bIdx + 1}`;
          const label = `Batch ${bIdx + 1}: ${ctx.label}`;
          const ids: string[] = [];
          for (const s of slice) {
            const sid = String(s?.id || `strategy-${flattened.length + 1}`);
            ids.push(sid);
            flattened.push({
              id: sid,
              visualStyle: s.visualStyle,
              visualCategory: s.visualCategory,
              headlineApproach: s.headlineApproach,
              ctaType: s.ctaType,
              colorScheme: s.colorScheme,
              layout: s.layout,
              mood: s.mood,
              reasoning: s.reasoning,
              batchId,
              batchLabel: label,
              scene: ctx.scene,
              environment: ctx.environment,
              targetPersona: ctx.targetPersona,
            } as VariationStrategy);
          }
          batches.push({
            id: batchId,
            label,
            scene: ctx.scene,
            environment: ctx.environment,
            targetPersona: ctx.targetPersona,
            strategyIds: ids,
          });
          cursor += size;
          bIdx += 1;
        }
      }
    }

    const strategies = flattened.slice(0, batchSize);
    if (strategies.length === 0) throw new Error('No strategies returned from AI');
    // If the model returned too many, trim batches accordingly.
    const selectedIds = new Set(strategies.map(s => s.id));
    const normalizedBatches = batches
      .map(b => ({ ...b, strategyIds: b.strategyIds.filter(id => selectedIds.has(id)) }))
      .filter(b => b.strategyIds.length > 0);

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Generated ${strategies.length} unique strategies`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      strategies,
      batches: normalizedBatches,
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

  const batches: VariationStrategyResult['batches'] = [];
  // Chunk into batches of 1–3 strategies
  const chunkSizes = [2, 1, 3]; // slight variety
  let cursor = 0;
  let bIdx = 0;
  while (cursor < strategies.length) {
    const size = Math.min(chunkSizes[bIdx % chunkSizes.length], strategies.length - cursor);
    const slice = strategies.slice(cursor, cursor + size);
    const ctx = getFallbackBatchContext(campaignType, bIdx);
    const batchId = `batch-${bIdx + 1}`;
    const label = `Batch ${bIdx + 1}: ${ctx.label}`;
    for (const s of slice) {
      s.batchId = batchId;
      s.batchLabel = label;
      s.scene = ctx.scene;
      s.environment = ctx.environment;
      s.targetPersona = ctx.targetPersona;
    }
    batches.push({
      id: batchId,
      label,
      scene: ctx.scene,
      environment: ctx.environment,
      targetPersona: ctx.targetPersona,
      strategyIds: slice.map(s => s.id),
    });
    cursor += size;
    bIdx += 1;
  }

  return {
    strategies,
    batches,
    cost: 0,
  };
}

function getFallbackBatchContext(campaignType: CampaignType, idx: number): { label: string; scene: string; environment: string; targetPersona: string } {
  const contexts: Record<CampaignType, Array<{ label: string; scene: string; environment: string; targetPersona: string }>> = {
    recruitment: [
      { label: 'Benefits & pay', scene: 'Headline-driven benefits spotlight', environment: 'Clean branded background', targetPersona: 'Urgent job seeker' },
      { label: 'Workplace culture', scene: 'Friendly team culture vibe (no faces required)', environment: 'On-brand workplace setting', targetPersona: 'Culture-first candidate' },
      { label: 'Fast application', scene: 'Low-friction “apply in minutes” message', environment: 'Minimal UI/graphic layout', targetPersona: 'Busy applicant' },
    ],
    free_sample: [
      { label: 'Product hero', scene: 'Free sample offer with product as hero', environment: 'Studio product setup', targetPersona: 'Freebie hunter' },
      { label: 'Limited supply', scene: 'Urgency-driven claim message', environment: 'Clean high-contrast layout', targetPersona: 'Impulse clicker' },
      { label: 'Value proof', scene: 'Benefit/value highlight', environment: 'Premium minimal aesthetic', targetPersona: 'Skeptical but curious' },
    ],
    government_program: [
      { label: 'Eligibility check', scene: 'Simple eligibility CTA', environment: 'Official, calm layout', targetPersona: 'Unsure if eligible' },
      { label: 'Benefits amount', scene: 'Clear benefit highlight', environment: 'Trust-first design', targetPersona: 'Value-driven applicant' },
      { label: 'Trust & legitimacy', scene: 'Legit program reassurance', environment: 'Official document-inspired style', targetPersona: 'Scam-sensitive user' },
    ],
    credit_card: [
      { label: 'Primary offer', scene: 'Core benefit lead (APR/cashback)', environment: 'Premium finance aesthetic', targetPersona: 'Value optimizer' },
      { label: 'Trust & security', scene: 'Trust-building reassurance', environment: 'Minimal, clean design', targetPersona: 'Risk-averse applicant' },
      { label: 'Comparison angle', scene: 'Before/after savings angle', environment: 'Data-led layout', targetPersona: 'Analytical shopper' },
    ],
    lead_gen: [
      { label: 'Instant quote', scene: 'Low-friction CTA', environment: 'Clean CTA-focused layout', targetPersona: 'High-intent shopper' },
      { label: 'Social proof', scene: 'Testimonial-led pitch', environment: 'Trustworthy layout', targetPersona: 'Skeptical prospect' },
      { label: 'Value comparison', scene: 'Savings/benefit comparison', environment: 'Data-led visual', targetPersona: 'Price-sensitive user' },
    ],
    trial_offer: [
      { label: 'Free trial', scene: 'Try-before-you-buy message', environment: 'SaaS/product aesthetic', targetPersona: 'Curious evaluator' },
      { label: 'Feature highlight', scene: 'Single key feature spotlight', environment: 'Minimal product layout', targetPersona: 'Feature-driven shopper' },
      { label: 'Urgency', scene: 'Limited-time trial hook', environment: 'Bold CTA layout', targetPersona: 'Impulse tester' },
    ],
    sweepstakes: [
      { label: 'Prize hero', scene: 'Prize-focused headline', environment: 'Clean celebratory layout', targetPersona: 'Contest entrant' },
      { label: 'Enter fast', scene: 'Low-friction entry CTA', environment: 'Minimal UI/graphic layout', targetPersona: 'Mobile scroller' },
      { label: 'Urgency', scene: 'Limited-time entry hook', environment: 'High-contrast urgency style', targetPersona: 'Impulse clicker' },
    ],
    discount_sale: [
      { label: 'Big discount', scene: 'Offer-first headline', environment: 'Bold sale layout', targetPersona: 'Deal seeker' },
      { label: 'Limited time', scene: 'Urgency-first hook', environment: 'High-contrast layout', targetPersona: 'Impulse buyer' },
      { label: 'Value proof', scene: 'Comparison/value pitch', environment: 'Clean product-led design', targetPersona: 'Value optimizer' },
    ],
    product_launch: [
      { label: 'New arrival', scene: 'New product hook', environment: 'Premium minimal aesthetic', targetPersona: 'Early adopter' },
      { label: 'Key benefit', scene: 'Single benefit spotlight', environment: 'Clean product-led design', targetPersona: 'Problem-aware buyer' },
      { label: 'Brand story', scene: 'Brand-led trust', environment: 'Editorial lifestyle', targetPersona: 'Brand-first shopper' },
    ],
    education: [
      { label: 'Career upgrade', scene: 'Outcome-focused promise', environment: 'Clean optimistic layout', targetPersona: 'Career switcher' },
      { label: 'Scholarship/aid', scene: 'Affordability hook', environment: 'Trust-first design', targetPersona: 'Budget-conscious learner' },
      { label: 'Fast start', scene: 'Start-now CTA', environment: 'Minimal CTA-focused layout', targetPersona: 'Busy learner' },
    ],
    delivery_gig: [
      { label: 'Flexibility', scene: 'Set-your-own-hours hook', environment: 'Clean branded layout', targetPersona: 'Side-hustler' },
      { label: 'Earnings', scene: 'Pay-focused hook', environment: 'Bold benefits layout', targetPersona: 'Income seeker' },
      { label: 'Fast onboarding', scene: 'Start-today CTA', environment: 'Minimal CTA-focused layout', targetPersona: 'Urgent applicant' },
    ],
  };
  const list = contexts[campaignType] || contexts.recruitment;
  return list[idx % list.length];
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

