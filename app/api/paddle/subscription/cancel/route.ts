import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { cancelSubscription } from '@/lib/paddle';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const session = await getAuthedSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceSupabase();
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('provider', 'paddle')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });
    if (!sub?.paddle_subscription_id) {
      return NextResponse.json({ error: 'No Paddle subscription found' }, { status: 400 });
    }

    await cancelSubscription(sub.paddle_subscription_id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Paddle cancel error:', error);
    return NextResponse.json({ error: error.message || 'Cancel failed' }, { status: 500 });
  }
}

