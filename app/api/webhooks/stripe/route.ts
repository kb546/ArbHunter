import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function planFromPriceId(priceId: string | null | undefined): 'starter' | 'pro' | 'agency' | 'free' {
  const starter = process.env.STRIPE_PRICE_STARTER;
  const pro = process.env.STRIPE_PRICE_PRO;
  const agency = process.env.STRIPE_PRICE_AGENCY;
  if (!priceId) return 'free';
  if (starter && priceId === starter) return 'starter';
  if (pro && priceId === pro) return 'pro';
  if (agency && priceId === agency) return 'agency';
  return 'free';
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing Stripe webhook signature/secret' }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err?.message || err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

        if (!userId || !subscriptionId) break;

        // Fetch subscription for accurate status/period + priceId
        let sub: Stripe.Subscription | null = null;
        if (subscriptionId) {
          sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
        }

        const priceId = sub?.items.data[0]?.price?.id;
        const plan = planFromPriceId(priceId);

        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId ?? null,
            plan,
            status: (sub?.status as any) ?? 'active',
            current_period_start: sub?.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub?.cancel_at_period_end ?? false,
          },
          { onConflict: 'stripe_subscription_id' }
        );

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = planFromPriceId(priceId);

        await supabase.from('subscriptions').update({
          stripe_customer_id: customerId ?? null,
          stripe_price_id: priceId ?? null,
          plan,
          status: sub.status as any,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
        }).eq('stripe_subscription_id', subscriptionId);

        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook handler error:', error);
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
}

