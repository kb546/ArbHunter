"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

import type { OnboardingState, OnboardingChecklistKey } from "@/app/api/onboarding/route";

type StepDef = {
  key: OnboardingChecklistKey;
  title: string;
  description: string;
  href: string;
};

const STEPS: StepDef[] = [
  {
    key: "run_discovery",
    title: "Run your first discovery",
    description: "Pick a GEO + topic and generate your first opportunity.",
    href: "/discovery",
  },
  {
    key: "generate_creatives",
    title: "Generate 2 creatives",
    description: "Use Creative Studio to make an A/B pair.",
    href: "/creative-studio",
  },
  {
    key: "save_campaign",
    title: "Save a campaign",
    description: "Create a campaign so your work is saved and organized.",
    href: "/discovery",
  },
  {
    key: "export_copy",
    title: "Export copy (CSV)",
    description: "Export headlines + primary text from a campaign.",
    href: "/campaigns",
  },
];

function isDone(state: OnboardingState | null, key: OnboardingChecklistKey) {
  return Boolean(state?.checklist?.[key]?.done);
}

export function OnboardingChecklistCard() {
  const [state, setState] = React.useState<OnboardingState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [dismissed, setDismissed] = React.useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setState(data.state);
        setDismissed(Boolean(data.state?.dismissed));
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const doneCount = STEPS.reduce((sum, s) => sum + (isDone(state, s.key) ? 1 : 0), 0);
  const pct = Math.round((doneCount / STEPS.length) * 100);

  async function startTour() {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour: { active: true, completed: false, currentStepId: "dash_welcome" },
      }),
    });
    const data = await res.json();
    if (res.ok) setState(data.state);
  }

  async function dismiss() {
    setDismissed(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed: true }),
    });
  }

  if (loading) {
    return (
      <Card className="p-5" data-tour="onboarding-checklist">
        <div className="text-sm text-muted-foreground">Loading onboarding…</div>
      </Card>
    );
  }

  if (dismissed) return null;

  return (
    <Card className="p-5" data-tour="onboarding-checklist">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-foreground">Getting started</div>
            <Badge variant="outline">{doneCount}/{STEPS.length}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Finish these quick steps to get your first profitable test live.
          </div>
        </div>
        <div className="shrink-0 flex gap-2">
          <Button variant="outline" onClick={startTour}>
            <Sparkles className="h-4 w-4 mr-2" />
            Start guided tour
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={pct} />
        <div className="mt-2 text-xs text-muted-foreground">{pct}% complete</div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {STEPS.map((s) => {
          const done = isDone(state, s.key);
          const Icon = done ? CheckCircle2 : Circle;
          return (
            <div key={s.key} className="rounded-lg border bg-card p-4 flex items-start gap-3">
              <Icon className={done ? "h-5 w-5 text-emerald-500" : "h-5 w-5 text-muted-foreground"} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">{s.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.description}</div>
                <div className="mt-3">
                  <Button asChild size="sm" variant={done ? "outline" : "default"}>
                    <Link href={s.href}>{done ? "Review" : "Go"}</Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

