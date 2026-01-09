/**
 * Gemini Image Generation Service
 * Nano Banana (Fast) and Nano Banana Pro (Quality) models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from '@/types/creative-studio';

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
  campaignType: 'recruitment' | 'product' | 'sale';
  niche: string;
  geo: string;
  targetAudience?: string;
  keyMessage?: string;
  size: 'square' | 'portrait' | 'landscape';
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
  } = params;

  // Size mapping
  const sizeSpecs = {
    square: '1080x1080 square (1:1)',
    portrait: '1080x1350 portrait (4:5)',
    landscape: '1920x1080 landscape (16:9)',
  };

  // Campaign-specific templates
  const templates = {
    recruitment: `Professional recruitment advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Industry: ${niche}
- Market: ${geo}

LAYOUT:
- Background: Bright white (#FFFFFF) or very light ${brandColors.primary}, clean studio lighting
- Top 20%: Bold headline "${brandName.toUpperCase()} IS HIRING NOW" in ${brandColors.primary}
- Center 50%: ${brandName} branded product or uniform on natural wooden hanger, perfectly centered
- Bottom 20%: Call-to-action button in ${brandColors.secondary} with "APPLY TODAY" text

${keyMessage ? `KEY BENEFITS:\n${keyMessage}\n` : ''}

STYLE:
- Studio product photography
- Apple-inspired minimalism
- High-key lighting, NO shadows
- 8K clarity, professional
- Brand logo visible (${brandName})

AUDIENCE: ${targetAudience || 'Job seekers'}

DELIVERABLE: A scroll-stopping, brand-focused recruitment ad.`,

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

DELIVERABLE: High-converting product ad.`,

    sale: `Bold sale/promotion advertisement for ${brandName}.

CANVAS: ${sizeSpecs[size]}

BRAND:
- Brand Name: ${brandName}
- Primary Color: ${brandColors.primary}
- Secondary Color: ${brandColors.secondary}
- Promotion: ${niche}
- Market: ${geo}

LAYOUT:
- Background: High-contrast, attention-grabbing
- Large SALE badge/banner in ${brandColors.primary}
- Discount percentage if applicable (e.g., "50% OFF")
- Product visual or branded element
- Urgent CTA: "SHOP NOW", "LIMITED TIME" in ${brandColors.secondary}

${keyMessage ? `OFFER DETAILS:\n${keyMessage}\n` : ''}

STYLE:
- Bold, impactful
- High contrast
- Clear urgency
- Brand logo visible
- Scroll-stopping

AUDIENCE: ${targetAudience || 'Bargain hunters, deal seekers'}

DELIVERABLE: Urgent, high-CTR sale ad.`,
  };

  return templates[campaignType];
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

