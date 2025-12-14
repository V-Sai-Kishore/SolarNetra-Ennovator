import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FolderOpen, Zap, BarChart3, Sun, Layers, Shield, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ideasConfig } from '@/lib/ideas';
import { cn } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';

const Dashboard = () => {
  const { uploadedImage, uploadedCSV, resultsMap } = useApp();
  const savedCount = Object.keys(resultsMap).length;

  const categoryGroups = {
    detection: ideasConfig.filter(i => i.category === 'detection'),
    segmentation: ideasConfig.filter(i => i.category === 'segmentation'),
    quality: ideasConfig.filter(i => i.category === 'quality'),
    validation: ideasConfig.filter(i => i.category === 'validation'),
    scoring: ideasConfig.filter(i => i.category === 'scoring'),
    metadata: ideasConfig.filter(i => i.category === 'metadata'),
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    detection: Sun,
    segmentation: Layers,
    quality: Shield,
    validation: CheckCircle,
    scoring: BarChart3,
    metadata: FileSpreadsheet,
  };

  const hasInputs = !!uploadedImage || !!uploadedCSV;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-solar-gold/10 via-solar-orange/5 to-transparent border border-solar-gold/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-solar-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-gold/20 text-solar-gold text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            SolarNetra Platform
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            Solar Analysis Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Upload an image or CSV above to run comprehensive solar panel verification across 30 analysis modules.
          </p>
          
          {/* Input Status */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              uploadedImage 
                ? "bg-success/10 text-success border border-success/30" 
                : "bg-muted/50 text-muted-foreground border border-border"
            )}>
              <Sun className="w-4 h-4" />
              {uploadedImage ? `Image: ${uploadedImage.file.name}` : 'No image uploaded'}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              uploadedCSV 
                ? "bg-secondary/10 text-secondary border border-secondary/30" 
                : "bg-muted/50 text-muted-foreground border border-border"
            )}>
              <FileSpreadsheet className="w-4 h-4" />
              {uploadedCSV ? `CSV: ${uploadedCSV.file.name}` : 'No CSV uploaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/run-all"
          className={cn(
            "group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300",
            hasInputs 
              ? "bg-gradient-to-br from-solar-gold/10 to-solar-orange/5 border-solar-gold/30 hover:border-solar-gold/50 hover:shadow-lg hover:shadow-solar-gold/10" 
              : "bg-card border-border hover:border-primary/30"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-solar-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              hasInputs ? "bg-solar-gold/20" : "bg-muted"
            )}>
              <PlayCircle className={cn("w-7 h-7", hasInputs ? "text-solar-gold" : "text-muted-foreground")} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Run All Analyses</h3>
              <p className="text-muted-foreground">Execute all 30 verification ideas in sequence</p>
            </div>
          </div>
        </Link>

        <Link
          to="/results"
          className="group relative overflow-hidden p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center transition-transform group-hover:scale-110">
              <FolderOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Saved Results</h3>
              <p className="text-muted-foreground">
                {savedCount > 0 ? `${savedCount} saved analyses` : 'No saved analyses yet'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Ideas by Category */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analysis Modules</h2>
        
        <div className="grid gap-6">
          {Object.entries(categoryGroups).map(([category, ideas]) => {
            const CategoryIcon = categoryIcons[category];
            const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `hsl(var(--${colorClass}) / 0.2)` }}
                  >
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold capitalize">{category}</h3>
                  <span className="text-xs text-muted-foreground">({ideas.length})</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {ideas.map((idea) => (
                    <Link
                      key={idea.id}
                      to={`/idea/${idea.id}`}
                      className={cn(
                        "group p-3 rounded-xl border transition-all duration-200",
                        "bg-card hover:bg-muted/50 border-border hover:border-primary/30",
                        "hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-mono font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {idea.id}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{idea.shortName}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
