"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function num(v: string) {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function ProfitCalculator() {
  const [spend, setSpend] = React.useState("500");
  const [cpc, setCpc] = React.useState("0.05");
  const [rpm, setRpm] = React.useState("4.00");
  const [clickToPageviewRate, setClickToPageviewRate] = React.useState("0.85");

  const spendN = num(spend);
  const cpcN = Math.max(0.0001, num(cpc));
  const rpmN = Math.max(0.0001, num(rpm));
  const c2p = Math.min(1, Math.max(0, num(clickToPageviewRate)));

  const clicks = spendN / cpcN;
  const pageviews = clicks * c2p;
  const revenue = (pageviews / 1000) * rpmN;
  const profit = revenue - spendN;
  const roi = spendN > 0 ? (profit / spendN) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#2B2F36]/60 p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Business impact calculator</div>
          <div className="text-sm text-white/70 mt-1">
            Turn pricing into ROI. Plug in your numbers and see the spread instantly.
          </div>
        </div>
        <Button
          className="hidden sm:inline-flex bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
          type="button"
          onClick={() => {
            setSpend("500");
            setCpc("0.05");
            setRpm("4.00");
            setClickToPageviewRate("0.85");
          }}
        >
          Reset
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-white/60 mb-2">Ad spend (USD)</div>
          <Input
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            className="bg-[#0B0D10]/60 border-white/10 text-white placeholder:text-white/40"
            inputMode="decimal"
          />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-2">CPC (USD)</div>
          <Input
            value={cpc}
            onChange={(e) => setCpc(e.target.value)}
            className="bg-[#0B0D10]/60 border-white/10 text-white placeholder:text-white/40"
            inputMode="decimal"
          />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-2">AdSense RPM (USD)</div>
          <Input
            value={rpm}
            onChange={(e) => setRpm(e.target.value)}
            className="bg-[#0B0D10]/60 border-white/10 text-white placeholder:text-white/40"
            inputMode="decimal"
          />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-2">Click → pageview rate (0–1)</div>
          <Input
            value={clickToPageviewRate}
            onChange={(e) => setClickToPageviewRate(e.target.value)}
            className="bg-[#0B0D10]/60 border-white/10 text-white placeholder:text-white/40"
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0B0D10]/50 p-4">
          <div className="text-xs text-white/60">Clicks</div>
          <div className="text-xl font-semibold text-white mt-1">{Math.round(clicks).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0B0D10]/50 p-4">
          <div className="text-xs text-white/60">Pageviews</div>
          <div className="text-xl font-semibold text-white mt-1">{Math.round(pageviews).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0B0D10]/50 p-4">
          <div className="text-xs text-white/60">Revenue</div>
          <div className="text-xl font-semibold text-white mt-1">${revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0B0D10]/50 p-4">
          <div className="text-xs text-white/60">Net profit</div>
          <div className="text-xl font-semibold mt-1">
            <span className={profit >= 0 ? "text-[#DFFF00]" : "text-red-300"}>
              {profit >= 0 ? "+" : ""}
              ${profit.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-white/60 mt-1">ROI: {roi.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}

