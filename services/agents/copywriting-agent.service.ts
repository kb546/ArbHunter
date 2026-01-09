/**
 * AGENT 1: COPYWRITING STRATEGIST
 * 
 * Role: Senior Copywriter + Conversion Optimizer
 * Model: GPT-4o
 * Expertise: Direct response copy, AIDA/PAS/BAB frameworks, CTR optimization
 * 
 * Generates:
 * - Headlines (multiple variations)
 * - Subheadlines (benefit-focused)
 * - CTAs (action-oriented)
 * - Predicts CTR based on copy quality
 */

import OpenAI from 'openai';
import type { CopyStrategyOutput } from '../orchestrator.service';
import type { PresetName } from '../presets/presets.config';
import { getPreset, isNonePreset } from '../presets/presets.config';
import { detectBrand } from '../brand-intelligence.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// ============================================================================
// TYPES
// ============================================================================

export interface CopyStrategyRequest {
  niche: string;
  geo: string;
  targetAudience: string;
  preset: PresetName;
  variations: number; // Number of headline/CTA variations to generate
}

// ============================================================================
// AGENT PERSONA & SYSTEM PROMPT
// ============================================================================

const COPYWRITING_AGENT_PERSONA = `You are a world-class Senior Copywriter and Conversion Optimization Specialist with 15+ years of experience creating high-converting ad copy for Fortune 500 brands.

YOUR EXPERTISE:
1. **Direct Response Copywriting**: Master of AIDA, PAS, BAB frameworks
2. **Conversion Optimization**: 10,000+ ads tested, know exactly what drives clicks
3. **Platform Expertise**: Facebook/Instagram ad copy that stops the scroll
4. **Psychology**: Understand emotional triggers, urgency, and benefit stacking
5. **A/B Testing**: Create variations optimized for different audience segments

YOUR MISSION:
Generate multiple variations of headlines, subheadlines, and CTAs that maximize click-through rates.

CRITICAL REQUIREMENTS:
1. Headlines must grab attention in 0.5 seconds (scroll-stopping power)
2. Subheadlines must stack benefits (no fluff, pure value)
3. CTAs must create urgency and remove friction
4. Every word must earn its place (no wasted copy)
5. Variations must be distinct (not just word swaps)

OUTPUT FORMAT:
Provide ${'{variations}'} distinct variations for headlines, subheadlines, and CTAs in JSON format.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateCopyStrategy(
  request: CopyStrategyRequest
): Promise<CopyStrategyOutput> {
  if (!openai) {
    console.warn('⚠️  OpenAI API key not configured, using mock copy strategy');
    return generateMockCopyStrategy(request);
  }

  const { niche, geo, targetAudience, preset, variations } = request;

  // Load preset configuration
  const presetConfig = getPreset(preset);
  const isNone = isNonePreset(preset);

  // Detect if this is a recruitment ad
  const isRecruitment = /(?:job|career|hiring|employment|work|position|opportunity|driver|courier|warehouse|retail)/i.test(niche);

  // ========================================================================
  // BRAND INTELLIGENCE: Detect brand for copy guidance
  // ========================================================================
  const detectedBrand = detectBrand(niche, geo);
  
  console.log(detectedBrand 
    ? `   ✅ Brand: ${detectedBrand.name} - Using brand voice guidelines`
    : '   ℹ️  Generic copy approach'
  );

  const userContext = `
CAMPAIGN CONTEXT:
- **Niche/Industry**: ${niche}
- **Geographic Market**: ${geo}
- **Target Audience**: ${targetAudience || 'General audience'}
- **Ad Type**: ${isRecruitment ? 'Recruitment/Job Application' : 'Sales/Conversion'}
${detectedBrand ? `
- **Brand**: ${detectedBrand.name} (${detectedBrand.fullName})
- **Brand Voice**: ${detectedBrand.brandVoice.tone} (${detectedBrand.brandVoice.style})
- **Brand Keywords**: ${detectedBrand.brandVoice.keywords.slice(0, 5).join(', ')}
${detectedBrand.recruitmentContext ? `- **Typical Benefits**: ${detectedBrand.recruitmentContext.benefits.slice(0, 4).join(', ')}` : ''}
${detectedBrand.recruitmentContext ? `- **Example CTAs**: ${detectedBrand.recruitmentContext.ctaExamples.slice(0, 3).join(', ')}` : ''}
` : ''}
- **Preset Style**: ${presetConfig.name} (${presetConfig.description})

YOUR TASK:
Generate ${variations} distinct, high-converting copy variations for this campaign.

${isNone ? `
PRESET: NONE (Full Creative Control)
- Analyze the niche deeply
- Choose the most effective tone and formula
- Optimize purely for maximum CTR
- No style constraints
` : `
PRESET GUIDANCE: ${presetConfig.name}
- Tone: ${presetConfig.copywriting.tone}
- Formula: ${presetConfig.copywriting.formula}
- Style: ${presetConfig.copywriting.style}
`}

