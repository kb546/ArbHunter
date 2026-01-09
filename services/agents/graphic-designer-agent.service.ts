/**
 * AGENT 3: GRAPHIC DESIGNER
 * 
 * Role: Senior Graphic Designer + Typography Expert
 * Model: GPT-4o
 * Expertise: Layout design, typography, visual balance, pixel-perfect specifications
 * 
 * Generates:
 * - Canvas specifications
 * - Typography system (headline, subheadline, CTA)
 * - Element sizing & positioning
 * - Spacing rules
 * - Accessibility compliance (contrast ratios)
 */

import OpenAI from 'openai';
import type { GraphicDesignOutput } from '../orchestrator.service';
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

export interface GraphicDesignRequest {
  niche: string;
  geo: string;
  preset: PresetName;
}

// ============================================================================
// AGENT PERSONA & SYSTEM PROMPT
// ============================================================================

const GRAPHIC_DESIGNER_PERSONA = `You are a world-class Senior Graphic Designer with 15+ years of experience creating high-converting ad creatives for major brands.

YOUR EXPERTISE:
1. **Layout Design**: Master of composition, visual balance, grid systems
2. **Typography**: Expert in font selection, hierarchy, readability
3. **Pixel-Perfect Specs**: Precise sizing, positioning, spacing measurements
4. **Accessibility**: WCAG AA compliance, contrast ratios, readability
5. **Platform Optimization**: Facebook/Instagram feed specifications

YOUR MISSION:
Create pixel-perfect layout specifications that a DALL-E 3 prompt can execute flawlessly.

CRITICAL REQUIREMENTS:
1. All measurements must be precise (pixels, percentages, specific positions)
2. Typography must be readable at thumbnail size (300x300px)
3. Contrast ratios must meet WCAG AA standards (4.5:1 minimum)
4. Layout must work on mobile (70% of traffic)
5. Every spec must be actionable for the prompt engineer

OUTPUT FORMAT:
Provide complete graphic design specifications in JSON format with canvas, typography, visual elements, and spacing.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateGraphicDesign(
  request: GraphicDesignRequest
): Promise<GraphicDesignOutput> {
  if (!openai) {
    console.warn('⚠️  OpenAI API key not configured, using mock graphic design');
    return generateMockGraphicDesign(request);
  }

  const { niche, geo, preset } = request;

  // Load preset configuration
  const presetConfig = getPreset(preset);
  const isNone = isNonePreset(preset);

  // ========================================================================
  // BRAND INTELLIGENCE: Detect brand for graphic design guidance
  // ========================================================================
  const detectedBrand = detectBrand(niche, geo);
  const brand = detectedBrand?.name || null;
  
  console.log(detectedBrand 
    ? `   ✅ Brand: ${detectedBrand.name} - Using brand visual guidelines`
    : '   ℹ️  Generic design approach'
  );

  // Detect ad type
  const isRecruitment = /(?:job|career|hiring|employment|work|position|opportunity)/i.test(niche);

  // Build context for the agent
  const userContext = `
CAMPAIGN CONTEXT:
- **Niche/Industry**: ${niche}
${detectedBrand ? `- **Brand**: ${detectedBrand.name} (${detectedBrand.fullName})` : ''}
- **Ad Type**: ${isRecruitment ? 'Recruitment/Job Application' : 'Sales/Conversion'}
- **Preset Style**: ${presetConfig.name}

YOUR TASK:
Create pixel-perfect layout specifications for a square 1080x1080 ad creative.

${isNone ? `
PRESET: NONE (Full Creative Control)
- Analyze niche and determine optimal layout
- Choose best typography system
- No style constraints
` : `
PRESET GUIDANCE: ${presetConfig.name}
- Background: ${presetConfig.graphicDesign.background}
- Lighting: ${presetConfig.graphicDesign.lighting}
- Composition: ${presetConfig.graphicDesign.composition}
`}

CANVAS SPECIFICATIONS:
- Size: 1080x1080 (square format for Instagram/Facebook feed)
- Safe margins: 54px on all sides (5% margin)
- Usable area: 972x972px
- Orientation: Square (1:1 ratio)

LAYOUT STRUCTURE:

1. **Canvas** (object):
   {
     "size": "1080x1080",
     "orientation": "square",
     "safeMargins": "54px all sides"
   }

2. **Typography - Headline** (object):
   {
     "fontStyle": "Extra Bold, All Caps, Sans-serif",
     "fontSize": "72pt (approx 6.7% of canvas height)",
     "color": "#HEX (from brand/preset)",
     "position": "Centered horizontally, 15% from top",
     "width": "85% of canvas width (918px)",
     "lineHeight": "1.1",
     "letterSpacing": "2%",
     "effects": "Subtle white outline (2px) for contrast"
   }
   - Must be largest element (primary visual hierarchy)
   - Readable at 300px thumbnail
   - High contrast with background

3. **Typography - Subheadline** (object):
   {
     "fontStyle": "Medium, Sentence case",
     "fontSize": "32pt",
     "color": "#333333 (dark gray for readability)",
     "position": "Centered horizontally, 60% from top",
     "width": "80% of canvas width"
   }
   - Secondary hierarchy
   - Gray for visual separation from headline
   - Clear bullet separation (• character)

4. **Typography - CTA Button** (object):
   {
     "background": "#FFD700 (yellow or brand accent)",
     "buttonSize": "756px width × 120px height (70% × 11%)",
     "borderRadius": "60px (pill shape)",
     "shadow": "0px 8px 16px rgba(0,0,0,0.15)",
     "fontStyle": "Bold, All Caps",
     "fontSize": "42pt",
     "color": "#000000 (black for max contrast)",
     "position": "Centered horizontally, 85% from top (156px from bottom)"
   }
   - Must be impossible to miss
   - High contrast for accessibility
   - Pill shape for modern feel

