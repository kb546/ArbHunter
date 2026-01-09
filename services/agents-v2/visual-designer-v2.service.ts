/**
 * Agent 3: Visual Designer V2 - CATEGORY-AWARE
 * AI-powered generation of category-specific visual specifications
 * 
 * CRITICAL UPDATE: Now generates diverse visuals across 5 categories:
 * 1. Product (hero product shots)
 * 2. People (employees/lifestyle)
 * 3. Benefits (graphic-heavy)
 * 4. Uniform (apparel on hanger)
 * 5. CTA-Graphic (text-focused)
 */

import OpenAI from 'openai';
import type { VariationStrategy } from './variation-strategist.service';
import type { CopyVariation } from './copywriting-batch.service';
import type { CampaignType } from '../campaign-type-detector.service';
import type { CreativePreset, CreativePresetConfig } from '../creative-presets.service';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export interface VisualDesign {
  id: string;
  visualCategory: 'product' | 'people' | 'benefits' | 'uniform' | 'cta-graphic';
  mainElement: {
    type: string;
    description: string;
    position: 'center' | 'left' | 'right' | 'top' | 'bottom';
    size: 'large' | 'medium' | 'small';
  };
  background: {
    type: 'solid' | 'gradient' | 'texture' | 'image' | 'lifestyle';
    primaryColor: string;
    secondaryColor?: string;
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
  campaignType: CampaignType;
  brandName?: string;
  brandColors?: { primary: string; secondary?: string };
  brandHeroProduct?: { name: string; description: string; visualDescription: string };
  strategies: VariationStrategy[];
  copies: CopyVariation[];
  preset: CreativePreset;
  presetConfig: CreativePresetConfig;
}

export interface VisualDesignResult {
  designs: VisualDesign[];
  cost: number;
}

/**
 * Fallback: Template-based category-specific designs
 */
export function generateFallbackDesigns(request: VisualDesignRequest): VisualDesignResult {
  const { brandColors, brandHeroProduct, strategies, brandName } = request;
  const primaryColor = brandColors?.primary || '#E30613';
  const secondaryColor = brandColors?.secondary || '#FFD700';

  const designs: VisualDesign[] = strategies.map((strategy, idx) => {
    const category = strategy.visualCategory;

    // CRITICAL: Category-specific design logic
    if (category === 'product') {
      return {
        id: `visual-${idx + 1}`,
        visualCategory: 'product',
        mainElement: {
          type: 'hero-product',
          description: brandHeroProduct?.visualDescription || `${brandName} signature product, professional studio shot, appetizing, high-quality`,
          position: 'center',
          size: 'large',
        },
        background: {
          type: 'solid',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          description: `Clean ${primaryColor} background, professional studio aesthetic`,
        },
        logoPlacement: {
          position: 'top-left',
          size: 'medium',
          description: 'Brand logo prominently displayed',
        },
        textLayout: {
          headlinePosition: 'top',
          headlineStyle: 'bold',
          alignment: 'center',
          description: 'Bold headline at top, CTA at bottom',
        },
        composition: {
          rule: 'centered',
          whitespace: 'balanced',
          hierarchy: 'Logo → Headline → Product (hero) → Subheadline → CTA',
        },
        colorGrading: {
          brightness: 'high',
          contrast: 'high',
          saturation: 'vibrant',
          temperature: 'warm',
        },
        lighting: {
          type: 'studio',
          direction: 'front',
          description: 'Professional studio lighting, no harsh shadows',
        },
        mood: 'Appetizing, premium, brand-focused',
        technicalSpecs: '8K resolution, product photography, professional color grading',
        reasoning: `Product-focused visual showcasing ${brandName}'s hero product`,
      };
    }
    
    else if (category === 'people') {
      return {
        id: `visual-${idx + 1}`,
        visualCategory: 'people',
        mainElement: {
          type: 'employees',
          description: `Diverse team of 2-3 ${brandName} employees in uniform, smiling, welcoming pose, natural candid feel, workplace setting`,
          position: 'center',
          size: 'large',
        },
        background: {
          type: 'lifestyle',
          primaryColor: primaryColor,
          description: `${brandName} restaurant/workplace interior, branded environment, authentic setting`,
        },
        logoPlacement: {
          position: 'top-right',
          size: 'small',
          description: 'Logo visible but not overwhelming',
        },
        textLayout: {
          headlinePosition: 'top',
          headlineStyle: 'bold',
          alignment: 'center',
          description: 'Headline overlaid on image with high contrast',
        },
        composition: {
          rule: 'rule-of-thirds',
          whitespace: 'minimal',
          hierarchy: 'Headline → People (main focus) → CTA',
        },
        colorGrading: {
          brightness: 'medium',
          contrast: 'medium',
          saturation: 'normal',
          temperature: 'warm',
        },
        lighting: {
          type: 'natural',
          direction: 'front',
          description: 'Natural workplace lighting, authentic feel',
        },
        mood: 'Friendly, welcoming, team-oriented, authentic',
        technicalSpecs: 'Lifestyle photography, candid moments, natural colors',
        reasoning: `People-focused visual showcasing ${brandName} team culture`,
      };
    }
    
    else if (category === 'benefits') {
      return {
        id: `visual-${idx + 1}`,
        visualCategory: 'benefits',
        mainElement: {
          type: 'graphic-elements',
          description: 'Large, bold text displaying key benefit (salary, hours, benefits) with supporting icons and graphics',
          position: 'center',
          size: 'large',
        },
        background: {
          type: 'gradient',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          description: `Eye-catching gradient from ${primaryColor} to ${secondaryColor}, modern and energetic`,
        },
        logoPlacement: {
          position: 'top-left',
          size: 'small',
          description: 'Small logo for brand recognition',
        },
        textLayout: {
          headlinePosition: 'center',
          headlineStyle: 'display',
          alignment: 'center',
          description: 'Extra-large headline as main visual element',
        },
        composition: {
          rule: 'centered',
          whitespace: 'minimal',
          hierarchy: 'Benefit Text (dominant) → Supporting Graphics → CTA',
        },
        colorGrading: {
          brightness: 'high',
          contrast: 'high',
          saturation: 'vibrant',
          temperature: 'warm',
        },
        lighting: {
          type: 'high-key',
          direction: 'front',
          description: 'Bright, energetic lighting',
        },
        mood: 'Exciting, urgent, benefit-focused, attention-grabbing',
        technicalSpecs: 'Graphic design heavy, bold typography, high contrast',
        reasoning: 'Benefits-focused visual emphasizing key value proposition',
      };
    }
    
    else if (category === 'uniform') {
      return {
        id: `visual-${idx + 1}`,
        visualCategory: 'uniform',
        mainElement: {
          type: 'uniform-apparel',
          description: `${brandName} branded uniform (shirt, hat, apron) on wooden hanger, clean professional display`,
          position: 'center',
          size: 'medium',
        },
        background: {
          type: 'solid',
          primaryColor: primaryColor,
          description: `Simple ${primaryColor} background, clean and professional`,
        },
        logoPlacement: {
          position: 'top-left',
          size: 'medium',
          description: 'Logo clearly visible',
        },
        textLayout: {
          headlinePosition: 'top',
          headlineStyle: 'bold',
          alignment: 'center',
          description: 'Clean text layout, professional',
        },
        composition: {
          rule: 'centered',
          whitespace: 'generous',
          hierarchy: 'Logo → Headline → Uniform → CTA',
        },
        colorGrading: {
          brightness: 'high',
          contrast: 'medium',
          saturation: 'normal',
          temperature: 'neutral',
        },
        lighting: {
          type: 'studio',
          direction: 'front',
          description: 'Clean studio lighting',
        },
        mood: 'Professional, clean, brand-focused',
        technicalSpecs: 'Product photography, studio setup',
        reasoning: 'Uniform-focused visual showing professional attire',
      };
    }
    
    else { // cta-graphic
      return {
        id: `visual-${idx + 1}`,
        visualCategory: 'cta-graphic',
        mainElement: {
          type: 'text-graphics',
          description: 'Bold "HIRING NOW" or "APPLY TODAY" text with urgency graphics (arrows, badges, emphasis elements)',
          position: 'center',
          size: 'large',
        },
        background: {
          type: 'gradient',
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          description: `Bold gradient, urgent feel`,
        },
        logoPlacement: {
          position: 'top-left',
          size: 'small',
          description: 'Small logo for branding',
        },
        textLayout: {
          headlinePosition: 'center',
          headlineStyle: 'display',
          alignment: 'center',
          description: 'Massive CTA text as primary element',
        },
        composition: {
          rule: 'centered',
          whitespace: 'minimal',
          hierarchy: 'CTA Text (dominant) → Urgency Elements → Logo',
        },
        colorGrading: {
          brightness: 'high',
          contrast: 'high',
          saturation: 'vibrant',
          temperature: 'warm',
        },
        lighting: {
          type: 'high-key',
          direction: 'front',
          description: 'Bright, urgent lighting',
        },
        mood: 'Urgent, action-oriented, direct, compelling',
        technicalSpecs: 'Graphic design, bold typography, high impact',
        reasoning: 'CTA-focused visual driving immediate action',
      };
    }
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
  };

  const modelCosts = costs[model] || costs['gpt-4o'];
  return promptTokens * modelCosts.input + completionTokens * modelCosts.output;
}

// Export the function with the same name for compatibility
export const generateVisualDesigns = generateFallbackDesigns;


