import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '@/context/AppContext';
import { Image as ImageIcon, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { seedFromImage } from '@/lib/seed';

interface GlobalUploadBarProps {
  className?: string;
}

export function GlobalUploadBar({ className }: GlobalUploadBarProps) {
  const { uploadedImage, setUploadedImage, uploadedCSV, setUploadedCSV } = useApp();

  // Image dropzone
  const onImageDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = async () => {
        const seed = await seedFromImage(file);
        setUploadedImage({
          file,
          dataUrl,
          width: img.width,
          height: img.height,
          seed,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [setUploadedImage]);

  // CSV dropzone
  const onCSVDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const data = lines.slice(1).map((line) => {
      const values = line.split(',');
      const record: Record<string, string | number> = {};
      headers.forEach((h, i) => {
        const val = values[i]?.trim() || '';
        record[h] = isNaN(Number(val)) ? val : Number(val);
      });
      return record;
    });

    const seed = await seedFromImage(file);
    
    setUploadedCSV({
      file,
      data,
      headers,
      seed,
    });
  }, [setUploadedCSV]);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff'] },
    multiple: false,
    noClick: !!uploadedImage,
  });

  const {
    getRootProps: getCSVRootProps,
    getInputProps: getCSVInputProps,
    isDragActive: isCSVDragActive,
  } = useDropzone({
    onDrop: onCSVDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    noClick: !!uploadedCSV,
  });

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Image Upload */}
      <div
        {...getImageRootProps()}
        className={cn(
          "flex-1 flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-dashed transition-all cursor-pointer",
          isImageDragActive && "border-solar-gold bg-solar-gold/10",
          uploadedImage 
            ? "border-success/50 bg-success/5" 
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <input {...getImageInputProps()} />
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          uploadedImage ? "bg-success/20" : "bg-muted"
        )}>
          {uploadedImage ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploadedImage ? (
            <>
              <p className="text-sm font-medium text-success truncate">{uploadedImage.file.name}</p>
              <p className="text-xs text-muted-foreground">{uploadedImage.width}×{uploadedImage.height}px</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Drop image here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
        </div>
        {uploadedImage && (
          <button
            onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CSV Upload */}
      <div
        {...getCSVRootProps()}
        className={cn(
          "flex-1 flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-dashed transition-all cursor-pointer",
          isCSVDragActive && "border-solar-blue bg-solar-blue/10",
          uploadedCSV 
            ? "border-secondary/50 bg-secondary/5" 
            : "border-border hover:border-secondary/50 hover:bg-secondary/5"
        )}
      >
        <input {...getCSVInputProps()} />
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          uploadedCSV ? "bg-secondary/20" : "bg-muted"
        )}>
          {uploadedCSV ? (
            <CheckCircle className="w-5 h-5 text-secondary" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploadedCSV ? (
            <>
              <p className="text-sm font-medium text-secondary truncate">{uploadedCSV.file.name}</p>
              <p className="text-xs text-muted-foreground">{uploadedCSV.data.length} rows</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Drop CSV here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
        </div>
        {uploadedCSV && (
          <button
            onClick={(e) => { e.stopPropagation(); setUploadedCSV(null); }}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
