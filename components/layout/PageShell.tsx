import * as React from 'react';
import { cn } from '@/lib/utils';

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  right,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {description ? <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p> : null}
      </div>
      {right ? <div className="shrink-0 flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
      {description ? <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p> : null}
    </div>
  );
}

