import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { OverlayType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CanvasViewerProps {
  maskDataUrl?: string;
  overlayDataUrl?: string;
  gradcamDataUrl?: string;
  className?: string;
  showControls?: boolean;
}

export function CanvasViewer({
  maskDataUrl,
  overlayDataUrl,
  gradcamDataUrl,
  className,
  showControls = true,
}: CanvasViewerProps) {
  const { uploadedImage } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayType>>(new Set(['mask']));
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Draw the canvas
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !uploadedImage) return;

    // Set canvas size
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transforms
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw base image
    const baseImg = new Image();
    baseImg.src = uploadedImage.dataUrl;
    await new Promise<void>((resolve) => {
      baseImg.onload = () => resolve();
      if (baseImg.complete) resolve();
    });
    ctx.drawImage(baseImg, 0, 0);

    // Draw overlays
    const drawOverlay = async (dataUrl: string, opacity: number = 0.6) => {
      if (!dataUrl) return;
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        if (img.complete) resolve();
      });
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    };

    if (activeOverlays.has('mask') && maskDataUrl) {
      await drawOverlay(maskDataUrl, 0.5);
    }
    if (activeOverlays.has('gradcam') && gradcamDataUrl) {
      await drawOverlay(gradcamDataUrl, 0.4);
    }
    if (activeOverlays.has('bbox') && overlayDataUrl) {
      await drawOverlay(overlayDataUrl, 0.8);
    }

    ctx.restore();
  }, [uploadedImage, maskDataUrl, overlayDataUrl, gradcamDataUrl, activeOverlays, zoom, pan]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 4));
  };

  const toggleOverlay = (type: OverlayType) => {
    setActiveOverlays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 20;
    switch (e.key) {
      case 'ArrowUp':
        setPan(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'ArrowDown':
        setPan(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'ArrowLeft':
        setPan(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'ArrowRight':
        setPan(prev => ({ ...prev, x: prev.x - step }));
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev * 1.2, 4));
        break;
      case '-':
        setZoom(prev => Math.max(prev * 0.8, 0.5));
        break;
      case '0':
        resetView();
        break;
    }
  };

  if (!uploadedImage) {
    return (
      <div
        id="canvas-viewer"
        className={cn(
          "canvas-container flex items-center justify-center h-64 text-muted-foreground",
          className
        )}
      >
        <p>Upload an image to view</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={containerRef}
        id="canvas-viewer"
        className="canvas-container relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Canvas viewer with zoom and pan. Use arrow keys to pan, +/- to zoom, 0 to reset."
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ maxHeight: '400px' }}
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {showControls && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">Overlays:</span>
          
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" id="overlay-toggle-mask">
            <input
              type="checkbox"
              checked={activeOverlays.has('mask')}
              onChange={() => toggleOverlay('mask')}
              className="w-3 h-3 rounded border-border focus-ring"
              aria-label="Toggle mask overlay"
            />
            <span className="text-primary">Mask</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs cursor-pointer" id="overlay-toggle-gradcam">
            <input
              type="checkbox"
              checked={activeOverlays.has('gradcam')}
              onChange={() => toggleOverlay('gradcam')}
              className="w-3 h-3 rounded border-border focus-ring"
              aria-label="Toggle Grad-CAM overlay"
            />
            <span className="text-destructive">Grad-CAM</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs cursor-pointer" id="overlay-toggle-bbox">
            <input
              type="checkbox"
              checked={activeOverlays.has('bbox')}
              onChange={() => toggleOverlay('bbox')}
              className="w-3 h-3 rounded border-border focus-ring"
              aria-label="Toggle bounding box overlay"
            />
            <span className="text-accent">Boxes</span>
          </label>

          <div className="flex-1" />

          <button
            onClick={resetView}
            className="text-xs text-muted-foreground hover:text-foreground focus-ring rounded px-2 py-1"
            aria-label="Reset view"
          >
            Reset View
          </button>
        </div>
      )}
    </div>
  );
}
