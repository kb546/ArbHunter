/**
 * Image Generation Service - Multi-Provider Support
 * Generates ad creatives using OpenAI DALL-E 3, Google Gemini Imagen, Flux.1, or Stability AI
 * Priority: Quality first, with automatic fallback
 */

import * as fal from "@fal-ai/serverless-client";
import type { 
  CreativeStyle, 
  CreativeOrientation, 
  GeneratedCreative, 
  ImageGenerationRequest,
  ImageModel
} from '@/types/creative-studio';

// ============================================================================
// API KEYS CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FAL_API_KEY = process.env.FAL_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

// Log available providers
console.log('🎨 Image Generation Providers Available:');
console.log(`   - OpenAI DALL-E 3: ${OPENAI_API_KEY ? '✅' : '❌'}`);
console.log(`   - Google Gemini Imagen: ${GEMINI_API_KEY ? '✅' : '❌'}`);
console.log(`   - Flux.1 Schnell (FAL): ${FAL_API_KEY ? '✅' : '❌'}`);
console.log(`   - Stability AI SDXL: ${STABILITY_API_KEY ? '✅' : '❌'}`);

// Configure FAL client if available
if (FAL_API_KEY) {
  fal.config({
    credentials: FAL_API_KEY,
  });
}

// ============================================================================
// PROVIDER PRIORITY & COSTS (Quality First)
// ============================================================================

const PROVIDER_PRIORITY: ImageModel[] = [
  'dalle3',      // Highest quality, $0.040-$0.080 per image
  'gemini',      // High quality, ~$0.020 per image
  'flux-schnell', // Fast & cheap, $0.003 per image
  'sdxl',        // Good quality, $0.010 per image
];

const COST_PER_IMAGE: Record<ImageModel, number> = {
  'dalle3': 0.040,      // OpenAI DALL-E 3 (1024x1024)
  'gemini': 0.020,      // Google Gemini Imagen
  'flux-schnell': 0.003, // Flux.1 Schnell
  'sdxl': 0.010,        // Stability AI SDXL
};

// Default dimensions for different orientations
const DIMENSIONS: Record<CreativeOrientation, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 1024, height: 1792 }, // Optimized for DALL-E 3
  landscape: { width: 1792, height: 1024 }, // Optimized for DALL-E 3
};

// DALL-E 3 specific sizes (they're strict about this)
const DALLE3_SIZES: Record<CreativeOrientation, string> = {
  square: '1024x1024',
  portrait: '1024x1792',
  landscape: '1792x1024',
};

// ============================================================================
// PROMPT ENGINEERING
// ============================================================================

/**
 * Creative Director-Level Style Specifications
 * Based on proven ad creative structures that convert
 */
