import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfitCalculator } from "@/components/landing/ProfitCalculator";
import { ArticleFactoryMock, CreativeStudioMock, SnifferMock, TiltedFrame } from "@/components/landing/Mockups";
import { FAQ, type FAQItem } from "@/components/landing/FAQ";
import { ProductInMotion } from "@/components/landing/ProductInMotion";
import { PricingSection } from "@/components/landing/PricingSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { cn } from "@/lib/utils";

function Section({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("py-12 sm:py-20", className)}>{children}</section>;
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>;
}

export default function LandingPage() {
  const faqs: FAQItem[] = [
    {
      q: "What is ArbHunter in one sentence?",
      a: "ArbHunter helps you find opportunities by country, generate ad creatives faster, and organize campaigns so you can scale without chaos.",
    },
    {
      q: "Do I need design skills to get good creatives?",
      a: "No. Creative Studio generates ready-to-run A/B variations and uses quality checks to reduce weird outputs before you waste budget.",
    },
    {
      q: "What does 'QC loop' mean?",
      a: "We generate creatives, score them for quality, and (when needed) regenerate once to fix common issues like irrelevant elements, weak hierarchy, or brand mismatch.",
    },
    {
      q: "Is ArbHunter a free tool?",
      a: "ArbHunter is hard-gated. You can create an account, then upgrade to unlock higher monthly limits for discoveries and creatives.",
    },
    {
      q: "What markets does it work best for?",
      a: "It’s designed for testing different countries quickly and choosing the right tradeoff between speed and quality.",
    },
    {
      q: "Can I export creatives and copy?",
      a: "Yes. Campaigns lets you mark winners, tag variations, and export copy. Creative exports can be expanded next (ZIP bundles, presets).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      {/* Top nav */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]/85 backdrop-blur">
        <Container>
          <div className="h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B2F36] border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#DFFF00]" />
              </span>
              ArbHunter
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <a href="#features" className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5">
                Features
              </a>
              <a href="#demo" className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5">
                Product
              </a>
              <a href="#pricing" className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5">
                Pricing
              </a>
              <a href="#faq" className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="border-white/15 bg-transparent text-white hover:bg-white/5">
                <Link href="/auth/login?next=/dashboard">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90 shadow-[0_0_0_1px_rgba(223,255,0,0.35),0_20px_60px_rgba(223,255,0,0.10)]"
              >
                <Link href="/auth/signup?next=/dashboard">Start the hunt</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <Section className="pt-10 sm:pt-18">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2B2F36]/50 px-3 py-1 text-xs text-white/70">
                A beginner-friendly workflow for ad arbitrage
                <span className="h-1.5 w-1.5 rounded-full bg-[#DFFF00]" />
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                Find better opportunities. Test faster. <span className="text-[#DFFF00]">Scale smarter</span>.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
                Pick a country + topic, generate ad creatives, and organize results — without spreadsheets and guesswork.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
                >
                  <Link href="/auth/signup">Start the hunt</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/5"
                >
                  <Link href="/auth/login?next=/dashboard">View demo inside app</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="Signals" value="Trend + demand" />
                <Stat label="Creatives" value="2 variations" />
                <Stat label="Speed" value="Minutes" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <TiltedFrame className="overflow-hidden">
                <SnifferMock />
              </TiltedFrame>
              <div className="mt-4 text-xs text-white/50">
                Example: “DHL Jobs” spike in South Africa (demo).
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Social proof strip */}
      <div className="border-y border-white/10 bg-[#0B0D10]">
        <Container>
          <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-white/60">
              Trusted by media buyers at <span className="text-white/70">performance teams</span> worldwide
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs tracking-wide text-white/40">
              <span>ARBITRAGE LAB</span>
              <span>MEDIA OPS</span>
              <span>GROWTH DESK</span>
              <span>BUYER COLLECTIVE</span>
              <span>AD YIELD GROUP</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Feature bento */}
      <Section>
        <Container>
          <div id="features" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-24">
            <BentoCard
              title="Opportunity Sniffer"
              desc="Stop guessing. Find countries + topics worth testing."
              className="lg:col-span-7"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <SnifferMock />
              </div>
            </BentoCard>
            <BentoCard
              title="Creative Studio"
              desc="Generate A/B pairs (2 variations) or batch options quickly."
              className="lg:col-span-5"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <CreativeStudioMock />
              </div>
            </BentoCard>
            <BentoCard
              title="Article Factory"
              desc="Turn a topic into a clean article layout (shipping next)."
              className="lg:col-span-12"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <ArticleFactoryMock />
              </div>
            </BentoCard>
          </div>
        </Container>
      </Section>

      {/* Product in motion */}
      <Section className="pt-0">
        <Container>
          <div id="demo" className="scroll-mt-24">
            <ProductInMotion />
          </div>
        </Container>
      </Section>

      {/* ROI calculator */}
      <Section className="pt-0">
        <Container>
          <ProfitCalculator />
        </Container>
      </Section>

      {/* Pricing */}
      <Section className="pt-0">
        <Container>
          <div id="pricing" className="scroll-mt-24">
            <PricingSection />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <Container>
          <div id="faq" className="scroll-mt-24">
            <FAQ items={faqs} />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B0D10]/55 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-base font-semibold text-white">Ready to try it?</div>
              <div className="text-sm text-white/70 mt-1">
                Create an account in seconds and explore the workflow inside the app.
              </div>
            </div>
            <Button asChild size="lg" className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90">
              <Link href="/auth/signup">Create account</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <SiteFooter />

      {/* Structured data (minimal) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ArbHunter",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Ad arbitrage workflow platform to find opportunities by country, generate creatives faster, and organize campaigns.",
            offers: { "@type": "Offer", price: "29", priceCurrency: "USD" },
          }),
        }}
      />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#2B2F36]/40 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white mt-1">{value}</div>
    </div>
  );
}

function BentoCard({
  title,
  desc,
  className,
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-[#2B2F36]/35 p-5 sm:p-6", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="text-sm text-white/70 mt-1 leading-relaxed">{desc}</div>
        </div>
        <div className="hidden sm:block h-2 w-2 rounded-full bg-[#DFFF00]" />
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

