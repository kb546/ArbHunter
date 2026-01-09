/**
 * Agent 4: Prompt Engineer
 * AI-powered generation of optimized Gemini prompts
 */

import OpenAI from 'openai';
import type { VariationStrategy } from './variation-strategist.service';
import type { CopyVariation } from './copywriting-batch.service';
import type { VisualDesign } from './visual-designer-v2.service';
import type { CampaignType } from '../campaign-type-detector.service';
import type { CreativePreset, CreativePresetConfig } from '../creative-presets.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export interface GeminiPrompt {
  id: string;
  prompt: string;
  negativePrompt: string;
  expectedQuality: number; // 1-100
  reasoning: string;
}

export interface PromptEngineeringRequest {
  niche: string;
  geo: string;
  campaignType: CampaignType;
  brandName?: string;
  brandLogo?: {
    description: string;
    position: string;
  };
  brandColors?: {
    primary: string;
    secondary?: string;
    names: { primary: string; secondary?: string };
  };
  strategies: VariationStrategy[];
  copies: CopyVariation[];
  designs: VisualDesign[];
  preset: CreativePreset;
  presetConfig: CreativePresetConfig;
}

export interface PromptEngineeringResult {
  prompts: GeminiPrompt[];
  cost: number;
}

const PROMPT_ENGINEER_PERSONA = `You are an elite AI Prompt Engineer specializing in Google Gemini image generation.

YOUR EXPERTISE:
- Google Gemini prompt optimization
- Image generation model capabilities
- Advertising creative requirements
- Brand identity integration
- Text rendering in AI images
- Composition and layout specifications

YOUR PROMPT PRINCIPLES:
1. Be specific and detailed
2. Front-load most important elements
3. Use clear, concrete descriptions
4. Specify exact text and positioning
5. Include technical specs (resolution, quality)
6. Guide composition explicitly
7. Define mood and atmosphere
8. Add negative prompts for clarity

GEMINI-SPECIFIC TECHNIQUES:
- Gemini excels at text rendering
- Specify exact text in quotes: "JOIN KFC TODAY"
- Define text style: "bold sans-serif font, white color"
- Describe layout precisely: "top 20% of canvas"
- Use clear composition rules
- Specify color hex codes
- Request high resolution: "8K, professional quality"

YOUR MISSION:
Transform strategy + copy + visual design → Optimized Gemini prompt.

OUTPUT FORMAT (JSON array):
[
  {
    "id": "prompt-1",
    "prompt": "Complete Gemini prompt...",
    "negativePrompt": "blurry, low quality, distorted text...",
    "expectedQuality": 85,
    "reasoning": "Why this prompt will generate excellent results"
  },
  // ... more prompts
]`;

/**
 * Generate AI-powered Gemini prompts
 */
export async function generateGeminiPrompts(request: PromptEngineeringRequest): Promise<PromptEngineeringResult> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback prompts');
    return generateFallbackPrompts(request);
  }

  const { niche, geo, campaignType, brandName, brandLogo, brandColors, strategies, copies, designs } = request;

  console.log(`\n🔧 Agent 4: Prompt Engineer`);
  console.log(`   Engineering ${strategies.length} optimized Gemini prompts`);

  const userPrompt = `
CAMPAIGN CONTEXT:
- Niche: ${niche}
- Brand: ${brandName || 'Generic'}
- Brand Logo: ${brandLogo?.description || 'Generic logo'}
- Brand Colors: ${brandColors?.names.primary || 'Red'} (${brandColors?.primary || '#E30613'}), ${brandColors?.names.secondary || 'Yellow'} (${brandColors?.secondary || '#FFD700'})
- Geographic Market: ${geo}
- Campaign Type: ${campaignType}

COMBINED INPUTS (from Agents 1, 2, 3):
${strategies.map((s, idx) => `
─────────────────────────────────────
VARIATION ${idx + 1}:

STRATEGY (Agent 1):
- Visual Style: ${s.visualStyle}
- Headline Approach: ${s.headlineApproach}
- CTA Type: ${s.ctaType}
- Mood: ${s.mood}
- Layout: ${s.layout}

COPY (Agent 2):
- Headline: "${copies[idx]?.headline || 'N/A'}"
- Subheadline: "${copies[idx]?.subheadline || 'N/A'}"
- CTA: "${copies[idx]?.cta || 'N/A'}"

