import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForceDark } from "@/components/ForceDark";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { FAQ, type FAQItem } from "@/components/landing/FAQ";
import { PricingSection } from "@/components/landing/PricingSection";
import { TrustBar } from "@/components/feature/TrustBar";
import { SnifferMockupLarge } from "@/components/feature/OpportunitySniffer/SnifferMockupLarge";
import { ArrowRight, TrendingUp, Globe, Zap, Target, Brain, Clock } from "lucide-react";

export const metadata = {
  title: 'Find Profitable Ad Arbitrage Opportunities | ArbHunter Opportunity Sniffer',
  description: 'Discover trending topics and high-margin countries for Facebook ad arbitrage in seconds. AI-powered opportunity scanner finds profitable campaigns before your competitors with 94% accuracy.',
  keywords: 'ad arbitrage opportunities, facebook arbitrage scanner, trending topics ads, ad spy tool, arbitrage opportunity finder, facebook ads arbitrage',
  openGraph: {
    title: 'Find Profitable Ad Arbitrage Opportunities Before Your Competitors',
    description: 'AI-powered opportunity scanner for Facebook ad arbitrage. Discover trending topics with 200%+ search spikes and 80+ margin scores.',
    url: 'https://arbhunter.dev/opportunity-sniffer',
    siteName: 'ArbHunter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Profitable Ad Arbitrage Opportunities',
    description: 'AI-powered opportunity scanner for Facebook ad arbitrage',
  },
};

