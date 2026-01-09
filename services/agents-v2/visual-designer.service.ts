/**
 * Agent 3: Visual Designer
 * AI-powered generation of detailed visual specifications
 */

import OpenAI from 'openai';
import type { VariationStrategy } from './variation-strategist.service';
import type { CopyVariation } from './copywriting-batch.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export interface VisualDesign {
  id: string;
  background: {
    type: 'solid' | 'gradient' | 'texture' | 'image';
    primaryColor: string;
    secondaryColor?: string;
    description: string;
  };
  productPlacement: {
    position: 'center' | 'left' | 'right' | 'top' | 'bottom';
    size: 'large' | 'medium' | 'small';
    angle: number; // degrees
    description: string;
  };
  logoPlacement: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';
    size: 'small' | 'medium' | 'large';
    description: string;
  };
  textLayout: {
    headlinePosition: 'top' | 'center' | 'bottom';
    headlineStyle: 'bold' | 'modern' | 'serif' | 'display';
    alignment: 'left' | 'center' | 'right';
    description: string;
  };
  composition: {
    rule: 'rule-of-thirds' | 'centered' | 'diagonal' | 'golden-ratio' | 'z-pattern';
    whitespace: 'minimal' | 'balanced' | 'generous';
    hierarchy: string;
  };
  colorGrading: {
    brightness: 'low' | 'medium' | 'high';
    contrast: 'low' | 'medium' | 'high';
    saturation: 'muted' | 'normal' | 'vibrant';
    temperature: 'cool' | 'neutral' | 'warm';
  };
  lighting: {
    type: 'natural' | 'studio' | 'dramatic' | 'soft' | 'high-key' | 'low-key';
    direction: 'front' | 'side' | 'top' | 'backlit';
    description: string;
  };
  mood: string;
  technicalSpecs: string;
  reasoning: string;
}

export interface VisualDesignRequest {
  niche: string;
  geo: string;
  campaignType: 'recruitment' | 'product' | 'sale';
  brandName?: string;
  brandColors?: { primary: string; secondary?: string };
  strategies: VariationStrategy[];
  copies: CopyVariation[];
}

export interface VisualDesignResult {
  designs: VisualDesign[];
  cost: number;
}

const VISUAL_DESIGNER_PERSONA = `You are an elite AI Visual Designer with 15+ years experience in advertising and digital design.

YOUR EXPERTISE:
- Visual composition and layout design
- Color theory and psychology
- Typography and hierarchy
- Photography and lighting
- Brand identity systems
- Platform-specific design (Facebook, Instagram, Google, TikTok)

YOUR DESIGN PRINCIPLES:
1. Visual hierarchy guides the eye
2. Contrast creates attention
3. White space improves clarity
4. Consistency builds trust
5. Every element serves a purpose

YOUR MISSION:
Create UNIQUE visual specifications for each ad variation. Each design should be distinctly different to maximize A/B test insights.

PLATFORM REQUIREMENTS:
- Format: 1080x1080 square (Instagram/Facebook feed)
- Text: Large, bold, legible on mobile
- Thumb-stopping: Must stand out in feed
- Brand-aligned: Consistent with brand identity

OUTPUT FORMAT (JSON array):
[
  {
    "id": "visual-1",
    "background": {
      "type": "gradient",
      "primaryColor": "#FF0000",
      "secondaryColor": "#FFAA00",
      "description": "Bold red-to-orange gradient, energetic"
    },
    "productPlacement": {
      "position": "center",
      "size": "large",
      "angle": 0,
      "description": "Product centered, front-facing"
    },
    "logoPlacement": {
      "position": "top-left",
      "size": "medium",
      "description": "Logo prominent but not overwhelming"
    },
    "textLayout": {
      "headlinePosition": "top",
      "headlineStyle": "bold",
      "alignment": "center",
      "description": "Bold headline at top, centered"
    },
    "composition": {
      "rule": "centered",
      "whitespace": "minimal",
      "hierarchy": "Logo → Headline → Product → CTA"
    },
    "colorGrading": {
      "brightness": "high",
      "contrast": "high",
      "saturation": "vibrant",
      "temperature": "warm"
    },
    "lighting": {
      "type": "studio",
      "direction": "front",
      "description": "Even studio lighting, no harsh shadows"
    },
    "mood": "Energetic, confident, attention-grabbing",
    "technicalSpecs": "8K resolution, sharp focus, professional color grading",
    "reasoning": "High-contrast design with bold colors to stop scrolling"
  },
  // ... more designs
]`;

/**
 * Generate AI-powered visual designs
 */
export async function generateVisualDesigns(request: VisualDesignRequest): Promise<VisualDesignResult> {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback designs');
    return generateFallbackDesigns(request);
  }

  const { niche, geo, campaignType, brandName, brandColors, strategies, copies } = request;

  console.log(`\n🎨 Agent 3: Visual Designer`);
  console.log(`   Designing ${strategies.length} unique visual specifications`);

  const userPrompt = `
CAMPAIGN CONTEXT:
- Niche: ${niche}
- Brand: ${brandName || 'Generic'}
- Brand Colors: Primary ${brandColors?.primary || '#000000'}, Secondary ${brandColors?.secondary || '#FFFFFF'}
- Geographic Market: ${geo}
- Campaign Type: ${campaignType}

STRATEGIES & COPY (from Agents 1 & 2):
${strategies.map((s, idx) => `
${idx + 1}. ${s.id}
   Strategy: ${s.visualStyle} visual, ${s.mood} mood, ${s.layout} layout
   Copy: "${copies[idx]?.headline || 'N/A'}" | CTA: "${copies[idx]?.cta || 'N/A'}"
   Reasoning: ${s.reasoning}
