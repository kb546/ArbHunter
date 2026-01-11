"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { OnboardingState } from "@/app/api/onboarding/route";
import { toast } from "sonner";

type TourStep = {
  id: string;
  path: string;
  match?: 'exact' | 'prefix';
  selector?: string; // optional: if missing/unavailable, we show a generic step
  title: string;
  body: string;
};

const STEPS: TourStep[] = [
  {
    id: "dash_welcome",
    path: "/dashboard",
    selector: "[data-tour='onboarding-checklist']",
    title: "Welcome to ArbHunter",
    body: "This quick tour shows you the workflow: discover → generate → save → export. You can skip anytime.",
  },
  {
    id: "dash_discovery",
    path: "/dashboard",
    selector: "[data-tour='dash-card-discovery']",
    title: "Start with Discovery",
    body: "Discovery finds GEO + niche combos worth testing. You’ll use these to generate creatives and build campaigns.",
  },
  {
    id: "discovery_geo",
    path: "/discovery",
    selector: "[data-tour='discovery-geo']",
    title: "Pick your market (GEO)",
    body: "Choose a country (or Worldwide). Start with Tier 1 markets when you want quality CPM and cleaner tests.",
  },
  {
    id: "discovery_niche",
    path: "/discovery",
    selector: "[data-tour='discovery-niche']",
    title: "Enter a niche",
    body: "Use high-intent topics like jobs, benefits, credit cards, free samples, delivery gigs, and scholarships.",
  },
  {
    id: "discovery_run",
    path: "/discovery",
    selector: "[data-tour='discovery-run']",
    title: "Run discovery",
    body: "Click Run Discovery to score the opportunity. Then open the result to create a campaign.",
  },
  {
    id: "cs_niche",
    path: "/creative-studio",
    selector: "[data-tour='cs-form']",
    title: "Creative Studio inputs",
    body: "Set your niche and market. We auto-detect brand + style (no logo upload).",
  },
  {
    id: "cs_generate",
    path: "/creative-studio",
    selector: "[data-tour='cs-generate']",
    title: "Generate 2 variations",
    body: "Quick mode always generates 2 variations for A/B testing. Use Pro for the cleanest, most on-brand images.",
  },
  {
    id: "nav_campaigns",
    path: "/campaigns",
    selector: "[data-tour='campaigns-header']",
    title: "Save + export in Campaigns",
    body: "Campaigns is where everything lives: variations, winners, tags, and copy exports.",
  },
  {
    id: "campaign_export",
    path: "/campaigns/",
    match: "prefix",
    selector: "[data-tour='campaign-export-copy']",
    title: "Export copy (CSV)",
    body: "Export headlines + primary text to hand off to your media buying workflow.",
  },
  {
    id: "finish",
    path: "/campaigns",
    title: "You’re ready",
    body: "Run a discovery, generate creatives, then save and export. If anything feels confusing, restart the tour from Settings.",
  },
];

function findStepIndexById(id: string | null | undefined) {
  if (!id) return 0;
  const idx = STEPS.findIndex((s) => s.id === id);
  return idx >= 0 ? idx : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function fetchState(): Promise<OnboardingState | null> {
  const res = await fetch("/api/onboarding", { cache: "no-store" });
  const data = await res.json();
  return res.ok ? (data.state as OnboardingState) : null;
}

async function patchState(patch: Partial<OnboardingState>) {
  await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => {});
}

function getRect(selector?: string): DOMRect | null {
  if (!selector) return null;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (!rect || rect.width <= 1 || rect.height <= 1) return null;
  return rect;
}

function inViewport(r: DOMRect) {
  return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
}

