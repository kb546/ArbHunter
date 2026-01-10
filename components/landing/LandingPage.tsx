import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfitCalculator } from "@/components/landing/ProfitCalculator";
import { ArticleFactoryMock, CreativeStudioMock, SnifferMock, TiltedFrame } from "@/components/landing/Mockups";
import { cn } from "@/lib/utils";

function Section({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("py-16 sm:py-20", className)}>{children}</section>;
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>;
}

export default function LandingPage() {
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
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5">
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90 shadow-[0_0_0_1px_rgba(223,255,0,0.35),0_20px_60px_rgba(223,255,0,0.10)]"
              >
                <Link href="/auth/signup">Start hunting for free</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <Section className="pt-14 sm:pt-18">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2B2F36]/50 px-3 py-1 text-xs text-white/70">
                High-velocity intelligence for Ad Arbitrage
                <span className="h-1.5 w-1.5 rounded-full bg-[#DFFF00]" />
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                Maximize your <span className="text-[#DFFF00]">arbitrage spread</span>.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
                Identify undervalued GEOs, generate policy-safe creatives, and launch AdSense-ready articles in one click.
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
                  <Link href="/auth/login">View demo inside app</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="Signals" value="Spikes + spread" />
                <Stat label="Creatives" value="QC loop" />
                <Stat label="Speed" value="Minutes, not days" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <TiltedFrame className="overflow-hidden">
                <SnifferMock />
              </TiltedFrame>
              <div className="mt-4 text-xs text-white/50">
                Example: “DHL Jobs” spike in South Africa with wide CPC→RPM spread.
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

      {/* Product in motion / bento */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <BentoCard
              title="Opportunity Sniffer"
              desc="Stop guessing. Target Tier-2 markets where the spread is widest."
              className="lg:col-span-7"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <SnifferMock />
              </div>
            </BentoCard>
            <BentoCard
              title="Creative Studio"
              desc="Compliance-locked assets. Reduce policy rejections for jobs & credit."
              className="lg:col-span-5"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <CreativeStudioMock />
              </div>
            </BentoCard>
            <BentoCard
              title="Article Factory"
              desc="Articles built for yield — structured for CTR and dwell time."
              className="lg:col-span-12"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0B0D10]/50 overflow-hidden">
                <ArticleFactoryMock />
              </div>
            </BentoCard>
          </div>
        </Container>
      </Section>

      {/* ROI calculator */}
      <Section className="pt-0">
        <Container>
          <ProfitCalculator />
        </Container>
      </Section>

      {/* Pricing teaser */}
      <Section className="pt-0">
        <Container>
          <div className="rounded-2xl border border-white/10 bg-[#2B2F36]/50 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">Tiered pricing</div>
                <div className="text-sm text-white/70 mt-1">
                  Starter for testing • Agency for volume. Upgrade as you scale.
                </div>
              </div>
              <Button
                asChild
                className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <footer className="border-t border-white/10 py-10">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-white/50">
            <div>© {new Date().getFullYear()} ArbHunter</div>
            <div className="flex items-center gap-4">
              <Link className="hover:text-white" href="/pricing">
                Pricing
              </Link>
              <Link className="hover:text-white" href="/auth/signup">
                Start free
              </Link>
            </div>
          </div>
        </Container>
      </footer>

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
              "Ad arbitrage intelligence platform to discover undervalued GEOs, generate policy-safe creatives, and launch AdSense-ready articles.",
            offers: { "@type": "Offer", price: "29", priceCurrency: "USD" },
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

