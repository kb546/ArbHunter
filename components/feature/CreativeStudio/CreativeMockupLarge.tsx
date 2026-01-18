"use client";

import { cn } from "@/lib/utils";

export function CreativeMockupLarge() {
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
          arbhunter.dev/creative-studio
        </div>
        <div className="rounded-md bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-400">
          QC LOOP • 2 VARIATIONS
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Creative Studio</h3>
        <p className="text-sm text-white/60 mt-1">ZA • DHL jobs opportunity</p>
      </div>

      {/* A/B Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variation 1 */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/80 to-[#1a1d24]/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">V1</div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              QC 82
            </div>
          </div>

          {/* Creative Preview */}
          <div className="aspect-[1200/628] rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-6 mb-4 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">
                📦
              </div>
              <div>
                <div className="text-white font-bold text-sm">DHL Express</div>
                <div className="text-white/80 text-xs">Hiring Now in SA</div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="text-white font-bold text-lg">
                Urgent: DHL Hiring in South Africa
              </div>
              <div className="text-white/90 text-sm">
                Competitive salary • Full benefits
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <div className="bg-white text-blue-800 font-bold px-6 py-2 rounded-lg text-sm">
                Apply Now
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-white/60">
              <span>Clean layout</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Brand-aligned colors</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Readable hierarchy</span>
              <span className="text-emerald-400">✓</span>
            </div>
          </div>

          {/* Predicted CTR */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-1">Predicted CTR</div>
            <div className="text-2xl font-bold text-emerald-400">6.8%</div>
          </div>
        </div>

        {/* Variation 2 */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#2B2F36]/80 to-[#1a1d24]/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">V2</div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              QC 88
            </div>
          </div>

          {/* Creative Preview */}
          <div className="aspect-[1200/628] rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 mb-4 flex flex-col justify-between">
            {/* Header with different style */}
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-[#0B0D10] font-bold text-lg">
                DHL Jobs Available
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/95 backdrop-blur rounded-lg p-4 space-y-2">
              <div className="text-[#0B0D10] font-bold text-base">
                Join DHL South Africa Today
              </div>
              <div className="text-[#0B0D10]/80 text-xs leading-relaxed">
                ✓ Competitive wages<br />
                ✓ Career growth<br />
                ✓ Full benefits package
              </div>
              <div className="flex justify-center mt-2">
                <div className="bg-[#0B0D10] text-white font-bold px-6 py-2 rounded-lg text-sm">
                  View Positions
                </div>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-white/60">
              <span>Clean layout</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Brand-aligned colors</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Readable hierarchy</span>
              <span className="text-emerald-400">✓</span>
            </div>
          </div>

          {/* Predicted CTR */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-1">Predicted CTR</div>
            <div className="text-2xl font-bold text-emerald-400">7.5%</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
          Generate More
        </button>
        <button className="rounded-lg bg-[#DFFF00] px-4 py-2 text-sm font-bold text-[#0B0D10] hover:bg-[#DFFF00]/90 transition-colors">
          Export Both
        </button>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 rounded-full bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
        A/B READY
      </div>
    </div>
  );
}
