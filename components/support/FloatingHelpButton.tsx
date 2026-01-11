'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingHelpButton() {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button asChild className="shadow-lg">
        <Link href="/support" aria-label="Open support">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Link>
      </Button>
    </div>
  );
}

