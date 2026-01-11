"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Key = "home" | "pricing" | "contact" | "terms" | "privacy" | "refund-policy";

const NAV: Array<{ key: Key; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "contact", label: "Contact", href: "/contact" },
  { key: "terms", label: "Terms", href: "/terms" },
  { key: "privacy", label: "Privacy", href: "/privacy" },
  { key: "refund-policy", label: "Refunds", href: "/refund-policy" },
];

export function MarketingHeader({ active }: { active?: Key }) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2B2F36] border border-white/10 overflow-hidden">
              <Image src="/brand/logo.png" alt="ArbHunter" width={28} height={28} />
            </span>
            ArbHunter
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {NAV.map((i) => {
              const isActive = active === i.key;
              return (
                <Link
                  key={i.key}
                  href={i.href}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-colors",
                    isActive ? "text-white bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/5"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90">
              <Link href="/auth/signup?next=/dashboard">Start the hunt</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