export function OnboardingTour() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [state, setState] = React.useState<OnboardingState | null>(null);
  const [active, setActive] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [autoSkipNote, setAutoSkipNote] = React.useState<string | null>(null);
  const attemptsRef = React.useRef<Record<string, number>>({});
  const rafRef = React.useRef<number | null>(null);

  // Load state
  React.useEffect(() => {
    (async () => {
      const s = await fetchState();
      setState(s);
      const isActive = Boolean(s?.tour?.active) && !Boolean(s?.tour?.completed);
      setActive(isActive);
      setStepIndex(findStepIndexById(s?.tour?.currentStepId));
    })();
  }, []);

  const step = STEPS[clamp(stepIndex, 0, STEPS.length - 1)];

  // Keep the tour aligned with the current page/selector.
  React.useEffect(() => {
    if (!active) return;
    if (!step) return;

    const matchMode = step.match || 'exact';
    const pathMatches = matchMode === 'prefix' ? pathname.startsWith(step.path) : pathname === step.path;

    if (!pathMatches) {
      router.push(step.path === '/campaigns/' ? '/campaigns' : step.path);
      return;
    }

    // Wait briefly for page to render, then compute rect.
    const t = window.setTimeout(() => {
      const r = getRect(step.selector);
      setRect(r);
      if (r) {
        setAutoSkipNote(null);
        attemptsRef.current[step.id] = 0;
        // Only scroll the target into view if it isn't already visible.
        if (!inViewport(r)) {
          const el = step.selector ? (document.querySelector(step.selector) as HTMLElement | null) : null;
          el?.scrollIntoView?.({ block: "center", behavior: "auto" });
        }
      } else if (step.selector) {
        // Step target isn't present (e.g. empty state / user hasn't created data yet).
        // Try a couple times, then skip to keep the tour flowing.
        const nextAttempts = (attemptsRef.current[step.id] || 0) + 1;
        attemptsRef.current[step.id] = nextAttempts;
        if (nextAttempts >= 2) {
          setAutoSkipNote("Skipping this step — nothing to highlight yet.");
          // Auto-advance after a short pause.
          window.setTimeout(() => {
            if (attemptsRef.current[step.id] >= 2) go(stepIndex + 1);
          }, 900);
        }
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [active, pathname, stepIndex]);

  // Keep spotlight aligned while user scrolls/resizes (prevents the “electric lime moving” issue).
  React.useEffect(() => {
    if (!active) return;
    if (!step?.selector) return;

    const update = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = getRect(step.selector);
        setRect(r);
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, step?.id]);

  async function start() {
    setActive(true);
    setStepIndex(0);
    await patchState({ tour: { active: true, completed: false, currentStepId: STEPS[0].id } });
    setState((s) => (s ? { ...s, tour: { ...(s.tour || {}), active: true, completed: false, currentStepId: STEPS[0].id } } : s));
    router.push(STEPS[0].path);
  }

  async function stop(markCompleted: boolean) {
    setActive(false);
    setRect(null);
    if (markCompleted) {
      await patchState({
        dismissed: true,
        checklist: {
          run_discovery: { done: true, doneAt: new Date().toISOString() },
          generate_creatives: { done: true, doneAt: new Date().toISOString() },
          save_campaign: { done: true, doneAt: new Date().toISOString() },
          export_copy: { done: true, doneAt: new Date().toISOString() },
          open_campaigns: { done: true, doneAt: new Date().toISOString() },
        },
        tour: {
          active: false,
          completed: true,
          currentStepId: null,
          completedAt: new Date().toISOString(),
        },
      });
      toast.success("Onboarding complete", {
        description: "You can restart the tour anytime from Settings.",
      });
      return;
    }

    await patchState({
      tour: {
        active: false,
        completed: state?.tour?.completed,
        currentStepId: state?.tour?.currentStepId ?? null,
      },
    });
  }

  async function go(nextIdx: number) {
    const idx = clamp(nextIdx, 0, STEPS.length - 1);
    const next = STEPS[idx];
    setStepIndex(idx);
    await patchState({ tour: { active: true, completed: false, currentStepId: next.id } });
    const matchMode = next.match || 'exact';
    const pathMatches = matchMode === 'prefix' ? pathname.startsWith(next.path) : pathname === next.path;
    if (!pathMatches) router.push(next.path === '/campaigns/' ? '/campaigns' : next.path);
  }

  // Floating entry point
  const showFloating = pathname.startsWith("/dashboard") || pathname.startsWith("/discovery") || pathname.startsWith("/creative-studio") || pathname.startsWith("/campaigns");

  return (
    <>
      {showFloating && !active ? (
        <div className="fixed bottom-6 right-6 z-[60]">
          <Button onClick={start} className="shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Guided tour
          </Button>
        </div>
      ) : null}

      {active ? (
        <>
          {/* Non-blocking dim layer */}
          <div className="fixed inset-0 z-[70] bg-black/40 pointer-events-none" />

          {/* Spotlight outline */}
          {rect ? (
            <div
              className="fixed z-[71] pointer-events-none rounded-xl ring-2 ring-[color:var(--primary)] shadow-[0_0_0_6px_rgba(223,255,0,0.08)]"
              style={{
                left: Math.max(8, rect.left - 6),
                top: Math.max(8, rect.top - 6),
                width: rect.width + 12,
                height: rect.height + 12,
              }}
            />
          ) : null}

          {/* Tour card */}
          <div className="fixed bottom-6 right-6 z-[80] w-[min(420px,calc(100vw-1.5rem))]">
            <Card className="p-4 border border-border bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{step?.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{step?.body}</div>
                  {autoSkipNote ? (
                    <div className="text-xs text-muted-foreground mt-2">{autoSkipNote}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => stop(false)}
                  aria-label="Close tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline">
                  Step {stepIndex + 1} / {STEPS.length}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => go(stepIndex - 1)} disabled={stepIndex === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  {stepIndex === STEPS.length - 1 ? (
                    <Button size="sm" onClick={() => stop(true)}>
                      Finish
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => go(stepIndex + 1)}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}

