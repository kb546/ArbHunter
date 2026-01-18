"use client";

import { cn } from "@/lib/utils";

export function SnifferMockupLarge() {
  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#0B0D10] p-6 sm:p-8">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-green-500/60" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1.5 text-xs text-white/60">
          arbhunter.dev/discovery
        </div>
        <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
          LIVE
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Opportunity Sniffer</h3>
        <p className="text-sm text-white/60 mt-1">ZA • DHL jobs</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search spike card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/80 to-[#1a1d24]/80 p-5">
          <div className="text-sm text-white/60 mb-2">Search spike</div>
          <div className="flex items-end gap-2 mb-4">
            <div className="text-4xl font-bold text-white">+200%</div>
            <div className="text-sm text-white/60 pb-1">last 14 days</div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1.5 h-24">
            {[30, 32, 28, 35, 31, 29, 33, 36, 34, 38, 45, 55, 72, 88, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className={cn(
                    "w-full rounded-t",
                    i >= 11 ? "bg-[#DFFF00]" : "bg-white/20"
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Profit gap card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/80 to-[#1a1d24]/80 p-5">
          <div className="text-sm text-white/60 mb-4">Profit gap</div>

          {/* Big number */}
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl font-bold text-[#DFFF00]">$0.05</div>
            <div className="text-2xl text-white/40">→</div>
            <div className="text-3xl font-bold text-[#DFFF00]">$4.00</div>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">CPC</div>
              <div className="text-sm font-semibold text-white">$0.05</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">RPM</div>
              <div className="text-sm font-semibold text-white">$4.00</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">Margin score</div>
              <div className="text-2xl font-bold text-[#DFFF00]">86</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend indicators */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <div className="text-xs text-emerald-400/80">Trend strength</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">High</div>
        </div>
        <div className="rounded-lg border border-[#DFFF00]/20 bg-[#DFFF00]/5 px-3 py-2">
          <div className="text-xs text-[#DFFF00]/80">Competition</div>
          <div className="text-lg font-bold text-[#DFFF00] mt-1">Low</div>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <div className="text-xs text-blue-400/80">Confidence</div>
          <div className="text-lg font-bold text-blue-400 mt-1">94%</div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 rounded-full bg-[#DFFF00] px-4 py-2 text-xs font-bold text-[#0B0D10] shadow-lg">
        HOT OPPORTUNITY
      </div>
    </div>
  );
}
