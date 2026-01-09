declare global {
  interface Window {
    Paddle?: any;
  }
}

let paddleInitPromise: Promise<void> | null = null;

function getPaddleEnv(): 'sandbox' | 'production' {
  return (process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox') as any;
}

export async function ensurePaddleInitialized(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (paddleInitPromise) return paddleInitPromise;

  paddleInitPromise = new Promise<void>((resolve, reject) => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      reject(new Error('Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN'));
      return;
    }

    // Load Paddle.js v2 if not present
    const existing = document.querySelector<HTMLScriptElement>('script[data-paddle="v2"]');
    if (existing) {
      init();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.dataset.paddle = 'v2';
    script.onload = () => init();
    script.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(script);

    function init() {
      try {
        const Paddle = window.Paddle;
        if (!Paddle) throw new Error('Paddle.js loaded but window.Paddle missing');
        console.log('[PADDLE] Initializing Paddle.js', {
          env: getPaddleEnv(),
          tokenPrefix: String(token).slice(0, 8),
        });
        Paddle.Environment.set(getPaddleEnv());
        Paddle.Initialize({ token });
        console.log('[PADDLE] Paddle.js initialized OK');
        resolve();
      } catch (e) {
        reject(e);
      }
    }
  });

  return paddleInitPromise;
}

export async function openPaddleCheckout(transactionId: string) {
  await ensurePaddleInitialized();
  const Paddle = window.Paddle;
  if (!Paddle?.Checkout?.open) throw new Error('Paddle.Checkout.open is not available');

  // Paddle Billing v2: open an overlay checkout for a transaction
  console.log('[PADDLE] Calling Paddle.Checkout.open', { transactionId });
  Paddle.Checkout.open({
    transactionId,
    settings: {
      displayMode: 'overlay',
    },
  });
}

