'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BatchProgressIndicatorProps {
  isGenerating: boolean;
  batchSize: number;
}

type Stage = {
  id: number;
  name: string;
  description: string;
  emoji: string;
  estimatedTime: number; // seconds
};

const stages: Stage[] = [
  { id: 1, name: 'Strategy Planning', description: 'Planning unique creative strategies', emoji: '🎯', estimatedTime: 5 },
  { id: 2, name: 'Copywriting', description: 'Writing unique ad copy', emoji: '✍️', estimatedTime: 10 },
  { id: 3, name: 'Visual Design', description: 'Designing visual specifications', emoji: '🎨', estimatedTime: 5 },
  { id: 4, name: 'Prompt Engineering', description: 'Optimizing Gemini prompts', emoji: '🔧', estimatedTime: 5 },
  { id: 5, name: 'Image Generation', description: 'Generating images with Gemini', emoji: '📸', estimatedTime: 30 },
  { id: 6, name: 'Quality Control', description: 'Assessing quality & A/B pairs', emoji: '✅', estimatedTime: 10 },
];

export function BatchProgressIndicator({ isGenerating, batchSize }: BatchProgressIndicatorProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStage(1);
      setElapsedTime(0);
      setProgress(0);
      return;
    }

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

  if (!isGenerating) return null;

  const estimatedTotal = stages.reduce((sum, stage) => sum + stage.estimatedTime, 0);
  const estimatedRemaining = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
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
                      ? 'bg-blue-100 border border-blue-300 shadow-sm'
                      : isCompleted
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-400">{stage.id}</span>
                      </div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stage.emoji}</span>
                      <span
                        className={`font-semibold ${
                          isCurrent ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-600'
                        }`}
                      >
                        {stage.name}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-blue-600 font-medium animate-pulse">
                          In Progress...
                        </span>
                      )}
                      {isCompleted && (
                        <span className="ml-auto text-xs text-green-600 font-medium">✓ Done</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Time Info */}
          <div className="flex justify-between items-center text-sm bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Time Elapsed:</span>
              <span className="font-semibold text-gray-800">{elapsedTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-semibold text-blue-600">~{estimatedRemaining}s</span>
            </div>
          </div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-xs text-gray-500 italic"
          >
            💡 Each ad is being crafted by 5 specialized AI agents
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


