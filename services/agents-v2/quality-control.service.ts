/**
 * Agent 5: Quality Control
 * AI-powered scoring and quality assessment of generated ads
 */

import OpenAI from 'openai';
import type { VariationStrategy } from './variation-strategist.service';
import type { CopyVariation } from './copywriting-batch.service';
import type { VisualDesign } from './visual-designer-v2.service';
import type { CampaignType } from '../campaign-type-detector.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export interface QualityScoresV3 {
  visualScore: number;
  brandScore: number;
  textScore: number;
  overallScore: number;
}

export interface QualityAssessment {
  id: string;
  overallScore: number; // 1-100
  visualScore: number; // 1-100
  brandScore: number; // 1-100
  textScore: number; // 1-100
  emotionalScore: number; // 1-100
  predictedCTR: number; // percentage
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reasoning: string;
}

export interface ABTestRecommendation {
  variationA: string; // ID
  variationB: string; // ID
  hypothesis: string;
  expectedLearning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface QualityControlRequest {
  niche: string;
  geo: string;
  campaignType: CampaignType;
  strategies: VariationStrategy[];
  copies: CopyVariation[];
  designs: VisualDesign[];
  imageUrls?: string[]; // Optional: actual generated images for visual analysis
}

export interface QualityControlResult {
  assessments: QualityAssessment[];
  abTestPairs: ABTestRecommendation[];
  bestVariationId: string;
  cost: number;
}

const QUALITY_CONTROL_PERSONA = `You are an elite AI Quality Control Specialist with 15+ years experience in advertising creative assessment.

YOUR EXPERTISE:
- Ad creative evaluation and scoring
- Click-through rate (CTR) prediction
- Visual hierarchy assessment
- Brand consistency analysis
- Copy effectiveness evaluation
- A/B testing methodology
- Platform-specific optimization (Facebook, Instagram, Google)

YOUR EVALUATION FRAMEWORK:

1. VISUAL SCORE (1-100):
   - Composition and layout quality
   - Visual hierarchy effectiveness
   - Color theory application
   - Design balance and spacing
   - Thumb-stopping power

2. BRAND SCORE (1-100):
   - Brand identity consistency
   - Logo placement and visibility
   - Brand color usage
   - Professional quality
   - Trust and credibility signals

3. TEXT SCORE (1-100):
   - Headline effectiveness
   - Copy clarity and persuasion
   - CTA strength
   - Readability on mobile
   - Message hierarchy

4. EMOTIONAL SCORE (1-100):
   - Emotional resonance
   - Motivation to act
   - Relevance to audience
   - Mood alignment
   - Desire creation

5. CTR PREDICTION:
   - Historical benchmarks
   - Platform averages
   - Industry standards
   - Creative quality indicators
   - Target audience fit

YOUR MISSION:
Assess each ad variation and provide actionable insights for optimization and A/B testing.

OUTPUT FORMAT (JSON object):
{
  "assessments": [
    {
      "id": "variation-1",
      "overallScore": 85,
      "visualScore": 88,
      "brandScore": 90,
      "textScore": 82,
      "emotionalScore": 80,
      "predictedCTR": 4.5,
      "strengths": ["Strong headline", "Excellent brand consistency"],
      "weaknesses": ["CTA could be more urgent"],
      "recommendations": ["Test more urgent CTA", "Increase contrast"],
      "reasoning": "Detailed explanation..."
    }
  ],
  "abTestPairs": [
    {
      "variationA": "variation-1",
      "variationB": "variation-3",
      "hypothesis": "Bold visuals vs. minimal design",
      "expectedLearning": "Which visual style drives higher CTR",
      "priority": "high"
    }
  ],
  "bestVariationId": "variation-1"
}`;

/**
 * AI-powered quality control and assessment
 */
export async function assessQuality(request: QualityControlRequest): Promise<QualityControlResult> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using heuristic scoring');
    return generateHeuristicScores(request);
  }

  const { niche, geo, campaignType, strategies, copies, designs } = request;

  console.log(`\n✅ Agent 5: Quality Control`);
  console.log(`   Assessing ${strategies.length} ad variations`);

  const userPrompt = `
CAMPAIGN CONTEXT:
- Niche: ${niche}
- Geographic Market: ${geo}
- Campaign Type: ${campaignType}

AD VARIATIONS TO ASSESS:
${strategies.map((s, idx) => `
─────────────────────────────────────
VARIATION ${idx + 1} (${s.id}):

