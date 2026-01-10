"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  key: "starter" | "pro" | "agency";
  name: string;
  price: string;
  cadence: string;
  highlight?: boolean;
  bullets: string[];
};

export const LANDING_PLANS: PricingPlan[] = [
  {
    key: "starter",
    name: "Starter",
    price: "$29",
    cadence: "/mo",
    highlight: true,
    bullets: ["50 discoveries / month", "100 creatives / month", "Great for early testing"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$79",
    cadence: "/mo",
    bullets: ["200 discoveries / month", "500 creatives / month", "Best for consistent scaling"],
  },
  {
    key: "agency",
    name: "Agency",
    price: "$199",
    cadence: "/mo",
    bullets: ["Unlimited discoveries", "2,000 creatives / month", "Best value for volume"],
  },
];

export function PricingSection() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#2B2F36]/35 p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">Pricing</div>
          <div className="text-sm text-white/70 mt-1 leading-relaxed">
            Beginner-friendly plans. Start small, then upgrade when you scale.
          </div>
        </div>
        <Button
          asChild
          className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
        >
          <Link href="/pricing">See full pricing</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {LANDING_PLANS.map((p) => (
          <div
            key={p.key}
            className={cn(
              "rounded-2xl border p-5",
              p.highlight
                ? "border-[#DFFF00]/35 bg-[#0B0D10]/55 shadow-[0_0_0_1px_rgba(223,255,0,0.15)]"
                : "border-white/10 bg-[#0B0D10]/35"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-white">{p.name}</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-3xl font-semibold text-white">{p.price}</div>
                  <div className="text-sm text-white/60">{p.cadence}</div>
                </div>
              </div>
              {p.highlight ? (
                <div className="text-[11px] font-semibold rounded-full bg-[#DFFF00] text-[#0B0D10] px-3 py-1">
                  Popular
                </div>
              ) : null}
            </div>

            <ul className="mt-5 space-y-2 text-sm text-white/70">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#DFFF00]/80" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button
                asChild
                className={cn(
                  "w-full",
                  p.highlight
                    ? "bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
                    : "bg-white/10 text-white hover:bg-white/15"
                )}
              >
                <Link href="/pricing">Choose {p.name}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

