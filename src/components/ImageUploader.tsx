import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, FileImage } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  compact?: boolean;
  className?: string;
}

export function ImageUploader({ compact = false, className }: ImageUploaderProps) {
  const { uploadedImage, uploadFile } = useApp();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await uploadFile(acceptedFiles[0]);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.webp'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  if (uploadedImage && compact) {
    return (
      <div
        id="img-uploader"
        className={cn(
          "card-elevated p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors",
          className
        )}
        {...getRootProps()}
        role="button"
        aria-label="Upload a new image"
        tabIndex={0}
      >
        <input {...getInputProps()} aria-label="File input" />
        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
          <img
            src={uploadedImage.dataUrl}
            alt="Uploaded satellite image preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{uploadedImage.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {uploadedImage.width}×{uploadedImage.height} • {(uploadedImage.file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <FileImage className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      id="img-uploader"
      className={cn(
        "card-elevated p-6 transition-all duration-200",
        isDragActive && "border-primary border-2 bg-primary/5",
        className
      )}
      {...getRootProps()}
      role="button"
      aria-label="Drag and drop or click to upload an image"
      tabIndex={0}
    >
      <input {...getInputProps()} aria-label="File input" />
      
      {uploadedImage ? (
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-canvas-bg">
            <img
              src={uploadedImage.dataUrl}
              alt="Uploaded satellite image preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="font-medium">{uploadedImage.file.name}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-mono text-xs">
              <span>{uploadedImage.width}×{uploadedImage.height}</span>
              <span>{(uploadedImage.file.size / 1024).toFixed(1)} KB</span>
              <span>Seed: {uploadedImage.seed.toString(16).slice(0, 8)}</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragActive ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">{strings.upload.dragDrop}</p>
            <p className="text-sm text-muted-foreground">
              {strings.upload.or} <span className="text-primary font-medium">{strings.upload.browse}</span>
            </p>
          </div>
          <div className="text-center text-xs text-muted-foreground space-y-0.5">
            <p>{strings.upload.supported}</p>
            <p>{strings.upload.maxSize}</p>
          </div>
        </div>
      )}
    </div>
  );
}
