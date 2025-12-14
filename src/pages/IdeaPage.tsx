import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIdeaById } from '@/lib/ideas';
import { useApp } from '@/context/AppContext';
import { RunButton } from '@/components/RunButton';
import { CanvasViewer } from '@/components/CanvasViewer';
import { CSVUploader } from '@/components/CSVUploader';
import { IdeaResultDisplay } from '@/components/IdeaResultDisplay';
import { CategoryIcon } from '@/components/CategoryIcon';
import { SolarAnalysisResult } from '@/lib/types';
import { 
  Sun, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  ChevronRight, 
  Info,
  AlertTriangle,
  Sliders,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const IdeaPage = () => {
  const { id } = useParams<{ id: string }>();
  const ideaId = parseInt(id || '1');
  const idea = getIdeaById(ideaId);
  const { uploadedImage, uploadedCSV, setUploadedCSV } = useApp();
  const [result, setResult] = useState<Partial<SolarAnalysisResult> | null>(null);
  const [sunAngle, setSunAngle] = useState(45);
  const [showOverlays, setShowOverlays] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    inputs: true,
    workflow: false,
    failures: false,
  });

  if (!idea) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Sun className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Idea not found</p>
        </div>
      </div>
    );
  }

  const hasImage = !!uploadedImage;
  const hasCSV = !!uploadedCSV;
  const canRun = hasImage || hasCSV;

  // Determine which inputs this idea uses
  const usesImage = idea.inputs.some(i => 
    i.toLowerCase().includes('image') || 
    i.toLowerCase().includes('rgb') ||
    i.toLowerCase().includes('multispectral')
  );
  const usesCSV = idea.inputs.some(i => 
    i.toLowerCase().includes('csv') || 
    i.toLowerCase().includes('data') ||
    i.toLowerCase().includes('metadata') ||
    i.toLowerCase().includes('record')
  );

  // Show additional controls based on idea
  const showsSunAngle = idea.id === 4 || idea.id === 23 || idea.inputs.some(i => i.toLowerCase().includes('sun'));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 border",
        `category-${idea.category}`
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative flex items-start gap-4">
          <CategoryIcon category={idea.category} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <span className="px-2 py-0.5 rounded-full bg-muted">{idea.category}</span>
              <span>•</span>
              <span>Idea #{idea.id}</span>
            </div>
            <h1 id={`idea-title-${ideaId}`} className="text-2xl font-bold text-foreground">
              {idea.name}
            </h1>
            <p className="text-muted-foreground mt-1">{idea.purpose}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Inputs & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Data Inputs */}
          <div className="card-solar p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Analysis Inputs
            </h3>
            
            <div className="space-y-4">
              {/* Image Status */}
              {usesImage && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  hasImage ? "bg-success/10 border border-success/30" : "bg-muted/50 border border-border"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    hasImage ? "bg-success/20" : "bg-muted"
                  )}>
                    <ImageIcon className={cn("w-5 h-5", hasImage ? "text-success" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm", hasImage ? "text-success" : "text-muted-foreground")}>
                      {hasImage ? uploadedImage.file.name : 'No image uploaded'}
                    </p>
                    {hasImage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {uploadedImage.width}×{uploadedImage.height}px
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CSV Upload/Status */}
              {usesCSV && (
                <div>
                  {hasCSV ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/20">
                        <FileSpreadsheet className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-secondary">{uploadedCSV.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedCSV.data.length} rows
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setUploadedCSV(null)}
                        className="text-muted-foreground"
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <CSVUploader 
                      onUpload={setUploadedCSV} 
                      uploadedCSV={uploadedCSV}
                    />
                  )}
                </div>
              )}

              {/* Sun Angle Control */}
              {showsSunAngle && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Sun Angle</Label>
                    <span className="text-sm font-mono text-primary">{sunAngle}°</span>
                  </div>
                  <Slider
                    id="input-sun-angle"
                    value={[sunAngle]}
                    onValueChange={([v]) => setSunAngle(v)}
                    min={0}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Overlay Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <Label className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Show Overlays
                </Label>
                <Switch
                  id="toggle-save-artifacts"
                  checked={showOverlays}
                  onCheckedChange={setShowOverlays}
                />
              </div>
            </div>

            <RunButton
              ideaId={ideaId}
              onComplete={setResult}
              className="w-full mt-4"
              options={{ sunAngle }}
              disabled={!canRun}
            />
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-2">
            {/* Inputs & Outputs */}
            <Collapsible 
              open={expandedSections.inputs} 
              onOpenChange={(o) => setExpandedSections(s => ({...s, inputs: o}))}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Inputs & Outputs
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.inputs && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Inputs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.inputs.map((input, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Outputs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.outputs.map((output, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary font-mono">
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Workflow Steps */}
            <Collapsible 
              open={expandedSections.workflow} 
              onOpenChange={(o) => setExpandedSections(s => ({...s, workflow: o}))}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-secondary" />
                  Workflow Steps
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.workflow && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <ol className="space-y-2">
                    {idea.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Failure Modes */}
            <Collapsible 
              open={expandedSections.failures} 
              onOpenChange={(o) => setExpandedSections(s => ({...s, failures: o}))}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Failure Modes
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.failures && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <ul className="space-y-2">
                    {idea.failureModes.map((mode, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                        {mode}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Right Column - Visualization & Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Canvas Viewer */}
          <div className="card-solar p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Visualization
            </h3>
            <div id={`canvas-idea-${ideaId}`}>
              <CanvasViewer
                maskDataUrl={showOverlays ? result?.artifacts?.mask_data_url : undefined}
                gradcamDataUrl={showOverlays ? result?.artifacts?.gradcam_data_url : undefined}
                overlayDataUrl={showOverlays ? result?.artifacts?.overlay_data_url : undefined}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div id={`result-idea-${ideaId}`} className="card-solar p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" />
              Analysis Results
            </h3>
            <IdeaResultDisplay 
              ideaId={ideaId}
              idea={idea}
              result={result}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaPage;