export default function OpportunitySniffer() {
  const faqs: FAQItem[] = [
    {
      q: "How does the Opportunity Sniffer find trending topics?",
      a: "Our AI analyzes search volume spikes across Google Trends, social signals, and news mentions in real-time. We detect topics with 100%+ search increases in the last 14 days, giving you early access to emerging trends before they saturate."
    },
    {
      q: "What does the margin score mean?",
      a: "The margin score (0-100) predicts your profit potential by comparing estimated CPC costs against RPM earnings. Scores above 70 indicate strong arbitrage opportunities. We factor in competition levels, search intent, and historical performance data."
    },
    {
      q: "Can I filter by specific countries or regions?",
      a: "Yes! The Opportunity Sniffer supports 150+ countries with country-specific trend data. You can save favorite countries, exclude regions, and compare opportunities across multiple markets simultaneously."
    },
    {
      q: "How often is the data updated?",
      a: "Opportunity data refreshes every 4 hours. Search spike trends update daily. You'll see a timestamp on each discovery showing when it was last analyzed, ensuring you're always working with fresh signals."
    },
    {
      q: "What if I find an opportunity but it's too competitive?",
      a: "The Sniffer shows competition levels (Low/Medium/High). We recommend starting with 'Low' competition opportunities with margin scores above 75. You can also use the Creative Studio to differentiate your ads even in competitive niches."
    },
    {
      q: "Do I need technical skills to use this?",
      a: "Not at all. Just pick a country from the dropdown, browse trending topics, and click any opportunity to see the full analysis. The interface explains every metric in plain English with visual indicators for quick decisions."
    },
    {
      q: "Can I export opportunities for my team?",
      a: "Pro and Agency plans include CSV export with all metrics (CPC, RPM, margin score, trend data). You can also bookmark opportunities and share links with team members for collaboration."
    },
    {
      q: "How accurate are the profit predictions?",
      a: "Our margin scores have 94% correlation with actual campaign profitability based on historical data from 50,000+ opportunities. While we can't guarantee results (markets change!), our predictions are the most reliable leading indicator available."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-4 py-1.5 text-sm text-[#DFFF00] mb-6">
              <Zap className="h-4 w-4" />
              Find opportunities in under 2 minutes
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Find Profitable Ad Arbitrage Opportunities{" "}
              <span className="text-[#DFFF00]">Before Anyone Else</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Discover trending topics with 200%+ search spikes and 80+ margin scores.
              Our AI scans 150+ countries daily to surface opportunities your competitors haven't found yet.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90 text-base px-8"
              >
                <Link href="/auth/signup?next=/discovery">
                  Start Discovering
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5 text-base px-8"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-6 text-sm text-white/50">
              7-day free trial on Starter plan • No credit card required
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="mt-16">
            <SnifferMockupLarge />
            <p className="mt-4 text-center text-sm text-white/50">
              Live example: "DHL Jobs" spike in South Africa showing 200% search increase and 86 margin score
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Feature Deep Dive 1: AI-Powered Detection */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-sm text-emerald-400 mb-4">
                <Brain className="h-4 w-4" />
                AI-Powered
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stop Guessing. Let AI Find the Winners.
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                Our machine learning model analyzes millions of data points daily—search volumes,
                social signals, news mentions, and historical arbitrage performance—to surface
                opportunities with the highest profit potential.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#DFFF00]/10 p-2 mt-0.5">
                    <TrendingUp className="h-5 w-5 text-[#DFFF00]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Real-Time Trend Detection</div>
                    <div className="text-sm text-white/60 mt-1">
                      Catch 100-200% search spikes within hours, not days. Get alerted before saturation hits.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#DFFF00]/10 p-2 mt-0.5">
                    <Target className="h-5 w-5 text-[#DFFF00]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Margin Score Predictions</div>
                    <div className="text-sm text-white/60 mt-1">
                      94% accuracy in predicting profitability. See CPC vs RPM gap instantly with confidence scores.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#DFFF00]/10 p-2 mt-0.5">
                    <Globe className="h-5 w-5 text-[#DFFF00]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">150+ Countries Monitored</div>
                    <div className="text-sm text-white/60 mt-1">
                      Find geo-specific opportunities. What's saturated in the US might be untapped in South Africa.
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="order-first lg:order-last">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8">
                {/* Mini visualization */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Trend Strength</span>
                      <span className="text-lg font-bold text-emerald-400">+247%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#DFFF00]/20 bg-[#DFFF00]/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Margin Score</span>
                      <span className="text-lg font-bold text-[#DFFF00]">86/100</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#DFFF00] rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Confidence</span>
                      <span className="text-lg font-bold text-blue-400">94%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/60 mb-2">Estimated Profit Margin</div>
                    <div className="text-3xl font-bold text-white">$3.95</div>
                    <div className="text-sm text-white/60 mt-1">per $0.05 spend</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 2: Speed Matters */}
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8">
              {/* Timeline visual */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-[#DFFF00]">2 min</div>
                  <div className="text-sm text-white/60 mt-2">Average discovery time</div>
                </div>

                {[
                  { step: 1, label: "Select country", time: "5s", color: "emerald" },
                  { step: 2, label: "Browse opportunities", time: "30s", color: "blue" },
                  { step: 3, label: "Analyze margin score", time: "20s", color: "purple" },
                  { step: 4, label: "Start creating ads", time: "1m", color: "yellow" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-400 font-bold`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.label}</div>
                    </div>
                    <div className="text-sm text-white/60">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-3 py-1 text-sm text-[#DFFF00] mb-4">
                <Clock className="h-4 w-4" />
                Lightning Fast
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                From Idea to Campaign in Under 2 Minutes
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                Speed is everything in ad arbitrage. While competitors waste hours scrolling Google Trends
                and manually calculating margins, you'll be launching profitable campaigns.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white">One-Click Country Selection</div>
                    <div className="text-sm text-white/60 mt-1">
                      No more spreadsheets. Pick from 150+ countries with instant trend loading.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white">Pre-Calculated Margins</div>
                    <div className="text-sm text-white/60 mt-1">
                      CPC, RPM, and profit margins computed automatically. No manual math required.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1">✓</span>
                  <div>
                    <div className="font-semibold text-white">Instant Creative Studio Handoff</div>
                    <div className="text-sm text-white/60 mt-1">
                      Click "Generate Creatives" to jump straight into A/B testing with your opportunity data pre-filled.
                    </div>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
                >
                  <Link href="/auth/signup?next=/discovery">
                    Try It Free for 7 Days
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 3: Built for Scale */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Media Buyers Who Scale
            </h2>
            <p className="text-lg text-white/70">
              Whether you're testing 5 opportunities or 500, the Opportunity Sniffer keeps up with your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-6">
              <div className="text-3xl mb-4">📌</div>
              <h3 className="text-xl font-semibold mb-2">Bookmark & Track</h3>
              <p className="text-white/60">
                Save promising opportunities to your watchlist. Get alerts when margin scores change or competition increases.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Bulk Export</h3>
              <p className="text-white/60">
                Export opportunities as CSV with all metrics. Share with your team or load into your campaign tracker.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-6">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
              <p className="text-white/60">
                Get notified when new high-margin opportunities appear in your favorite countries (Pro plan).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Finding Opportunities Today
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              All plans include full access to the Opportunity Sniffer. Upgrade for higher monthly discovery limits.
            </p>
          </div>
          <PricingSection />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-white/70">
              Everything you need to know about finding profitable opportunities
            </p>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Related Features */}
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Your Workflow</h2>
            <p className="text-white/70">Opportunity Sniffer works seamlessly with our other tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/creative-studio"
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8 hover:border-[#DFFF00]/30 transition-all"
            >
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#DFFF00] transition-colors">
                Creative Studio
              </h3>
              <p className="text-white/60 mb-4">
                Generate A/B tested ad creatives in minutes. Auto-filled with your opportunity data for faster testing.
              </p>
              <div className="flex items-center text-[#DFFF00] text-sm font-medium">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/campaign-manager"
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8 hover:border-[#DFFF00]/30 transition-all"
            >
              <div className="text-3xl mb-4">📁</div>
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#DFFF00] transition-colors">
                Campaign Manager
              </h3>
              <p className="text-white/60 mb-4">
                Organize and track your campaigns by opportunity. Tag winners, export copy, and scale what works.
              </p>
              <div className="flex items-center text-[#DFFF00] text-sm font-medium">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find Your Next Winner?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Join media buyers discovering 50,000+ opportunities monthly. Start your 7-day free trial—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90 text-base px-8"
            >
              <Link href="/auth/signup?next=/discovery">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5 text-base px-8"
            >
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ArbHunter Opportunity Sniffer",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "AI-powered opportunity scanner for Facebook ad arbitrage. Find trending topics with 200%+ search spikes and 80+ margin scores across 150+ countries.",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "39",
              "highPrice": "249",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "39",
                "priceCurrency": "USD",
                "billingDuration": "P1M"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127",
              "bestRating": "5"
            },
            "featureList": [
              "Real-time trend detection across 150+ countries",
              "94% accuracy in margin score predictions",
              "AI-powered CPC vs RPM analysis",
              "2-minute average discovery time",
              "Bookmark and track opportunities",
              "CSV export for team collaboration",
              "Smart alerts for new opportunities"
            ]
          }),
        }}
      />
    </div>
  );
}
