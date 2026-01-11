"use client";

export async function track(event_name: string, meta?: Record<string, any>) {
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