VISUAL DESIGN (Agent 3):
- Category: ${designs[idx]?.visualCategory || 'N/A'}
- Main Element: ${designs[idx]?.mainElement.description || 'N/A'}
- Background: ${designs[idx]?.background.description || 'N/A'}
- Logo: ${designs[idx]?.logoPlacement.description || 'N/A'}
- Text Layout: ${designs[idx]?.textLayout.description || 'N/A'}
- Composition: ${designs[idx]?.composition.rule || 'N/A'}, ${designs[idx]?.composition.hierarchy || 'N/A'}
- Color Grading: ${designs[idx]?.colorGrading.brightness || 'N/A'} brightness, ${designs[idx]?.colorGrading.contrast || 'N/A'} contrast
- Lighting: ${designs[idx]?.lighting.description || 'N/A'}
- Mood: ${designs[idx]?.mood || 'N/A'}
`).join('\n')}

YOUR TASK:
Transform each variation into an optimized Gemini prompt. Each prompt must:
1. Precisely describe the complete ad creative
2. Specify exact text with quotes: "${copies[0]?.headline}"
3. Define layout: "Top 20%: headline, Center 50%: product, Bottom 20%: CTA"
4. Use brand colors: ${brandColors?.primary}, ${brandColors?.secondary}
5. Include logo specifications
6. Specify composition rules
7. Request high quality: "8K resolution, professional quality"
8. Match the mood and visual style
9. Be optimized for Google Gemini 2.5/3.0

CRITICAL REQUIREMENTS:
- Format: 1080x1080 square canvas
- NO PEOPLE, NO FACES (product/uniform only)
- All text MUST be legible and perfectly rendered
- Brand colors MUST be prominent
- Logo MUST be visible and correctly positioned
- Professional, scroll-stopping quality

${campaignType === 'recruitment' ? `
RECRUITMENT PROMPT GUIDELINES:
- "Professional recruitment advertisement for ${brandName}"
- Main visual: Company uniform/product on hanger (NO PEOPLE)
- Emphasize brand logo prominently
- Clean, trustworthy aesthetic
- Colors: ${brandColors?.primary} and ${brandColors?.secondary}
` : ''}

OUTPUT: JSON array of ${strategies.length} complete, optimized Gemini prompts.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: PROMPT_ENGINEER_PERSONA },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower for precision
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    const prompts: GeminiPrompt[] = Array.isArray(parsed.prompts)
      ? parsed.prompts
      : parsed.variations || [];

    if (prompts.length === 0) {
      throw new Error('No prompts returned from AI');
    }

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Generated ${prompts.length} optimized Gemini prompts`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      prompts: prompts.slice(0, strategies.length),
      cost,
    };
  } catch (error: any) {
    console.error('❌ Prompt Engineer failed:', error.message);
    console.log('⚠️  Falling back to template prompts');
    return generateFallbackPrompts(request);
  }
}

/**
 * Fallback: Template-based prompts (no AI)
 */