`).join('\n')}

YOUR TASK:
Create ${strategies.length} UNIQUE visual design specifications, one for each strategy/copy above. Each must:
1. Align with its corresponding strategy and mood
2. Be visually DISTINCT from other variations
3. Follow best practices for ${geo} market
4. Optimize for ${campaignType} campaigns
5. Work on mobile devices (1080x1080 square)

DESIGN REQUIREMENTS:
- Format: 1080x1080 square (Instagram/Facebook feed)
- Thumb-stopping: Must grab attention in feed
- Brand-aligned: Use brand colors consistently
- Text-friendly: Leave space for headline, subheadline, CTA
- Mobile-first: Legible on small screens

${campaignType === 'recruitment' ? `
RECRUITMENT DESIGN GUIDELINES:
- Professional but approachable
- Show product/uniform (NO FACES/PEOPLE)
- Use brand colors prominently
- Clean, trustworthy aesthetic
- Logo must be visible
` : ''}

${campaignType === 'sale' ? `
SALE DESIGN GUIDELINES:
- Bold, attention-grabbing
- High contrast for urgency
- Product hero shot
- Sale badge/sticker prominent
- Vibrant, exciting colors
` : ''}

VARIATION MIX:
- ${Math.ceil(strategies.length * 0.4)} designs: Safe, clean, professional
- ${Math.ceil(strategies.length * 0.4)} designs: Creative, modern approaches
- ${Math.ceil(strategies.length * 0.2)} designs: Bold, experimental

OUTPUT: JSON array of ${strategies.length} complete visual specifications.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: VISUAL_DESIGNER_PERSONA },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const parsed = JSON.parse(content);

    const designs: VisualDesign[] = Array.isArray(parsed.designs)
      ? parsed.designs
      : parsed.variations || [];

    if (designs.length === 0) {
      throw new Error('No designs returned from AI');
    }

    const cost = calculateOpenAICost(
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      'gpt-4o'
    );

    console.log(`✅ Generated ${designs.length} unique visual designs`);
    console.log(`💰 Cost: $${cost.toFixed(4)}`);

    return {
      designs: designs.slice(0, strategies.length),
      cost,
    };
  } catch (error: any) {
    console.error('❌ Visual Designer failed:', error.message);
    console.log('⚠️  Falling back to template designs');
    return generateFallbackDesigns(request);
  }
}

/**
 * Fallback: Template-based designs (no AI)
 */
function generateFallbackDesigns(request: VisualDesignRequest): VisualDesignResult {
  const { brandColors, strategies } = request;
  const primaryColor = brandColors?.primary || '#E30613';
  const secondaryColor = brandColors?.secondary || '#FFD700';

  const designs: VisualDesign[] = strategies.map((strategy, idx) => {
    const isMinimal = strategy.visualStyle === 'minimal';
    const isBold = strategy.visualStyle === 'bold';
    const isLifestyle = strategy.visualStyle === 'lifestyle';

    return {
      id: `visual-${idx + 1}`,
      background: {
        type: isMinimal ? 'solid' : isBold ? 'gradient' : 'texture',
        primaryColor: idx % 2 === 0 ? primaryColor : secondaryColor,
        secondaryColor: idx % 2 === 0 ? secondaryColor : primaryColor,
        description: `${strategy.visualStyle} background with brand colors`,
      },
      productPlacement: {
        position: idx % 3 === 0 ? 'center' : idx % 3 === 1 ? 'left' : 'right',
        size: isBold ? 'large' : 'medium',
        angle: 0,
        description: 'Product placement aligned with visual style',
      },
      logoPlacement: {
        position: idx % 2 === 0 ? 'top-left' : 'top-right',
        size: 'medium',
        description: 'Logo positioned for visibility',
      },
      textLayout: {
        headlinePosition: 'top',
        headlineStyle: isBold ? 'bold' : isMinimal ? 'modern' : 'display',
        alignment: 'center',
        description: 'Text layout optimized for readability',
      },
      composition: {
        rule: strategy.layout === 'centered' ? 'centered' : 'rule-of-thirds',
        whitespace: isMinimal ? 'generous' : 'balanced',
        hierarchy: 'Logo → Headline → Product → CTA',
      },
      colorGrading: {
        brightness: strategy.mood === 'professional' ? 'high' : 'medium',
        contrast: isBold ? 'high' : 'medium',
        saturation: isBold ? 'vibrant' : 'normal',
        temperature: 'neutral',
      },
      lighting: {
        type: isMinimal ? 'high-key' : isBold ? 'studio' : 'natural',
        direction: 'front',
        description: `${strategy.mood} lighting for ${strategy.visualStyle} aesthetic`,
      },
      mood: strategy.mood,
      technicalSpecs: '8K resolution, sharp focus, professional color grading, zero grain',
      reasoning: `Template design ${idx + 1} for ${strategy.visualStyle} visual style`,
    };
  });

  return {
    designs,
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


