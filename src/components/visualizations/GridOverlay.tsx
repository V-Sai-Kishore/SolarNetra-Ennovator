import React from 'react';
import { cn } from '@/lib/utils';

interface GridOverlayProps {
  rows: number;
  cols: number;
  highlights?: { row: number; col: number; color?: string }[];
  title?: string;
  className?: string;
}

export function GridOverlay({ rows, cols, highlights = [], title, className }: GridOverlayProps) {
  const isHighlighted = (r: number, c: number) => {
    return highlights.find(h => h.row === r && h.col === c);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      )}
      <div 
        className="grid gap-1 p-4 rounded-xl bg-muted/30 border border-border"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          aspectRatio: `${cols}/${rows}`
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const highlight = isHighlighted(row, col);
          
          return (
            <div
              key={i}
              className={cn(
                "rounded-md transition-all",
                highlight 
                  ? "bg-solar-gold shadow-lg shadow-solar-gold/30" 
                  : "bg-muted/50 hover:bg-muted"
              )}
              style={{
                backgroundColor: highlight?.color,
              }}
            />
          );
        })}
      </div>
      {highlights.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {highlights.length} panel{highlights.length !== 1 ? 's' : ''} detected
        </p>
      )}
    </div>
  );
}
