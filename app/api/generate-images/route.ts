/**
 * Image Generation API
 * Generates ad creatives using Flux.1 Schnell and saves to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCreatives } from '@/services/image-generation.service';
import type { ImageGenerationRequest } from '@/types/creative-studio';
import { getBillingAccess } from '@/lib/billing.server';

export async function POST(request: NextRequest) {
  try {
    const access = await getBillingAccess();
    if (!access.ok) {
      return NextResponse.json(
        { error: 'Subscription required', reason: access.reason, status: access.status ?? null, plan: access.plan ?? null },
        { status: 402 }
      );
    }

    const body: ImageGenerationRequest = await request.json();
    const { campaignId, niche, geo, style, orientation, variations } = body;

    // Validation
    if (!campaignId || !niche || !geo || !style || !orientation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (variations < 1 || variations > 5) {
      return NextResponse.json(
        { error: 'Variations must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log(`\n🎨 Image Generation Request:`);
    console.log(`   Campaign: ${campaignId}`);
    console.log(`   Niche: ${niche}`);
    console.log(`   Style: ${style}`);
    console.log(`   Variations: ${variations}`);

    // Generate images with multi-provider fallback
    const { creatives, totalCost, provider } = await generateCreatives(body);

    // Save to database
    const creativesToInsert = creatives.map(creative => ({
      campaign_id: campaignId,
      ...creative,
    }));

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('generated_creatives')
      .insert(creativesToInsert)
      .select();

    if (error) {
      console.error('❌ Error saving creatives to database:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save creatives',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully saved ${data.length} creatives to database`);

    const providerNames: Record<string, string> = {
      'dalle3': 'DALL-E 3 (Highest Quality)',
      'gemini': 'Gemini Imagen (High Quality)',
      'flux-schnell': 'Flux.1 Schnell',
      'sdxl': 'Stability AI SDXL',
      'mock': 'Mock Data (for testing)',
    };

    return NextResponse.json({
      success: true,
      creatives: data,
      totalCost,
      provider: providerNames[provider] || provider,
      message: `Generated ${data.length} creative(s) with ${providerNames[provider]} for $${totalCost.toFixed(4)}`,
    });

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    return NextResponse.json(
      { 
        error: 'Image generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

