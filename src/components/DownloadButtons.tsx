import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SolarAnalysisResult } from '@/lib/types';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';

interface DownloadEvidenceProps {
  result: SolarAnalysisResult;
  className?: string;
}

export function DownloadEvidence({ result, className }: DownloadEvidenceProps) {
  const { downloadEvidence } = useApp();
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadEvidence(result);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      id="btn-download-evidence"
      onClick={handleDownload}
      disabled={downloading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
        "bg-accent text-accent-foreground hover:bg-accent/90",
        "focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-label="Download evidence bundle as ZIP"
      aria-busy={downloading}
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{downloading ? 'Preparing...' : strings.actions.downloadEvidence}</span>
    </button>
  );
}

interface DownloadJsonProps {
  result: SolarAnalysisResult;
  className?: string;
}

export function DownloadJson({ result, className }: DownloadJsonProps) {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      id="btn-download-json"
      onClick={handleDownload}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "focus-ring",
        className
      )}
      aria-label="Download analysis JSON"
    >
      <Download className="w-4 h-4" />
      <span>{strings.actions.downloadJson}</span>
    </button>
  );
}
