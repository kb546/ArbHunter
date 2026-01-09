/**
 * AI Prompt Engineer Agent
 * Uses GPT-4 to generate professional ad creative prompts
 * Expert persona: Senior Creative Director + AI Prompt Engineer
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// ============================================================================
// EXPERT PERSONA & SYSTEM PROMPT
// ============================================================================

const PROMPT_ENGINEER_PERSONA = `You are a world-class AI Prompt Engineer AND Senior Creative Director with 15+ years experience creating high-converting Facebook/Instagram ads.

YOUR EXPERTISE:
1. **Ad Creative Strategy**: You've created 1000+ ads for Fortune 500 companies (McDonald's, KFC, Walmart, Amazon, DHL)
2. **AI Image Generation**: Expert in DALL-E 3, Midjourney, Stable Diffusion - you know EXACTLY how to craft prompts that generate professional ad creatives
3. **Conversion Optimization**: You understand what makes people click, apply, and buy
4. **Visual Design**: You think like a graphic designer - layout, typography, color theory, composition

YOUR MISSION:
Generate a DETAILED, PROFESSIONAL prompt for DALL-E 3 that will create a scroll-stopping, high-converting ad creative.

CRITICAL REQUIREMENTS:
1. **Include ALL text elements**: Headline, subheadline, CTA button with exact text
2. **Specify exact layout**: Where each element goes (top, center, bottom)
3. **Brand accuracy**: Use official brand colors (hex codes), logos, products
4. **Professional specs**: Canvas size, lighting, composition, style
5. **DALL-E 3 compatible**: Use language DALL-E 3 understands for text generation

YOUR OUTPUT FORMAT:
A single, detailed prompt (200-400 words) structured as a creative brief that DALL-E 3 can execute flawlessly.

REMEMBER:
- DALL-E 3 CAN generate text, logos, and typography - specify them!
- Be specific about text placement, font style, colors
- Think like you're briefing a top-tier designer
- The output must be ad-ready with NO post-production needed`;

// ============================================================================
// PROMPT GENERATION FUNCTION
// ============================================================================

interface PromptRequest {
  niche: string;
  geo: string;
  style: string;
  targetAudience?: string;
  orientation: 'square' | 'portrait' | 'landscape';
  adObjective?: 'recruitment' | 'sales' | 'awareness';
}

interface PromptResponse {
  generatedPrompt: string;
  reasoning: string;
  estimatedQuality: number; // 1-100
}

export async function generateAdPrompt(request: PromptRequest): Promise<PromptResponse> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    niche,
    geo,
    style,
    targetAudience,
    orientation,
    adObjective = 'recruitment'
  } = request;

  console.log('🤖 AI Prompt Engineer Agent: Generating creative brief...');

  // Detect brand from niche
  const brandMatch = niche.match(/^([A-Z][A-Za-z0-9&\s]+?)(?:\s+(?:jobs?|careers?|hiring|employment|opportunities|positions))/i);
  const brand = brandMatch ? brandMatch[1].trim() : null;

  // Build context for the AI agent
  const userContext = `
USER REQUEST:
- **Campaign**: ${niche}
- **Geographic Market**: ${geo}
- **Creative Style**: ${style}
- **Target Audience**: ${targetAudience || 'General audience'}
- **Canvas Orientation**: ${orientation} (${orientation === 'square' ? '1080x1080' : orientation === 'portrait' ? '1080x1920' : '1920x1080'})
- **Ad Objective**: ${adObjective === 'recruitment' ? 'Job application / recruitment' : 'Sales / conversions'}
${brand ? `- **Detected Brand**: ${brand}` : ''}

YOUR TASK:
Generate a professional DALL-E 3 prompt for this ad creative.

MUST INCLUDE IN YOUR PROMPT:
1. **Headline Text**: The main attention-grabbing headline (e.g., "NOW HIRING AT ${brand || 'COMPANY'}")
2. **Subheadline**: Supporting copy (e.g., "Weekly Pay • No Experience Needed")
3. **CTA Button**: Call-to-action with exact text and styling (e.g., "APPLY TODAY" on yellow button)
4. **Visual Elements**: Brand products, uniforms, or relevant imagery
5. **Layout Specs**: Exact placement of each element (top/center/bottom)
6. **Brand Colors**: Official hex codes if known (${brand ? `research ${brand} brand colors` : 'use appropriate colors'})
7. **Typography**: Font styles (bold, uppercase, sizes)
8. **Background**: Color, texture, lighting

STYLE GUIDANCE (${style}):
${getStyleGuidance(style)}

EXAMPLE STRUCTURE (adapt for this request):
"Create a professional 1080x1080 recruitment ad for ${brand || niche}.

BACKGROUND: Bright white (#FFFFFF) with soft studio lighting, clean and minimal.

HEADLINE (Top Center): Bold, extra-large, all-caps text in brand red: '${brand ? `${brand.toUpperCase()} IS HIRING NOW` : 'NOW HIRING'}' - Make this the most prominent element.

VISUAL CENTER: ${brand ? `${brand} branded uniform (shirt/apron) hanging on a natural wooden hanger, centered in frame, with official ${brand} logo clearly visible. Use authentic ${brand} brand colors.` : 'Professional workplace imagery relevant to the role.'}

SUBHEADLINE (Below visual): Medium gray text (#333333): 'Weekly Pay • Start This Week • No Experience Needed'

CTA BUTTON (Bottom Center): Wide rounded button in ${brand ? 'brand yellow (#FFC220)' : 'bright yellow (#FFD700)'} with bold black text: 'APPLY TODAY' - Make it impossible to miss.

STYLE: Clean, minimal, high-trust, premium employer branding. Think Apple product launch meets premium job board.

TECHNICAL: Studio-quality lighting, perfect text rendering, zero shadows, professional color grading, 4K clarity."

NOW CREATE YOUR VERSION for this specific request.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Best model for creative tasks
      messages: [
        {
          role: 'system',
          content: PROMPT_ENGINEER_PERSONA
        },
        {
          role: 'user',
          content: userContext
        }
      ],
      temperature: 0.8, // Creative but not too random
      max_tokens: 1500,
    });

    const generatedPrompt = completion.choices[0].message.content?.trim() || '';

    if (!generatedPrompt) {
      throw new Error('AI Prompt Engineer returned empty response');
    }

    console.log('✅ AI Prompt Engineer: Generated professional prompt');
    console.log(`📝 Prompt length: ${generatedPrompt.length} characters`);

    // Estimate quality based on prompt characteristics
    const quality = estimatePromptQuality(generatedPrompt);

    return {
      generatedPrompt,
      reasoning: `Generated by AI Prompt Engineer Agent (GPT-4) with ${style} style specifications for ${brand || niche}`,
      estimatedQuality: quality
    };

  } catch (error: any) {
    console.error('❌ AI Prompt Engineer failed:', error);
    throw new Error(`Prompt generation failed: ${error.message}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get style-specific guidance for the AI agent
 */
