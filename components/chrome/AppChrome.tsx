'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UsageBanner } from '@/components/UsageBanner';
import { CommandPalette } from '@/components/chrome/CommandPalette';
import { BarChart3, CreditCard, FolderKanban, Home, Menu, Search, Settings, Sparkles, X } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { href: '/discovery', label: 'Discovery', icon: <Home className="h-4 w-4" /> },
  { href: '/creative-studio', label: 'Creative Studio', icon: <Sparkles className="h-4 w-4" /> },
  { href: '/campaigns', label: 'Campaigns', icon: <FolderKanban className="h-4 w-4" /> },
  { href: '/account/billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
  { href: '/account/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

function pageTitle(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/discovery')) return 'Discovery';
  if (pathname.startsWith('/creative-studio')) return 'Creative Studio';
  if (pathname.startsWith('/campaigns')) return 'Campaigns';
  if (pathname.startsWith('/account/billing')) return 'Billing';
  if (pathname.startsWith('/account/settings')) return 'Settings';
  if (pathname.startsWith('/pricing')) return 'Pricing';
  if (pathname.startsWith('/admin/webhooks/paddle')) return 'Paddle Webhooks';
  return 'ArbHunter';
}

function breadcrumbs(pathname: string) {
  const items: Array<{ label: string; href?: string }> = [{ label: 'ArbHunter', href: '/dashboard' }];
  if (pathname.startsWith('/discovery')) items.push({ label: 'Discovery' });
  else if (pathname.startsWith('/dashboard')) items.push({ label: 'Dashboard' });
  else if (pathname.startsWith('/creative-studio')) items.push({ label: 'Creative Studio' });
  else if (pathname.startsWith('/campaigns')) items.push({ label: 'Campaigns' });
  else if (pathname.startsWith('/account/billing')) items.push({ label: 'Account', href: '/account/settings' }, { label: 'Billing' });
  else if (pathname.startsWith('/account/settings')) items.push({ label: 'Account', href: '/account/settings' }, { label: 'Settings' });
  else items.push({ label: pageTitle(pathname) });
  return items;
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideChrome = pathname.startsWith('/auth') || pathname === '/';
  const title = useMemo(() => pageTitle(pathname), [pathname]);
  const crumbs = useMemo(() => breadcrumbs(pathname), [pathname]);

  if (hideChrome) return <>{children}</>;

  // Search is now handled by CommandPalette (⌘K)

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <CommandPalette />
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
              <Link href="/dashboard" className="font-semibold tracking-tight">
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
            <Link href="/dashboard" className="flex items-center gap-2">
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
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {crumbs.map((c, idx) => (
                  <span key={`${c.label}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 ? <span className="text-gray-300">/</span> : null}
                    {c.href ? (
                      <Link className="hover:text-gray-900 transition-colors" href={c.href}>
                        {c.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-900">{c.label}</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Trigger via synthetic keypress keeps behavior aligned with global handler
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                  }}
                  className="hidden xl:flex items-center gap-2 h-9 w-[360px] rounded-md border bg-white px-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-left">Search…</span>
                  <span className="text-xs text-gray-400">⌘K</span>
                </button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/account/settings">Account</Link>
                </Button>
              </div>
            </div>
          </div>

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* lightweight inline usage status */}
              <div className="mb-6">
                <UsageBanner />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

