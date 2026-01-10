"use client";

import * as React from "react";
import { TiltedFrame, SnifferMock, CreativeStudioMock, ArticleFactoryMock } from "@/components/landing/Mockups";
import { cn } from "@/lib/utils";

type Step = {
  key: "sniffer" | "creative" | "article";
  title: string;
  desc: string;
  render: () => React.ReactNode;
};

const STEPS: Step[] = [
  {
    key: "sniffer",
    title: "1) Find opportunities",
    desc: "Spot rising demand in a country, then estimate whether it’s worth testing.",
    render: () => <SnifferMock />,
  },
  {
    key: "creative",
    title: "2) Generate ads",
    desc: "Create 2 variations fast (A/B) or batch-generate 5–20 options.",
    render: () => <CreativeStudioMock />,
  },
  {
    key: "article",
    title: "3) Build the article",
    desc: "Turn the topic into a layout that’s optimized for ad yield and readability.",
    render: () => <ArticleFactoryMock />,
  },
];

export function ProductInMotion() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const t = window.setInterval(() => setActive((v) => (v + 1) % STEPS.length), 5000);
    return () => window.clearInterval(t);
  }, []);

  const step = STEPS[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5">
        <div className="text-sm font-semibold text-white">Product in motion</div>
        <div className="text-sm text-white/70 mt-1 leading-relaxed">
          A quick walk-through of the workflow. It cycles automatically every few seconds.
        </div>

        <div className="mt-6 space-y-3">
          {STEPS.map((s, idx) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "w-full text-left rounded-2xl border px-4 py-3 transition-colors",
                idx === active
                  ? "border-[#DFFF00]/40 bg-[#2B2F36]/60"
                  : "border-white/10 bg-[#2B2F36]/30 hover:bg-[#2B2F36]/45"
              )}
            >
              <div className="text-sm font-semibold text-white">{s.title}</div>
              <div className="text-sm text-white/70 mt-1 leading-relaxed">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7">
        <TiltedFrame className="overflow-hidden">
          <div className="transition-opacity duration-300">{step.render()}</div>
        </TiltedFrame>
        <div className="mt-3 text-xs text-white/50">
          Tip: replace these with real screenshots/video later — the layout already supports tilt + glow.
        </div>
      </div>
    </div>
  );
}