function getStyleGuidance(style: string): string {
  const styleGuides: Record<string, string> = {
    studio: "Ultra-clean product shot on white background, brand product/uniform on wooden hanger centered, professional studio lighting, Apple-inspired minimalism",
    professional: "Corporate aesthetic, clean composition, high-trust design, modern professional look",
    casual: "Lifestyle photography, natural authentic feel, warm lighting, relatable workplace vibes",
    lifestyle: "Aspirational workplace moments, emotional connection, natural environment",
    urgency: "Bold high-contrast design, attention-grabbing colors, clear call-to-action, dynamic",
    minimal: "Maximum negative space, single focal element, clean white background, sophisticated",
    bold: "Vibrant brand-forward, high saturation, dynamic composition, eye-catching",
    vibrant: "Colorful energetic palette, bright cheerful lighting, youthful dynamic feel",
    dark: "Moody cinematic lighting, dramatic shadows, sophisticated premium aesthetic"
  };

  return styleGuides[style] || styleGuides.professional;
}

/**
 * Estimate prompt quality based on characteristics
 */
function estimatePromptQuality(prompt: string): number {
  let score = 60; // Base score

  // Check for key elements
  if (/headline|text at top|bold.*text/i.test(prompt)) score += 10;
  if (/CTA|call.to.action|button|apply|click/i.test(prompt)) score += 10;
  if (/#[0-9A-Fa-f]{6}/i.test(prompt)) score += 5; // Has hex colors
  if (/1080|1920|canvas|size/i.test(prompt)) score += 5; // Has dimensions
  if (/logo|brand|uniform|product/i.test(prompt)) score += 5; // Brand elements
  if (/lighting|studio|background/i.test(prompt)) score += 5; // Technical specs

  return Math.min(score, 100);
}

// ============================================================================
// FALLBACK: Manual Prompt Builder (if AI fails)
// ============================================================================

export function buildFallbackPrompt(request: PromptRequest): string {
  const { niche, style, orientation } = request;
  
  const brandMatch = niche.match(/^([A-Z][A-Za-z0-9&\s]+?)(?:\s+(?:jobs?|careers?|hiring))/i);
  const brand = brandMatch ? brandMatch[1].trim() : null;

  const size = orientation === 'square' ? '1080x1080' : orientation === 'portrait' ? '1080x1920' : '1920x1080';

  return `Create a professional ${size} recruitment ad for ${brand || niche}.

LAYOUT:
- Top 20%: Bold headline in large text: "${brand ? `${brand.toUpperCase()} IS HIRING NOW` : 'NOW HIRING'}"
- Center 50%: ${brand ? `${brand} branded uniform on wooden hanger with visible logo` : 'Professional workplace imagery'}
- Bottom 20%: Yellow CTA button with text "APPLY TODAY"
- Add subheadline: "Weekly Pay • No Experience Needed"

STYLE: ${getStyleGuidance(style)}
BACKGROUND: Clean white (#FFFFFF)
QUALITY: Studio-quality, professional, ad-ready

Make all text clear, readable, and perfectly rendered.`;
}


