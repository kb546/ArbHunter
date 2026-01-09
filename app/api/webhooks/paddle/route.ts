import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPaddleWebhookSignature } from '@/lib/paddle';

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
    console.error('Paddle webhook: missing signature/secret', {
      hasSecret: Boolean(secret),
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ error: 'Missing Paddle signature/secret' }, { status: 400 });
  }

  const verified = verifyPaddleWebhookSignature(rawBody, signature, secret);
  if (!verified.ok) {
    console.error('Paddle webhook: signature verification failed', { reason: verified.reason });
    return NextResponse.json({ error: `Invalid signature: ${verified.reason}` }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('Paddle webhook: invalid JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType: string = payload?.event_type || payload?.type || '';
  const data = payload?.data;
  if (!eventType || !data) {
    console.error('Paddle webhook: missing event_type or data', { eventType, hasData: Boolean(data) });
    return NextResponse.json({ error: 'Missing event_type or data' }, { status: 400 });
  }

  // Best-effort: persist a lightweight record for verification/debugging
  // (doesn't include raw payload to avoid storing PII).
  async function logEvent(params: {
    status: 'received' | 'processed' | 'ignored' | 'error';
    httpStatus?: number;
    verifyOk: boolean;
    verifyReason?: string | null;
    processError?: string | null;
    userId?: string | null;
    subscriptionId?: string | null;
    transactionId?: string | null;
  }) {
    try {
      const supabase = getServiceSupabase();
      await supabase.from('webhook_events').insert({
        provider: 'paddle',
        event_type: eventType,
        event_id: payload?.event_id || payload?.id || null,
        status: params.status,
        http_status: params.httpStatus ?? 200,
        signature_present: true,
        verified: params.verifyOk,
        verify_reason: params.verifyReason ?? null,
        process_error: params.processError ?? null,
        related_user_id: params.userId ?? null,
        related_subscription_id: params.subscriptionId ?? null,
        related_transaction_id: params.transactionId ?? null,
      });
    } catch (e) {
      // Don't fail webhook because logging failed.
      console.warn('Paddle webhook: failed to insert webhook_events log', e);
    }
  }

  await logEvent({ status: 'received', verifyOk: true });

  try {
    const supabase = getServiceSupabase();

    // IMPORTANT: Paddle expects a response within ~5 seconds.
    // Avoid extra network calls (like fetching from Paddle API) inside the webhook.

    // Common custom_data location in v2 notifications:
    const userId: string | null = data?.custom_data?.user_id || data?.custom_data?.userId || null;

    // Subscription lifecycle
    if (eventType.startsWith('subscription.')) {
      const subscriptionId: string | undefined = data?.id;
      const customerId: string | undefined = data?.customer_id;
      const status: string | undefined = data?.status;
      const nextBilledAt: string | null = data?.next_billed_at || null;
      const startedAt: string | null = data?.started_at || null;
      const transactionId: string | undefined = data?.transaction_id;

      if (!subscriptionId) {
        await logEvent({
          status: 'ignored',
          verifyOk: true,
          verifyReason: null,
          subscriptionId: null,
          transactionId: transactionId ?? null,
          userId,
        });
        return NextResponse.json({ received: true, ignored: 'missing subscription id' });
      }

      // Determine product/price from subscription items
      const firstItem = Array.isArray(data?.items) ? data.items[0] : null;
      const priceId = firstItem?.price?.id || firstItem?.price_id || null;
      const productId = firstItem?.price?.product_id || firstItem?.product_id || null;
      const plan = planFromProductId(productId);

      if (!userId) {
        // Can't attach to a user; acknowledge but log loudly.
        console.warn('Paddle webhook: could not determine user_id', { eventType, subscriptionId, transactionId });
        await logEvent({
          status: 'ignored',
          verifyOk: true,
          verifyReason: null,
          subscriptionId,
          transactionId: transactionId ?? null,
          userId: null,
        });
        return NextResponse.json({ received: true, ignored: 'missing user_id' });
      }

      // Upsert by paddle_subscription_id
      const { error: upsertErr } = await supabase.from('subscriptions').upsert(
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
      if (upsertErr) throw upsertErr;

      await logEvent({
        status: 'processed',
        verifyOk: true,
        verifyReason: null,
        subscriptionId,
        transactionId: transactionId ?? null,
        userId,
      });
      return NextResponse.json({ received: true });
    }

    // Transaction completion can be used as a backup source of user_id/custom_data.
    if (eventType === 'transaction.completed') {
      const transactionId: string | undefined = data?.id;
      const subscriptionId: string | undefined =
        data?.subscription_id || data?.subscription?.id || data?.related_subscription_id;

      await logEvent({
        status: 'processed',
        verifyOk: true,
        verifyReason: null,
        subscriptionId: subscriptionId ?? null,
        transactionId: transactionId ?? null,
        userId,
      });

      // If the transaction tells us the subscription id + user id, ensure we have a row (best effort).
      if (subscriptionId && userId) {
        const items = Array.isArray(data?.items) ? data.items : [];
        const firstItem = items[0] || null;
        const priceId = firstItem?.price?.id || firstItem?.price_id || null;
        const productId = firstItem?.price?.product_id || firstItem?.product_id || null;
        const plan = planFromProductId(productId);

        const { error: upsertErr } = await supabase.from('subscriptions').upsert(
          {
            provider: 'paddle',
            user_id: userId,
            paddle_subscription_id: subscriptionId,
            paddle_price_id: priceId,
            paddle_transaction_id: transactionId ?? null,
            plan,
            status: 'active',
          },
          { onConflict: 'paddle_subscription_id' }
        );
        if (upsertErr) throw upsertErr;
      }

      return NextResponse.json({ received: true });
    }

    // For other events, just acknowledge (we can expand later)
    await logEvent({ status: 'ignored', verifyOk: true });
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paddle webhook handler error:', error);
    await (async () => {
      try {
        const supabase = getServiceSupabase();
        await supabase.from('webhook_events').insert({
          provider: 'paddle',
          event_type: eventType,
          event_id: payload?.event_id || payload?.id || null,
          status: 'error',
          http_status: 500,
          signature_present: true,
          verified: true,
          verify_reason: null,
          process_error: error?.message || String(error),
        });
      } catch {
        // ignore
      }
    })();
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
}

