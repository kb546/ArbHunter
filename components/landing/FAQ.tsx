"use client";

import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type FAQItem = {
  q: string;
  a: string;
};

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#2B2F36]/35 p-5 sm:p-6">
      <div className="text-lg font-semibold text-white">Frequently asked questions</div>
      <div className="text-sm text-white/70 mt-1 leading-relaxed">
        Fast answers to the questions we hear from media buyers and arbitrage teams.
      </div>

      <div className="mt-6 divide-y divide-white/10">
        {items.map((it, idx) => (
          <FAQRow key={`${it.q}-${idx}`} item={it} defaultOpen={idx === 0} />
        ))}
      </div>
    </div>
  );
}

function FAQRow({ item, defaultOpen }: { item: FAQItem; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="py-4">
      <CollapsibleTrigger
        className={cn(
          "w-full flex items-center justify-between gap-4 text-left",
          "hover:text-white transition-colors"
        )}
      >
        <span className="text-sm sm:text-base font-medium text-white">{item.q}</span>
        <ChevronDown className={cn("h-4 w-4 text-white/60 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 text-sm text-white/70 leading-relaxed">
        {item.a}
      </CollapsibleContent>
    </Collapsible>
  );
}

