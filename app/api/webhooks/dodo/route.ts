import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseDodoWebhook, mapDodoSubscriptionStatus, type DodoWebhookEvent } from '@/lib/dodo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Dodo Payments Webhook Handler
 *
 * Handles real-time subscription events from Dodo Payments.
 * Events are verified using webhook signature and processed to update
 * subscription status in the database.
 *
 * Webhook URL: https://arbhunter.dev/api/webhooks/dodo
 */
export async function POST(req: NextRequest) {
  let eventType = 'unknown';
  let eventId = 'unknown';
  let signaturePresent = false;
  let verified = false;
  let verifyReason = '';
  let relatedUserId: string | null = null;
  let relatedSubscriptionId: string | null = null;

  try {
    // 1. Get raw body and headers
    const rawBody = await req.text();

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    signaturePresent = !!(
      headers['webhook-signature'] || headers['Webhook-Signature']
    );

    // 2. Verify signature and parse event
    let event: DodoWebhookEvent;
    try {
      event = parseDodoWebhook(rawBody, headers);
      verified = true;
      verifyReason = 'Valid signature';
    } catch (error: any) {
      verified = false;
      verifyReason = error.message || 'Signature verification failed';
      throw error;
    }

    // 3. Extract event metadata
    eventType = event.type;
    eventId = headers['webhook-id'] || 'unknown';

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 4. Handle different event types
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.activated': {
        const sub = event.data as any; // Dodo subscription object

        // Extract metadata (user_id and plan are passed during checkout)
        const metadata = sub.metadata || {};
        relatedUserId = metadata.user_id || null;
        relatedSubscriptionId = sub.subscription_id;

        if (!relatedUserId) {
          console.error('[Dodo Webhook] No user_id in subscription metadata', sub);
          throw new Error('No user_id in subscription metadata');
        }

        // Determine plan from metadata or product_id
        const plan = metadata.plan || 'starter';

        // Map Dodo's current_period_start/end (they use Unix timestamps or ISO strings)
        const currentPeriodStart = sub.current_period_start
          ? new Date(sub.current_period_start).toISOString()
          : new Date().toISOString();

        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days

        // Insert or update subscription
        const { error: upsertError } = await supabase.from('subscriptions').upsert(
          {
            user_id: relatedUserId,
            provider: 'dodo',
            dodo_customer_id: sub.customer_id,
            dodo_subscription_id: sub.subscription_id,
            dodo_price_id: sub.product_id,
            plan,
            status: mapDodoSubscriptionStatus(sub.status || 'active'),
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            provider_metadata: sub,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

        if (upsertError) {
          console.error('[Dodo Webhook] Subscription upsert error:', upsertError);
          throw upsertError;
        }

        console.log(`[Dodo Webhook] Subscription ${event.type} for user ${relatedUserId}`);
        break;
      }

      case 'subscription.updated': {
        const sub = event.data as any;
        relatedSubscriptionId = sub.subscription_id;

        const metadata = sub.metadata || {};
        relatedUserId = metadata.user_id || null;

        // Update subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: mapDodoSubscriptionStatus(sub.status),
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start).toISOString()
              : undefined,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end).toISOString()
              : undefined,
            cancel_at_period_end: sub.cancel_at_period_end || false,
            dodo_price_id: sub.product_id,
            provider_metadata: sub,
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', sub.subscription_id);

        if (updateError) {
          console.error('[Dodo Webhook] Subscription update error:', updateError);
          throw updateError;
        }

        console.log(`[Dodo Webhook] Subscription updated: ${sub.subscription_id}`);
        break;
      }

      case 'subscription.cancelled': {
        const sub = event.data as any;
        relatedSubscriptionId = sub.subscription_id;

        const metadata = sub.metadata || {};
        relatedUserId = metadata.user_id || null;

        // Mark as cancelled
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            provider_metadata: sub,
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', sub.subscription_id);

        if (cancelError) {
          console.error('[Dodo Webhook] Subscription cancel error:', cancelError);
          throw cancelError;
        }

        console.log(`[Dodo Webhook] Subscription cancelled: ${sub.subscription_id}`);
        break;
      }

      case 'subscription.paused': {
        const sub = event.data as any;
        relatedSubscriptionId = sub.subscription_id;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'inactive',
            provider_metadata: sub,
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', sub.subscription_id);

        if (error) throw error;
        console.log(`[Dodo Webhook] Subscription paused: ${sub.subscription_id}`);
        break;
      }

      case 'subscription.resumed': {
        const sub = event.data as any;
        relatedSubscriptionId = sub.subscription_id;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            provider_metadata: sub,
            updated_at: new Date().toISOString(),
          })
          .eq('dodo_subscription_id', sub.subscription_id);

        if (error) throw error;
        console.log(`[Dodo Webhook] Subscription resumed: ${sub.subscription_id}`);
        break;
      }

      case 'payment.succeeded': {
        const payment = event.data as any;
        relatedSubscriptionId = payment.subscription_id || null;

        // Optionally update subscription or send confirmation email
        console.log(
          `[Dodo Webhook] Payment succeeded: ${payment.payment_id} for subscription ${payment.subscription_id}`
        );
        break;
      }

      case 'payment.failed': {
        const payment = event.data as any;
        relatedSubscriptionId = payment.subscription_id || null;

        // Optionally mark subscription as past_due
        if (payment.subscription_id) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('dodo_subscription_id', payment.subscription_id);
        }

        console.log(`[Dodo Webhook] Payment failed: ${payment.payment_id}`);
        break;
      }

      default:
        console.log(`[Dodo Webhook] Unhandled event type: ${event.type}`);
    }

    // 5. Log webhook event
    await supabase.from('webhook_events').insert({
      provider: 'dodo',
      event_type: eventType,
      event_id: eventId,
      status: 'processed',
      http_status: 200,
      signature_present: signaturePresent,
      verified,
      verify_reason: verifyReason,
      related_user_id: relatedUserId,
      related_subscription_id: relatedSubscriptionId,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Dodo Webhook Error]', error);

    // Log failed webhook
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    await supabase.from('webhook_events').insert({
      provider: 'dodo',
      event_type: eventType,
      event_id: eventId,
      status: 'error',
      http_status: 500,
      signature_present: signaturePresent,
      verified,
      verify_reason: verifyReason || error.message,
      process_error: error.message,
      related_user_id: relatedUserId,
      related_subscription_id: relatedSubscriptionId,
    });

    return NextResponse.json(
      { error: error.message },
      { status: verified ? 500 : 401 }
    );
  }
}
