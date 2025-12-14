import React from 'react';
import { SolarAnalysisResult, IdeaConfig } from '@/lib/types';
import { ResultMetric } from './ResultMetric';
import { HeatmapViz } from './visualizations/HeatmapViz';
import { ScoreChart } from './visualizations/ScoreChart';
import { DataTableViz } from './visualizations/DataTableViz';
import { 
  CheckCircle, XCircle, AlertCircle, Zap, Sun, Grid3X3, 
  ThermometerSun, Calendar, Users, AlertTriangle, FileCheck,
  Eye, Cable, Radio, Building, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdeaResultDisplayProps {
  ideaId: number;
  idea: IdeaConfig;
  result: Partial<SolarAnalysisResult> | null;
  className?: string;
}

export const IdeaResultDisplay: React.FC<IdeaResultDisplayProps> = ({
  ideaId,
  idea,
  result,
  className,
}) => {
  if (!result) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Run analysis to see results</p>
      </div>
    );
  }

  // Check if result has any meaningful data
  const hasData = Object.keys(result).some(key => {
    const value = result[key as keyof typeof result];
    return value !== undefined && value !== null && 
           !(Array.isArray(value) && value.length === 0) &&
           !(typeof value === 'object' && Object.keys(value).length === 0);
  });

  if (!hasData) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No data available for this analysis</p>
      </div>
    );
  }

  // Render different layouts based on idea category and outputs
  const renderByCategory = () => {
    switch (idea.category) {
      case 'detection':
        return renderDetectionResult();
      case 'segmentation':
        return renderSegmentationResult();
      case 'quality':
        return renderQualityResult();
      case 'validation':
        return renderValidationResult();
      case 'scoring':
        return renderScoringResult();
      case 'metadata':
        return renderMetadataResult();
      default:
        return renderGenericResult();
    }
  };

  const renderDetectionResult = () => (
    <div className="space-y-4">
      {result.has_solar !== undefined && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl",
          result.has_solar ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
        )}>
          {result.has_solar ? (
            <Zap className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <p className={cn("font-bold text-lg", result.has_solar ? "text-success" : "text-destructive")}>
              {result.has_solar ? 'Detection Confirmed' : 'Not Detected'}
            </p>
            {result.confidence !== undefined && (
              <p className="text-sm text-muted-foreground">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      )}
      
      {result.confidence !== undefined && result.has_solar === undefined && (
        <ResultMetric
          label="Detection Confidence"
          value={(result.confidence * 100).toFixed(0)}
          unit="%"
          variant={result.confidence > 0.7 ? 'success' : 'warning'}
          size="lg"
        />
      )}
      
      {result.micro_flags?.wiring !== undefined && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg",
          result.micro_flags.wiring ? "bg-success/10 border border-success/30" : "bg-muted/50"
        )}>
          <Cable className="w-5 h-5" />
          <span className="text-sm">
            Wiring Detected: <strong className={result.micro_flags.wiring ? "text-success" : ""}>{result.micro_flags.wiring ? 'Yes' : 'No'}</strong>
          </span>
        </div>
      )}

      {result.plg_score !== undefined && (
        <ResultMetric
          label="Component Score"
          value={(result.plg_score * 100).toFixed(0)}
          unit="%"
          variant={result.plg_score > 0.7 ? 'success' : 'warning'}
        />
      )}
    </div>
  );

  const renderSegmentationResult = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {result.panel_count !== undefined && (
          <ResultMetric
            label="Panels Detected"
            value={result.panel_count}
            variant="primary"
          />
        )}
        {result.area_sqm !== undefined && (
          <ResultMetric
            label="Total Area"
            value={result.area_sqm.toFixed(1)}
            unit="m²"
            variant="success"
          />
        )}
        {result.capacity_kw !== undefined && (
          <ResultMetric
            label="Est. Capacity"
            value={result.capacity_kw.toFixed(2)}
            unit="kW"
            variant="primary"
          />
        )}
        {result.confidence !== undefined && (
          <ResultMetric
            label="Confidence"
            value={(result.confidence * 100).toFixed(0)}
            unit="%"
            variant={result.confidence > 0.7 ? 'success' : 'warning'}
          />
        )}
      </div>
    </div>
  );

  const renderQualityResult = () => (
    <div className="space-y-4">
      {/* Heatmap for micro flags */}
      {result.micro_flags && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quality Flags</p>
          <HeatmapViz 
            data={result.micro_flags} 
            className="bg-card/50 rounded-lg p-3"
          />
        </div>
      )}
      
      {/* Score metrics */}
      <div className="grid grid-cols-2 gap-3">
        {result.confidence !== undefined && (
          <ResultMetric
            label="Confidence"
            value={(result.confidence * 100).toFixed(0)}
            unit="%"
            variant={result.confidence > 0.7 ? 'success' : 'warning'}
          />
        )}
        {result.freshness_score !== undefined && (
          <ResultMetric
            label="Freshness"
            value={(result.freshness_score * 100).toFixed(0)}
            unit="%"
            variant={result.freshness_score > 0.7 ? 'success' : result.freshness_score > 0.4 ? 'warning' : 'error'}
          />
        )}
        {result.plg_score !== undefined && (
          <ResultMetric
            label="Quality Score"
            value={(result.plg_score * 100).toFixed(0)}
            unit="%"
            variant={result.plg_score > 0.7 ? 'success' : 'warning'}
          />
        )}
      </div>

      {/* QC Status */}
      {result.qc_status && (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          result.qc_status === 'VERIFIABLE' && "bg-success/10 border border-success/30",
          result.qc_status === 'NOT_VERIFIABLE' && "bg-destructive/10 border border-destructive/30",
          result.qc_status === 'PARTIALLY_VERIFIABLE' && "bg-warning/10 border border-warning/30"
        )}>
          {result.qc_status === 'VERIFIABLE' && <CheckCircle className="w-5 h-5 text-success" />}
          {result.qc_status === 'NOT_VERIFIABLE' && <XCircle className="w-5 h-5 text-destructive" />}
          {result.qc_status === 'PARTIALLY_VERIFIABLE' && <AlertCircle className="w-5 h-5 text-warning" />}
          <span className="font-medium text-sm">{result.qc_status.replace(/_/g, ' ')}</span>
        </div>
      )}

      {result.reason_codes && result.reason_codes.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <p className="text-sm font-medium text-warning mb-2">Issues Found:</p>
          <ul className="text-xs space-y-1">
            {result.reason_codes.map((code, i) => (
              <li key={i} className="text-muted-foreground">• {code.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderValidationResult = () => (
    <div className="space-y-4">
      {/* Validation scores chart */}
      {(result.shadow_match_score !== undefined || result.plg_score !== undefined || result.confidence !== undefined) && (
        <div className="bg-card/50 rounded-lg p-4">
          <ScoreChart 
            data={[
              ...(result.shadow_match_score !== undefined ? [{ name: 'Shadow Match', value: result.shadow_match_score * 100 }] : []),
              ...(result.plg_score !== undefined ? [{ name: 'PLG Score', value: result.plg_score * 100 }] : []),
              ...(result.confidence !== undefined ? [{ name: 'Confidence', value: result.confidence * 100 }] : []),
              ...(result.freshness_score !== undefined ? [{ name: 'Freshness', value: result.freshness_score * 100 }] : []),
            ]}
            type="bar"
          />
        </div>
      )}

      {/* Individual metrics */}
      <div className="grid grid-cols-2 gap-3">
        {result.shadow_match_score !== undefined && (
          <ResultMetric
            label="Shadow Match"
            value={(result.shadow_match_score * 100).toFixed(0)}
            unit="%"
            variant={result.shadow_match_score > 0.7 ? 'success' : 'warning'}
          />
        )}
        
        {result.plg_score !== undefined && (
          <ResultMetric
            label="Validation Score"
            value={(result.plg_score * 100).toFixed(0)}
            unit="%"
            variant={result.plg_score > 0.7 ? 'success' : result.plg_score > 0.5 ? 'warning' : 'error'}
          />
        )}

        {result.has_solar !== undefined && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg col-span-2",
            result.has_solar ? "bg-success/10 border border-success/30" : "bg-muted/50"
          )}>
            {result.has_solar ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm font-medium">
              {result.has_solar ? 'Validation Passed' : 'Validation Failed'}
            </span>
          </div>
        )}
      </div>

      {result.failed_contract_tests && result.failed_contract_tests.length > 0 && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm font-medium text-destructive mb-2">Failed Tests:</p>
          <ul className="text-xs space-y-1">
            {result.failed_contract_tests.map((test, i) => (
              <li key={i} className="text-muted-foreground">• {test.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderScoringResult = () => {
    // Prepare scores for chart
    const chartData: Array<{ name: string; value: number }> = [];
    if (result.confidence !== undefined) chartData.push({ name: 'Confidence', value: result.confidence * 100 });
    if (result.plg_score !== undefined) chartData.push({ name: 'PLG Score', value: result.plg_score * 100 });
    if (result.neighborhood_adoption_prob !== undefined) chartData.push({ name: 'Adoption', value: result.neighborhood_adoption_prob * 100 });
    if (result.shadow_match_score !== undefined) chartData.push({ name: 'Shadow', value: result.shadow_match_score * 100 });
    if (result.freshness_score !== undefined) chartData.push({ name: 'Freshness', value: result.freshness_score * 100 });

    return (
      <div className="space-y-4">
        {/* Score chart */}
        {chartData.length > 0 && (
          <div className="bg-card/50 rounded-lg p-4">
            <ScoreChart data={chartData} type="bar" />
          </div>
        )}

        {/* QC Status - prominent display */}
        {result.qc_status && (
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            result.qc_status === 'VERIFIABLE' && "bg-success/10 border border-success/30",
            result.qc_status === 'NOT_VERIFIABLE' && "bg-destructive/10 border border-destructive/30",
            result.qc_status === 'PARTIALLY_VERIFIABLE' && "bg-warning/10 border border-warning/30"
          )}>
            {result.qc_status === 'VERIFIABLE' && <CheckCircle className="w-6 h-6 text-success" />}
            {result.qc_status === 'NOT_VERIFIABLE' && <XCircle className="w-6 h-6 text-destructive" />}
            {result.qc_status === 'PARTIALLY_VERIFIABLE' && <AlertCircle className="w-6 h-6 text-warning" />}
            <div>
              <p className="font-semibold">{result.qc_status.replace(/_/g, ' ')}</p>
              {result.reason_codes && result.reason_codes.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {result.reason_codes.length} issue(s) found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {result.panel_count !== undefined && (
            <ResultMetric
              label="Panel Count"
              value={result.panel_count}
              variant="primary"
            />
          )}
          {result.area_sqm !== undefined && (
            <ResultMetric
              label="Area"
              value={result.area_sqm.toFixed(1)}
              unit="m²"
              variant="success"
            />
          )}
          {result.capacity_kw !== undefined && (
            <ResultMetric
              label="Capacity"
              value={result.capacity_kw.toFixed(2)}
              unit="kW"
              variant="primary"
            />
          )}
        </div>
      </div>
    );
  };

  const renderMetadataResult = () => (
    <div className="space-y-4">
      {/* Data table for metadata */}
      <DataTableViz 
        data={{
          ...(result.tilt_deg !== undefined && { 'Panel Tilt': `${result.tilt_deg.toFixed(1)}°` }),
          ...(result.age_bucket && { 'Age Estimate': result.age_bucket }),
          ...(result.freshness_score !== undefined && { 'Freshness': `${(result.freshness_score * 100).toFixed(0)}%` }),
          ...(result.confidence !== undefined && { 'Confidence': `${(result.confidence * 100).toFixed(0)}%` }),
          ...(result.panel_count !== undefined && { 'Panel Count': result.panel_count }),
          ...(result.area_sqm !== undefined && { 'Area': `${result.area_sqm.toFixed(1)} m²` }),
        }}
        className="bg-card/50 rounded-lg"
      />

      {/* Visual cards for key metrics */}
      <div className="grid grid-cols-2 gap-3">
        {result.tilt_deg !== undefined && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <ThermometerSun className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Panel Tilt</p>
              <p className="font-mono font-bold">{result.tilt_deg.toFixed(1)}°</p>
            </div>
          </div>
        )}
        
        {result.age_bucket && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <Calendar className="w-5 h-5 text-secondary-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="font-semibold capitalize">{result.age_bucket}</p>
            </div>
          </div>
        )}

        {result.freshness_score !== undefined && (
          <ResultMetric
            label="Freshness"
            value={(result.freshness_score * 100).toFixed(0)}
            unit="%"
            variant={result.freshness_score > 0.6 ? 'success' : 'warning'}
          />
        )}

        {result.has_solar !== undefined && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg",
            result.has_solar ? "bg-success/10 border border-success/30" : "bg-muted/50"
          )}>
            {result.has_solar ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm font-medium">
              {result.has_solar ? 'Detected' : 'Not Found'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenericResult = () => (
    <div className="space-y-3">
      <DataTableViz 
        data={Object.fromEntries(
          Object.entries(result)
            .filter(([key, value]) => {
              if (key === 'artifacts' || key === 'assumptions' || key === 'model_versions') return false;
              if (value === undefined || value === null) return false;
              if (typeof value === 'object') return false;
              return true;
            })
            .map(([key, value]) => {
              let displayValue: string;
              if (typeof value === 'number') {
                displayValue = value < 1 ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);
              } else if (typeof value === 'boolean') {
                displayValue = value ? 'Yes' : 'No';
              } else {
                displayValue = String(value);
              }
              return [key.replace(/_/g, ' '), displayValue];
            })
        )}
        className="bg-card/50 rounded-lg"
      />
    </div>
  );

  return (
    <div className={cn("", className)}>
      {renderByCategory()}
    </div>
  );
};
