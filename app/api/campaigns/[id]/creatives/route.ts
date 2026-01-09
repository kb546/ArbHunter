/**
 * Campaign Creatives API
 * Fetches generated images for a specific campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = id;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const session = await getAuthedSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAuthedServerClient(session.accessToken);
    const { data, error } = await supabase
      .from('generated_creatives')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching creatives:', error);
      return NextResponse.json(
        { error: 'Failed to fetch creatives' },
        { status: 500 }
      );
    }

    return NextResponse.json({ creatives: data || [] });

  } catch (error) {
    console.error('❌ Creatives GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

