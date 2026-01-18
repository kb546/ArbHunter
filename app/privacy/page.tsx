"use client";

import { ForceDark } from "@/components/ForceDark";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader active="privacy" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8 space-y-6 text-sm text-white/70 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">What we collect</h2>
            <p>
              We collect your account email and basic usage data (for example: how many discoveries/creatives you’ve used this month).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">How we use it</h2>
            <p>
              We use this information to run the product, enforce monthly limits, improve reliability, and provide support.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Payments</h2>
            <p>
              Payments are processed by Dodo Payments (Merchant of Record). We do not store your full payment details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Data security</h2>
            <p>
              We take security seriously, but no system is perfect. Please use a strong password and keep your account secure.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