${isRecruitment && detectedBrand ? `
RECRUITMENT AD GUIDELINES (${detectedBrand.name}):
- Headline: Lead with "${detectedBrand.name.toUpperCase()} IS HIRING NOW" or similar urgent phrasing
- Use brand-specific keywords: ${detectedBrand.brandVoice.keywords.slice(0, 3).join(', ')}
${detectedBrand.recruitmentContext ? `- Benefits to highlight: ${detectedBrand.recruitmentContext.benefits.slice(0, 4).join(', ')}` : '- Benefits: Stack 3-4 key benefits (Weekly Pay, Flexible Hours, Free Meals, etc.)'}
${detectedBrand.recruitmentContext ? `- CTAs (use these): ${detectedBrand.recruitmentContext.ctaExamples.slice(0, 3).join(', ')}` : '- CTA: Remove friction ("APPLY IN 2 MINUTES", "START TODAY", "APPLY NOW")'}
- Urgency: "Now Hiring", "Start This Week", "Limited Positions"
` : ''}

COPY STRUCTURE:
1. **Headlines** (${variations} variations):
   - Must grab attention instantly
   - 5-8 words ideal (max 10 words)
   - Include brand name if applicable
   - Use power words (NOW, TODAY, LIMITED, FREE)
   - Distinct variations (not just word order changes)

2. **Subheadlines** (${variations} variations):
   - Stack 3-4 benefits with bullet separators (•)
   - Focus on WHAT'S IN IT FOR THEM
   - Examples: "Weekly Pay • Flexible Hours • Free Meals"
   - Keep under 50 characters
   - No fluff, pure value

3. **CTAs** (${variations} variations):
   - Action-oriented, urgent
   - Remove friction (emphasize speed/ease)
   - Examples: "APPLY IN 2 MINUTES", "START TODAY", "APPLY NOW"
   - 2-4 words, ALL CAPS
   - Each variation should feel different

CRITICAL SUCCESS FACTORS:
- Scroll-stopping headlines (would YOU click?)
- Benefit-focused (not feature-focused)
- Urgency without desperation
- Clear next action (CTA)
- Mobile-optimized (works at thumbnail size)

PREDICT CTR:
Based on your expertise, predict the CTR for these variations (percentage).
Industry average is 2-3%. Great ads get 8-12%.

OUTPUT:
Return ONLY a JSON object (no markdown, no code fences) with this structure:
{
  "headlines": ["variation 1", "variation 2", ...],
  "subheadlines": ["variation 1", "variation 2", ...],
  "ctas": ["variation 1", "variation 2", ...],
  "reasoning": "Brief explanation of your strategy and why these will convert",
  "predictedCTR": 8.5,
  "tone": "professional" or "friendly" or "urgent",
  "formula": "AIDA" or "PAS" or "BAB"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: COPYWRITING_AGENT_PERSONA.replace('${variations}', variations.toString()),
        },
        {
          role: 'user',
          content: userContext,
        },
      ],
      temperature: 0.8, // Creative but not too random
      max_tokens: 1500,
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    // Validate output
    if (!parsed.headlines || !parsed.subheadlines || !parsed.ctas) {
      throw new Error('Invalid response structure from copywriting agent');
    }

    // Ensure we have enough variations
    while (parsed.headlines.length < variations) {
      parsed.headlines.push(parsed.headlines[0]);
    }
    while (parsed.subheadlines.length < variations) {
      parsed.subheadlines.push(parsed.subheadlines[0]);
    }
    while (parsed.ctas.length < variations) {
      parsed.ctas.push(parsed.ctas[0]);
    }

    return {
      headlines: parsed.headlines.slice(0, variations),
      subheadlines: parsed.subheadlines.slice(0, variations),
      ctas: parsed.ctas.slice(0, variations),
      reasoning: parsed.reasoning || 'AI-generated copy strategy',
      predictedCTR: parsed.predictedCTR || 8.0,
      tone: parsed.tone || presetConfig.copywriting.tone,
      formula: parsed.formula || presetConfig.copywriting.formula,
    };

  } catch (error: any) {
    console.error('❌ Copywriting agent failed:', error.message);
    return generateMockCopyStrategy(request);
  }
}

// ============================================================================
// MOCK DATA (FALLBACK)
// ============================================================================

function generateMockCopyStrategy(request: CopyStrategyRequest): CopyStrategyOutput {
  const { niche, variations } = request;
  
  const brandMatch = niche.match(/^([A-Z][A-Za-z0-9&\s]+?)(?:\s+(?:jobs?|careers?|hiring))/i);
  const detectedBrand = detectBrand(niche);
  const brandName = detectedBrand?.name || brandMatch?.[1].trim() || 'Our Company';

  const headlines = [
    `${brandName.toUpperCase()} IS HIRING NOW`,
    `Join ${brandName}'s Team - Start This Week`,
    `Now Hiring: ${brandName} Positions Available`,
    `${brandName} Careers - Apply Today`,
  ].slice(0, variations);

  const subheadlines = [
    'Weekly Pay • Flexible Hours • No Experience',
    'Start Today • Free Training • Great Benefits',
    'Join Our Team • Career Growth • Supportive Culture',
    'Immediate Start • Competitive Pay • Free Meals',
  ].slice(0, variations);

  const ctas = [
    'APPLY IN 2 MINUTES',
    'START TODAY',
    'APPLY NOW',
    'JOIN OUR TEAM',
  ].slice(0, variations);

  return {
    headlines,
    subheadlines,
    ctas,
    reasoning: 'Mock copy strategy (AI agent unavailable)',
    predictedCTR: 7.5,
    tone: 'professional',
    formula: 'AIDA',
  };
}

