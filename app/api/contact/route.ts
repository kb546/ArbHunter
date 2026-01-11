import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/auth.server';

function clean(input: unknown, max: number) {
  return String(input ?? '').trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));

  // Honeypot (bots fill hidden fields)
  const hp = clean(body?.company_website, 120);
  if (hp) return NextResponse.json({ ok: true });

  const name = clean(body?.name, 80);
  const email = clean(body?.email, 120);
  const company = clean(body?.company, 120);
  const subject = clean(body?.subject, 140);
  const message = clean(body?.message, 4000);
  const page_url = clean(body?.page_url, 400);

  if (!email || !subject || !message) {
    return NextResponse.json({ error: 'Email, subject, and message are required.' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(); // anon client; insert allowed by RLS when user_id is null
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: null,
      email,
      subject,
      message,
      page_url: page_url || null,
      user_agent: req.headers.get('user-agent') || null,
      status: 'open',
      source: 'contact',
      meta: { name, company },
    })
    .select('id,created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  return NextResponse.json({ ok: true, ticket: data });
}

