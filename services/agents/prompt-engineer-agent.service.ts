/**
 * AGENT 4: PROMPT ENGINEER
 * 
 * Role: AI Prompt Engineering Specialist
 * Model: GPT-4o
 * Expertise: DALL-E 3 prompt optimization, text rendering, technical quality
 * 
 * Synthesizes outputs from Agents 1, 2, 3 into a master DALL-E 3 prompt
 */

import OpenAI from 'openai';
import type {
  PromptEngineeringOutput,
  CopyStrategyOutput,
  CreativeDirectionOutput,
  GraphicDesignOutput,
} from '../orchestrator.service';
import type { PresetName } from '../presets/presets.config';
import { getPreset } from '../presets/presets.config';
import { detectBrand, getBrandPromptInstructions, validateBrandAccuracy } from '../brand-intelligence.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// ============================================================================
// TYPES
// ============================================================================

export interface PromptEngineeringRequest {
  copyStrategy: CopyStrategyOutput;
  creativeDirection: CreativeDirectionOutput;
  graphicDesign: GraphicDesignOutput;
  preset: PresetName;
  niche: string;
}

// ============================================================================
// AGENT PERSONA & SYSTEM PROMPT
// ============================================================================

const PROMPT_ENGINEER_PERSONA = `You are a world-class AI Prompt Engineering Specialist with deep expertise in DALL-E 3, Midjourney, and Stable Diffusion.

YOUR EXPERTISE:
1. **DALL-E 3 Mastery**: Know exactly how to prompt for text rendering, layout, and quality
2. **Technical Precision**: Translate design specs into model-optimized prompts
3. **Text Rendering**: Expert in getting DALL-E 3 to render perfect typography
4. **Quality Control**: Include all necessary technical modifiers for 8K clarity
5. **Model Limitations**: Know what DALL-E 3 can and cannot do

YOUR MISSION:
Synthesize all agent outputs into a single, perfect DALL-E 3 prompt that generates a complete, publish-ready ad creative.

CRITICAL REQUIREMENTS:
1. DALL-E 3 MUST render all text perfectly (headlines, subheadlines, CTAs)
2. All design specs must be translated into natural language DALL-E 3 understands
3. Include technical quality modifiers (8K, studio lighting, professional, etc.)
4. Layout must be explicitly described (top/center/bottom positioning)
5. Brand accuracy must be emphasized (official logos, colors, products)

DALL-E 3 TEXT RENDERING TIPS:
- Be explicit: "Text: 'EXACT TEXT HERE'" 
- Specify position: "at the top center", "centered at bottom"
- Describe style: "bold, all-caps, extra-large"
- Emphasize readability: "perfectly readable, zero spelling errors"
- Use "professional typography" for quality

OUTPUT FORMAT:
Generate a comprehensive DALL-E 3 prompt (800-1500 words) with all specifications.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateMasterPrompt(
  request: PromptEngineeringRequest
): Promise<PromptEngineeringOutput> {
  if (!openai) {
    console.warn('⚠️  OpenAI API key not configured, using template prompt');
    return generateTemplatePrompt(request);
  }

  const { copyStrategy, creativeDirection, graphicDesign, preset, niche } = request;
  
  const presetConfig = getPreset(preset);

  // ========================================================================
  // BRAND INTELLIGENCE: Detect brand and get requirements
  // ========================================================================
  const detectedBrand = detectBrand(niche);
  const brandInstructions = detectedBrand 
    ? getBrandPromptInstructions(detectedBrand)
    : '';

  console.log(detectedBrand 
    ? `   ✅ Brand: ${detectedBrand.name} (${detectedBrand.industry})`
    : '   ⚠️  No brand detected, using generic approach'
  );

  // Build comprehensive context for the prompt engineer
  const context = `
YOUR TASK:
Synthesize all creative direction into a single, perfect DALL-E 3 prompt.