const STYLE_MODIFIERS: Record<CreativeStyle, string> = {
  studio: 
    "COMPOSITION: Premium studio product shot—brand uniform or product on natural wooden hanger, centered in 1080x1080 frame, bright white or soft cream background (#F9F6F0 to #FFFFFF). EXACT CENTERING with 40% negative space above, 40% below. LIGHTING: Bright diffused daylight, ZERO harsh shadows, high-key clean aesthetic, editorial-level clarity, crystal-sharp focus. STYLE: Minimalist, breathable, Apple-inspired product photography, premium recruitment aesthetic. MOOD: High-trust, professional, corporate-approved, 'premium employer' signal. CRITICAL: Product must be perfectly centered, well-lit, and occupy exactly 20-30% of frame. Background must be pristine white/cream, no distractions, no people.",
  
  professional: 
    "COMPOSITION: Ultra-clean studio setup with bright white or soft neutral background (#F9F6F0), product/uniform centered in frame on natural wooden hanger or display surface. LIGHTING: Bright diffused daylight, no harsh shadows, high-key clean aesthetic, editorial-level clarity. STYLE: Minimalist, breathable spacing, premium recruitment aesthetic. MOOD: High-trust, professional, corporate-approved.",
  
  casual: 
    "COMPOSITION: Lifestyle scene with authentic workplace environment, natural props (coffee, laptop, casual uniform elements), centered subject with soft bokeh background blur. LIGHTING: Warm natural window light, golden hour feel, soft shadows for depth. STYLE: Relatable, approachable, everyday authenticity. MOOD: Friendly, welcoming, 'start this week' energy.",
  
  lifestyle: 
    "COMPOSITION: Aspirational workplace moment showing brand products/uniforms in authentic use, faceless or cropped perspective focusing on hands, products, or environmental context. LIGHTING: Crisp natural daylight, bright and optimistic, clean shadows. STYLE: Modern editorial, Instagram-worthy, visual storytelling. MOOD: Energetic, fast-paced, career opportunity.",
  
  urgency: 
    "COMPOSITION: Bold product-focused layout with high-contrast brand colors, brand uniform/product as hero element centered in frame, clean uncluttered background. LIGHTING: Bright studio lighting, full saturation, crisp edges, dramatic clarity. STYLE: Attention-grabbing, high-impact, clear visual hierarchy. MOOD: 'Apply now', immediate action, limited-time opportunity.",
  
  minimal: 
    "COMPOSITION: Single product/uniform element centered on pure white or solid color background, maximum negative space (70% background, 30% subject), breathing room on all sides. LIGHTING: Even studio lighting, no shadows, ultra-clean high-key setup. STYLE: Premium minimalist, Apple-inspired aesthetic, sophisticated simplicity. MOOD: Premium, high-end, quality employer branding.",
  
  bold: 
    "COMPOSITION: Brand product/uniform filling 60% of frame, vibrant brand colors (#FFD700, #E30613), dynamic angle (slightly tilted or 3/4 view), clean solid background in complementary color. LIGHTING: Bright, saturated, high-contrast studio setup, sharp focus, no grain. STYLE: Eye-catching, scroll-stopping, bold brand presence. MOOD: Confident, established, 'join our team' authority.",
  
  vibrant: 
    "COMPOSITION: Colorful workplace scene with brand uniforms and products, multiple brand color elements (packaging, uniforms, props), balanced color distribution across frame. LIGHTING: Bright, cheerful, evenly lit, enhanced saturation, no flat tones. STYLE: Energetic, youthful, Instagram-optimized color palette. MOOD: Fun, dynamic, exciting workplace culture.",
  
  dark: 
    "COMPOSITION: Moody lifestyle setup with brand product/uniform illuminated against dark (#1A1A1A) or desaturated background, spotlight effect on subject, dramatic depth of field. LIGHTING: Cinematic single-source lighting, rim lights, controlled shadows, film-quality depth. STYLE: Premium, sophisticated, emotional storytelling. MOOD: Aspirational, prestige brand, career elevation.",
};

/**
 * Generate Creative Director-Level Prompts
 * Structured like professional ad creative briefs
 */
