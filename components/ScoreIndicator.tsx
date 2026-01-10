'use client';

import { Badge } from '@/components/ui/badge';

interface ScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreIndicator({ score, size = 'md', showLabel = true }: ScoreIndicatorProps) {
  const getScoreColor = (score: number): string => {
    // Acid Predator: use Electric Lime for strong/positive signals
    if (score >= 80) return 'bg-primary text-primary-foreground';
    if (score >= 60) return 'bg-primary/85 text-primary-foreground';
    if (score >= 40) return 'bg-amber-500 text-black';
    if (score >= 20) return 'bg-orange-500 text-white';
    return 'bg-destructive text-destructive-foreground';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const sizeClasses = {
    sm: 'text-xs h-6',
    md: 'text-sm h-8',
    lg: 'text-base h-10',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Score Number */}
      <div
        className={`flex items-center justify-center font-bold rounded-md px-3 ${sizeClasses[size]} ${getScoreColor(score)}`}
      >
        {score}
      </div>

      {/* Score Label */}
      {showLabel && (
        <Badge variant={getScoreVariant(score)} className={sizeClasses[size]}>
          {getScoreLabel(score)}
        </Badge>
      )}
    </div>
  );
}


