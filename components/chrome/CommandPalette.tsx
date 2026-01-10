'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BarChart3, CreditCard, FolderKanban, Home, LogOut, Settings, Sparkles } from 'lucide-react';

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  keywords: string[];
  run: () => void | Promise<void>;
};

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  // Global hotkey: Cmd/Ctrl + K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === 'k';
      const mod = e.metaKey || e.ctrlKey;
      if (mod && isK) {
        e.preventDefault();
        setOpen(true);
      }
      if (open && e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const items: Item[] = useMemo(() => {
    return [
      {
        id: 'dashboard',
        label: 'Go to Dashboard',
        hint: '/dashboard',
        icon: <BarChart3 className="h-4 w-4" />,
        keywords: ['dashboard', 'home', 'overview'],
        run: () => router.push('/dashboard'),
      },
      {
        id: 'discovery',
        label: 'Go to Discovery',
        hint: '/discovery',
        icon: <Home className="h-4 w-4" />,
        keywords: ['discovery', 'opportunity', 'sniffer'],
        run: () => router.push('/discovery'),
      },
      {
        id: 'creative',
        label: 'Go to Creative Studio',
        hint: '/creative-studio',
        icon: <Sparkles className="h-4 w-4" />,
        keywords: ['creative', 'studio', 'generate', 'ads'],
        run: () => router.push('/creative-studio'),
      },
      {
        id: 'campaigns',
        label: 'Go to Campaigns',
        hint: '/campaigns',
        icon: <FolderKanban className="h-4 w-4" />,
        keywords: ['campaigns', 'export', 'ab test'],
        run: () => router.push('/campaigns'),
      },
      {
        id: 'billing',
        label: 'Open Billing',
        hint: '/account/billing',
        icon: <CreditCard className="h-4 w-4" />,
        keywords: ['billing', 'plan', 'subscription', 'usage'],
        run: () => router.push('/account/billing'),
      },
      {
        id: 'settings',
        label: 'Open Settings',
        hint: '/account/settings',
        icon: <Settings className="h-4 w-4" />,
        keywords: ['settings', 'account', 'profile', 'logout'],
        run: () => router.push('/account/settings'),
      },
      {
        id: 'logout',
        label: 'Log out',
        hint: 'Ends your session',
        icon: <LogOut className="h-4 w-4" />,
        keywords: ['logout', 'sign out'],
        run: async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/auth/login');
        },
      },
    ].filter((i) => {
      // Hide "go to X" if already on X (small polish)
      if (i.id === 'discovery' && pathname.startsWith('/discovery')) return false;
      if (i.id === 'dashboard' && pathname.startsWith('/dashboard')) return false;
      if (i.id === 'creative' && pathname.startsWith('/creative-studio')) return false;
      if (i.id === 'campaigns' && pathname.startsWith('/campaigns')) return false;
      if (i.id === 'billing' && pathname.startsWith('/account/billing')) return false;
      if (i.id === 'settings' && pathname.startsWith('/account/settings')) return false;
      return true;
    });
  }, [router, pathname]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((i) => {
      const hay = [i.label, i.hint, ...i.keywords].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(query);
    });
  }, [items, q]);

  useEffect(() => {
    setActiveIdx(0);
  }, [q, open]);

  function runActive() {
    const item = filtered[activeIdx];
    if (!item) return;
    setOpen(false);
    setQ('');
    item.run();
  }

  return (
    <>
      {/* Trigger button is rendered in AppChrome */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-2xl" showCloseButton={false}>
          <div className="border-b bg-[color:var(--card)] p-3">
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search commands… (e.g. billing, creative, logout)"
              className="h-10"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIdx((v) => Math.min(v + 1, filtered.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIdx((v) => Math.max(v - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  runActive();
                }
              }}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tip: press ⌘K / Ctrl+K</span>
              <span>Enter to run • Esc to close</span>
            </div>
          </div>

          <div className="max-h-[360px] overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No results.</div>
            ) : (
              <div className="p-2">
                {filtered.map((item, idx) => {
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => {
                        setActiveIdx(idx);
                        runActive();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        active ? 'bg-[color:var(--accent)]' : 'hover:bg-[color:var(--accent)]/60'
                      )}
                    >
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-foreground">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{item.label}</div>
                        {item.hint ? <div className="text-xs text-muted-foreground truncate">{item.hint}</div> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

