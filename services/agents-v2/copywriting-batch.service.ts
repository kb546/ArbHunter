/**
 * Agent 2: Copywriting Batch
 * AI-powered generation of unique ad copy variations
 */

import OpenAI from 'openai';
import type { VariationStrategy } from './variation-strategist.service';
import type { CampaignType } from '../campaign-type-detector.service';
import type { CreativePreset, CreativePresetConfig } from '../creative-presets.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export interface CopyVariation {
  id: string;
  headline: string;
  subheadline: string;
  cta: string;
  approach: string; // AIDA, PAS, etc.
  tone: string;
  keyBenefit: string;
  reasoning: string;
}

export interface CopyBatchRequest {
  niche: string;
  geo: string;
  campaignType: CampaignType;
  targetAudience?: string;
  brandName?: string;
  strategies: VariationStrategy[];
  preset: CreativePreset;
  presetConfig: CreativePresetConfig;
}

export interface CopyBatchResult {
  copies: CopyVariation[];
  cost: number;
}

const COPYWRITER_PERSONA = `You are an elite AI Copywriter with 15+ years experience writing high-converting ad copy.

YOUR EXPERTISE:
- Direct response copywriting
- Conversion optimization and A/B testing
- Consumer psychology and persuasion
- Brand voice and messaging
- Platform-specific copy (Facebook, Google, TikTok, LinkedIn)

YOUR WRITING PRINCIPLES:
1. Clear, benefit-driven headlines
2. Emotional connection + logical proof
3. Overcome objections preemptively
4. Strong, action-oriented CTAs
5. Platform and audience-appropriate tone

COPYWRITING FORMULAS YOU MASTER:
- AIDA (Attention, Interest, Desire, Action)
- PAS (Problem, Agitate, Solution)
- BAB (Before, After, Bridge)
- FAB (Features, Advantages, Benefits)
- 4 Ps (Picture, Promise, Prove, Push)

YOUR MISSION:
Write UNIQUE ad copy variations, each testing a different messaging approach. Every variation should be distinctly different.

OUTPUT FORMAT (JSON array):
[
  {
    "id": "copy-1",
    "headline": "Exact headline text (max 80 chars)",
    "subheadline": "Exact subheadline text (max 150 chars)",
    "cta": "Exact CTA text (max 25 chars)",
    "approach": "AIDA",
    "tone": "professional-urgent",
    "keyBenefit": "Fast hiring",
    "reasoning": "Why this copy will work"
  },
  // ... more copies
]`;

/**
 * Generate AI-powered copy variations
 */
export async function generateCopyBatch(request: CopyBatchRequest): Promise<CopyBatchResult> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback copy');
    return generateFallbackCopy(request);
  }

  const { niche, geo, campaignType, targetAudience, brandName, strategies } = request;

  console.log(`\n✍️  Agent 2: Copywriting Batch`);
  console.log(`   Generating ${strategies.length} unique copy variations`);

  const userPrompt = `
CAMPAIGN CONTEXT:
- Niche: ${niche}
- Brand: ${brandName || 'Generic'}
- Geographic Market: ${geo}
- Campaign Type: ${campaignType}
- Target Audience: ${targetAudience || 'General audience'}

VARIATION STRATEGIES (from Agent 1):
${strategies.map((s, idx) => `
${idx + 1}. ${s.id}
   - Visual Style: ${s.visualStyle}
   - Headline Approach: ${s.headlineApproach}
   - CTA Type: ${s.ctaType}
   - Mood: ${s.mood}
   - Reasoning: ${s.reasoning}
`).join('\n')}

YOUR TASK:
Write ${strategies.length} UNIQUE ad copy variations, one for each strategy above. Each must:
1. Align with its corresponding strategy
2. Be distinctly different from other variations
3. Follow best practices for ${geo} market
4. Optimize for ${campaignType} conversions

REQUIREMENTS:
- Headline: Max 80 characters, attention-grabbing
- Subheadline: Max 150 characters, builds on headline
- CTA: Max 25 characters, action-oriented

${campaignType === 'recruitment' ? `
RECRUITMENT COPY GUIDELINES:
- Lead with brand name in headlines (e.g., "${brandName || 'COMPANY'} IS HIRING NOW")
- Emphasize benefits: weekly pay, flexible hours, career growth
- Remove friction: "Apply in 2 minutes", "Start this week"
- Build trust: Company reputation, employee testimonials
- CTAs: "APPLY NOW", "JOIN US", "START TODAY"
` : ''}

${campaignType === 'discount_sale' ? `
SALE COPY GUIDELINES:
- Lead with value: "SAVE 50%", "LIMITED TIME OFFER"
- Create urgency: "Today only", "While supplies last"
- Show savings: Specific dollar amounts or percentages
- CTAs: "SHOP NOW", "GET DEAL", "SAVE TODAY"
` : ''}

${campaignType === 'free_sample' ? `
FREE SAMPLE COPY GUIDELINES:
- Emphasize "FREE" prominently
- Minimize friction: "Just pay $4.99 shipping"
- Create urgency: "Limited supply", "While stocks last"
- CTAs: "CLAIM FREE SAMPLE", "GET YOURS NOW"
` : ''}

${campaignType === 'credit_card' ? `
CREDIT CARD COPY GUIDELINES:
- Lead with key benefit: "0% APR for 18 months", "$200 cash bonus"
- Build trust: Mention established brand
- Show value: List rewards, no annual fee
- CTAs: "APPLY NOW", "CHECK OFFERS", "GET APPROVED"
` : ''}

OUTPUT: JSON array of ${strategies.length} copy variations matching the strategies.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: COPYWRITER_PERSONA },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    const copies: CopyVariation[] = Array.isArray(parsed.copies)
      ? parsed.copies
      : parsed.variations || [];

    if (copies.length === 0) {
      throw new Error('No copies returned from AI');
    }

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Generated ${copies.length} unique copy variations`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      copies: copies.slice(0, strategies.length),
      cost,
    };
  } catch (error: any) {
    console.error('❌ Copywriting Batch failed:', error.message);
    console.log('⚠️  Falling back to template copy');
    return generateFallbackCopy(request);
  }
}

