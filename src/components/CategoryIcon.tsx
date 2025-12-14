import React from 'react';
import { 
  Scan, 
  Layers, 
  Shield, 
  CheckCircle2, 
  BarChart3, 
  FileText,
  LucideIcon
} from 'lucide-react';
import { IdeaConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

const iconMap: Record<IdeaConfig['category'], LucideIcon> = {
  detection: Scan,
  segmentation: Layers,
  quality: Shield,
  validation: CheckCircle2,
  scoring: BarChart3,
  metadata: FileText,
};

const colorMap: Record<IdeaConfig['category'], string> = {
  detection: 'bg-primary/20 text-primary',
  segmentation: 'bg-secondary/20 text-secondary',
  quality: 'bg-success/20 text-success',
  validation: 'bg-solar-purple/20 text-solar-purple',
  scoring: 'bg-accent/20 text-accent',
  metadata: 'bg-muted text-muted-foreground',
};

interface CategoryIconProps {
  category: IdeaConfig['category'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 'md',
  className 
}) => {
  const Icon = iconMap[category];
  
  const sizeStyles = {
    sm: 'w-6 h-6 [&>svg]:w-3 [&>svg]:h-3',
    md: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
    lg: 'w-14 h-14 [&>svg]:w-7 [&>svg]:h-7',
  };

  return (
    <div className={cn(
      "rounded-xl flex items-center justify-center",
      colorMap[category],
      sizeStyles[size],
      className
    )}>
      <Icon />
    </div>
  );
};
