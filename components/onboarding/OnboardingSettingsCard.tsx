"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Sparkles, Eye } from "lucide-react";

export function OnboardingSettingsCard() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function post(body: any) {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function restartTour() {
    setBusy(true);
    try {
      await post({ tour: { active: true, completed: false, currentStepId: "dash_welcome" } });
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function resetChecklist() {
    setBusy(true);
    try {
      await post({
        dismissed: false,
        checklist: {
          run_discovery: { done: false },
          generate_creatives: { done: false },
          save_campaign: { done: false },
          export_copy: { done: false },
          open_campaigns: { done: false },
        },
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function showChecklistAgain() {
    setBusy(true);
    try {
      await post({ dismissed: false });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            Onboarding
            <Badge variant="outline" className="bg-transparent">Help</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Restart the guided tour or reset the getting-started checklist.
          </div>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-2">
          <Button onClick={restartTour} disabled={busy}>
            <Sparkles className="h-4 w-4 mr-2" />
            Restart tour
          </Button>
          <Button variant="outline" onClick={showChecklistAgain} disabled={busy}>
            <Eye className="h-4 w-4 mr-2" />
            Show checklist
          </Button>
          <Button variant="outline" onClick={resetChecklist} disabled={busy}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset checklist
          </Button>
        </div>
      </div>
    </Card>
  );
}

