/**
 * Dodo Payments Server SDK
 * API Documentation: https://docs.dodopayments.com
 *
 * This SDK handles server-side interactions with Dodo Payments API
 * for subscription management and webhook verification.
 */

import crypto from 'crypto';

const DODO_API_KEY = process.env.DODO_API_KEY;
const DODO_ENV = process.env.DODO_ENV || 'sandbox';
const DODO_BASE_URL = DODO_ENV === 'production'
  ? 'https://api.dodopayments.com'
  : 'https://api.dodopayments.com'; // Dodo uses same base URL, environment determined by API key

if (!DODO_API_KEY) {
  console.warn('[Dodo Payments] DODO_API_KEY environment variable is not set');
}

// Type definitions based on Dodo Payments API
export type DodoSubscription = {
  subscription_id: string;
  customer_id: string;
  product_id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  current_period_start: string; // ISO 8601
  current_period_end: string; // ISO 8601
  cancel_at_period_end: boolean;
  trial_end?: string | null;
  metadata?: Record<string, any>;
};

export type DodoWebhookEvent = {
  business_id: string;
  type: string; // e.g., 'subscription.created', 'payment.succeeded'
  timestamp: string; // ISO 8601
  data: {
    payload_type: 'Payment' | 'Subscription' | 'Refund' | 'Dispute' | 'LicenseKey';
    [key: string]: any; // Event-specific data
  };
};

export type DodoPayment = {
  payment_id: string;
  customer_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  created_at: string;
};

/**
 * Fetch helper for Dodo API requests
 */
async function dodoFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${DODO_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${DODO_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Dodo API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Generate a payment link URL for a product
 * Dodo uses direct payment links instead of checkout sessions
 */
export function getDodoPaymentLink(params: {
  productId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}): string {
  const baseUrl = DODO_ENV === 'production'
    ? 'https://checkout.dodopayments.com'
    : 'https://test.checkout.dodopayments.com';

  const url = new URL(`${baseUrl}/buy/${params.productId}`);

  if (params.quantity) {
    url.searchParams.set('quantity', params.quantity.toString());
  }

  if (params.successUrl) {
    url.searchParams.set('success_url', params.successUrl);
  }

  if (params.cancelUrl) {
    url.searchParams.set('cancel_url', params.cancelUrl);
  }

  // Add metadata as URL params (Dodo supports this)
  if (params.metadata) {
    Object.entries(params.metadata).forEach(([key, value]) => {
      url.searchParams.set(`metadata[${key}]`, value);
    });
  }

  return url.toString();
}

/**
 * Retrieve a subscription by ID
 */
export async function getDodoSubscription(subscriptionId: string): Promise<DodoSubscription> {
  return dodoFetch(`/subscriptions/${subscriptionId}`);
}

/**
 * Cancel a subscription
 * Dodo subscriptions can be cancelled immediately or at period end
 */
export async function cancelDodoSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<DodoSubscription> {
  return dodoFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      cancel_at_period_end: cancelAtPeriodEnd,
    }),
  });
}

/**
 * Update a subscription (e.g., change plan)
 */
export async function updateDodoSubscription(
  subscriptionId: string,
  newProductId: string
): Promise<DodoSubscription> {
  return dodoFetch(`/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      product_id: newProductId,
    }),
  });
}

/**
 * Resume a paused subscription
 */
export async function resumeDodoSubscription(subscriptionId: string): Promise<DodoSubscription> {
  return dodoFetch(`/subscriptions/${subscriptionId}/resume`, {
    method: 'POST',
  });
}

/**
 * Verify Dodo Payments webhook signature
 *
 * Based on Standard Webhooks specification:
 * https://docs.dodopayments.com/developer-resources/webhooks
 *
 * Signature is computed as: HMAC-SHA256(webhook_id.timestamp.payload, secret)
 *
 * @param payload - Raw webhook body as string
 * @param headers - Webhook headers (webhook-id, webhook-signature, webhook-timestamp)
 * @param secret - Webhook signing secret (defaults to env var)
 * @returns boolean indicating if signature is valid
 */
export function verifyDodoWebhookSignature(
  payload: string,
  headers: {
    'webhook-id': string;
    'webhook-signature': string;
    'webhook-timestamp': string;
  },
  secret: string = process.env.DODO_WEBHOOK_SECRET!
): boolean {
  if (!secret) {
    throw new Error('DODO_WEBHOOK_SECRET environment variable is required for webhook verification');
  }

  const webhookId = headers['webhook-id'];
  const webhookSignature = headers['webhook-signature'];
  const webhookTimestamp = headers['webhook-timestamp'];

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return false;
  }

  // Construct the signed content: webhook_id.timestamp.payload
  const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;

  // Compute HMAC SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedContent, 'utf8')
    .digest('base64');

  // Dodo sends signature in format "v1,{base64_signature}"
  // Extract the actual signature part
  const signatureParts = webhookSignature.split(',');
  const receivedSignature = signatureParts.length > 1 ? signatureParts[1] : webhookSignature;

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Parse and validate a Dodo webhook event
 *
 * @param rawBody - Raw request body as string
 * @param headers - Request headers
 * @returns Parsed webhook event if valid
 * @throws Error if signature is invalid
 */
export function parseDodoWebhook(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): DodoWebhookEvent {
  // Normalize headers to lowercase and handle string arrays
  const normalizedHeaders = {
    'webhook-id': String(headers['webhook-id'] || headers['Webhook-Id'] || ''),
    'webhook-signature': String(headers['webhook-signature'] || headers['Webhook-Signature'] || ''),
    'webhook-timestamp': String(headers['webhook-timestamp'] || headers['Webhook-Timestamp'] || ''),
  };

  // Verify signature
  const isValid = verifyDodoWebhookSignature(rawBody, normalizedHeaders);

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // Parse event
  const event = JSON.parse(rawBody) as DodoWebhookEvent;

  return event;
}

/**
 * Map Dodo subscription status to ArbHunter internal status
 */
export function mapDodoSubscriptionStatus(dodoStatus: DodoSubscription['status']): 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' {
  switch (dodoStatus) {
    case 'active':
      return 'active';
    case 'cancelled':
    case 'expired':
      return 'canceled';
    case 'paused':
      return 'inactive';
    default:
      return 'inactive';
  }
}
