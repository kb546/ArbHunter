import { NextResponse } from 'next/server';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { createSupabaseAuthedServerClient } from '@/lib/supabase.authed.server';

export async function GET() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseAuthedServerClient(session.accessToken);
  const { data, error } = await supabase
    .from('subscriptions')
    .select('provider,plan,status,current_period_end,updated_at')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message || 'Failed to fetch subscription' }, { status: 500 });
  return NextResponse.json({ subscription: data || null });
}

