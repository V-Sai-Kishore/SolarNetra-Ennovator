import React, { useState } from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';

interface RunAllButtonProps {
  onComplete?: (result: any) => void;
  className?: string;
}

export function RunAllButton({ onComplete, className }: RunAllButtonProps) {
  const { uploadedImage, isRunning, runProgress, runAll } = useApp();

  const handleRunAll = async () => {
    try {
      const result = await runAll();
      onComplete?.(result);
    } catch (error) {
      console.error('Run all failed:', error);
    }
  };

  const isDisabled = !uploadedImage || isRunning;
  const showProgress = isRunning && runProgress;

  return (
    <div className={cn("space-y-2", className)}>
      <button
        id="btn-runall"
        onClick={handleRunAll}
        disabled={isDisabled}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-base font-semibold transition-all",
          "btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
          "shadow-lg hover:shadow-glow"
        )}
        aria-label="Run all 30 analyses"
        aria-busy={isRunning}
      >
        {isRunning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <PlayCircle className="w-5 h-5" />
        )}
        <span>{isRunning ? strings.status.running : strings.actions.runAll}</span>
      </button>

      {showProgress && (
        <div className="space-y-1" id="runall-progress">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${(runProgress.current / runProgress.total) * 100}%` }}
              role="progressbar"
              aria-valuenow={runProgress.current}
              aria-valuemin={0}
              aria-valuemax={runProgress.total}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground font-mono">
            Idea {runProgress.current} of {runProgress.total}
          </p>
        </div>
      )}
    </div>
  );
}