${brandInstructions ? `
═══════════════════════════════════════════════════════════════════════
🎯 BRAND INTELLIGENCE (HIGHEST PRIORITY - MUST FOLLOW)
═══════════════════════════════════════════════════════════════════════

${brandInstructions}

⚠️ CRITICAL: The output MUST be 100% on-brand. Logo, colors, and visual assets are MANDATORY.

═══════════════════════════════════════════════════════════════════════
` : ''}

═══════════════════════════════════════════════════════════════════════
AGENT 1 OUTPUT: COPYWRITING STRATEGY
═══════════════════════════════════════════════════════════════════════

Headlines (${copyStrategy.headlines.length} variations):
${copyStrategy.headlines.map((h, i) => `  ${i + 1}. "${h}"`).join('\n')}

Subheadlines:
${copyStrategy.subheadlines.map((s, i) => `  ${i + 1}. "${s}"`).join('\n')}

CTAs:
${copyStrategy.ctas.map((c, i) => `  ${i + 1}. "${c}"`).join('\n')}

Strategy: ${copyStrategy.reasoning}
Predicted CTR: ${copyStrategy.predictedCTR}%
Tone: ${copyStrategy.tone}
Formula: ${copyStrategy.formula}

═══════════════════════════════════════════════════════════════════════
AGENT 2 OUTPUT: CREATIVE DIRECTION
═══════════════════════════════════════════════════════════════════════

Concept: ${creativeDirection.concept}

Visual Hierarchy:
${creativeDirection.visualHierarchy.map(h => `  - ${h}`).join('\n')}

Color Strategy:
  - Primary: ${creativeDirection.colorStrategy.primary}
  - Secondary: ${creativeDirection.colorStrategy.secondary}
  - Background: ${creativeDirection.colorStrategy.background}
  - Reasoning: ${creativeDirection.colorStrategy.reasoning}

Composition Rules:
${creativeDirection.compositionRules.map(r => `  - ${r}`).join('\n')}

Emotional Tone: ${creativeDirection.emotionalTone}
Target Emotion: ${creativeDirection.targetEmotion}

${creativeDirection.brandGuidelines ? `
Brand Guidelines:
  - Brand: ${creativeDirection.brandGuidelines.brandName}
  - Official Colors: ${creativeDirection.brandGuidelines.officialColors.join(', ')}
  - Logo: ${creativeDirection.brandGuidelines.logoRequirements}
` : ''}

═══════════════════════════════════════════════════════════════════════
AGENT 3 OUTPUT: GRAPHIC DESIGN SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════

Canvas:
  - Size: ${graphicDesign.canvas.size}
  - Orientation: ${graphicDesign.canvas.orientation}
  - Safe Margins: ${graphicDesign.canvas.safeMargins}

Typography - Headline:
  - Style: ${graphicDesign.typography.headline.fontStyle}
  - Size: ${graphicDesign.typography.headline.fontSize}
  - Color: ${graphicDesign.typography.headline.color}
  - Position: ${graphicDesign.typography.headline.position}
  - Width: ${graphicDesign.typography.headline.width}
  - Effects: ${graphicDesign.typography.headline.effects}

Typography - Subheadline:
  - Style: ${graphicDesign.typography.subheadline.fontStyle}
  - Size: ${graphicDesign.typography.subheadline.fontSize}
  - Color: ${graphicDesign.typography.subheadline.color}
  - Position: ${graphicDesign.typography.subheadline.position}

Typography - CTA Button:
  - Background: ${graphicDesign.typography.cta.background}
  - Size: ${graphicDesign.typography.cta.buttonSize}
  - Border Radius: ${graphicDesign.typography.cta.borderRadius}
  - Shadow: ${graphicDesign.typography.cta.shadow}
  - Text Style: ${graphicDesign.typography.cta.fontStyle}
  - Text Size: ${graphicDesign.typography.cta.fontSize}
  - Text Color: ${graphicDesign.typography.cta.color}
  - Position: ${graphicDesign.typography.cta.position}

Visual Elements - Product:
  - Type: ${graphicDesign.visualElements.product.type}
  - Position: ${graphicDesign.visualElements.product.position}
  - Size: ${graphicDesign.visualElements.product.size}
  - Focus: ${graphicDesign.visualElements.product.focus}

