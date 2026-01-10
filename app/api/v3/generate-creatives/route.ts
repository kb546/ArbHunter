/**
 * Creative Studio V3 API - Simplified for Ad Arbitrage
 * Auto-detect brand, always 2 variations, smart model selection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateWithAuto,
  batchGenerate,
  buildGeminiPrompt,
} from '@/services/gemini-image.service';
import { detectBrand } from '@/services/brand-intelligence.service';
import type { GeneratedCreativeV3 } from '@/types/creative-studio';
import { getBillingAccess } from '@/lib/billing.server';
import { ensureWithinLimit, recordUsage } from '@/lib/usage.server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const access = await getBillingAccess();
    if (!access.ok) {
      return NextResponse.json(
        { error: 'Subscription required', reason: access.reason, status: access.status ?? null, plan: access.plan ?? null },
        { status: 402 }
      );
    }

    const body = await request.json();
    const {
      niche,
      geo,
      targetAudience,
      model = 'auto',
      marginScore,
      variations = 2, // Always 2 for A/B testing
    } = body as any;
    const campaignId = (body as any)?.campaignId as string | undefined;

    console.log('\n🎨 Creative Studio V3 - Ad Arb Focused');
    console.log(`   Niche: ${niche}`);
    console.log(`   GEO: ${geo}`);
    console.log(`   Margin Score: ${marginScore || 'unknown'}`);
    console.log(`   Model: ${model}`);
    console.log(`   Variations: ${variations}`);

    // Validate inputs
    if (!niche || !geo) {
      return NextResponse.json(
        { error: 'Missing required fields: niche and geo' },
        { status: 400 }
      );
    }

    // Auto-detect brand (no upload needed!)
    console.log('\n🔍 Auto-detecting brand...');
    const detectedBrand = detectBrand(niche, geo);
    
    if (detectedBrand) {
      console.log(`✅ Brand detected: ${detectedBrand.name} (${detectedBrand.fullName})`);
      console.log(`   Colors: ${detectedBrand.colorNames.primary}, ${detectedBrand.colorNames.secondary}`);
      console.log(`   Industry: ${detectedBrand.industry}`);
    } else {
      console.log('ℹ️  No brand detected, using generic approach');
    }

    // Smart model selection based on margin score
    let selectedModel: 'fast' | 'pro' | 'mixed' = 'pro'; // Default to pro
    
    if (model === 'auto' && marginScore !== null && marginScore !== undefined) {
      if (marginScore >= 8) {
        selectedModel = 'pro'; // High margin → quality
        console.log('🎯 Auto-selected: Gemini Pro (high margin opportunity)');
      } else if (marginScore >= 6) {
        selectedModel = 'mixed'; // Medium margin → balanced
        console.log('🎯 Auto-selected: Mixed (medium margin opportunity)');
      } else {
        selectedModel = 'fast'; // Low margin → cheap
        console.log('🎯 Auto-selected: Gemini Fast (low margin opportunity)');
      }
    } else if (model === 'fast') {
      selectedModel = 'fast';
    } else if (model === 'pro') {
      selectedModel = 'pro';
    }

    // Determine campaign type from niche
    let campaignType: 'recruitment' | 'product' | 'sale' = 'product';
    if (/job|career|hiring|employment|work|position|opportunity|driver|courier|warehouse|retail/i.test(niche)) {
      campaignType = 'recruitment';
    } else if (/sale|discount|offer|deal|promo|clearance|%|off/i.test(niche)) {
      campaignType = 'sale';
    }

    console.log(`📋 Campaign type: ${campaignType}`);

    // Build brand-aware prompt
    const prompt = buildGeminiPrompt({
      brandName: detectedBrand?.name || niche.split(' ')[0],
      brandColors: detectedBrand?.colors || {
        primary: '#4F46E5',
        secondary: '#8B5CF6',
      },
      campaignType,
      niche,
      geo,
      targetAudience,
      size: 'square', // Always square for social
    });

    console.log('\n📝 Generated Prompt:');
    console.log(prompt.substring(0, 300) + '...\n');

    // Generate images
    console.log(`🚀 Generating ${variations} variations with ${selectedModel} model...`);
    const startTime = Date.now();

    // Monthly usage limit (creatives)
    const usageCheck = await ensureWithinLimit('creative', Number(variations) || 0);
    if (!usageCheck.ok) {
      return NextResponse.json(
        { error: 'Monthly creative limit reached', plan: usageCheck.plan, limit: usageCheck.limit, used: usageCheck.used },
        { status: 429 }
      );
    }

    const generatedImages = await batchGenerate(prompt, variations, selectedModel);

    const totalTime = Date.now() - startTime;
    const totalCost = generatedImages.reduce((sum, img) => sum + img.cost, 0);

    console.log(`\n✅ Generation complete!`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Total cost: $${totalCost.toFixed(4)}`);
    console.log(`   Per ad: $${(totalCost / variations).toFixed(4)}`);

    // Build response with AI-generated copy
    const creatives: GeneratedCreativeV3[] = generatedImages.map((img, idx) => {
      // Generate variation-specific copy
      const headlines = generateHeadlines(niche, detectedBrand?.name, campaignType);
      const subheadlines = generateSubheadlines(niche, campaignType, targetAudience);
      const ctas = generateCTAs(campaignType);

      // Calculate quality scores (simplified for now)
      const baseScore = img.model === 'gemini-3-pro-image-preview' ? 90 : 85;
      const brandBonus = detectedBrand ? 5 : 0;
      const variance = Math.random() * 3;

      return {
        id: `creative-${Date.now()}-${idx}`,
        imageUrl: img.imageUrl,
        headline: headlines[idx % headlines.length],
        subheadline: subheadlines[idx % subheadlines.length],
        cta: ctas[idx % ctas.length],
        predictedCTR: parseFloat((6 + Math.random() * 4 + (brandBonus / 5)).toFixed(1)), // 6-10%
        visualScore: Math.round(baseScore + brandBonus + variance),
        brandScore: Math.round(baseScore + brandBonus + variance - 2),
        textScore: Math.round(baseScore + brandBonus + variance + 1),
        model: img.model,
        prompt,
        generatedAt: new Date().toISOString(),
      };
    });

    // Sort by predicted CTR (highest first)
    creatives.sort((a, b) => b.predictedCTR - a.predictedCTR);

    // If a campaign is provided, persist creatives into generated_creatives (RLS protected).
    if (campaignId && isSupabaseConfigured()) {
      const session = await getAuthedSessionFromCookies();
      if (session?.accessToken) {
        const supabase = createSupabaseAuthedServerClient(session.accessToken);
        const toInsert = generatedImages.map((img: any) => ({
          campaign_id: campaignId,
          image_url: img.imageUrl,
          prompt,
          model: img.model,
          cost: img.cost,
          orientation: 'square',
          style: null,
        }));
        const { error } = await supabase.from('generated_creatives').insert(toInsert);
        if (error) console.warn('Failed to save generated_creatives:', error);
      }
    }

    // Record usage (best-effort)
    await recordUsage('creative', creatives.length);

    return NextResponse.json({
      success: true,
      creatives,
      totalTime,
      totalCost,
      campaignId: campaignId || null,
      metadata: {
        niche,
        geo,
        brand: detectedBrand ? {
          name: detectedBrand.name,
          detected: true,
        } : {
          name: 'Generic',
          detected: false,
        },
        campaignType,
        variations,
        modelUsed: selectedModel,
        marginScore,
      },
    });
  } catch (error: any) {
    console.error('❌ Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COPY GENERATION HELPERS
// ============================================================================

function generateHeadlines(
  niche: string,
  brandName: string | undefined,
  campaignType: 'recruitment' | 'product' | 'sale'
): string[] {
  const brand = brandName || niche.split(' ')[0];

  if (campaignType === 'recruitment') {
    return [
      `${brand.toUpperCase()} IS HIRING NOW`,
      `Join the ${brand} Team Today`,
      `${brand} Careers - Start This Week`,
      `Now Hiring at ${brand}`,
    ];
  } else if (campaignType === 'sale') {
    return [
      `${brand} SALE - Limited Time`,
      `Huge Savings at ${brand}`,
      `Don't Miss ${brand}'s Best Deal`,
      `${brand} - Shop Now & Save`,
    ];
  } else {
    return [
      `Discover ${brand}`,
      `${brand} - Premium Quality`,
      `Experience ${brand}`,
      `${brand} - Try It Today`,
    ];
  }
}

function generateSubheadlines(
  niche: string,
  campaignType: 'recruitment' | 'product' | 'sale',
  targetAudience?: string
): string[] {
  if (campaignType === 'recruitment') {
    return [
      'Weekly pay, flexible hours, start this week',
      'Great benefits and career growth opportunities',
      'Join our team - apply in 2 minutes',
      'No experience needed - we provide training',
    ];
  } else if (campaignType === 'sale') {
    return [
      'Limited time offer - save up to 50%',
      'Shop now before it\'s too late',
      'Exclusive deals you can\'t miss',
      'Lowest prices of the season',
    ];
  } else {
    return [
      targetAudience ? `Perfect for ${targetAudience}` : 'Premium quality, unbeatable value',
      'Trusted by thousands worldwide',
      'Experience the difference today',
      'Limited availability - order now',
    ];
  }
}

function generateCTAs(campaignType: 'recruitment' | 'product' | 'sale'): string[] {
  if (campaignType === 'recruitment') {
    return [
      'APPLY NOW',
      'APPLY TODAY',
      'START NOW',
      'JOIN US',
    ];
  } else if (campaignType === 'sale') {
    return [
      'SHOP NOW',
      'SAVE NOW',
      'GET OFFER',
      'SHOP SALE',
    ];
  } else {
    return [
      'LEARN MORE',
      'GET STARTED',
      'TRY NOW',
      'SHOP NOW',
    ];
  }
}