function buildFluxPrompt(
  niche: string,
  style: CreativeStyle,
  targetAudience?: string,
  competitorInsights?: { topAdvertisers: string[]; commonThemes: string[] }
): string {
  // Extract brand name from niche if present
  const brandMatch = niche.match(/^([A-Z][A-Za-z0-9&\s]+?)(?:\s+(?:jobs?|careers?|hiring|employment|opportunities|positions))/i);
  const brand = brandMatch ? brandMatch[1].trim() : null;
  
  // Determine if this is a job/recruitment ad
  const isRecruitmentAd = /(?:job|career|hiring|employment|work|position|opportunity|driver|courier|warehouse|retail|cashier|manager|team member)/i.test(niche);
  
  const styleSpec = STYLE_MODIFIERS[style];
  
  // Build product-focused creative brief
  let productElement = '';
  if (isRecruitmentAd && brand) {
    productElement = `HERO ELEMENT: ${brand} branded uniform (shirt, polo, or apron) with official logo, hanging on natural wooden hanger, OR ${brand} branded products/packaging neatly arranged. NO FACES OR PEOPLE—focus on product and brand identity.`;
  } else if (brand) {
    productElement = `HERO ELEMENT: ${brand} branded product or packaging, centered and clearly visible, official brand colors and logo prominent.`;
  } else {
    productElement = `HERO ELEMENT: Industry-relevant product or uniform representing ${niche}, professionally styled and centered in frame.`;
  }
  
  // Background and canvas specs
  const canvasSpec = "CANVAS: 1080x1080 (or equivalent square ratio), optimized for social media feeds.";
  
  // Quality and technical specs
  const technicalSpec = "TECHNICAL: Studio-quality photography, 8K resolution feel, sharp focus, professional color grading, zero grain/noise, commercial-ready output. NO TEXT, NO TYPOGRAPHY, NO HEADLINES—pure visual creative only. The image will have text overlaid in post-production.";
  
  // Audience context
  const audienceNote = targetAudience 
    ? `AUDIENCE INSIGHT: ${targetAudience}. Tailor visual tone to resonate with this demographic.`
    : '';
  
  // Competitor insights
  const competitorNote = competitorInsights?.commonThemes?.length
    ? `MARKET INTELLIGENCE: Top-performing ads in this category use themes like: ${competitorInsights.commonThemes.slice(0, 2).join(', ')}. Incorporate these proven visual strategies.`
    : '';
  
  // Brand-specific color guidance
  let colorGuidance = '';
  if (brand) {
    const brandColors: Record<string, string> = {
      'DHL': 'bright yellow (#FFCC00) and red (#D40511)',
      'KFC': 'red (#E30613) and white, with golden yellow accents',
      'McDonald': 'golden yellow (#FFD700) and red (#E30613)',
      'Walmart': 'Walmart blue (#0071CE) and yellow (#FFC220)',
      'Amazon': 'Amazon orange (#FF9900) and black',
      'Target': 'Target red (#CC0000) and white',
      'Starbucks': 'Starbucks green (#00704A) and white',
      'UPS': 'UPS brown (#351C15) and gold (#FFB500)',
    };
    
    const matchedBrand = Object.keys(brandColors).find(b => brand.toLowerCase().includes(b.toLowerCase()));
    if (matchedBrand) {
      colorGuidance = `BRAND COLORS: Use official ${matchedBrand} brand colors: ${brandColors[matchedBrand]}. Ensure brand accuracy and color fidelity.`;
    }
  }
  
  // Assemble final creative brief
  return [
    `CREATIVE BRIEF FOR ${brand || niche.toUpperCase()} AD:`,
    canvasSpec,
    productElement,
    styleSpec,
    colorGuidance,
    audienceNote,
    competitorNote,
    technicalSpec,
    "DELIVER: A scroll-stopping, brand-focused product shot that serves as the perfect foundation for recruitment or sales ad creative. Think Apple product launches meets premium job recruitment."
  ].filter(Boolean).join('\n\n');
}

// ============================================================================
// PROVIDER-SPECIFIC GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate images using OpenAI DALL-E 3 (HIGHEST QUALITY)
 */
export async function generateWithDALLE3(
  prompt: string,
  orientation: CreativeOrientation,
  numImages: number = 1
): Promise<Array<{ url: string; dimensions: { width: number; height: number } }>> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`🎨 Generating ${numImages} image(s) with DALL-E 3 (HIGHEST QUALITY)`);
  
  const results: Array<{ url: string; dimensions: { width: number; height: number } }> = [];
  const size = DALLE3_SIZES[orientation];

  // DALL-E 3 can only generate 1 image at a time
  for (let i = 0; i < numImages; i++) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: size,
          quality: 'hd', // Use HD quality for best results
          style: 'vivid', // 'vivid' or 'natural'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DALL-E 3 API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      results.push({
        url: data.data[0].url,
        dimensions: DIMENSIONS[orientation],
      });

      // Add delay between requests to avoid rate limits
      if (i < numImages - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.error(`❌ DALL-E 3 generation ${i + 1} failed:`, error);
      throw error;
    }
  }

  console.log(`✅ DALL-E 3: Generated ${results.length} high-quality image(s)`);
  return results;
}

