import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SolarAnalysisResult } from '@/lib/types';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';

interface SaveLocalProps {
  result: SolarAnalysisResult;
  onSave?: () => void;
  className?: string;
}

export function SaveLocal({ result, onSave, className }: SaveLocalProps) {
  const { saveResult } = useApp();
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      saveResult(result.id, result);
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      id="btn-save-local"
      onClick={handleSave}
      disabled={saving}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
        "bg-success text-success-foreground hover:bg-success/90",
        "focus-ring disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-label="Save analysis to local storage"
      aria-busy={saving}
    >
      {saving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      <span>{saving ? 'Saving...' : strings.actions.save}</span>
    </button>
  );
}