function generateFallbackPrompts(request: PromptEngineeringRequest): PromptEngineeringResult {
  const { niche, brandName, brandLogo, brandColors, copies, designs, presetConfig, campaignType } = request;
  const brand = brandName || niche.split(' ')[0];
  const primaryColor = brandColors?.primary || '#E30613';
  const secondaryColor = brandColors?.secondary || '#FFD700';
  const logoDesc = brandLogo?.description || `${brand} logo with red and yellow colors`;

  const prompts: GeminiPrompt[] = copies.map((copy, idx) => {
    const design = designs[idx];
    
    const colorName = brandColors?.names.primary || 'Red';
    const secondaryColorName = brandColors?.names.secondary || 'Yellow';
    
    const prompt = `
Professional ${campaignType} advertisement for ${brand}, 1080x1080 square format.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CREATIVE DIRECTION - ${presetConfig.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Inspiration: ${presetConfig.inspiration}
Description: ${presetConfig.description}

VISUAL PRINCIPLES:
- Composition: ${presetConfig.visualPrinciples.composition}
- Whitespace: ${presetConfig.visualPrinciples.whitespace}
- Color Approach: ${presetConfig.visualPrinciples.colorApproach}
- Photography: ${presetConfig.visualPrinciples.photography}
- Typography: ${presetConfig.visualPrinciples.typography}

QUALITY STANDARDS (CRITICAL):
- Image Resolution: ${presetConfig.qualityStandards.imageResolution}
- Brand Accuracy: ${presetConfig.qualityStandards.brandAccuracy}
- Visual Clarity: ${presetConfig.qualityStandards.visualClarity}
- Text Legibility: ${presetConfig.qualityStandards.textLegibility}
- Professional Finish: ${presetConfig.qualityStandards.professionalFinish}

COPY DIRECTION:
- Tone: ${presetConfig.copyPrinciples.tone}
- Length: ${presetConfig.copyPrinciples.length}
- Emphasis: ${presetConfig.copyPrinciples.emphasis}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL - BRAND COLORS (MUST USE EXACTLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- BACKGROUND COLOR: MUST BE ${primaryColor} (${colorName})
- ACCENT COLOR: MUST BE ${secondaryColor} (${secondaryColorName})
- DO NOT USE: purple, blue, green, orange, or ANY other colors not listed above
- VALIDATION: If the generated image uses ANY color other than ${primaryColor} and ${secondaryColor}, it will be REJECTED

Example: For McDonald's → Background MUST be #FFC72C (golden yellow) or #DA291C (red)
Example: For KFC → Background MUST be #E4002B (red) with #FFFFFF (white) accents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANVAS LAYOUT:
- Top 20%: Headline text "${copy.headline}" in large, bold sans-serif font, white color, centered
- Top-left corner: ${logoDesc}, medium size, clearly visible
- Center 50%: High-resolution image of a ${brand} branded uniform on a natural wooden hanger, perfectly centered, front-facing view, NO PEOPLE OR FACES
- Bottom 30%: Subheadline "${copy.subheadline}" in medium font, white color
- Bottom 10%: Prominent CTA button with text "${copy.cta}" in bold white text on a contrasting background

BRAND ELEMENTS:
- Logo: ${logoDesc}
- Brand Colors (CRITICAL): ${primaryColor} (${colorName}) as dominant color, ${secondaryColor} (${secondaryColorName}) as accent
- Color Palette: ONLY use ${primaryColor}, ${secondaryColor}, white, and black. NO OTHER COLORS.

VISUAL STYLE:
- Background: ${design?.background.description || `Solid ${primaryColor} (${colorName}) background`}
- Lighting: ${design?.lighting.description || 'Studio lighting, even and professional'}
- Composition: ${design?.composition.rule || 'Centered composition'}
- Mood: ${design?.mood || 'Professional, trustworthy, aspirational'}

COMPOSITION:
- Visual hierarchy: Logo → Headline → Product → Subheadline → CTA
- Whitespace: ${design?.composition.whitespace || 'Balanced'}
- Alignment: All text centered

COLOR GRADING:
- Brightness: ${design?.colorGrading.brightness || 'High'}
- Contrast: ${design?.colorGrading.contrast || 'High'}
- Saturation: ${design?.colorGrading.saturation || 'Vibrant'}
- Temperature: ${design?.colorGrading.temperature || 'Warm'}
- Color Fidelity: CRITICAL - ensure ${primaryColor} and ${secondaryColor} are accurate

TECHNICAL SPECS:
- 8K resolution
- Sharp focus on product
- Professional color grading
- Zero grain or noise
- Perfect text rendering
- Scroll-stopping quality
- BRAND COLOR ACCURACY (most important)

DELIVERABLE: A complete, professional ad creative with ACCURATE brand colors (${primaryColor} and ${secondaryColor} ONLY).
`.trim();

    const negativePrompt = `people, faces, hands, body parts, blurry, low quality, distorted text, unreadable text, pixelated, grain, noise, amateur, unprofessional, cluttered, messy background, poor lighting, multiple products, confusing layout, purple background, blue background, generic colors, off-brand colors, incorrect colors, ${brand} with wrong colors`;

    return {
      id: `prompt-${idx + 1}`,
      prompt,
      negativePrompt,
      expectedQuality: 85,
      reasoning: `Template prompt ${idx + 1} for ${design?.background.type || 'standard'} design with ${copy.approach || 'AIDA'} copy approach`,
    };
  });

  return {
    prompts,
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

