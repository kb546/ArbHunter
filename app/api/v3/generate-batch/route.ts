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
import { assessPolicyCompliance } from '@/services/policy-compliance.service';
import { detectCampaignType } from '@/services/campaign-type-detector.service';

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

    // Policy compliance check (non-blocking; warnings only)
    let policy: any = null;
    try {
      const ct = await detectCampaignType(niche, geo);
      policy = await assessPolicyCompliance({
        niche,
        geo,
        campaignType: String(ct?.campaignType || ''),
        creatives: (result.variations || []).map((v: any) => ({
          id: String(v.id || ''),
          headline: String(v.headline || ''),
          subheadline: v.subheadline ? String(v.subheadline) : undefined,
          cta: v.cta ? String(v.cta) : undefined,
          prompt: v.prompt ? String(v.prompt) : undefined,
        })),
      });
    } catch {
      policy = null;
    }

    // Persist into generated_creatives if campaignId provided (RLS protected).
    if (campaignId && isSupabaseConfigured()) {
      const session = await getAuthedSessionFromCookies();
      if (session?.accessToken) {
        const supabase = createSupabaseAuthedServerClient(session.accessToken);
        try {
          // 1) Insert creatives
          const creativesToInsert = result.variations.map((v: any) => ({
            campaign_id: campaignId,
            image_url: v.imageUrl,
            prompt: v.prompt || '',
            model: v.model || null,
            cost: v.cost || null,
            orientation: 'square',
            style: null,
            predicted_score: v.visualScore || null,
          }));

          const { data: insertedCreatives, error: creativeErr } = await supabase
            .from('generated_creatives')
            .insert(creativesToInsert)
            .select('id');
          if (creativeErr) throw creativeErr;

          // 2) Insert copies (derived from batch variations)
          const copiesToInsert = result.variations.map((v: any) => ({
            campaign_id: campaignId,
            headline: v.headline || 'Untitled',
            primary_text: v.subheadline || v.headline || '—',
            description: null,
            call_to_action: v.cta || null,
            copy_formula: 'Custom',
            tone_of_voice: 'professional',
            estimated_ctr: v.predictedCTR || null,
            engagement_score: v.textScore || null,
            reasoning: (v.prompt ? `Generated from prompt: ${v.prompt}` : null),
          }));

          const { data: insertedCopies, error: copyErr } = await supabase
            .from('generated_copies')
            .insert(copiesToInsert)
            .select('id');
          if (copyErr) throw copyErr;

          // 3) Link via campaign_variations (preserve order)
          const rowsC = (insertedCreatives || []) as Array<{ id: string }>;
          const rowsP = (insertedCopies || []) as Array<{ id: string }>;
          const variationsToInsert = result.variations
            .map((v: any, idx: number) => {
              const creativeId = rowsC[idx]?.id;
              const copyId = rowsP[idx]?.id;
              if (!creativeId || !copyId) return null;
              return {
                campaign_id: campaignId,
                creative_id: creativeId,
                copy_id: copyId,
                variation_name: `V${idx + 1}`,
                is_control: idx === 0,
                predicted_winner: idx === 0,
                status: 'untested',
              };
            })
            .filter(Boolean);

          if (variationsToInsert.length > 0) {
            const { error: varErr } = await supabase
              .from('campaign_variations')
              .upsert(variationsToInsert as any, { onConflict: 'campaign_id,creative_id,copy_id' });
            if (varErr) throw varErr;
          }
        } catch (e) {
          console.warn('Failed to persist campaign assets (batch):', e);
        }
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
      metadata: { ...(result.metadata || {}), policy },
    });
  } catch (error: any) {
    console.error('❌ Batch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