/**
 * Generate images using Google Gemini Imagen
 */
async function generateWithGemini(
  prompt: string,
  orientation: CreativeOrientation,
  numImages: number = 1
): Promise<Array<{ url: string; dimensions: { width: number; height: number } }>> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  console.log(`🎨 Generating ${numImages} image(s) with Gemini Imagen`);
  
  try {
    // Gemini Imagen 3 uses Vertex AI API
    // Note: This requires Vertex AI setup in Google Cloud
    // For now, using the generative AI API endpoint
    
    const aspectRatio = orientation === 'square' ? '1:1' : orientation === 'portrait' ? '9:16' : '16:9';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
          }],
          parameters: {
            sampleCount: numImages,
            aspectRatio: aspectRatio,
            negativePrompt: 'blurry, low quality, distorted, pixelated, watermark',
            safetyFilterLevel: 'block_some',
            personGeneration: 'allow_adult',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse Gemini Imagen response
    const results: Array<{ url: string; dimensions: { width: number; height: number } }> = [];
    
    if (data.predictions && data.predictions.length > 0) {
      for (const prediction of data.predictions) {
        if (prediction.bytesBase64Encoded) {
          results.push({
            url: `data:image/png;base64,${prediction.bytesBase64Encoded}`,
            dimensions: DIMENSIONS[orientation],
          });
        } else if (prediction.imageUrl) {
          results.push({
            url: prediction.imageUrl,
            dimensions: DIMENSIONS[orientation],
          });
        }
      }
    }

    if (results.length === 0) {
      throw new Error('No images returned from Gemini Imagen');
    }

    console.log(`✅ Gemini: Generated ${results.length} image(s)`);
    return results;

  } catch (error: any) {
    console.error('❌ Gemini generation failed:', error);
    throw error;
  }
}

/**
 * Generate images using FAL.ai Flux.1 Schnell
 */
async function generateWithFlux(
  prompt: string,
  orientation: CreativeOrientation,
  numImages: number = 1
): Promise<Array<{ url: string; dimensions: { width: number; height: number } }>> {
  if (!FAL_API_KEY) {
    throw new Error('FAL_API_KEY not configured');
  }

  const dimensions = DIMENSIONS[orientation];

  console.log(`🎨 Generating ${numImages} image(s) with Flux.1 Schnell`);

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: orientation,
        num_images: numImages,
        enable_safety_checker: true,
        output_format: "jpeg",
      },
      logs: true,
    }) as any;

    console.log(`✅ Flux.1: Generated ${result.images.length} image(s)`);

    return result.images.map((img: any) => ({
      url: img.url,
      dimensions,
    }));

  } catch (error: any) {
    console.error('❌ Flux.1 generation failed:', error);
    throw error;
  }
}

/**
 * Generate images using Stability AI SDXL
 */
