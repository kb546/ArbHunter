/**
 * AGENT 2: CREATIVE DIRECTOR
 * 
 * Role: Senior Creative Director + Brand Strategist
 * Model: GPT-4o
 * Expertise: Visual strategy, brand positioning, creative concepts, color psychology
 * 
 * Generates:
 * - Creative concept
 * - Visual hierarchy (what draws eye first, second, third)
 * - Color strategy (psychology + brand accuracy)
 * - Composition rules
 * - Emotional positioning
 */

import OpenAI from 'openai';
import type { CreativeDirectionOutput } from '../orchestrator.service';
import type { PresetName } from '../presets/presets.config';
import { getPreset, isNonePreset } from '../presets/presets.config';
import { detectBrand, type BrandData } from '../brand-intelligence.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// ============================================================================
// TYPES
// ============================================================================

export interface CreativeDirectionRequest {
  niche: string;
  geo: string;
  targetAudience: string;
  preset: PresetName;
}

// ============================================================================
// BRAND COLOR DATABASE
// ============================================================================

const BRAND_COLORS: Record<string, { primary: string; secondary: string; accent?: string }> = {
  'kfc': { primary: '#E30613', secondary: '#FFFFFF', accent: '#FFD700' },
  'mcdonalds': { primary: '#FFD700', secondary: '#E30613' },
  'mcdonald': { primary: '#FFD700', secondary: '#E30613' },
  'dhl': { primary: '#FFCC00', secondary: '#D40511' },
  'walmart': { primary: '#0071CE', secondary: '#FFC220' },
  'amazon': { primary: '#FF9900', secondary: '#000000' },
  'target': { primary: '#CC0000', secondary: '#FFFFFF' },
  'starbucks': { primary: '#00704A', secondary: '#FFFFFF' },
  'ups': { primary: '#351C15', secondary: '#FFB500' },
  'fedex': { primary: '#4D148C', secondary: '#FF6600' },
  'subway': { primary: '#00853F', secondary: '#FFC600' },
  'dominos': { primary: '#0066CC', secondary: '#E31837' },
  'pizza hut': { primary: '#EE3124', secondary: '#00A160' },
  'wendys': { primary: '#E11B2A', secondary: '#FFFFFF' },
  'burger king': { primary: '#F2A900', secondary: '#E31837' },
  'taco bell': { primary: '#702082', secondary: '#FFFFFF' },
};

// ============================================================================
// AGENT PERSONA & SYSTEM PROMPT
// ============================================================================

const CREATIVE_DIRECTOR_PERSONA = `You are a world-class Senior Creative Director with 15+ years of experience at top advertising agencies (Droga5, Wieden+Kennedy, BBDO).

YOUR EXPERTISE:
1. **Visual Strategy**: Master of composition, visual hierarchy, attention flow
2. **Brand Positioning**: Expert in brand identity, color psychology, emotional resonance
3. **Color Theory**: Deep understanding of color psychology and brand consistency
4. **Creative Concepts**: Generate scroll-stopping ideas that convert
5. **Platform Optimization**: Know exactly what works on Facebook/Instagram feeds

YOUR MISSION:
Define the creative direction for this ad campaign that maximizes visual impact and brand alignment.

CRITICAL REQUIREMENTS:
1. Visual hierarchy must guide the eye (headline → product → CTA)
2. Colors must align with brand + psychology + platform performance
3. Concept must be scroll-stopping yet authentic
4. Composition must work at thumbnail size (300x300px)
5. Everything must support the conversion goal

OUTPUT FORMAT:
Provide creative direction in JSON format with concept, visual hierarchy, color strategy, composition rules, and emotional positioning.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateCreativeDirection(
  request: CreativeDirectionRequest
): Promise<CreativeDirectionOutput> {
  if (!openai) {
    console.warn('⚠️  OpenAI API key not configured, using mock creative direction');
    return generateMockCreativeDirection(request);
  }

  const { niche, geo, targetAudience, preset } = request;

  // Load preset configuration
  const presetConfig = getPreset(preset);
  const isNone = isNonePreset(preset);

  // ========================================================================
  // BRAND INTELLIGENCE: Detect brand and get full brand data
  // ========================================================================
  const detectedBrand = detectBrand(niche, geo);
  
  console.log(detectedBrand 
    ? `   ✅ Brand Intelligence: ${detectedBrand.name} (${detectedBrand.industry})`
    : '   ℹ️  No brand detected, using generic creative direction'
  );

  // Detect ad type
  const isRecruitment = /(?:job|career|hiring|employment|work|position|opportunity)/i.test(niche);

  // Build context for the agent
  const userContext = `
