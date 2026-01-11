import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const subject = String(body?.subject || '').trim().slice(0, 140);
  const message = String(body?.message || '').trim().slice(0, 4000);
  const page_url = String(body?.page_url || '').trim().slice(0, 400);

  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
  }

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: session.user.id,
      email: (session.user.email as string | undefined) || null,
      subject,
      message,
      page_url: page_url || null,
      user_agent: req.headers.get('user-agent') || null,
      status: 'open',
    })
    .select('id,created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message || 'Failed to submit ticket' }, { status: 500 });
  return NextResponse.json({ ok: true, ticket: data });
}

