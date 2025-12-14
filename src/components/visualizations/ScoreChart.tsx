import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';

interface ScoreChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  type?: 'bar' | 'radar';
  title?: string;
  className?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--solar-gold))',
  'hsl(var(--solar-blue))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--solar-purple))',
];

export function ScoreChart({ data, type = 'bar', title, className }: ScoreChartProps) {
  if (type === 'radar') {
    return (
      <div className={cn("space-y-3", className)}>
        {title && (
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        )}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      )}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