CAMPAIGN CONTEXT:
- **Niche/Industry**: ${niche}
- **Geographic Market**: ${geo}
- **Target Audience**: ${targetAudience || 'General audience'}
- **Ad Type**: ${isRecruitment ? 'Recruitment/Job Application' : 'Sales/Conversion'}
${detectedBrand ? `
- **Brand**: ${detectedBrand.name} (${detectedBrand.fullName})
- **Industry**: ${detectedBrand.industry}
- **Official Colors**: Primary ${detectedBrand.colorNames.primary}, Secondary ${detectedBrand.colorNames.secondary}
- **Logo**: ${detectedBrand.logo.description}
${detectedBrand.uniform ? `- **Uniform**: ${detectedBrand.uniform.description}` : ''}
- **Visual Assets**: ${detectedBrand.visualAssets.slice(0, 3).join(', ')}
- **Brand Voice**: ${detectedBrand.brandVoice.tone} (${detectedBrand.brandVoice.style})
` : ''}
- **Preset Style**: ${presetConfig.name} (${presetConfig.description})

YOUR TASK:
Define the creative direction that will make this ad scroll-stopping and high-converting.

${isNone ? `
PRESET: NONE (Full Creative Control)
- Pure brand analysis
- Choose optimal visual strategy
- No style constraints
- Maximum impact focus
` : `
PRESET GUIDANCE: ${presetConfig.name}
- Concept: ${presetConfig.creativeDirection.concept}
- Mood: ${presetConfig.creativeDirection.mood}
- Aesthetic: ${presetConfig.creativeDirection.aesthetic}
- Background: ${presetConfig.graphicDesign.background}
- Lighting: ${presetConfig.graphicDesign.lighting}
`}

${isRecruitment && detectedBrand ? `
RECRUITMENT AD CONSIDERATIONS:
- Product focus: ${detectedBrand.name} branded uniform or product on hanger
- Trust signals: Professional, corporate-approved aesthetic
- Goal: Convert job seekers → applicants (remove friction)
- Key elements: ${detectedBrand.uniform?.description || 'Product/uniform'}, ${detectedBrand.name} logo, clean professional look
- Brand colors MUST be used: ${detectedBrand.colorNames.primary} and ${detectedBrand.colorNames.secondary}
${detectedBrand.recruitmentContext ? `- Positions: ${detectedBrand.recruitmentContext.positions.slice(0, 3).join(', ')}` : ''}
` : ''}

CREATIVE DIRECTION STRUCTURE:

1. **Concept** (1-2 sentences):
   - Big idea that ties everything together
   - Example: "Premium Employer Branding - Apple Store Aesthetic"
   - Must be instantly understandable and aspirational

2. **Visual Hierarchy** (ordered list, 3-4 items):
   - What draws the eye FIRST, SECOND, THIRD
   - Example: ["1st: Headline (bold, red, top 20%)", "2nd: Product (uniform, center 50%)", "3rd: CTA button (yellow, bottom 20%)"]
   - Must create natural Z-pattern or F-pattern reading flow

3. **Color Strategy** (object with primary, secondary, background, reasoning):
   - Primary: Main brand color (use official colors if available)
   - Secondary: Accent/CTA color
   - Background: Canvas color
   - Reasoning: Why these colors (psychology + brand + platform)
   ${detectedBrand ? `- CRITICAL: Use official ${detectedBrand.name} colors: ${detectedBrand.colors.primary}, ${detectedBrand.colors.secondary}${detectedBrand.colors.accent ? `, ${detectedBrand.colors.accent}` : ''}` : ''}

4. **Composition Rules** (array of 3-5 rules):
   - Specific layout guidelines
   - Example: ["Rule of thirds: Product at vertical center", "40% negative space for breathability", "Z-pattern reading flow"]
   - Must be actionable for graphic designer

5. **Emotional Tone** (1-2 words):
   - Primary emotion to evoke
   - Example: "Aspirational yet accessible", "Urgent and exciting"

6. **Target Emotion** (1 sentence):
   - What should viewer FEEL after seeing this?
   - Example: "Excitement about joining a premium employer + trust in the opportunity"

${detectedBrand ? `
7. **Brand Guidelines** (object):
   - brandName: "${detectedBrand.name}"
   - officialColors: ["${detectedBrand.colors.primary}", "${detectedBrand.colors.secondary}"${detectedBrand.colors.accent ? `, "${detectedBrand.colors.accent}"` : ''}]
   - logoRequirements: "Official ${detectedBrand.name} logo, high-resolution, brand-accurate - ${detectedBrand.logo.description}"
` : ''}