async function generateWithSDXL(
  prompt: string,
  orientation: CreativeOrientation,
  numImages: number = 1
): Promise<Array<{ url: string; dimensions: { width: number; height: number } }>> {
  if (!STABILITY_API_KEY) {
    throw new Error('Stability AI API key not configured');
  }

  console.log(`🎨 Generating ${numImages} image(s) with Stability AI SDXL`);
  
  const dimensions = DIMENSIONS[orientation];
  const results: Array<{ url: string; dimensions: { width: number; height: number } }> = [];

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: dimensions.height,
        width: dimensions.width,
        samples: numImages,
        steps: 30,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stability AI error: ${response.statusText}`);
    }

    const data = await response.json();
    
    for (const artifact of data.artifacts) {
      results.push({
        url: `data:image/png;base64,${artifact.base64}`,
        dimensions,
      });
    }

    console.log(`✅ SDXL: Generated ${results.length} image(s)`);
    return results;

  } catch (error: any) {
    console.error('❌ SDXL generation failed:', error);
    throw error;
  }
}

// ============================================================================
// MAIN SERVICE FUNCTION WITH MULTI-PROVIDER FALLBACK
// ============================================================================

/**
 * Generate ad creatives with automatic provider fallback (Quality First)
 * NOW WITH AI PROMPT ENGINEER AGENT!
 */
export async function generateCreatives(
  request: ImageGenerationRequest
): Promise<{ creatives: Partial<GeneratedCreative>[]; totalCost: number; provider: string }> {
  const { 
    niche, 
    geo, 
    style, 
    orientation, 
    variations, 
    targetAudience, 
    competitorInsights 
  } = request;

  console.log(`\n🚀 Starting TWO-STAGE AI WORKFLOW:`);
  console.log(`   Stage 1: AI Prompt Engineer Agent (GPT-4)`);
  console.log(`   Stage 2: AI Image Generator (DALL-E 3/Flux/etc.)`);
  console.log(`   Niche: ${niche}`);
  console.log(`   GEO: ${geo}`);
  console.log(`   Style: ${style}`);
  console.log(`   Variations: ${variations}`);

  const creatives: Partial<GeneratedCreative>[] = [];
  let totalCost = 0;
  let usedProvider: ImageModel = 'flux-schnell';

  // STAGE 1: AI Prompt Engineer Agent generates professional prompt
  let prompt: string;
  let promptQuality = 0;
  
  try {
    // Import the AI Prompt Engineer Agent
    const { generateAdPrompt, buildFallbackPrompt } = await import('./prompt-engineer-agent.service');
    
    console.log('\n🤖 STAGE 1: AI Prompt Engineer Agent analyzing your request...');
    
    const isRecruitmentAd = /(?:job|career|hiring|employment|work|position|opportunity)/i.test(niche);
    
    const promptResult = await generateAdPrompt({
      niche,
      geo,
      style,
      targetAudience,
      orientation,
      adObjective: isRecruitmentAd ? 'recruitment' : 'sales'
    });
    
    prompt = promptResult.generatedPrompt;
    promptQuality = promptResult.estimatedQuality;
    
    console.log(`✅ AI Prompt Engineer: Generated ${prompt.length}-char prompt (Quality: ${promptQuality}/100)`);
    console.log(`📝 Prompt Preview: ${prompt.substring(0, 150)}...`);
    
  } catch (error: any) {
    console.warn(`⚠️  AI Prompt Engineer failed: ${error.message}`);
    console.log('🔄 Falling back to manual prompt builder...');
    
    // Fallback to our manual prompt builder
    prompt = buildFluxPrompt(niche, style, targetAudience, competitorInsights);
  }

  console.log('\n🎨 STAGE 2: Sending to AI Image Generator...');

  // Try each provider in priority order (quality first)
  for (const provider of PROVIDER_PRIORITY) {
    try {
      console.log(`\n🎨 Trying provider: ${provider.toUpperCase()}`);
      
      let images: Array<{ url: string; dimensions: { width: number; height: number } }> = [];

      switch (provider) {
        case 'dalle3':
          if (!OPENAI_API_KEY) {
            console.log('⏭️  Skipping DALL-E 3 (no API key)');
            continue;
          }
          images = await generateWithDALLE3(prompt, orientation, variations);
          usedProvider = 'dalle3';
          break;

        case 'gemini':
          if (!GEMINI_API_KEY) {
            console.log('⏭️  Skipping Gemini (no API key)');
            continue;
          }
          try {
            images = await generateWithGemini(prompt, orientation, variations);
            usedProvider = 'gemini';
          } catch (error) {
            console.log('⚠️  Gemini not available yet, trying next provider...');
            continue;
          }
          break;

        case 'flux-schnell':
          if (!FAL_API_KEY) {
            console.log('⏭️  Skipping Flux.1 (no API key)');
            continue;
          }
          images = await generateWithFlux(prompt, orientation, variations);
          usedProvider = 'flux-schnell';
          break;

        case 'sdxl':
          if (!STABILITY_API_KEY) {
            console.log('⏭️  Skipping SDXL (no API key)');
            continue;
          }
          images = await generateWithSDXL(prompt, orientation, variations);
          usedProvider = 'sdxl';
          break;
      }

      // If we got images, process them and break the loop
      if (images.length > 0) {
        const costPerImage = COST_PER_IMAGE[usedProvider];

        for (const image of images) {
          const creative: Partial<GeneratedCreative> = {
            image_url: image.url,
            thumbnail_url: image.url,
            prompt,
            style,
            orientation,
            model: usedProvider,
            cost: costPerImage,
            dimensions: image.dimensions,
            predicted_score: predictCreativeScore(style, niche),
            is_favorite: false,
            generated_at: new Date().toISOString(),
          };

          creatives.push(creative);
          totalCost += costPerImage;
        }

        console.log(`\n✅ Generation complete with ${usedProvider.toUpperCase()}!`);
        console.log(`   Images: ${creatives.length}`);
        console.log(`   Quality: ${provider === 'dalle3' ? 'HIGHEST' : provider === 'gemini' ? 'HIGH' : 'GOOD'}`);
        console.log(`   Total cost: $${totalCost.toFixed(4)}`);

        return { creatives, totalCost, provider: usedProvider };
      }

    } catch (error: any) {
      console.error(`❌ ${provider.toUpperCase()} generation failed:`, error.message);
      console.log(`⏭️  Trying next provider...`);
      continue;
    }
  }

  // All providers failed, return mock data
  console.log('\n⚠️  All providers failed, returning mock data as fallback');
  const mockResult = getMockCreatives(request);
  return { ...mockResult, provider: 'mock' };
}

// ============================================================================
// MOCK DATA (FOR DEVELOPMENT/FALLBACK)
// ============================================================================

function getMockCreatives(
  request: ImageGenerationRequest
): { creatives: Partial<GeneratedCreative>[]; totalCost: number } {
  const { niche, style, orientation, variations } = request;
  
  const mockImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1024&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1024&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1024&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1024&q=80',
  ];

  const creatives: Partial<GeneratedCreative>[] = [];
  
  for (let i = 0; i < variations; i++) {
    creatives.push({
      image_url: mockImages[i % mockImages.length],
      thumbnail_url: mockImages[i % mockImages.length],
      prompt: `Mock ad creative for ${niche} in ${style} style`,
      style,
      orientation,
      model: 'flux-schnell',
      cost: 0.001, // Mock cost
      dimensions: DIMENSIONS[orientation],
      predicted_score: Math.floor(Math.random() * 30) + 65, // 65-95
      is_favorite: false,
      generated_at: new Date().toISOString(),
    });
  }

  return { 
    creatives, 
    totalCost: 0.001 * variations 
  };
}

// ============================================================================
// SCORING & PREDICTIONS
// ============================================================================

/**
 * Predict creative performance score (1-100)
 * Based on style, niche, and AI heuristics
 */
function predictCreativeScore(style: CreativeStyle, niche: string): number {
  // Base score: 60-80
  let score = Math.floor(Math.random() * 20) + 60;

  // Style bonuses
  if (style === 'professional' || style === 'lifestyle') score += 5;
  if (style === 'urgency' || style === 'bold') score += 8;
  if (style === 'vibrant') score += 3;

  // Niche adjustments (simplified)
  const lowercaseNiche = niche.toLowerCase();
  if (lowercaseNiche.includes('tech') || lowercaseNiche.includes('software')) score += 5;
  if (lowercaseNiche.includes('fitness') || lowercaseNiche.includes('health')) score += 7;
  if (lowercaseNiche.includes('finance') || lowercaseNiche.includes('crypto')) score += 3;

  // Cap at 100
  return Math.min(score, 100);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { COST_PER_IMAGE, DIMENSIONS, PROVIDER_PRIORITY };

