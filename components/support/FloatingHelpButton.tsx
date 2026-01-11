'use client';

import * as React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingHelpButton() {
  const [tourActive, setTourActive] = React.useState(false);
  const [tourLauncherVisible, setTourLauncherVisible] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const hasTourCard = Boolean(document.querySelector('[data-floating-tour-card="true"]'));
      const hasTourLauncher = Boolean(document.querySelector('[data-floating-tour-launcher="true"]'));
      setTourActive(hasTourCard);
      setTourLauncherVisible(hasTourLauncher);
    };

    update();

    const obs = new MutationObserver(update);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', update);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // During an active tour, hide Help to avoid competing UI in the same corner.
  if (tourActive) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        right: 20,
        bottom: tourLauncherVisible ? 84 : 20, // move up if Guided tour launcher is present
      }}
    >
      <Button asChild className="shadow-lg">
        <Link href="/support" aria-label="Open support">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Link>
      </Button>
    </div>
  );
}

