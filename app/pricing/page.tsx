"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openPaddleCheckout } from "@/lib/paddle-client";
import { ForceDark } from "@/components/ForceDark";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "$29",
    cadence: "/mo",
    planKey: "starter",
    features: ["50 discoveries / month", "100 creatives / month", "Great for early testing"],
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$79",
    cadence: "/mo",
    planKey: "pro",
    features: ["200 discoveries / month", "500 creatives / month", "Best for consistent scaling"],
    highlight: false,
  },
  {
    key: "agency",
    name: "Agency",
    price: "$199",
    cadence: "/mo",
    planKey: "agency",
    features: ["Unlimited discoveries", "2,000 creatives / month", "Best value for volume"],
    highlight: false,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <div className="border-b border-white/10 bg-[#0B0D10]/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B2F36] border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#DFFF00]" />
              </span>
              ArbHunter
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90">
                <Link href="/auth/signup">Start free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Pricing</h1>
            <p className="text-sm sm:text-base text-white/70 mt-2 max-w-2xl leading-relaxed">
              Choose a plan based on how many opportunities and creatives you want to generate each month. Upgrade anytime.
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5">
            <Link href="/discovery">Go to app</Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.key}
              className={cn(
                "rounded-3xl border p-6",
                p.highlight
                  ? "border-[#DFFF00]/35 bg-[#2B2F36]/35 shadow-[0_0_0_1px_rgba(223,255,0,0.15)]"
                  : "border-white/10 bg-[#2B2F36]/25"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="text-4xl font-semibold">{p.price}</div>
                    <div className="text-white/60">{p.cadence}</div>
                  </div>
                </div>
                {p.highlight ? (
                  <div className="text-[11px] font-semibold rounded-full bg-[#DFFF00] text-[#0B0D10] px-3 py-1">
                    Popular
                  </div>
                ) : null}
              </div>

              <ul className="mt-6 space-y-2 text-sm text-white/70">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#DFFF00]/80" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-2">
                <CheckoutButton plan={p.planKey} planName={p.name} highlight={p.highlight} />
                <p className="text-xs text-white/50">Billing powered by Paddle (MoR). Taxes/VAT handled automatically.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-white/50">
          Questions? Reply to the onboarding email after signup.
        </div>
      </div>
    </div>
  );
}

function CheckoutButton({
  plan,
  planName,
  highlight,
}: {
  plan: "starter" | "pro" | "agency";
  planName: string;
  highlight?: boolean;
}) {
  return (
    <Button
      type="button"
      className={cn(
        "w-full",
        highlight ? "bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90" : "bg-white/10 text-white hover:bg-white/15"
      )}
      onClick={async () => {
        try {
          const res = await fetch("/api/paddle/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          });
          const data = await res.json();

          if (!res.ok) {
            if (res.status === 401) {
              window.location.href = `/auth/login?next=${encodeURIComponent("/pricing")}`;
              return;
            }
            throw new Error(data.error || `Checkout failed (HTTP ${res.status})`);
          }

          if (data.transactionId) {
            await openPaddleCheckout(data.transactionId);
            return;
          }

          throw new Error(`Checkout response missing transactionId.`);
        } catch (err: any) {
          alert(`Upgrade failed: ${err?.message || String(err)}`);
        }
      }}
    >
      Upgrade to {planName}
    </Button>
  );
}

