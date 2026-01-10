import * as React from "react";
import { cn } from "@/lib/utils";

export function TiltedFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/10 bg-[#0B0D10]/60",
        "shadow-[0_0_0_1px_rgba(223,255,0,0.12),0_40px_110px_rgba(0,0,0,0.70)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-60",
        className
      )}
      style={{
        transform: "perspective(1200px) rotateX(8deg) rotateY(-12deg)",
        transformOrigin: "center",
      }}
    >
      {/* tilt-shift edge blur */}
      <div className="pointer-events-none absolute -inset-10 blur-2xl opacity-40 bg-gradient-to-r from-[#DFFF00]/20 via-transparent to-[#DFFF00]/10" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl [background:radial-gradient(circle_at_30%_10%,rgba(223,255,0,0.10),transparent_45%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function SnifferMock() {
  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 rounded-2xl border border-white/10 bg-[#2B2F36]/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 text-[11px] text-white/60">arbhunter.dev</span>
        </div>
        <div className="text-[11px] text-white/50">LIVE</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-white/70">Opportunity Sniffer</div>
        <div className="text-[11px] text-white/50">ZA • DHL jobs</div>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-3">
        <div className="col-span-7 rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-4">
          <div className="text-[11px] text-white/60">Search spike</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-semibold text-white">+200%</div>
            <div className="text-xs text-white/50">last 14 days</div>
          </div>
          <div className="mt-3 h-20 rounded-xl bg-[#0B0D10]/60 border border-white/10 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.10),transparent_55%)]" />
            <div className="absolute inset-0 flex items-end gap-1 p-2">
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 rounded-sm bg-white/15",
                    i > 16 ? "bg-[#DFFF00]/70" : ""
                  )}
                  style={{ height: `${20 + ((i * 13) % 70)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-5 rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-4">
          <div className="text-[11px] text-white/60">Profit gap</div>
          <div className="mt-2 text-2xl font-semibold text-[#DFFF00]">$0.05 → $4.00</div>
          <div className="mt-3 space-y-2">
            <Row label="CPC" value="$0.05" />
            <Row label="RPM" value="$4.00" />
            <Row label="Margin score" value="86" strong />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreativeStudioMock() {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-white/70">Creative Studio</div>
        <div className="text-[11px] text-white/50">QC loop • 2 variations</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {["V1", "V2"].map((v, idx) => (
          <div key={v} className="rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white">{v}</div>
              <div className="text-[11px] text-white/50">QC {idx === 0 ? 82 : 88}</div>
            </div>
            <div className="mt-2 h-24 rounded-xl border border-white/10 bg-[#0B0D10]/60" />
            <div className="mt-2 text-[11px] text-white/60 line-clamp-2">
              Clean layout • brand-aligned colors • readable text
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[11px] text-white/50">Predicted CTR</div>
              <div className="text-sm font-semibold text-[#DFFF00]">{idx === 0 ? "6.8%" : "7.5%"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleFactoryMock() {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-white/70">Article Factory</div>
        <div className="text-[11px] text-white/50">AdSense-ready template</div>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-3">
        <div className="col-span-7 rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-4">
          <div className="text-xs font-semibold text-white">“DHL Jobs in South Africa”</div>
          <div className="mt-2 space-y-2">
            <Line w={90} />
            <Line w={82} />
            <Line w={76} />
            <div className="h-8 rounded-lg border border-white/10 bg-[#0B0D10]/60 flex items-center px-3 text-[11px] text-white/60">
              Ad slot • above the fold
            </div>
            <Line w={88} />
            <Line w={72} />
          </div>
        </div>
        <div className="col-span-5 rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-4">
          <div className="text-[11px] text-white/60">Yield layout</div>
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-white/10 bg-[#0B0D10]/60 p-3">
              <div className="text-[11px] text-white/60">Slots</div>
              <div className="text-2xl font-semibold text-white mt-1">3–5</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0B0D10]/60 p-3">
              <div className="text-[11px] text-white/60">Time on page</div>
              <div className="text-2xl font-semibold text-white mt-1">↑</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0B0D10]/60 p-3">
              <div className="text-[11px] text-white/60">CTR</div>
              <div className="text-2xl font-semibold text-[#DFFF00] mt-1">+15%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className={cn("text-white", strong && "text-[#DFFF00] font-semibold")}>{value}</span>
    </div>
  );
}

function Line({ w }: { w: number }) {
  return <div className="h-2 rounded bg-white/10" style={{ width: `${w}%` }} />;
}

