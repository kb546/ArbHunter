import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSubscription, getTransaction, verifyPaddleWebhookSignature } from '@/lib/paddle';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function planFromProductId(productId: string | null | undefined): 'starter' | 'pro' | 'agency' | 'free' {
  const starter = process.env.PADDLE_PRODUCT_STARTER;
  const pro = process.env.PADDLE_PRODUCT_PRO;
  const agency = process.env.PADDLE_PRODUCT_AGENCY;
  if (!productId) return 'free';
  if (starter && productId === starter) return 'starter';
  if (pro && productId === pro) return 'pro';
  if (agency && productId === agency) return 'agency';
  return 'free';
}

function mapStatus(paddleStatus: string | undefined): 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' {
  const s = (paddleStatus || '').toLowerCase();
  if (s === 'active') return 'active';
  if (s === 'trialing') return 'trialing';
  if (s === 'past_due') return 'past_due';
  if (s === 'canceled' || s === 'cancelled') return 'canceled';
  return 'inactive';
}

export async function POST(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const signature = req.headers.get('paddle-signature') || req.headers.get('Paddle-Signature');
  const rawBody = await req.text();

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Missing Paddle signature/secret' }, { status: 400 });
  }

  const verified = verifyPaddleWebhookSignature(rawBody, signature, secret);
  if (!verified.ok) {
    return NextResponse.json({ error: `Invalid signature: ${verified.reason}` }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType: string = payload?.event_type || payload?.type || '';
  const data = payload?.data;
  if (!eventType || !data) {
    return NextResponse.json({ error: 'Missing event_type or data' }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();

    // We care primarily about subscription lifecycle.
    if (eventType.startsWith('subscription.')) {
      const subscriptionId: string | undefined = data?.id;
      const customerId: string | undefined = data?.customer_id;
      const status: string | undefined = data?.status;
      const nextBilledAt: string | null = data?.next_billed_at || null;
      const startedAt: string | null = data?.started_at || null;
      const transactionId: string | undefined = data?.transaction_id;

      if (!subscriptionId) {
        return NextResponse.json({ received: true, ignored: 'missing subscription id' });
      }

      // Determine product/price from subscription items
      const firstItem = Array.isArray(data?.items) ? data.items[0] : null;
      const priceId = firstItem?.price?.id || firstItem?.price_id || null;
      const productId = firstItem?.price?.product_id || firstItem?.product_id || null;
      const plan = planFromProductId(productId);

      // Resolve user_id:
      // Prefer transaction.custom_data.user_id (we set it at checkout).
      let userId: string | null = null;
      if (transactionId) {
        const tx = await getTransaction(transactionId);
        userId = tx?.data?.custom_data?.user_id || tx?.data?.custom_data?.userId || null;
      }

      // Fallback: fetch subscription from API and try to read custom_data if present there.
      if (!userId) {
        const sub = await getSubscription(subscriptionId);
        userId = sub?.data?.custom_data?.user_id || null;
      }

      if (!userId) {
        // Can't attach to a user; acknowledge but log loudly.
        console.warn('Paddle webhook: could not determine user_id', { eventType, subscriptionId, transactionId });
        return NextResponse.json({ received: true, ignored: 'missing user_id' });
      }

      // Upsert by paddle_subscription_id
      await supabase.from('subscriptions').upsert(
        {
          provider: 'paddle',
          user_id: userId,
          paddle_customer_id: customerId ?? null,
          paddle_subscription_id: subscriptionId,
          paddle_price_id: priceId,
          paddle_transaction_id: transactionId ?? null,
          plan,
          status: mapStatus(status),
          current_period_start: startedAt,
          current_period_end: nextBilledAt,
          cancel_at_period_end: Boolean(data?.scheduled_change?.action === 'cancel'),
        },
        { onConflict: 'paddle_subscription_id' }
      );

      return NextResponse.json({ received: true });
    }

    // For other events, just acknowledge (we can expand later)
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paddle webhook handler error:', error);
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
}

