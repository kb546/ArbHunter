import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForceDark } from "@/components/ForceDark";
import { MarketingHeader } from "@/components/landing/MarketingHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { FAQ, type FAQItem } from "@/components/landing/FAQ";
import { SnifferMockup } from "@/components/feature/OpportunitySniffer/SnifferMockup";
import { TrendingUp, Database, Brain, ArrowRight, Zap, Target } from "lucide-react";

export const metadata = {
  title: 'Find Ad Arbitrage Opportunities with Real Market Data | ArbHunter',
  description: 'Analyze ad arbitrage opportunities with Google Trends search data and Meta advertising competition insights. AI scores each opportunity 0-100 with detailed reasoning.',
  keywords: 'ad arbitrage opportunities, google trends arbitrage, meta advertising data, ad opportunity analysis, margin score calculator',
  openGraph: {
    title: 'Find Ad Arbitrage Opportunities with Real Market Data',
    description: 'AI-powered opportunity analysis combining Google Trends and Meta advertising data',
    url: 'https://arbhunter.dev/opportunity-sniffer',
    siteName: 'ArbHunter',
    locale: 'en_US',
    type: 'website',
  },
};

export default function OpportunitySniffer() {
  const faqs: FAQItem[] = [
    {
      q: "What data sources does this use?",
      a: "We pull real search data from Google Trends (search volume, growth rate, peak interest) and combine it with Meta advertising data (advertiser count, average CPC, competition level). Claude AI then analyzes both to score the opportunity."
    },
    {
      q: "What does the margin score mean?",
      a: "It's a 0-100 score predicting profit potential. Higher scores indicate favorable conditions: growing search interest, low competition, and good CPC vs RPM spread. Claude provides reasoning explaining why each opportunity scored the way it did."
    },
    {
      q: "Can I test any country?",
      a: "Yes. Enter any country code (US, UK, ZA, etc.) and topic. We fetch real data for that specific market, so you can compare the same niche across different countries to find the best opportunities."
    },
    {
      q: "How accurate are the scores?",
      a: "The scores reflect current market conditions based on real Google Trends and Meta data. They're predictive indicators, not guarantees. Market conditions change, so we recommend using scores as a starting point and validating with small test budgets."
    },
    {
      q: "What's included in the AI reasoning?",
      a: "Claude analyzes the trend velocity (is interest growing or declining?), competition density (how many advertisers are active?), and CPC/RPM economics. You get a plain-English explanation of why the opportunity scored well or poorly."
    },
    {
      q: "Can I save discoveries?",
      a: "Yes. All discoveries are automatically saved to your account. You can review them later, compare scores, and create campaigns from the best opportunities."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-4 py-1.5 text-sm text-[#DFFF00] mb-6">
              <Zap className="h-4 w-4" />
              Real Google Trends + Meta Data
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Find Ad Arbitrage Opportunities{" "}
              <span className="text-[#DFFF00]">with Real Market Data</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Stop guessing which topics are profitable. Combine Google Trends search data
              with Meta advertising insights to score opportunities from 0-100.
              AI analyzes each market and explains why it's worth testing.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90 text-base px-8"
              >
                <Link href="/auth/signup?next=/discovery">
                  Try It Free
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
              7-day free trial • No credit card required
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="mt-16 max-w-4xl mx-auto">
            <SnifferMockup />
            <p className="mt-4 text-center text-sm text-white/50">
              Example: Analyzing "DHL jobs" in South Africa showing 86/100 score with AI reasoning
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 1: Real Data Sources */}
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-sm text-emerald-400 mb-4">
                <Database className="h-4 w-4" />
                Real-Time Data
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Google Trends Meets Meta Advertising Data
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                We fetch live data from Google Trends to see search interest and growth,
                then combine it with Meta's advertising platform data for competition
                and CPC insights. You get the complete picture before spending a dollar.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 mt-0.5">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Search Growth Rate</div>
                    <div className="text-sm text-white/60 mt-1">
                      See if interest is rising or falling. Catch trends early before they saturate.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 mt-0.5">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Competition Level</div>
                    <div className="text-sm text-white/60 mt-1">
                      Know exactly how many advertisers are active and whether competition is low, medium, or high.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#DFFF00]/10 p-2 mt-0.5">
                    <Database className="h-5 w-5 text-[#DFFF00]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Average CPC from Meta</div>
                    <div className="text-sm text-white/60 mt-1">
                      Real cost-per-click data from Meta's advertising platform. No guessing on ad costs.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-first lg:order-last">
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-6">
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="text-xs text-white/60 mb-1">Google Trends Data</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Search Volume:</span>
                        <span className="text-white font-medium">8,200/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Growth Rate:</span>
                        <span className="text-emerald-400 font-medium">+127%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Peak Interest:</span>
                        <span className="text-white font-medium">82/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="text-xs text-white/60 mb-1">Meta Advertising Data</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Advertiser Count:</span>
                        <span className="text-white font-medium">12 active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Average CPC:</span>
                        <span className="text-white font-medium">$0.08</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Competition:</span>
                        <span className="text-blue-400 font-medium">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 2: AI Scoring */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-6">
              <div className="rounded-lg border border-[#DFFF00]/20 bg-[#DFFF00]/5 p-6 mb-4">
                <div className="text-sm text-white/60 mb-2">AI Margin Score</div>
                <div className="text-5xl font-bold text-[#DFFF00] mb-4">86/100</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#DFFF00] rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Reasoning
                </div>
                <div className="text-sm text-white/70 leading-relaxed space-y-2">
                  <p>
                    Strong growth trend (+127%) indicates rising interest. Low competition
                    (12 advertisers) suggests market isn't saturated yet.
                  </p>
                  <p>
                    CPC of $0.08 is favorable for arbitrage in this GEO. Consider testing
                    immediately before more advertisers enter.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-sm text-purple-400 mb-4">
                <Brain className="h-4 w-4" />
                AI-Powered Analysis
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Get a 0-100 Score with AI Reasoning
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                Claude analyzes trend velocity, competition density, and CPC economics to
                score each opportunity. You don't just get a number—you get a plain-English
                explanation of why it's worth testing or why you should skip it.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1 text-lg">✓</span>
                  <div>
                    <div className="font-semibold text-white">Trend Velocity Analysis</div>
                    <div className="text-sm text-white/60 mt-1">
                      Is search interest growing or declining? How fast is the change?
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1 text-lg">✓</span>
                  <div>
                    <div className="font-semibold text-white">Competition Assessment</div>
                    <div className="text-sm text-white/60 mt-1">
                      How many advertisers are active? Is the market saturated?
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#DFFF00] mt-1 text-lg">✓</span>
                  <div>
                    <div className="font-semibold text-white">Economics Breakdown</div>
                    <div className="text-sm text-white/60 mt-1">
                      CPC vs estimated RPM spread. Is the margin worth pursuing?
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
                >
                  <Link href="/auth/signup?next=/discovery">
                    Start Finding Opportunities
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-white/70">
              Everything you need to know about opportunity analysis
            </p>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Related Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Happens After Discovery?</h2>
            <p className="text-white/70">Turn opportunities into campaigns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/creative-studio-landing"
              className="group rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8 hover:border-[#DFFF00]/30 transition-all"
            >
              <div className="text-3xl mb-4">→</div>
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#DFFF00] transition-colors">
                Generate Ad Creatives
              </h3>
              <p className="text-white/60 mb-4">
                Auto-detect brand, generate 2 A/B variations with QC scoring. Hand off discovery data automatically.
              </p>
              <div className="flex items-center text-[#DFFF00] text-sm font-medium">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/campaign-manager-landing"
              className="group rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/50 to-[#0B0D10] p-8 hover:border-[#DFFF00]/30 transition-all"
            >
              <div className="text-3xl mb-4">→</div>
              <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#DFFF00] transition-colors">
                Organize Campaigns
              </h3>
              <p className="text-white/60 mb-4">
                Save discoveries as campaigns, track variations, select winners, and export copy without spreadsheets.
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
      <section className="py-20 bg-[#1a1d24]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Start analyzing opportunities with real Google Trends and Meta data.
            7-day free trial, no credit card required.
          </p>
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
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