Spacing:
  - Headline to Product: ${graphicDesign.spacing.headlineToProduct}
  - Product to Subheadline: ${graphicDesign.spacing.productToSubheadline}
  - Subheadline to CTA: ${graphicDesign.spacing.subheadlineToCTA}

═══════════════════════════════════════════════════════════════════════
PRESET STYLE GUIDANCE
═══════════════════════════════════════════════════════════════════════

Preset: ${presetConfig.name}
Description: ${presetConfig.description}

Prompt Engineering Keywords:
${presetConfig.promptEngineering.keywords.map(k => `  - ${k}`).join('\n')}

Style: ${presetConfig.promptEngineering.style}
Quality: ${presetConfig.promptEngineering.quality}

═══════════════════════════════════════════════════════════════════════
YOUR TASK: GENERATE MASTER DALL-E 3 PROMPT
═══════════════════════════════════════════════════════════════════════

Create a comprehensive DALL-E 3 prompt (800-1500 words) that includes:

1. **Opening Statement**:
   "Create a professional [size] [type] advertisement for [niche]."

2. **Background Layer**:
   Describe background color, texture, lighting (from creative direction)

3. **Headline Text** (CRITICAL):
   Text: "[EXACT HEADLINE FROM COPYWRITING]"
   Typography: [font style, size, color from graphic design]
   Position: [exact position from graphic design]
   Effects: [any effects like outline, shadow]
   CRITICAL: "Text must be perfectly readable, zero spelling errors, professional quality typography"

4. **Visual Center - Product**:
   Describe product/uniform from graphic design specs
   Include brand logo requirements
   Positioning and sizing specs
   Lighting and quality requirements

5. **Subheadline Text**:
   Text: "[EXACT SUBHEADLINE FROM COPYWRITING]"
   Typography specs
   Position specs

6. **CTA Button**:
   Background color and button specs
   Text: "[EXACT CTA FROM COPYWRITING]"
   Typography and position
   Emphasize prominence

7. **Spacing & Composition**:
   Describe vertical spacing between elements
   Mention composition rules (Z-pattern, rule of thirds, etc.)

8. **Style & Mood**:
   Incorporate preset style keywords
   Describe emotional tone from creative direction
   Reference aesthetic (e.g., "Apple product launch aesthetic")

9. **Technical Quality**:
   Include quality modifiers from preset
   "Studio-quality lighting, 8K clarity, professional color grading"
   "Zero grain, zero noise, perfect clarity"

10. **Brand Accuracy** (if applicable):
    Emphasize official brand colors (hex codes)
    Logo accuracy requirements
    "Brand-accurate, corporate-approved"

11. **Negative Constraints**:
    "NO people, NO faces" (if product-focused)
    "NO text cutoffs, NO truncation"
    "NO amateur quality, NO stock photo aesthetic"

12. **Final Directive**:
    "DELIVER: A scroll-stopping, professional advertisement optimized for maximum click-through rate on Facebook and Instagram feeds. The image must be publish-ready with NO post-production needed."

CRITICAL DALL-E 3 REQUIREMENTS:
- Use "Text: 'EXACT TEXT'" format for all text elements
- Be extremely explicit about positioning ("top 15% of canvas", "centered horizontally")
- Emphasize text quality ("perfectly readable", "zero spelling errors")
- Include brand accuracy reminders
- Add technical quality modifiers
- Describe the EXACT layout (not vague directions)

