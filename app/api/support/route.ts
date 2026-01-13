import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';
import { sendEmail } from '@/lib/email.server';

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
      source: 'in_app',
    })
    .select('id,created_at')
    .single();

  if (error) {
    console.error('Support submission failed:', error);
    return NextResponse.json({ error: 'Could not send your message right now. Please try again.' }, { status: 500 });
  }

  // Best-effort notification email to ops inbox (if configured)
  const to = process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
  const fromUserEmail = (session.user.email as string | undefined) || null;
  if (to && to.includes('@')) {
    const ticketId = String(data?.id || '').slice(0, 8);
    await sendEmail({
      to,
      subject: `[ArbHunter] New support ticket${ticketId ? ` (${ticketId})` : ''}: ${subject}`,
      replyTo: fromUserEmail,
      text: [
        `New in-app support ticket`,
        ``,
        `User: ${session.user.id}`,
        `Email: ${fromUserEmail || '(unknown)'}`,
        `Subject: ${subject}`,
        `Page: ${page_url || '(unknown)'}`,
        ``,
        message,
      ].join('\n'),
    });
  }
  return NextResponse.json({ ok: true, ticket: data });
}