STRATEGY:
- Visual Style: ${s.visualStyle}
- Headline Approach: ${s.headlineApproach}
- CTA Type: ${s.ctaType}
- Mood: ${s.mood}
- Layout: ${s.layout}
- Reasoning: ${s.reasoning}

COPY:
- Headline: "${copies[idx]?.headline || 'N/A'}"
- Subheadline: "${copies[idx]?.subheadline || 'N/A'}"
- CTA: "${copies[idx]?.cta || 'N/A'}"
- Approach: ${copies[idx]?.approach || 'N/A'}
- Tone: ${copies[idx]?.tone || 'N/A'}
- Key Benefit: ${copies[idx]?.keyBenefit || 'N/A'}

VISUAL DESIGN:
- Category: ${designs[idx]?.visualCategory || 'N/A'}
- Main Element: ${designs[idx]?.mainElement.description || 'N/A'}
- Background: ${designs[idx]?.background.description || 'N/A'}
- Logo: ${designs[idx]?.logoPlacement.description || 'N/A'}
- Text Layout: ${designs[idx]?.textLayout.description || 'N/A'}
- Composition: ${designs[idx]?.composition.rule || 'N/A'}
- Lighting: ${designs[idx]?.lighting.description || 'N/A'}
- Mood: ${designs[idx]?.mood || 'N/A'}
`).join('\n')}

YOUR TASK:
1. Assess each variation using your expertise
2. Score on 5 dimensions (1-100): visual, brand, text, emotional, overall
3. Predict CTR (%) based on quality indicators
4. Identify strengths and weaknesses
5. Provide specific recommendations
6. Recommend 3-5 high-value A/B test pairs
7. Identify the best overall variation

SCORING GUIDELINES:

CTR BENCHMARKS (${campaignType}):
- Excellent: 5-8%
- Good: 3-5%
- Average: 1.5-3%
- Poor: <1.5%

Consider:
- ${geo} market preferences
- ${campaignType} campaign best practices
- Mobile-first design (1080x1080)
- Platform: Facebook/Instagram feed

A/B TEST PAIR SELECTION:
- Test distinctly different approaches
- Prioritize high-impact variables
- Focus on learnings, not just wins
- Suggest 3-5 pairs maximum

OUTPUT: Complete JSON assessment of all ${strategies.length} variations with A/B test recommendations.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: QUALITY_CONTROL_PERSONA },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    const assessments: QualityAssessment[] = Array.isArray(parsed.assessments)
      ? parsed.assessments
      : [];

    const abTestPairs: ABTestRecommendation[] = Array.isArray(parsed.abTestPairs)
      ? parsed.abTestPairs
      : [];

    const bestVariationId = parsed.bestVariationId || assessments[0]?.id || 'variation-1';

    if (assessments.length === 0) {
      throw new Error('No assessments returned from AI');
    }

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Completed quality assessment of ${assessments.length} variations`);
    console.log(`🏆 Best variation: ${bestVariationId}`);
    console.log(`🧪 Recommended ${abTestPairs.length} A/B test pairs`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      assessments: assessments.slice(0, strategies.length),
      abTestPairs,
      bestVariationId,
      cost,
    };
  } catch (error: any) {
    console.error('❌ Quality Control failed:', error.message);
    console.log('⚠️  Falling back to heuristic scoring');
    return generateHeuristicScores(request);
  }
}

/**
 * Fallback: Heuristic-based scoring (no AI)
 */