COLOR PSYCHOLOGY REFERENCE:
- Red (#E30613): Energy, urgency, appetite, action
- Yellow/Gold (#FFD700): Optimism, warmth, attention, affordability
- Blue (#0071CE): Trust, stability, professional, corporate
- Green (#00704A): Growth, health, eco-friendly, fresh
- Black (#000000): Premium, luxury, sophistication, authority
- White (#FFFFFF): Clean, pure, minimal, high-trust

PLATFORM OPTIMIZATION (Facebook/Instagram):
- Must work at thumbnail size (300x300px)
- High contrast for scroll-stopping power
- Clear focal point (single hero element)
- Mobile-first (70% of traffic)

OUTPUT:
Return ONLY a JSON object (no markdown, no code fences) with this structure:
{
  "concept": "Brief concept description",
  "visualHierarchy": ["1st: element", "2nd: element", "3rd: element"],
  "colorStrategy": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "background": "#HEX",
    "reasoning": "Why these colors work"
  },
  "compositionRules": ["rule 1", "rule 2", "rule 3"],
  "emotionalTone": "tone description",
  "targetEmotion": "what viewer should feel",
  "brandGuidelines": {
    "brandName": "Brand Name",
    "officialColors": ["#HEX", "#HEX"],
    "logoRequirements": "logo specs"
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: CREATIVE_DIRECTOR_PERSONA,
        },
        {
          role: 'user',
          content: userContext,
        },
      ],
      temperature: 0.7, // Balanced creativity
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    // Validate and return
    return {
      concept: parsed.concept || 'Professional Brand-Focused Creative',
      visualHierarchy: parsed.visualHierarchy || ['1st: Headline', '2nd: Product', '3rd: CTA'],
      colorStrategy: {
        primary: parsed.colorStrategy?.primary || (detectedBrand?.colors.primary || '#E30613'),
        secondary: parsed.colorStrategy?.secondary || (detectedBrand?.colors.secondary || '#FFD700'),
        background: parsed.colorStrategy?.background || (detectedBrand?.colors.background || '#FFFFFF'),
        reasoning: parsed.colorStrategy?.reasoning || 'Brand-aligned color strategy',
      },
      compositionRules: parsed.compositionRules || ['Centered composition', '40% negative space', 'Z-pattern flow'],
      emotionalTone: parsed.emotionalTone || 'Professional and aspirational',
      targetEmotion: parsed.targetEmotion || 'Trust and excitement',
      brandGuidelines: parsed.brandGuidelines || (detectedBrand ? {
        brandName: detectedBrand.name,
        officialColors: [detectedBrand.colors.primary, detectedBrand.colors.secondary].filter(Boolean),
        logoRequirements: `Official ${detectedBrand.name} logo, high-resolution - ${detectedBrand.logo.description}`,
      } : undefined),
    };

  } catch (error: any) {
    console.error('❌ Creative Director agent failed:', error.message);
    return generateMockCreativeDirection(request);
  }
}

// ============================================================================
// MOCK DATA (FALLBACK)
// ============================================================================

function generateMockCreativeDirection(request: CreativeDirectionRequest): CreativeDirectionOutput {
  const { niche } = request;
  
  const detectedBrand = detectBrand(niche);
  const brand = detectedBrand?.name || null;
  const officialColors = detectedBrand ? {
    primary: detectedBrand.colors.primary,
    secondary: detectedBrand.colors.secondary,
    accent: detectedBrand.colors.accent
  } : null;

  return {
    concept: brand ? `Premium Employer Branding for ${brand}` : 'Professional High-Trust Creative',
    visualHierarchy: [
      '1st: Headline (bold, brand color, top 20%)',
      '2nd: Product/uniform (centered, middle 50%)',
      '3rd: CTA button (accent color, bottom 20%)',
    ],
    colorStrategy: {
      primary: officialColors?.primary || '#E30613',
      secondary: officialColors?.secondary || '#FFD700',
      background: '#FFFFFF',
      reasoning: 'Brand colors with high-contrast CTA for maximum conversion',
    },
    compositionRules: [
      'Rule of thirds: Product at vertical center',
      '40% negative space above and below for breathability',
      'Z-pattern reading flow: Headline → Product → CTA',
      'Single focal point (product) for clarity',
    ],
    emotionalTone: 'Aspirational yet accessible',
    targetEmotion: 'Excitement about opportunity + trust in brand',
    brandGuidelines: brand && officialColors ? {
      brandName: brand,
      officialColors: [officialColors.primary, officialColors.secondary].filter(Boolean),
      logoRequirements: `Official ${brand} logo, high-resolution, brand-accurate`,
    } : undefined,
  };
}

