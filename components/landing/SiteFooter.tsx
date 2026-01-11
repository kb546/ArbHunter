import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SUPPORT_EMAIL } from "@/lib/support";

function Col({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="space-y-2 text-sm text-white/70">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("block hover:text-white transition-colors", className)}
    >
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B2F36] border border-white/10 overflow-hidden">
                <Image src="/brand/logo.png" alt="ArbHunter" width={28} height={28} />
              </span>
              ArbHunter
            </Link>
            <p className="mt-3 text-sm text-white/60 max-w-sm leading-relaxed">
              Find opportunities by country, generate creatives faster, and keep your campaigns organized.
            </p>
            <p className="mt-3 text-xs text-white/55">
              Support:{" "}
              <a className="underline underline-offset-4 hover:text-white" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Col title="Product">
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/discovery">Discovery</FooterLink>
              <FooterLink href="/creative-studio">Creative Studio</FooterLink>
              <FooterLink href="/campaigns">Campaigns</FooterLink>
            </Col>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Col title="Account">
              <FooterLink href="/auth/login">Log in</FooterLink>
              <FooterLink href="/auth/signup?next=/dashboard">Start the hunt</FooterLink>
              <FooterLink href="/account/billing">Billing</FooterLink>
              <FooterLink href="/account/settings">Settings</FooterLink>
            </Col>
          </div>

          <div className="col-span-2 md:col-span-4">
            <Col title="Legal">
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/refund-policy">Refund policy</FooterLink>
              <div className="pt-2 text-xs text-white/50 leading-relaxed">
                Billing is handled by Paddle (MoR). Taxes/VAT are handled automatically when applicable.
              </div>
            </Col>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} ArbHunter. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <FooterLink href="/terms" className="text-white/50 hover:text-white">Terms</FooterLink>
            <FooterLink href="/privacy" className="text-white/50 hover:text-white">Privacy</FooterLink>
            <FooterLink href="/refund-policy" className="text-white/50 hover:text-white">Refunds</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

