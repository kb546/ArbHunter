"use client";

import { TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";

export function SnifferMockup() {
  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#0B0D10] p-6">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-white/50">
          arbhunter.dev/discovery
        </div>
      </div>

      {/* Discovery Form */}
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-white/60 mb-1.5">Country (GEO)</div>
            <div className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
              ZA - South Africa
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1.5">Topic (Niche)</div>
            <div className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
              DHL jobs
            </div>
          </div>
        </div>
        <button className="mt-3 w-full rounded-md bg-[#DFFF00] px-4 py-2 text-sm font-semibold text-[#0B0D10]">
          Analyze Opportunity
        </button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {/* Margin Score - Main metric */}
        <div className="rounded-lg border border-[#DFFF00]/20 bg-[#DFFF00]/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 mb-1">AI Margin Score</div>
              <div className="text-3xl font-bold text-[#DFFF00]">86/100</div>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Strong Opportunity
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Trend Data */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <div className="text-xs text-white/60">Growth Rate</div>
            </div>
            <div className="text-xl font-bold text-white">+127%</div>
            <div className="text-xs text-white/50 mt-1">Last 30 days</div>
          </div>

          {/* Competition */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              <div className="text-xs text-white/60">Competition</div>
            </div>
            <div className="text-xl font-bold text-white">Low</div>
            <div className="text-xs text-white/50 mt-1">12 advertisers</div>
          </div>

          {/* CPC */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[#DFFF00]" />
              <div className="text-xs text-white/60">Avg CPC</div>
            </div>
            <div className="text-xl font-bold text-white">$0.08</div>
            <div className="text-xs text-white/50 mt-1">From Meta</div>
          </div>

          {/* Search Volume */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <div className="text-xs text-white/60">Search Volume</div>
            </div>
            <div className="text-xl font-bold text-white">8,200</div>
            <div className="text-xs text-white/50 mt-1">Monthly avg</div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-medium text-white/80 mb-2">AI Analysis</div>
          <div className="text-xs text-white/60 leading-relaxed">
            Strong growth trend with low competition. CPC is favorable for arbitrage.
            Consider testing immediately before market saturates.
          </div>
        </div>
      </div>
    </div>
  );
}
