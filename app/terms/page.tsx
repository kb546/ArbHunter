"use client";

import { ForceDark } from "@/components/ForceDark";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader active="terms" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Terms & Conditions</h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-6 text-sm text-white/70 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1) Using ArbHunter</h2>
            <p>
              You may use ArbHunter only if you follow these terms and all applicable laws. Don’t abuse the product,
              attempt to break security, or use it to harm other people.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2) Accounts</h2>
            <p>
              You are responsible for your account and anything that happens under it. Keep your login details safe.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3) Billing</h2>
            <p>
              Paid plans unlock higher monthly limits. Billing is handled by Paddle (Merchant of Record), which may
              collect taxes/VAT where required.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4) Limits and availability</h2>
            <p>
              Features and limits can change over time. We work to keep ArbHunter reliable, but we can’t guarantee
              100% uptime.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">5) Your content and outputs</h2>
            <p>
              You keep rights to your inputs. Generated outputs are provided “as is”. You are responsible for how you
              use them.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">6) Refunds</h2>
            <p>
              Please read our Refund Policy for details.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

