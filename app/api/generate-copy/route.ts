/**
 * Copy Generation API
 * Generates ad copy using AI and saves to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCopy } from '@/services/copy-generation.service';
import type { CopyGenerationRequest } from '@/types/creative-studio';
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

    const body: CopyGenerationRequest = await request.json();
    const { campaignId, niche, geo, targetAudience, toneOfVoice, callToAction, variations } = body;

    // Validation
    if (!campaignId || !niche || !geo || !targetAudience || !toneOfVoice || !callToAction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (variations < 1 || variations > 10) {
      return NextResponse.json(
        { error: 'Variations must be between 1 and 10' },
        { status: 400 }
      );
    }

    console.log(`\n📝 Copy Generation Request:`);
    console.log(`   Campaign: ${campaignId}`);
    console.log(`   Niche: ${niche}`);
    console.log(`   Tone: ${toneOfVoice}`);
    console.log(`   Variations: ${variations}`);

    // Generate copy
    const { copies, totalCost } = await generateCopy(body);

    // Save to database
    const copiesToInsert = copies.map(copy => ({
      campaign_id: campaignId,
      ...copy,
    }));

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('generated_copies')
      .insert(copiesToInsert)
      .select();

    if (error) {
      console.error('❌ Error saving copies to database:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save copies',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully saved ${data.length} copies to database`);

    return NextResponse.json({
      success: true,
      copies: data,
      totalCost,
      message: `Generated ${data.length} copy variation(s) for $${totalCost.toFixed(4)}`,
    });

  } catch (error: any) {
    console.error('❌ Copy generation error:', error);
    return NextResponse.json(
      { 
        error: 'Copy generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

