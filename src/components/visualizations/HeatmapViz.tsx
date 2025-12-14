import React from 'react';
import { cn } from '@/lib/utils';

interface HeatmapVizProps {
  data: Record<string, boolean | number>;
  title?: string;
  className?: string;
}

export function HeatmapViz({ data, title, className }: HeatmapVizProps) {
  const entries = Object.entries(data);
  
  const getColor = (value: boolean | number) => {
    if (typeof value === 'boolean') {
      return value ? 'bg-warning text-warning-foreground' : 'bg-success/20 text-success';
    }
    // Numeric value (0-100)
    const num = typeof value === 'number' ? value : 0;
    if (num > 70) return 'bg-destructive text-destructive-foreground';
    if (num > 40) return 'bg-warning text-warning-foreground';
    if (num > 10) return 'bg-solar-gold/30 text-foreground';
    return 'bg-success/20 text-success';
  };

  const getIntensity = (value: boolean | number) => {
    if (typeof value === 'boolean') return value ? 0.8 : 0.2;
    return Math.min(value / 100, 1);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className={cn(
              "relative p-3 rounded-xl border transition-all hover:scale-105",
              getColor(value)
            )}
            style={{
              opacity: 0.4 + getIntensity(value) * 0.6,
            }}
          >
            <p className="text-xs font-medium capitalize truncate">
              {key.replace(/_/g, ' ')}
            </p>
            <p className="text-lg font-bold mt-1">
              {typeof value === 'boolean' 
                ? (value ? '⚠️' : '✓')
                : `${value}%`
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
