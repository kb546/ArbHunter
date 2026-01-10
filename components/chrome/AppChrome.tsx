'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UsageBanner } from '@/components/UsageBanner';
import { BarChart3, CreditCard, Home, Menu, Sparkles, X } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  { href: '/', label: 'Discovery', icon: <Home className="h-4 w-4" /> },
  { href: '/creative-studio', label: 'Creative Studio', icon: <Sparkles className="h-4 w-4" /> },
  { href: '/account/billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
];

function pageTitle(pathname: string) {
  if (pathname === '/') return 'Discovery';
  if (pathname.startsWith('/creative-studio')) return 'Creative Studio';
  if (pathname.startsWith('/account/billing')) return 'Billing';
  if (pathname.startsWith('/pricing')) return 'Pricing';
  if (pathname.startsWith('/admin/webhooks/paddle')) return 'Paddle Webhooks';
  return 'ArbHunter';
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideChrome = pathname.startsWith('/auth');
  const title = useMemo(() => pageTitle(pathname), [pathname]);

  if (hideChrome) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-50 border-b bg-[color:var(--card)]/90 backdrop-blur">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-semibold">{title}</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[color:var(--sidebar)] border-r p-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight">
                ArbHunter
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      active ? 'bg-[color:var(--sidebar-accent)] text-[color:var(--foreground)]' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-[color:var(--sidebar)]">
          <div className="h-16 px-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[color:var(--primary)]/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-[color:var(--primary)]" />
              </div>
              <div className="font-semibold tracking-tight">ArbHunter</div>
            </Link>
          </div>
          <nav className="px-3 pb-4 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-[color:var(--sidebar-accent)] text-[color:var(--foreground)]'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-5 pb-5">
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Desktop topbar */}
          <div className="hidden lg:block sticky top-0 z-40 border-b bg-[color:var(--card)]/90 backdrop-blur">
            <div className="h-16 px-8 flex items-center justify-between">
              <div className="font-semibold text-gray-900">{title}</div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/account/billing">Account</Link>
                </Button>
              </div>
            </div>
          </div>

          <main className="px-4 py-6 lg:px-8 lg:py-8">
            {/* Stripe-like: lightweight inline usage status */}
            <div className="mb-6">
              <UsageBanner />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

