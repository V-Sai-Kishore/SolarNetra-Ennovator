import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResultMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResultMetric: React.FC<ResultMetricProps> = ({
  label,
  value,
  unit,
  trend,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    default: 'from-muted/60 to-muted/30',
    success: 'from-success/20 to-success/5 border-success/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
    error: 'from-destructive/20 to-destructive/5 border-destructive/30',
    primary: 'from-primary/20 to-primary/5 border-primary/30',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    primary: 'text-primary',
  };

  const sizeStyles = {
    sm: { container: 'p-2', value: 'text-lg', label: 'text-[10px]' },
    md: { container: 'p-3', value: 'text-2xl', label: 'text-xs' },
    lg: { container: 'p-4', value: 'text-3xl', label: 'text-sm' },
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        sizeStyles[size].container,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-bold font-mono flex items-baseline gap-1",
            sizeStyles[size].value,
            valueStyles[variant]
          )}>
            <span className="truncate">{value}</span>
            {unit && <span className="text-muted-foreground text-sm font-normal">{unit}</span>}
          </div>
          <p className={cn(
            "text-muted-foreground uppercase tracking-wider mt-0.5 truncate",
            sizeStyles[size].label
          )}>
            {label}
          </p>
        </div>
        
        {trend && (
          <div className={cn(
            "p-1 rounded-md",
            trend === 'up' && "bg-success/20 text-success",
            trend === 'down' && "bg-destructive/20 text-destructive",
            trend === 'neutral' && "bg-muted text-muted-foreground"
          )}>
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>
    </div>
  );
};
