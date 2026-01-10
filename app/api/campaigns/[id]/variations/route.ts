import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const session = await getAuthedSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createSupabaseAuthedServerClient(session.accessToken);

    const { data, error } = await supabase
      .from('campaign_variations')
      .select('id,campaign_id,creative_id,copy_id,variation_name,status,is_control,predicted_winner,is_favorite,tags,created_at')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ variations: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

type PatchBody =
  | { action: 'mark_winner'; variationId: string }
  | { action: 'toggle_favorite'; variationId: string; is_favorite: boolean }
  | { action: 'set_tags'; variationId: string; tags: string[] };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const session = await getAuthedSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: campaignId } = await params;
    const body = (await req.json()) as PatchBody;
    const supabase = createSupabaseAuthedServerClient(session.accessToken);

    if (body.action === 'mark_winner') {
      // Winner: set one to winner, others to loser (preserve untested -> loser).
      const winnerId = body.variationId;

      // Set all to loser
      const { error: loseErr } = await supabase
        .from('campaign_variations')
        .update({ status: 'loser', predicted_winner: false })
        .eq('campaign_id', campaignId);
      if (loseErr) return NextResponse.json({ error: loseErr.message }, { status: 500 });

      // Set chosen to winner + favorite
      const { error: winErr } = await supabase
        .from('campaign_variations')
        .update({ status: 'winner', predicted_winner: true, is_favorite: true })
        .eq('campaign_id', campaignId)
        .eq('id', winnerId);
      if (winErr) return NextResponse.json({ error: winErr.message }, { status: 500 });

      // Persist on campaign (used for exports/defaults later)
      await supabase
        .from('campaigns')
        .update({ winner_variation_id: winnerId, winner_selected_at: new Date().toISOString(), status: 'active' })
        .eq('id', campaignId);

      const { data: variations, error: vErr } = await supabase
        .from('campaign_variations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

      return NextResponse.json({ success: true, variations: variations || [] });
    }

    if (body.action === 'toggle_favorite') {
      const { error } = await supabase
        .from('campaign_variations')
        .update({ is_favorite: body.is_favorite })
        .eq('campaign_id', campaignId)
        .eq('id', body.variationId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const { data: variation } = await supabase
        .from('campaign_variations')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('id', body.variationId)
        .maybeSingle();
      return NextResponse.json({ success: true, variation: variation || null });
    }

    if (body.action === 'set_tags') {
      const tags = (body.tags || []).map((t) => String(t).trim()).filter(Boolean).slice(0, 12);
      const { error } = await supabase
        .from('campaign_variations')
        .update({ tags })
        .eq('campaign_id', campaignId)
        .eq('id', body.variationId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const { data: variation } = await supabase
        .from('campaign_variations')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('id', body.variationId)
        .maybeSingle();
      return NextResponse.json({ success: true, variation: variation || null });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

