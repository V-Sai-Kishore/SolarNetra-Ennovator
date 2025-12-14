import React from 'react';
import { useApp } from '@/context/AppContext';
import { DownloadEvidence, DownloadJson } from '@/components/DownloadButtons';
import { Trash2, Flag, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResultsPage = () => {
  const { resultsMap, deleteResult, flagResult } = useApp();
  const results = Object.values(resultsMap);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Saved Results</h1>
        <p className="text-muted-foreground">{results.length} saved analyses</p>
      </div>

      <div id="results-list" className="space-y-3">
        {results.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            No saved results yet. Run an analysis and save it to see it here.
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result.id}
              className={cn(
                "card-elevated p-4 flex items-center gap-4",
                result.flagged && "border-warning"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{result.image_source}</p>
                  {result.flagged && (
                    <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">Flagged</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {result.id.slice(0, 8)} • {new Date(result.timestamp_utc).toLocaleDateString()}
                </p>
              </div>

              <div className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                result.qc_status === 'VERIFIABLE' && "status-verifiable",
                result.qc_status === 'NOT_VERIFIABLE' && "status-not-verifiable",
                result.qc_status === 'PARTIALLY_VERIFIABLE' && "status-partial"
              )}>
                {result.qc_status}
              </div>

              <div className="flex items-center gap-1">
                <DownloadJson result={result} className="!px-2 !py-1" />
                <DownloadEvidence result={result} className="!px-2 !py-1" />
                <button
                  onClick={() => flagResult(result.id, !result.flagged)}
                  className="p-2 rounded hover:bg-muted focus-ring"
                  aria-label={result.flagged ? "Remove flag" : "Flag for review"}
                >
                  <Flag className={cn("w-4 h-4", result.flagged ? "text-warning fill-warning" : "text-muted-foreground")} />
                </button>
                <button
                  onClick={() => deleteResult(result.id)}
                  className="p-2 rounded hover:bg-destructive/10 text-destructive focus-ring"
                  aria-label="Delete result"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
