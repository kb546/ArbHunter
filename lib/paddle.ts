import crypto from 'crypto';

export type PaddleEnv = 'sandbox' | 'production';

function paddleEnv(): PaddleEnv {
  return (process.env.PADDLE_ENV === 'production' ? 'production' : 'sandbox') as PaddleEnv;
}

function paddleBaseUrl(): string {
  return paddleEnv() === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
}

function paddleApiKey(): string {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error('PADDLE_API_KEY is not set');
  return key;
}

export async function paddleFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${paddleBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paddleApiKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = json?.error?.detail || json?.error?.message || text || `Paddle request failed: ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

export async function getFirstActiveRecurringPriceIdForProduct(productId: string): Promise<string> {
  const resp = await paddleFetch<any>(`/prices?product_id=${encodeURIComponent(productId)}&status=active`);
  const prices: any[] = resp?.data || [];

  // Prefer recurring monthly prices.
  const recurring = prices.filter((p) => p?.billing_cycle?.interval && p?.billing_cycle?.frequency);
  const monthly = recurring.find((p) => String(p.billing_cycle.interval).toLowerCase() === 'month');
  const chosen = monthly || recurring[0] || prices[0];
  const id = chosen?.id;
  if (!id) throw new Error(`No active price found for product ${productId}. Create an active recurring price in Paddle.`);
  return id;
}

export async function createCheckoutTransaction(params: {
  priceId: string;
  userEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { priceId, userEmail, userId, successUrl, cancelUrl } = params;

  const body = {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: { email: userEmail },
    custom_data: { user_id: userId },
    checkout: {
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
  };

  // Paddle: POST /transactions returns { data: { id, checkout: { url } ... } }
  const resp = await paddleFetch<any>('/transactions', { method: 'POST', body: JSON.stringify(body) });
  const url = resp?.data?.checkout?.url;
  const transactionId = resp?.data?.id;
  if (!url || !transactionId) throw new Error('Paddle did not return a checkout URL for the transaction.');
  return { url, transactionId };
}

export function verifyPaddleWebhookSignature(rawBody: string, signatureHeader: string, secret: string) {
  // Paddle Billing notifications include a `Paddle-Signature` header.
  // Common formats seen:
  // - "ts=1671552777;h1=<hex>"
  // - "ts=1671552777,h1=<hex>" (commas)
  // We parse both separators and tolerate extra fields.
  const parts = signatureHeader
    .split(/[;,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const kv: Record<string, string> = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k && v) kv[k] = v;
  }
  const ts = kv.ts;
  const h1 = kv.h1;
  if (!ts || !h1) return { ok: false as const, reason: 'Missing ts or h1' };

  // Replay protection: tolerate clock skew + serverless retries.
  // NOTE: Some platforms send ms timestamps; normalize if needed.
  const now = Math.floor(Date.now() / 1000);
  let tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return { ok: false as const, reason: 'Invalid ts' };
  if (tsNum > 1e12) tsNum = Math.floor(tsNum / 1000); // ms -> s
  const age = Math.abs(now - tsNum);
  if (age > 60 * 30) return { ok: false as const, reason: `Timestamp too old (age=${age}s)` };

  // IMPORTANT: Signature must be computed using the exact `ts` value from the header,
  // not a normalized timestamp. (We only normalize for replay/age checks.)
  const signedPayload = `${ts}:${rawBody}`;
  const expectedHex = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  // Paddle's `h1` is typically hex. If it's not hex, try base64 as a fallback.
  const isHex = /^[0-9a-f]+$/i.test(h1) && h1.length % 2 === 0;
  const provided = isHex ? Buffer.from(h1, 'hex') : Buffer.from(h1, 'base64');
  const expected = Buffer.from(expectedHex, 'hex');

  const ok = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!ok) {
    return {
      ok: false as const,
      reason: `Signature mismatch (ts=${tsNum}, encoding=${isHex ? 'hex' : 'base64'})`,
    };
  }

  return { ok: true as const };
}

export async function getTransaction(transactionId: string) {
  return paddleFetch<any>(`/transactions/${encodeURIComponent(transactionId)}`);
}

export async function getSubscription(subscriptionId: string) {
  return paddleFetch<any>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function updateSubscriptionPlan(params: {
  subscriptionId: string;
  newPriceId: string;
  prorationBillingMode:
    | 'prorated_immediately'
    | 'full_immediately'
    | 'prorated_next_billing_period'
    | 'full_next_billing_period'
    | 'do_not_bill';
}) {
  const { subscriptionId, newPriceId, prorationBillingMode } = params;
  return paddleFetch<any>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      items: [{ price_id: newPriceId, quantity: 1 }],
      proration_billing_mode: prorationBillingMode,
    }),
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return paddleFetch<any>(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

