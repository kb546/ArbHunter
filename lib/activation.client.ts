"use client";

export async function track(event_name: string, meta?: Record<string, any>) {
  // Send to GTM dataLayer (best-effort). Configure GA4 inside GTM to forward these as events.
  try {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "arbhunter_event",
      event_name,
      ...(meta ? { meta } : {}),
    });
  } catch {
    // ignore
  }

  try {
    await fetch("/api/activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name, meta: meta || {} }),
    });
  } catch {
    // ignore
  }
}

