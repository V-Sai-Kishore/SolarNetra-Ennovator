import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';

interface RunButtonProps {
  ideaId?: number;
  onComplete?: (result: any) => void;
  className?: string;
  variant?: 'default' | 'compact';
  options?: { sunAngle?: number };
  disabled?: boolean;
}

export function RunButton({ ideaId, onComplete, className, variant = 'default', options, disabled }: RunButtonProps) {
  const { uploadedImage, uploadedCSV, isRunning, runIdea } = useApp();
  const [localRunning, setLocalRunning] = useState(false);

  const handleRun = async () => {
    if ((!uploadedImage && !uploadedCSV) || !ideaId) return;
    
    setLocalRunning(true);
    try {
      const result = await runIdea(ideaId, options);
      onComplete?.(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLocalRunning(false);
    }
  };

  const isDisabled = disabled || (!uploadedImage && !uploadedCSV) || isRunning || localRunning;
  const showLoading = localRunning;

  if (variant === 'compact') {
    return (
      <button
        id={ideaId ? `btn-run-idea-${ideaId}` : 'btn-run'}
        onClick={handleRun}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={`Run analysis for idea ${ideaId}`}
        aria-busy={showLoading}
      >
        {showLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span>{showLoading ? 'Running...' : 'Run'}</span>
      </button>
    );
  }

  return (
    <button
      id={ideaId ? `btn-run-idea-${ideaId}` : 'btn-run'}
      onClick={handleRun}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all",
        "btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
        "shadow-lg hover:shadow-glow",
        className
      )}
      aria-label={`Run analysis${ideaId ? ` for idea ${ideaId}` : ''}`}
      aria-busy={showLoading}
    >
      {showLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Play className="w-5 h-5" />
      )}
      <span>{showLoading ? strings.status.running : strings.actions.run}</span>
    </button>
  );
}
