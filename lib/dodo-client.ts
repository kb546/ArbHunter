/**
 * Dodo Payments Client-Side SDK
 *
 * Handles checkout flow using Dodo's redirect-based payment links.
 * No JavaScript SDK needed - we simply redirect to Dodo's hosted checkout.
 */

/**
 * Redirect user to Dodo checkout page
 *
 * @param checkoutUrl - Full Dodo checkout URL from API
 */
export function redirectToDodoCheckout(checkoutUrl: string): void {
  if (typeof window === 'undefined') {
    throw new Error('redirectToDodoCheckout can only be called in browser');
  }

  // Simple redirect to Dodo's hosted checkout
  window.location.href = checkoutUrl;
}

/**
 * Get checkout success parameters from URL
 * Dodo redirects back with query params after successful payment
 */
export function getDodoCheckoutResult(): {
  isSuccess: boolean;
  subscriptionId?: string;
  paymentId?: string;
} {
  if (typeof window === 'undefined') {
    return { isSuccess: false };
  }

  const params = new URLSearchParams(window.location.search);

  // Check if this is a checkout success redirect
  const checkoutParam = params.get('checkout');
  const subscriptionId = params.get('subscription_id');
  const paymentId = params.get('payment_id');

  return {
    isSuccess: checkoutParam === 'success',
    subscriptionId: subscriptionId || undefined,
    paymentId: paymentId || undefined,
  };
}

/**
 * Clear checkout parameters from URL after processing
 */
export function clearCheckoutParams(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('checkout');
  url.searchParams.delete('subscription_id');
  url.searchParams.delete('payment_id');

  window.history.replaceState({}, '', url.toString());
}