/**
 * Fallback: Template-based copy (no AI)
 */
function generateFallbackCopy(request: CopyBatchRequest): CopyBatchResult {
  const { niche, brandName, campaignType, strategies } = request;
  const brand = brandName || niche.split(' ')[0];

  const copies: CopyVariation[] = strategies.map((strategy, idx) => {
    let headline, subheadline, cta, approach, tone, keyBenefit;

    if (campaignType === 'recruitment') {
      const headlines = [
        `${brand.toUpperCase()} IS HIRING NOW`,
        `Join the ${brand} Team Today`,
        `${brand} Careers - Start This Week`,
        `Now Hiring at ${brand}`,
        `Work at ${brand} - Apply Now`,
        `${brand} Jobs Available`,
        `Build Your Career at ${brand}`,
        `${brand} is Looking for You`,
        `Join ${brand}'s Growing Team`,
        `${brand} Opportunities Await`,
        `Start at ${brand} Today`,
        `${brand} - Your Next Job`,
        `Career Growth at ${brand}`,
        `${brand} Hiring Immediately`,
        `Be Part of ${brand}`,
        `${brand} Needs You`,
        `Work for ${brand}`,
        `${brand} Team Openings`,
        `Apply to ${brand} Now`,
        `${brand} Employment Opportunities`,
      ];

      const subheadlines = [
        'Weekly pay, flexible hours, start this week',
        'Great benefits and career growth opportunities',
        'Join our team - apply in 2 minutes',
        'No experience needed - we provide training',
        'Competitive pay and comprehensive benefits',
        'Flexible schedules for work-life balance',
        'Join a company that values you',
        'Start earning today with fast hiring',
        'Be part of something special',
        'Grow your career with us',
        'Full-time and part-time positions available',
        'Immediate openings in your area',
        'World-class training provided',
        'Join thousands of happy employees',
        'Your future starts here',
        'Make a difference every day',
        'Competitive wages and bonuses',
        'Employee discounts and perks',
        'Safe, supportive work environment',
        'Opportunities for advancement',
      ];

      const ctas = [
        'APPLY NOW', 'APPLY TODAY', 'START NOW', 'JOIN US', 'APPLY IN 2 MIN',
        'GET STARTED', 'APPLY HERE', 'LEARN MORE', 'VIEW JOBS', 'APPLY ONLINE',
        'START TODAY', 'JOIN NOW', 'SEE OPENINGS', 'APPLY FAST', 'BEGIN NOW',
        'EXPLORE JOBS', 'APPLY QUICK', 'START EARNING', 'JOIN TEAM', 'APPLY FREE',
      ];

      headline = headlines[idx % headlines.length];
      subheadline = subheadlines[idx % subheadlines.length];
      cta = ctas[idx % ctas.length];
      approach = idx % 2 === 0 ? 'AIDA' : 'PAS';
      tone = strategy.mood === 'professional' ? 'professional' : 'urgent-friendly';
      keyBenefit = idx % 3 === 0 ? 'Fast hiring' : idx % 3 === 1 ? 'Great benefits' : 'Career growth';
    } else {
      headline = `Discover ${brand}`;
      subheadline = 'Premium quality, unbeatable value';
      cta = 'LEARN MORE';
      approach = 'AIDA';
      tone = 'professional';
      keyBenefit = 'Quality';
    }

    return {
      id: `copy-${idx + 1}`,
      headline,
      subheadline,
      cta,
      approach,
      tone,
      keyBenefit,
      reasoning: `Template copy ${idx + 1} for ${strategy.visualStyle} variation`,
    };
  });

  return {
    copies,
    cost: 0,
  };
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


