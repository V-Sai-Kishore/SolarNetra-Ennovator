import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  showHome?: boolean;
}

export function BackButton({ className, showHome = true }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = location.key !== 'default';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => canGoBack ? navigate(-1) : navigate('/dashboard')}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>
      
      {showHome && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground"
        >
          <Home className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
