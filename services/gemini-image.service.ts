/**
 * Gemini Image Generation Service
 * Nano Banana (Fast) and Nano Banana Pro (Quality) models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from '@/types/creative-studio';
import type { CampaignType } from '@/services/campaign-type-detector.service';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini Image Generation initialized');
} else {
  console.warn('⚠️  GEMINI_API_KEY not configured');
}

// ============================================================================
// NANO BANANA (FAST) - gemini-2.5-flash-image
// ============================================================================

export async function generateWithNanoBanana(
  prompt: string
): Promise<{ imageUrl: string; model: GeminiModel; cost: number }> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  console.log('\n⚡ Nano Banana (Fast) generating...');
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Extract image from response
    const imageData = extractImageFromResponse(response);
    
    if (!imageData) {
      throw new Error('No image data returned from Gemini');
    }

    // Convert to data URL
    const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

    const duration = Date.now() - startTime;
    console.log(`✅ Nano Banana generated in ${duration}ms`);

    return {
      imageUrl,
      model: 'gemini-2.5-flash-image',
      cost: 0.002, // Estimated cost (very low)
    };
  } catch (error: any) {
    console.error('❌ Nano Banana failed:', error.message);
    throw new Error(`Nano Banana generation failed: ${error.message}`);
  }
}

// ============================================================================
// NANO BANANA PRO (QUALITY) - gemini-3-pro-image-preview
// ============================================================================

export async function generateWithNanoBananaPro(
  prompt: string
): Promise<{ imageUrl: string; model: GeminiModel; cost: number }> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  console.log('\n💎 Nano Banana Pro (Quality) generating...');
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Extract image from response
    const imageData = extractImageFromResponse(response);
    
    if (!imageData) {
      throw new Error('No image data returned from Gemini');
    }

    // Convert to data URL
    const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

    const duration = Date.now() - startTime;
    console.log(`✅ Nano Banana Pro generated in ${duration}ms`);

    return {
      imageUrl,
      model: 'gemini-3-pro-image-preview',
      cost: 0.01, // Estimated cost (higher quality)
    };
  } catch (error: any) {
    console.error('❌ Nano Banana Pro failed:', error.message);
    throw new Error(`Nano Banana Pro generation failed: ${error.message}`);
  }
}

// ============================================================================
// AUTO SELECTOR (SMART ROUTING)
// ============================================================================

export async function generateWithAuto(
  prompt: string,
  mode: 'fast' | 'pro' = 'pro'
): Promise<{ imageUrl: string; model: GeminiModel; cost: number }> {
  console.log(`\n🤖 Auto mode (preference: ${mode})`);

  try {
    // Try preferred model first
    if (mode === 'pro') {
      return await generateWithNanoBananaPro(prompt);
    } else {
      return await generateWithNanoBanana(prompt);
    }
  } catch (error: any) {
    console.log(`⚠️  ${mode} model failed, trying fallback...`);
    
    // Fallback to other model
    try {
      if (mode === 'pro') {
        return await generateWithNanoBanana(prompt);
      } else {
        return await generateWithNanoBananaPro(prompt);
      }
    } catch (fallbackError: any) {
      console.error('❌ All Gemini models failed');
      throw new Error('Both Nano Banana models failed');
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractImageFromResponse(response: any): { mimeType: string; data: string } | null {
  try {
    // Gemini returns images in response.candidates[0].content.parts
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return null;
    }

    const parts = candidates[0].content.parts;
    if (!parts || parts.length === 0) {
      return null;
    }

    // Find the part with inlineData (image)
    for (const part of parts) {
      if (part.inlineData) {
        return {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting image from response:', error);
    return null;
  }
}

// ============================================================================
// PROMPT BUILDER (Brand-Aware)
// ============================================================================

export function buildGeminiPrompt(params: {
  brandName: string;
  brandColors: { primary: string; secondary: string };
  campaignType: CampaignType;
  niche: string;
  geo: string;
  targetAudience?: string;
  keyMessage?: string;
  size: 'square' | 'portrait' | 'landscape';
  variationHint?: string; // optional, used to enforce diversity between variations
}): string {
  const {
    brandName,
    brandColors,
    campaignType,
    niche,
    geo,
    targetAudience,
    keyMessage,
    size,
    variationHint,
  } = params;

  // Size mapping
  const sizeSpecs = {
    square: '1080x1080 square (1:1)',
    portrait: '1080x1350 portrait (4:5)',
    landscape: '1920x1080 landscape (16:9)',
  };

  const base = `IMPORTANT QUALITY RULES:
- Make the creative highly relevant to: "${niche}" (${geo})
- Do NOT include random/unrelated props or confusing objects.
- Do NOT default to uniforms/aprons/hangers unless the campaign is explicitly about hiring/jobs.
- Avoid purple/blue default branding when brand colors are unknown. Prefer clean neutral backgrounds and a single accent color.
- Text must be readable and minimal (mobile-first). Keep it simple.`;

  const hint = variationHint ? `\n\nVARIATION DIRECTION:\n${variationHint}\n` : '';

  // Campaign-specific templates (expanded beyond recruitment/product/sale)
  const templates = {
    recruitment: `Professional hiring advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Hiring Topic: ${niche}
- Market: ${geo}

LAYOUT:
- Background: clean and modern (neutral), not cluttered
- Use one strong hero visual that matches the hiring context (storefront, in-store team, employees at work, friendly manager, etc.)
- Avoid confusing objects; avoid generic stock-like scenes
- Keep brand feeling accurate (colors, vibe)

${keyMessage ? `KEY BENEFITS:\n${keyMessage}\n` : ''}

STYLE:
- High-quality, realistic, modern ad creative
- Clean typography and clear hierarchy
- Professional lighting and composition
- No weird artifacts
- If a logo appears, keep it subtle and realistic (do not invent complex marks)

AUDIENCE: ${targetAudience || 'Job seekers'}

${base}${hint}

DELIVERABLE: A scroll-stopping hiring ad.`,

    free_sample: `High-converting free sample advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Offer: ${niche}
- Market: ${geo}

LAYOUT:
- Make the product/sample the clear hero (packaging, bottle, box, kit)
- Show "FREE SAMPLE" clearly (simple text, no spammy style)
- Use clean background and a single accent
- Avoid uniforms/aprons/hiring cues

STYLE:
- Premium product photography or clean lifestyle shot
- Minimal, readable text
- No clutter

AUDIENCE: ${targetAudience || 'People interested in free samples'}

${base}${hint}

DELIVERABLE: A clean, trustworthy free sample ad.`,

    credit_card: `High-converting credit card offer advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Market: ${geo}
- Offer: ${niche}

LAYOUT:
- Clean, premium, trustworthy
- Use abstract finance visuals (cards, subtle patterns) but avoid fake logos
- No hiring/uniform visuals

AUDIENCE: ${targetAudience || 'Applicants'}

${base}${hint}

DELIVERABLE: A compliant-looking, trustworthy credit offer ad.`,

    government_program: `Clear informational advertisement for a government program.

CANVAS: ${sizeSpecs[size]}

TOPIC:
- Program: ${niche}
- Market: ${geo}

LAYOUT:
- Informational, calm, trustworthy
- Avoid sensational imagery
- No uniforms/aprons/hiring visuals

AUDIENCE: ${targetAudience || 'Eligible applicants'}

${base}${hint}

DELIVERABLE: A clean informational ad.`,

    education: `High-converting education advertisement.

CANVAS: ${sizeSpecs[size]}

TOPIC:
- Education offer: ${niche}
- Market: ${geo}

LAYOUT:
- Clean, optimistic, trustworthy
- Use education visuals (books, laptop, graduation cap) without clutter

AUDIENCE: ${targetAudience || 'Learners'}

${base}${hint}

DELIVERABLE: A clean education ad.`,

    lead_gen: `High-converting lead generation advertisement.

CANVAS: ${sizeSpecs[size]}

TOPIC:
- Offer: ${niche}
- Market: ${geo}

LAYOUT:
- Trust-first, simple, clear CTA
- Avoid uniforms/aprons/hiring cues unless the niche is a job

AUDIENCE: ${targetAudience || 'Prospects'}

${base}${hint}

DELIVERABLE: A clean lead gen ad.`,

    trial_offer: `High-converting free trial advertisement.

CANVAS: ${sizeSpecs[size]}

TOPIC:
- Trial offer: ${niche}
- Market: ${geo}

LAYOUT:
- Modern SaaS-style or product-style (depending on niche)
- Trustworthy, simple, minimal text

AUDIENCE: ${targetAudience || 'Prospects'}

${base}${hint}

DELIVERABLE: A clean trial ad.`,

    sweepstakes: `High-converting giveaway / sweepstakes advertisement.

CANVAS: ${sizeSpecs[size]}

TOPIC:
- Sweepstakes: ${niche}
- Market: ${geo}

LAYOUT:
- Exciting but not spammy
- Prize-focused visuals (gift card, product box) with clean typography

AUDIENCE: ${targetAudience || 'Entrants'}

${base}${hint}

DELIVERABLE: A clean giveaway ad.`,

    discount_sale: `Bold sale/promotion advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Promotion: ${niche}
- Market: ${geo}

LAYOUT:
- Background: High-contrast, attention-grabbing, but clean
- Clear offer and CTA

${keyMessage ? `OFFER DETAILS:\n${keyMessage}\n` : ''}

STYLE:
- Bold, impactful
- Clear urgency

AUDIENCE: ${targetAudience || 'Deal seekers'}

${base}${hint}

DELIVERABLE: A high-CTR sale ad.`,

    product_launch: `Premium product launch advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Market: ${geo}
- Launch: ${niche}

LAYOUT:
- Premium, clean, product-first
- Avoid uniforms/aprons/hiring cues

AUDIENCE: ${targetAudience || 'Customers'}

${base}${hint}

DELIVERABLE: A premium launch ad.`,

    delivery_gig: `High-converting delivery/gig recruitment advertisement.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Market: ${geo}
- Offer: ${niche}

LAYOUT:
- Show delivery context (vehicle, app screen, courier outdoors) but keep it clean
- Avoid random uniforms unless clearly delivery-related

AUDIENCE: ${targetAudience || 'Drivers / couriers'}

${base}${hint}

DELIVERABLE: A gig recruitment ad.`,

    product: `Professional product advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Product/Service: ${niche}
- Market: ${geo}

LAYOUT:
- Background: Clean, modern, brand-aligned (${brandColors.primary} or white)
- Hero Product: Featured product in center, premium presentation
- Headline: Bold, benefit-driven, ${brandColors.primary}
- Subheadline: Supporting text, builds desire
- CTA: ${brandColors.secondary} button with clear action

${keyMessage ? `KEY FEATURES:\n${keyMessage}\n` : ''}

STYLE:
- Premium product photography
- Professional lighting
- High-end aesthetic
- Brand logo prominently displayed
- 8K quality

AUDIENCE: ${targetAudience || 'Target customers'}

${base}${hint}

DELIVERABLE: High-converting product ad.`,

    // Legacy alias: keep supporting "sale"
    sale: undefined as any,
  };

  // Map legacy "sale" to discount_sale (keeps existing callers working)
  const normalized = (campaignType === ('sale' as any) ? 'discount_sale' : campaignType) as CampaignType;
  const t = (templates as any)[normalized] || templates.product;
  return t;
}

// ============================================================================
// BATCH GENERATION
// ============================================================================

export async function batchGenerate(
  prompts: string | string[],
  count: number,
  model: 'fast' | 'pro' | 'mixed' = 'mixed'
): Promise<Array<{ imageUrl: string; model: GeminiModel; cost: number }>> {
  console.log(`\n🔄 Batch generating ${count} images (${model} mode)`);

  const results = [];
  const promises = [];

  // Handle both single prompt and multiple prompts
  const promptArray = Array.isArray(prompts) ? prompts : Array(count).fill(prompts);

  for (let i = 0; i < count; i++) {
    const prompt = promptArray[i % promptArray.length];
    
    if (model === 'mixed') {
      // Alternate between fast and pro
      const useProModel = i % 2 === 0;
      promises.push(
        useProModel
          ? generateWithNanoBananaPro(prompt)
          : generateWithNanoBanana(prompt)
      );
    } else if (model === 'pro') {
      promises.push(generateWithNanoBananaPro(prompt));
    } else {
      promises.push(generateWithNanoBanana(prompt));
    }
  }

  // Generate in parallel
  try {
    const generatedResults = await Promise.all(promises);
    results.push(...generatedResults);
    console.log(`✅ Batch generation complete: ${results.length} images`);
  } catch (error) {
    console.error('❌ Batch generation failed:', error);
    throw error;
  }

  return results;
}

/**
 * Generate images from an array of prompts
 * Modern interface for AI Agents V2
 */
export async function generateGeminiImages(
  prompts: string[],
  model: GeminiModel = 'gemini-2.5-flash-image'
): Promise<Array<{ url: string; model: GeminiModel }>> {
  console.log(`\n📸 Generating ${prompts.length} images with ${model}...`);
  
  const promises = prompts.map(prompt => {
    if (model === 'gemini-3-pro-image-preview') {
      return generateWithNanoBananaPro(prompt);
    } else {
      return generateWithNanoBanana(prompt);
    }
  });

  try {
    const results = await Promise.all(promises);
    console.log(`✅ Generated ${results.length} images`);
    
    // Convert to expected format
    return results.map(r => ({
      url: r.imageUrl,
      model: r.model,
    }));
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    throw error;
  }
}

