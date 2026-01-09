'use client';

/**
 * AGENT ORCHESTRATION DASHBOARD
 * 
 * Real-time progress display showing all 5 AI agents working together
 * Displays stages, agent status, time, and cost
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Clock, DollarSign } from 'lucide-react';

interface AgentOrchestrationDashboardProps {
  isGenerating: boolean;
  currentStage?: number; // 1-4
  agentStatus?: {
    copywriting: 'pending' | 'running' | 'complete';
    creativeDirector: 'pending' | 'running' | 'complete';
    graphicDesigner: 'pending' | 'running' | 'complete';
    promptEngineer: 'pending' | 'running' | 'complete';
    qualityControl: 'pending' | 'running' | 'complete';
  };
  elapsedTime?: number; // seconds
  estimatedCost?: number; // dollars
}

const AGENT_ICONS = {
  copywriting: '🖊️',
  creativeDirector: '🎨',
  graphicDesigner: '🖼️',
  promptEngineer: '🔧',
  qualityControl: '🔍',
};

const AGENT_NAMES = {
  copywriting: 'Copywriting Strategist',
  creativeDirector: 'Creative Director',
  graphicDesigner: 'Graphic Designer',
  promptEngineer: 'Prompt Engineer',
  qualityControl: 'Quality Control',
};

const STAGE_NAMES = {
  1: 'Parallel Agent Analysis',
  2: 'Prompt Synthesis',
  3: 'Image Generation',
  4: 'Quality Control',
};

export function AgentOrchestrationDashboard({
  isGenerating,
  currentStage = 0,
  agentStatus,
  elapsedTime = 0,
  estimatedCost = 0.194,
}: AgentOrchestrationDashboardProps) {
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDisplayTime(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayTime(elapsedTime);
    }
  }, [isGenerating, elapsedTime]);

  if (!isGenerating && currentStage === 0) {
    return null; // Don't show until generation starts
  }

  const overallProgress = Math.min(
    ((currentStage - 1) / 4) * 100 + 
    (currentStage === 4 ? 100 : 0),
    100
  );

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGenerating && <Loader2 className="w-5 h-5 animate-spin text-purple-500" />}
            {!isGenerating && <Check className="w-5 h-5 text-green-500" />}
            <span>
              {isGenerating ? 'Generating...' : 'Generation Complete'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{displayTime.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>${estimatedCost.toFixed(3)}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {currentStage > 0 && currentStage <= 4 ? STAGE_NAMES[currentStage as keyof typeof STAGE_NAMES] : 'Initializing...'}
            </span>
            <span className="text-gray-500">
              Stage {currentStage}/4
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Agents Grid */}
        {currentStage >= 1 && agentStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(agentStatus).map(([agent, status]) => (
              <AgentCard
                key={agent}
                agent={agent as keyof typeof AGENT_ICONS}
                status={status}
              />
            ))}
          </div>
        )}

        {/* Stage Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[1, 2, 3, 4].map((stage) => (
            <div
              key={stage}
              className={`p-3 rounded-lg border ${
                currentStage > stage
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : currentStage === stage
                  ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
              }`}
            >
              <div className="text-xs font-semibold mb-1">Stage {stage}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {STAGE_NAMES[stage as keyof typeof STAGE_NAMES]}
              </div>
              {currentStage > stage && (
                <Check className="w-4 h-4 text-green-500 mx-auto mt-1" />
              )}
              {currentStage === stage && (
                <Loader2 className="w-4 h-4 text-purple-500 animate-spin mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Status Message */}
        {isGenerating && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {currentStage === 1 && 'Analyzing campaign and generating strategy...'}
            {currentStage === 2 && 'Creating optimized DALL-E 3 prompt...'}
            {currentStage === 3 && 'Generating high-quality images...'}
            {currentStage === 4 && 'Running quality checks and CTR prediction...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Agent Card Component
function AgentCard({
  agent,
  status,
}: {
  agent: keyof typeof AGENT_ICONS;
  status: 'pending' | 'running' | 'complete';
}) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        status === 'complete'
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : status === 'running'
          ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 animate-pulse'
          : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{AGENT_ICONS[agent]}</span>
        {status === 'complete' && <Check className="w-4 h-4 text-green-500" />}
        {status === 'running' && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
      </div>
      <div className="text-xs font-semibold mb-1">{AGENT_NAMES[agent]}</div>
      <Badge
        variant={status === 'complete' ? 'default' : status === 'running' ? 'secondary' : 'outline'}
        className="text-xs"
      >
        {status === 'complete' ? 'Done' : status === 'running' ? 'Working' : 'Pending'}
      </Badge>
    </div>
  );
}


