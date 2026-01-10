"use client";

import Link from "next/link";
import { ForceDark } from "@/components/ForceDark";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader active="refund-policy" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Refund Policy</h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-6 text-sm text-white/70 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Short version</h2>
            <p>
              If you believe you were charged incorrectly, contact us and we’ll help. For normal subscription usage,
              refunds depend on the situation and the payment provider’s rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">How to request a refund</h2>
            <p>
              Reply to your onboarding email after signup with your account email and what happened. If you can, include
              the Paddle receipt/transaction ID.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Billing provider</h2>
            <p>
              Billing is handled by Paddle (Merchant of Record). In some cases, Paddle may require the refund request to
              follow specific steps.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Links</h2>
            <p>
              Please also review our <Link className="underline underline-offset-4 hover:text-white" href="/terms">Terms</Link>{" "}
              and <Link className="underline underline-offset-4 hover:text-white" href="/privacy">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