function generateHeuristicScores(request: QualityControlRequest): QualityControlResult {
  const { strategies, copies, designs } = request;

  const assessments: QualityAssessment[] = strategies.map((strategy, idx) => {
    const copy = copies[idx];
    const design = designs[idx];

    // Heuristic scoring based on best practices
    let visualScore = 75;
    if (design?.composition.rule === 'rule-of-thirds') visualScore += 5;
    if (design?.colorGrading.contrast === 'high') visualScore += 5;
    if (design?.composition.whitespace === 'balanced') visualScore += 5;
    visualScore = Math.min(100, visualScore + Math.random() * 10);

    let brandScore = 80;
    if (design?.logoPlacement.size === 'medium') brandScore += 5;
    if (design?.background.primaryColor) brandScore += 5;
    brandScore = Math.min(100, brandScore + Math.random() * 10);

    let textScore = 75;
    if (copy?.headline && copy.headline.length < 80) textScore += 5;
    if (copy?.cta && copy.cta.length < 25) textScore += 5;
    if (copy?.approach === 'AIDA' || copy?.approach === 'PAS') textScore += 5;
    textScore = Math.min(100, textScore + Math.random() * 10);

    let emotionalScore = 75;
    if (strategy.mood === 'professional' || strategy.mood === 'trustworthy') emotionalScore += 5;
    if (copy?.keyBenefit) emotionalScore += 5;
    emotionalScore = Math.min(100, emotionalScore + Math.random() * 10);

    const overallScore = (visualScore + brandScore + textScore + emotionalScore) / 4;

    // CTR prediction based on overall quality
    let predictedCTR = 2.5; // baseline
    if (overallScore > 85) predictedCTR += 2.5;
    else if (overallScore > 75) predictedCTR += 1.5;
    predictedCTR += Math.random() * 1.5;

    const strengths = [
      strategy.visualStyle === 'bold' ? 'Attention-grabbing visual style' : 'Clean, professional design',
      copy?.headline ? 'Strong headline' : 'Clear messaging',
      design?.composition.rule ? `Good use of ${design.composition.rule}` : 'Well-composed layout',
    ];

    const weaknesses = [
      overallScore < 80 ? 'Could improve visual impact' : null,
      textScore < 80 ? 'Copy could be more compelling' : null,
    ].filter(Boolean) as string[];

    const recommendations = [
      'Test different CTA wording',
      'Consider A/B testing color scheme',
      'Experiment with headline approaches',
    ];

    return {
      id: `variation-${idx + 1}`,
      overallScore: parseFloat(overallScore.toFixed(1)),
      visualScore: parseFloat(visualScore.toFixed(1)),
      brandScore: parseFloat(brandScore.toFixed(1)),
      textScore: parseFloat(textScore.toFixed(1)),
      emotionalScore: parseFloat(emotionalScore.toFixed(1)),
      predictedCTR: parseFloat(predictedCTR.toFixed(1)),
      strengths,
      weaknesses,
      recommendations,
      reasoning: `Heuristic assessment based on ${strategy.visualStyle} visual style with ${copy?.approach || 'standard'} copy approach`,
    };
  });

  // Sort by overall score
  assessments.sort((a, b) => b.overallScore - a.overallScore);

  // Generate A/B test pairs
  const abTestPairs: ABTestRecommendation[] = [];
  if (assessments.length >= 2) {
    abTestPairs.push({
      variationA: assessments[0].id,
      variationB: assessments[1].id,
      hypothesis: 'Best performer vs. second best',
      expectedLearning: 'Validate which creative approach drives higher CTR',
      priority: 'high',
    });
  }
  if (assessments.length >= 4) {
    abTestPairs.push({
      variationA: assessments[0].id,
      variationB: assessments[3].id,
      hypothesis: 'Top performer vs. experimental approach',
      expectedLearning: 'Test if bold experiment outperforms safe bet',
      priority: 'medium',
    });
  }

  return {
    assessments,
    abTestPairs,
    bestVariationId: assessments[0].id,
    cost: 0,
  };
}

/**
 * Convert QualityAssessment to QualityScoresV3 for API response
 */
export function convertToQualityScoresV3(assessment: QualityAssessment): QualityScoresV3 {
  return {
    visualScore: assessment.visualScore,
    brandScore: assessment.brandScore,
    textScore: assessment.textScore,
    overallScore: assessment.overallScore,
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

