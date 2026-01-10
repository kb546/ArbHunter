import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; creativeId: string }> }
) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    const session = await getAuthedSessionFromCookies();
    if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: campaignId, creativeId } = await params;
    const supabase = createSupabaseAuthedServerClient(session.accessToken);

    const { data, error } = await supabase
      .from('generated_creatives')
      .select('id,campaign_id,image_url,model,cost,generated_at')
      .eq('campaign_id', campaignId)
      .eq('id', creativeId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ creative: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