5. **Visual Elements - Product** (object):
   {
     "type": "${brand ? `${brand} branded uniform/product on wooden hanger` : 'Industry-relevant product'}",
     "position": "Centered, 35-55% vertical range (middle 20%)",
     "size": "45% of canvas width (486px)",
     "focus": "Crystal sharp, 300 DPI equivalent, logo clearly visible"
   }
   - Center stage (main visual)
   - Brand identity clear
   - Professional product photography quality

6. **Spacing** (object):
   {
     "headlineToProduct": "80px vertical gap",
     "productToSubheadline": "60px vertical gap",
     "subheadlineToCTA": "100px vertical gap"
   }
   - Breathing room between elements
   - Clear visual separation
   - Z-pattern reading flow

TYPOGRAPHY BEST PRACTICES:
- Headline: 72-84pt (scroll-stopping size)
- Subheadline: 28-36pt (readable but secondary)
- CTA: 38-46pt (prominent but not overwhelming)
- Line height: 1.1-1.3 for headlines, 1.4-1.6 for body
- Letter spacing: +2% for all-caps headlines

CONTRAST REQUIREMENTS (WCAG AA):
- Text on background: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- CTA button: minimum 4.5:1 ratio for text

PLATFORM OPTIMIZATION:
- Mobile-first (text must be readable on 375px screen)
- Thumbnail test (readable at 300x300px)
- Fast scroll test (headline grabs attention in 0.5s)

OUTPUT:
Return ONLY a JSON object (no markdown, no code fences) with complete specs.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: GRAPHIC_DESIGNER_PERSONA,
        },
        {
          role: 'user',
          content: userContext,
        },
      ],
      temperature: 0.5, // More precise, less creative
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    // Return structured output
    return {
      canvas: parsed.canvas || {
        size: '1080x1080',
        orientation: 'square',
        safeMargins: '54px all sides',
      },
      typography: {
        headline: parsed.typography?.headline || {
          fontStyle: 'Extra Bold, All Caps, Sans-serif',
          fontSize: '72pt',
          color: '#E30613',
          position: 'Centered, 15% from top',
          width: '85% of canvas width',
          lineHeight: '1.1',
          letterSpacing: '2%',
          effects: 'Subtle white outline (2px)',
        },
        subheadline: parsed.typography?.subheadline || {
          fontStyle: 'Medium, Sentence case',
          fontSize: '32pt',
          color: '#333333',
          position: 'Centered, 60% from top',
        },
        cta: parsed.typography?.cta || {
          text: 'APPLY NOW',
          fontStyle: 'Bold, All Caps',
          fontSize: '42pt',
          color: '#000000',
          background: '#FFD700',
          position: 'Centered, 85% from top',
          buttonSize: '756px × 120px',
          borderRadius: '60px',
          shadow: '0px 8px 16px rgba(0,0,0,0.15)',
        },
      },
      visualElements: {
        product: parsed.visualElements?.product || {
          type: brand ? `${brand} branded uniform on wooden hanger` : 'Industry product',
          position: 'Centered, 35-55% vertical',
          size: '45% of canvas width',
          focus: 'Sharp, 300 DPI, logo visible',
        },
      },
      spacing: parsed.spacing || {
        headlineToProduct: '80px',
        productToSubheadline: '60px',
        subheadlineToCTA: '100px',
      },
    };

  } catch (error: any) {
    console.error('❌ Graphic Designer agent failed:', error.message);
    return generateMockGraphicDesign(request);
  }
}

// ============================================================================
// MOCK DATA (FALLBACK)
// ============================================================================

function generateMockGraphicDesign(request: GraphicDesignRequest): GraphicDesignOutput {
  const { niche } = request;
  
  const detectedBrand = detectBrand(niche);
  const brand = detectedBrand?.name || null;

  return {
    canvas: {
      size: '1080x1080',
      orientation: 'square',
      safeMargins: '54px all sides',
    },
    typography: {
      headline: {
        fontStyle: 'Extra Bold, All Caps, Sans-serif',
        fontSize: '72pt',
        color: '#E30613',
        position: 'Centered horizontally, 15% from top',
        width: '85% of canvas width (918px)',
        lineHeight: '1.1',
        letterSpacing: '2%',
        effects: 'Subtle white outline (2px) for contrast',
      },
      subheadline: {
        fontStyle: 'Medium, Sentence case',
        fontSize: '32pt',
        color: '#333333',
        position: 'Centered horizontally, 60% from top',
      },
      cta: {
        text: 'APPLY NOW',
        fontStyle: 'Bold, All Caps',
        fontSize: '42pt',
        color: '#000000',
        background: '#FFD700',
        position: 'Centered horizontally, 85% from top',
        buttonSize: '756px width × 120px height',
        borderRadius: '60px (pill shape)',
        shadow: '0px 8px 16px rgba(0,0,0,0.15)',
      },
    },
    visualElements: {
      product: {
        type: brand ? `${brand} branded uniform on natural wooden hanger` : 'Industry-relevant product',
        position: 'Centered, 35-55% vertical range',
        size: '45% of canvas width (486px)',
        focus: 'Crystal sharp, 300 DPI, logo clearly visible',
      },
    },
    spacing: {
      headlineToProduct: '80px',
      productToSubheadline: '60px',
      subheadlineToCTA: '100px',
    },
  };
}