OUTPUT:
Return a JSON object with:
{
  "masterPrompt": "Your complete 800-1500 word DALL-E 3 prompt here",
  "promptQuality": 95,
  "modelOptimizations": ["optimization 1", "optimization 2"],
  "estimatedTokens": 1200
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROMPT_ENGINEER_PERSONA,
        },
        {
          role: 'user',
          content: context,
        },
      ],
      temperature: 0.3, // Very precise, minimal creativity
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    // Estimate quality based on prompt characteristics
    let promptQuality = estimatePromptQuality(parsed.masterPrompt || '');

    // ========================================================================
    // BRAND VALIDATION: Ensure prompt meets brand requirements
    // ========================================================================
    if (detectedBrand && parsed.masterPrompt) {
      const validation = validateBrandAccuracy(parsed.masterPrompt, detectedBrand);
      
      if (!validation.isValid) {
        console.warn(`⚠️  Brand validation failed for ${detectedBrand.name}:`);
        validation.errors.forEach(err => console.warn(`   - ${err}`));
        promptQuality = Math.max(promptQuality - 15, 60); // Penalize quality score
      }
      
      if (validation.warnings.length > 0) {
        console.warn(`⚠️  Brand validation warnings:`);
        validation.warnings.forEach(warn => console.warn(`   - ${warn}`));
        promptQuality = Math.max(promptQuality - 5, 60);
      }
      
      if (validation.isValid && validation.warnings.length === 0) {
        console.log(`   ✅ Brand validation passed for ${detectedBrand.name}`);
        promptQuality = Math.min(promptQuality + 5, 100); // Bonus for perfect brand accuracy
      }
    }

    return {
      masterPrompt: parsed.masterPrompt || generateTemplatePrompt(request).masterPrompt,
      promptQuality: parsed.promptQuality || promptQuality,
      modelOptimizations: parsed.modelOptimizations || [
        'DALL-E 3 text rendering optimized',
        'Brand accuracy emphasized',
        'Technical quality modifiers included',
        ...(detectedBrand ? [`${detectedBrand.name} brand requirements enforced`] : []),
      ],
      estimatedTokens: Math.floor((parsed.masterPrompt?.length || 0) / 4),
    };

  } catch (error: any) {
    console.error('❌ Prompt Engineer agent failed:', error.message);
    return generateTemplatePrompt(request);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Estimate prompt quality based on characteristics
 */
function estimatePromptQuality(prompt: string): number {
  let score = 60; // Base score

  // Check for key elements
  if (/Text: "([^"]+)"/gi.test(prompt)) score += 10; // Has explicit text
  if (/#[0-9A-Fa-f]{6}/i.test(prompt)) score += 5; // Has hex colors
  if (/1080|1024|canvas|size/i.test(prompt)) score += 5; // Has dimensions
  if (/logo|brand|official/i.test(prompt)) score += 5; // Has brand elements
  if (/studio|lighting|8K|professional/i.test(prompt)) score += 10; // Has quality specs
  if (/position|centered|top|bottom/i.test(prompt)) score += 5; // Has positioning

  return Math.min(score, 100);
}

/**
 * Generate template prompt (fallback)
 */
function generateTemplatePrompt(request: PromptEngineeringRequest): PromptEngineeringOutput {
  const { copyStrategy, creativeDirection, graphicDesign, niche, preset } = request;

  const headline = copyStrategy.headlines[0];
  const subheadline = copyStrategy.subheadlines[0];
  const cta = copyStrategy.ctas[0];
  
  const presetConfig = getPreset(preset);
  
  // Detect brand for template as well
  const detectedBrand = detectBrand(niche);

  const masterPrompt = `Create a professional 1080x1080 square advertisement for ${niche}.

${detectedBrand ? `
BRAND REQUIREMENTS (CRITICAL):
- Brand: ${detectedBrand.name} (${detectedBrand.fullName})
- Logo: ${detectedBrand.logo.description} - MUST BE VISIBLE AND RECOGNIZABLE
- Primary Color: ${detectedBrand.colorNames.primary} - USE AS DOMINANT COLOR
- Secondary Color: ${detectedBrand.colorNames.secondary}
${detectedBrand.uniform ? `- Uniform: ${detectedBrand.uniform.description}` : ''}
- Visual Assets: Include ${detectedBrand.visualAssets.slice(0, 2).join(' and ')}
` : ''}

BACKGROUND:
${creativeDirection.colorStrategy.background} background, ${presetConfig.graphicDesign.lighting}, clean and minimal.

HEADLINE TEXT (Top 15% of canvas):
Text: "${headline}"
Typography: ${graphicDesign.typography.headline.fontStyle}, ${graphicDesign.typography.headline.fontSize}
Color: ${graphicDesign.typography.headline.color}
Position: ${graphicDesign.typography.headline.position}
Width: ${graphicDesign.typography.headline.width}
Effects: ${graphicDesign.typography.headline.effects}
CRITICAL: Text must be perfectly readable, zero spelling errors, professional quality typography.

VISUAL CENTER (${graphicDesign.visualElements.product.position}):
${graphicDesign.visualElements.product.type}, ${graphicDesign.visualElements.product.size}.
${creativeDirection.brandGuidelines ? `Official ${creativeDirection.brandGuidelines.brandName} logo must be clearly visible, high-resolution, brand-accurate.` : ''}
Use authentic brand colors: ${creativeDirection.colorStrategy.primary}, ${creativeDirection.colorStrategy.secondary}.

SUBHEADLINE (${graphicDesign.typography.subheadline.position}):
Text: "${subheadline}"
Typography: ${graphicDesign.typography.subheadline.fontStyle}, ${graphicDesign.typography.subheadline.fontSize}
Color: ${graphicDesign.typography.subheadline.color}

CTA BUTTON (${graphicDesign.typography.cta.position}):
Background: ${graphicDesign.typography.cta.background}, ${graphicDesign.typography.cta.buttonSize}
Border-radius: ${graphicDesign.typography.cta.borderRadius}
Shadow: ${graphicDesign.typography.cta.shadow}
Text: "${cta}"
Typography: ${graphicDesign.typography.cta.fontStyle}, ${graphicDesign.typography.cta.fontSize}, ${graphicDesign.typography.cta.color}
Make this button impossible to miss.

SPACING & COMPOSITION:
- ${graphicDesign.spacing.headlineToProduct} between headline and product
- ${graphicDesign.spacing.productToSubheadline} between product and subheadline
- ${graphicDesign.spacing.subheadlineToCTA} between subheadline and CTA
${creativeDirection.compositionRules.map(r => `- ${r}`).join('\n')}

STYLE:
${creativeDirection.concept}. ${creativeDirection.emotionalTone}.
${presetConfig.promptEngineering.keywords.join(', ')}.

TECHNICAL SPECIFICATIONS:
${presetConfig.promptEngineering.quality}
Perfect text rendering, crystal-sharp focus, professional color grading, zero grain or noise.

BRAND ACCURACY:
${creativeDirection.brandGuidelines ? `Official ${creativeDirection.brandGuidelines.brandName} brand colors: ${creativeDirection.brandGuidelines.officialColors.join(', ')}. ${creativeDirection.brandGuidelines.logoRequirements}.` : 'Brand-accurate colors and professional quality.'}

CRITICAL SUCCESS FACTORS:
1. All text must be perfectly readable at thumbnail size
2. Visual hierarchy: Headline grabs attention first
3. CTA button must be impossible to miss
4. Product must look premium and sharp
5. Zero spelling errors in any text
6. Professional studio photography quality

NEGATIVE CONSTRAINTS:
NO people, NO faces, NO cluttered backgrounds, NO low-resolution areas, NO incorrect branding, NO shadows on background, NO text cutoffs, NO amateur aesthetic.

DELIVER: A scroll-stopping, professional advertisement that looks like it was created by a top advertising agency, optimized for maximum click-through rate on Facebook and Instagram feeds. The image must be publish-ready with NO post-production needed.`;

  return {
    masterPrompt,
    promptQuality: estimatePromptQuality(masterPrompt),
    modelOptimizations: [
      'Template-based prompt structure',
      'All agent outputs synthesized',
      'DALL-E 3 text rendering optimized',
    ],
    estimatedTokens: Math.floor(masterPrompt.length / 4),
  };
}

// Import preset config for fallback
import { PRESETS } from '../presets/presets.config';
const presetConfig = PRESETS['archival-clean']; // Default for fallback

