"use client";

import { cn } from "@/lib/utils";

interface TrustStat {
  icon: string;
  value: string;
  label: string;
  highlight?: boolean;
}

interface TrustBarProps {
  stats?: TrustStat[];
  className?: string;
}

const defaultStats: TrustStat[] = [
  { icon: "🎯", value: "50,000+", label: "Opportunities discovered" },
  { icon: "🎨", value: "200,000+", label: "Creatives generated" },
  { icon: "⭐", value: "4.8/5", label: "User rating", highlight: true },
  { icon: "⚡", value: "2min", label: "Avg. discovery time" },
];

export function TrustBar({ stats = defaultStats, className }: TrustBarProps) {
  return (
    <div className={cn("border-y border-white/10 bg-[#0B0D10]", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={cn(
                "text-center",
                stat.highlight && "md:border-l md:border-r border-white/10 md:px-6"
              )}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={cn(
                "text-2xl sm:text-3xl font-bold mb-1",
                stat.highlight ? "text-[#DFFF00]" : "text-white"
              )}>
                {stat.value}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
