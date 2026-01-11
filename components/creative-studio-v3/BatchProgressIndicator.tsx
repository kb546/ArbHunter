'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BatchProgressIndicatorProps {
  isGenerating: boolean;
  batchSize: number;
  isComplete?: boolean;
}

type Stage = {
  id: number;
  name: string;
  description: string;
  estimatedTime: number; // seconds
};

const stages: Stage[] = [
  { id: 1, name: 'Strategy Planning', description: 'Planning unique creative strategies', estimatedTime: 5 },
  { id: 2, name: 'Copywriting', description: 'Writing unique ad copy', estimatedTime: 10 },
  { id: 3, name: 'Visual Design', description: 'Designing visual specifications', estimatedTime: 5 },
  { id: 4, name: 'Prompt Engineering', description: 'Optimizing Gemini prompts', estimatedTime: 5 },
  { id: 5, name: 'Image Generation', description: 'Generating images with Gemini', estimatedTime: 30 },
  { id: 6, name: 'Quality Control', description: 'Assessing quality & A/B pairs', estimatedTime: 10 },
];

export function BatchProgressIndicator({ isGenerating, batchSize, isComplete }: BatchProgressIndicatorProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // If we are not generating, we either show a "completed" state or nothing (handled by parent).
    if (!isGenerating) return;

    // Simulate progress through stages
    const totalTime = stages.reduce((sum, stage) => sum + stage.estimatedTime, 0);
    let accumulated = 0;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);

      // Move through stages based on estimated times
      let stageIndex = 0;
      let stageAccumulatedTime = 0;
      for (let i = 0; i < stages.length; i++) {
        stageAccumulatedTime += stages[i].estimatedTime;
        if (elapsedTime < stageAccumulatedTime) {
          stageIndex = i + 1;
          break;
        }
      }
      setCurrentStage(Math.min(stageIndex, stages.length));

      // Update progress bar
      const newProgress = Math.min((elapsedTime / totalTime) * 100, 95); // Cap at 95% until done
      setProgress(newProgress);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, elapsedTime]);

  // Completed snapshot (keeps ticks visible after done)
  if (!isGenerating && isComplete) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="shadow-lg border border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--primary)]" />
              Batch generation complete ({batchSize} ads)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{stage.name}</span>
                      <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-300 font-medium">✓ Done</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overall Progress</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                <div className="h-full bg-[color:var(--primary)] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!isGenerating) return null;

  const estimatedTotal = stages.reduce((sum, stage) => sum + stage.estimatedTime, 0);
  const estimatedRemaining = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-[color:var(--primary)] animate-spin" />
            Generating {batchSize} Unique Ads...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Stages */}
          <div className="space-y-3">
            {stages.map((stage) => {
              const isCompleted = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              const isPending = stage.id > currentStage;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stage.id * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-muted/40 border border-border'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-6 h-6 text-[color:var(--primary)] animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{stage.id}</span>
                      </div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {stage.name}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-[color:var(--primary)] font-medium animate-pulse">
                          In Progress...
                        </span>
                      )}
                      {isCompleted && (
                        <span className="ml-auto text-xs text-green-600 font-medium">✓ Done</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-[color:var(--primary)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Time Info */}
          <div className="flex justify-between items-center text-sm bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time Elapsed:</span>
              <span className="font-semibold text-foreground">{elapsedTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-semibold text-[color:var(--primary)]">~{estimatedRemaining}s</span>
            </div>
          </div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-xs text-muted-foreground italic"
          >
            Each ad is being crafted by 5 specialized AI agents.
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


