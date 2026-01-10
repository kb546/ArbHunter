import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Import already-generated V3 creatives into a campaign (so users can generate first, then save).
 * NOTE: Stores image_url as a data URL for MVP. Later we should upload to storage + store public URLs.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const session = await getAuthedSessionFromCookies();
    if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: campaignId } = await params;
    const body = await req.json();
    const creatives = Array.isArray(body?.creatives) ? body.creatives : [];
    if (creatives.length === 0) return NextResponse.json({ error: 'No creatives provided' }, { status: 400 });

    const supabase = createSupabaseAuthedServerClient(session.accessToken);

    // 1) Insert creatives
    const creativesToInsert = creatives.map((c: any) => ({
      campaign_id: campaignId,
      image_url: c.imageUrl,
      prompt: c.prompt || '',
      model: c.model || null,
      cost: null,
      orientation: 'square',
      style: null,
      predicted_score: typeof c.visualScore === 'number' ? c.visualScore : null,
      is_favorite: false,
    }));

    const { data: insertedCreatives, error: cErr } = await supabase
      .from('generated_creatives')
      .insert(creativesToInsert)
      .select('id');
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

    // 2) Insert copies
    const copiesToInsert = creatives.map((c: any) => ({
      campaign_id: campaignId,
      headline: c.headline || 'Untitled',
      primary_text: c.subheadline || c.headline || '',
      description: null,
      call_to_action: c.cta || null,
      copy_formula: 'Custom',
      tone_of_voice: 'professional',
      estimated_ctr: typeof c.predictedCTR === 'number' ? c.predictedCTR : null,
      engagement_score: typeof c.textScore === 'number' ? c.textScore : null,
      reasoning: c.qcIssues?.length ? `QC issues: ${(c.qcIssues as string[]).join(' • ')}`.slice(0, 1000) : null,
      is_favorite: false,
    }));

    const { data: insertedCopies, error: pErr } = await supabase.from('generated_copies').insert(copiesToInsert).select('id');
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    // 3) Link variations
    const rowsC = (insertedCreatives || []) as Array<{ id: string }>;
    const rowsP = (insertedCopies || []) as Array<{ id: string }>;
    const variationsToInsert = creatives
      .map((c: any, idx: number) => {
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
      const { error: vErr } = await supabase
        .from('campaign_variations')
        .upsert(variationsToInsert as any, { onConflict: 'campaign_id,creative_id,copy_id' });
      if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaignId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

