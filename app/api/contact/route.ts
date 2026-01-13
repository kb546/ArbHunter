import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email.server';

function clean(input: unknown, max: number) {
  return String(input ?? '').trim().slice(0, max);
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
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

  let data: any = null;
  try {
    // Use service role to avoid any RLS drift/misconfiguration breaking public contact.
    const supabase = getServiceSupabase();
    const res = await supabase
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
    if (res.error) throw res.error;
    data = res.data;
  } catch (e: any) {
    const msg = String(e?.message || e);
    // Friendly message for end users; keep detail in logs only.
    console.error('Contact submission failed:', msg);
    return NextResponse.json(
      { error: 'Could not send your message right now. Please try again in a few minutes.' },
      { status: 500 }
    );
  }

  // Best-effort notification email to ops inbox (if configured)
  const to = process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
  if (to && to.includes('@')) {
    const ticketId = String(data?.id || '').slice(0, 8);
    await sendEmail({
      to,
      subject: `[ArbHunter] New contact request${ticketId ? ` (${ticketId})` : ''}: ${subject}`,
      replyTo: email,
      text: [
        `New contact request`,
        ``,
        `From: ${name || '(no name)'} <${email}>`,
        `Company: ${company || '(none)'}`,
        `Subject: ${subject}`,
        `Page: ${page_url || '(unknown)'}`,
        ``,
        message,
      ].join('\n'),
    });
  }

  return NextResponse.json({ ok: true, ticket: data });
}

