import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ImageUploader } from '@/components/ImageUploader';
import { RunAllButton } from '@/components/RunAllButton';
import { DownloadEvidence, DownloadJson } from '@/components/DownloadButtons';
import { SaveLocal } from '@/components/SaveLocal';
import { SolarAnalysisResult } from '@/lib/types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RunAllPage = () => {
  const { uploadedImage } = useApp();
  const [result, setResult] = useState<SolarAnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div id="runall-panel" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Run All Analyses</h1>
        <p className="text-muted-foreground">Execute all 30 verification ideas and generate a comprehensive report</p>
      </div>

      <ImageUploader compact />

      <RunAllButton onComplete={(r) => { setResult(r); setSaved(false); }} />

      {result && (
        <div className="space-y-4">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Analysis Complete</h2>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                result.qc_status === 'VERIFIABLE' && "status-verifiable",
                result.qc_status === 'NOT_VERIFIABLE' && "status-not-verifiable",
                result.qc_status === 'PARTIALLY_VERIFIABLE' && "status-partial"
              )}>
                {result.qc_status === 'VERIFIABLE' && <CheckCircle className="w-4 h-4" />}
                {result.qc_status === 'NOT_VERIFIABLE' && <XCircle className="w-4 h-4" />}
                {result.qc_status === 'PARTIALLY_VERIFIABLE' && <AlertCircle className="w-4 h-4" />}
                {result.qc_status}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold font-mono">{result.panel_count}</p>
                <p className="text-xs text-muted-foreground">Panels</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold font-mono">{result.area_sqm}</p>
                <p className="text-xs text-muted-foreground">Area (m²)</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold font-mono">{result.capacity_kw}</p>
                <p className="text-xs text-muted-foreground">Capacity (kW)</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold font-mono">{(result.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <SaveLocal result={result} onSave={() => setSaved(true)} />
              <DownloadJson result={result} />
              <DownloadEvidence result={result} />
            </div>
            {saved && <p className="text-sm text-success mt-2">✓ Saved to local storage</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RunAllPage;
