import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { getFirstActiveRecurringPriceIdForProduct, updateSubscriptionPlan } from '@/lib/paddle';

type Plan = 'starter' | 'pro' | 'agency';
type Body = {
  plan: Plan;
  prorationBillingMode?:
    | 'prorated_immediately'
    | 'full_immediately'
    | 'prorated_next_billing_period'
    | 'full_next_billing_period'
    | 'do_not_bill';
};

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function productIdForPlan(plan: Plan) {
  const starter = process.env.PADDLE_PRODUCT_STARTER;
  const pro = process.env.PADDLE_PRODUCT_PRO;
  const agency = process.env.PADDLE_PRODUCT_AGENCY;
  if (plan === 'starter') return starter;
  if (plan === 'pro') return pro;
  return agency;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthedSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as Body;
    const plan = body.plan;
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'No active Paddle subscription found' }, { status: 400 });
    }

    const productId = productIdForPlan(plan as Plan);
    if (!productId) return NextResponse.json({ error: `Missing Paddle product id for ${plan}` }, { status: 500 });

    const newPriceId = await getFirstActiveRecurringPriceIdForProduct(productId);

    const prorationBillingMode = body.prorationBillingMode || 'prorated_immediately';
    await updateSubscriptionPlan({
      subscriptionId: sub.paddle_subscription_id,
      newPriceId,
      prorationBillingMode,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Paddle change-plan error:', error);
    return NextResponse.json({ error: error.message || 'Change plan failed' }, { status: 500 });
  }
}

