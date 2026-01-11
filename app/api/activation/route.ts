import { NextRequest, NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const event_name = String(body?.event_name || '').slice(0, 80);
  if (!event_name) return NextResponse.json({ error: 'Missing event_name' }, { status: 400 });

  const meta = (body?.meta && typeof body.meta === 'object') ? body.meta : {};

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { error } = await supabase.from('activation_events').insert({
    user_id: session.user.id,
    event_name,
    meta,
  });

  if (error) {
    // best-effort analytics, never block UX
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}

