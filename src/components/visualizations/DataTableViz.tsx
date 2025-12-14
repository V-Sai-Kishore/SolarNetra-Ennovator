import React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableVizProps {
  data: Record<string, any>;
  title?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'striped';
}

export function DataTableViz({ data, title, className, variant = 'default' }: DataTableVizProps) {
  const entries = Object.entries(data).filter(
    ([key]) => !['artifacts', 'model_versions', 'assumptions', 'id', 'input_id'].includes(key)
  );

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (value < 1 && value > 0) return `${(value * 100).toFixed(1)}%`;
      return value.toFixed(2);
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getValueColor = (key: string, value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'text-success' : 'text-muted-foreground';
    }
    if (key.includes('score') || key.includes('confidence') || key.includes('prob')) {
      const num = typeof value === 'number' ? value : 0;
      if (num > 0.7) return 'text-success';
      if (num > 0.4) return 'text-warning';
      return 'text-destructive';
    }
    return 'text-foreground';
  };

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      )}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Property</TableHead>
              <TableHead className="font-semibold text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, value], i) => (
              <TableRow 
                key={key} 
                className={cn(
                  variant === 'striped' && i % 2 === 0 && "bg-muted/20",
                  "hover:bg-muted/30 transition-colors"
                )}
              >
                <TableCell className="font-medium capitalize text-muted-foreground">
                  {key.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className={cn("text-right font-mono", getValueColor(key, value))}>
                  {formatValue(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
