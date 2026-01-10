/**
 * Batch Creative Generation API
 * Generates 5-20 unique ad variations in parallel
 */

import { NextRequest, NextResponse } from 'next/server';
import { orchestrateBatchGeneration } from '@/services/batch-orchestrator.service';
import type { BatchGenerationRequest } from '@/services/batch-orchestrator.service';
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
      batchSize = 5,
      model = 'auto',
      marginScore,
    } = body as any;
    const campaignId = (body as any)?.campaignId as string | undefined;

    console.log('\n🎨 Batch Creative Generation API');
    console.log(`   Niche: ${niche}`);
    console.log(`   GEO: ${geo}`);
    console.log(`   Batch Size: ${batchSize}`);
    console.log(`   Model: ${model}`);

    // Validate inputs
    if (!niche || !geo) {
      return NextResponse.json(
        { error: 'Missing required fields: niche and geo' },
        { status: 400 }
      );
    }

    if (![5, 10, 20].includes(batchSize)) {
      return NextResponse.json(
        { error: 'Batch size must be 5, 10, or 20' },
        { status: 400 }
      );
    }

    // Monthly usage limit (creatives)
    const usageCheck = await ensureWithinLimit('creative', batchSize);
    if (!usageCheck.ok) {
      return NextResponse.json(
        { error: 'Monthly creative limit reached', plan: usageCheck.plan, limit: usageCheck.limit, used: usageCheck.used },
        { status: 429 }
      );
    }

    // Orchestrate batch generation
    const result = await orchestrateBatchGeneration({
      niche,
      geo,
      targetAudience,
      batchSize: batchSize as any,
      model,
      marginScore,
    });

    // Persist into generated_creatives if campaignId provided (RLS protected).
    if (campaignId && isSupabaseConfigured()) {
      const session = await getAuthedSessionFromCookies();
      if (session?.accessToken) {
        const supabase = createSupabaseAuthedServerClient(session.accessToken);
        const toInsert = result.variations.map((v: any) => ({
          campaign_id: campaignId,
          image_url: v.imageUrl,
          prompt: v.prompt || '',
          model: v.model || null,
          cost: v.cost || null,
          orientation: 'square',
          style: null,
        }));
        const { error } = await supabase.from('generated_creatives').insert(toInsert);
        if (error) console.warn('Failed to save generated_creatives:', error);
      }
    }

    // Record usage (best-effort)
    await recordUsage('creative', result.variations.length);

    return NextResponse.json({
      success: true,
      variations: result.variations,
      totalCost: result.totalCost,
      totalTime: result.totalTime,
      campaignId: campaignId || null,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('❌ Batch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


