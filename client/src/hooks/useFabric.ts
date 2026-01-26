
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface UseFabricOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

export const useFabric = (canvasRef: React.RefObject<HTMLCanvasElement>, options: UseFabricOptions) => {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    console.log("Initializing Fabric Canvas...");
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: options.width,
      height: options.height,
      backgroundColor: '#18181b', // Dark zinc-900 background for professional feel
      selection: true,
      preserveObjectStacking: true,
    });

    // Set up a "Paper" area matched to A4/Letter
    // Letter: 816x1056 px (96 DPI)
    const paperWidth = 816;
    const paperHeight = 1056;
    
    // Calculate start position to center the paper in the VIEWPORT
    const paperLeft = 0;
    const paperTop = 0;

    const paperOption = {
        left: paperLeft,
        top: paperTop,
        fill: '#ffffff',
        width: paperWidth,
        height: paperHeight,
        selectable: false,
        hoverCursor: 'default',
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 50, offsetX: 0, offsetY: 20 }), // Deep shadow
        id: 'paper-sheet'
    };
    
    const paper = new fabric.Rect(paperOption);
    canvas.add(paper);
    canvas.moveObjectTo(paper, 0);

    // Initial Center Viewport
    const centerViewport = () => {
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        // Calculate offset to center the paper
        // Container W/2 - Paper W/2 * Zoom
        const zoom = 0.8; // Start slightly zoomed out
        vpt[0] = zoom;
        vpt[3] = zoom;
        vpt[4] = (options.width - paperWidth * zoom) / 2;
        vpt[5] = (options.height - paperHeight * zoom) / 2;
        canvas.setViewportTransform(vpt);
    };
    
    // Delay slightly to ensure reliable dims, or just run immediate
    centerViewport();

    // Zoom & Pan Handling
    canvas.on('mouse:wheel', (opt) => {
        const delta = opt.e.deltaY;
        
        if (opt.e.ctrlKey) { 
          // ZOOM (Ctrl + Wheel)
          let zoom = canvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 5) zoom = 5;
          if (zoom < 0.1) zoom = 0.1;
          
          const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
          canvas.zoomToPoint(point, zoom);
        } else if (opt.e.shiftKey) {
          // HORIZONTAL PAN (Shift + Wheel)
          const vpt = canvas.viewportTransform;
          if (vpt) {
             vpt[4] -= opt.e.deltaY; // Use Y delta for X movement
             canvas.requestRenderAll();
          }
        } else {
          // VERTICAL PAN (Wheel only)
          const vpt = canvas.viewportTransform;
          if (vpt) {
             vpt[4] -= opt.e.deltaX; // Handle trackpad horizontal
             vpt[5] -= opt.e.deltaY;
             canvas.requestRenderAll();
          }
        }
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    // Alt + Drag to Pan
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (opt) => {
        const evt = opt.e as MouseEvent;
        // Alt key or Middle Mouse Button
        if (evt.altKey || evt.button === 1) {
            isPanning = true;
            canvas.selection = false;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
            canvas.defaultCursor = 'grab';
        }
    });

    canvas.on('mouse:move', (opt) => {
        if (isPanning && canvas.viewportTransform) {
            const evt = opt.e as MouseEvent;
            const vpt = canvas.viewportTransform;
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
        }
    });

    canvas.on('mouse:up', () => {
        if (isPanning) {
            isPanning = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
        }
    });

    // Snapping Logic
    const gridSize = 20;
    const snapDist = 10; // Distance to trigger snap
    
    canvas.on('object:moving', (options) => {
        if (!options.target) return;
        
        const target = options.target;
        
        // 1. Grid Snapping (Weak)
        let left = Math.round(target.left / gridSize) * gridSize;
        let top = Math.round(target.top / gridSize) * gridSize;
        
        // 2. Page Snapping (Strong - Overrides Grid)
        // Paper Dimensions (Hardcoded for now per the paper setup above)
        // Width: 816, Height: 1056
        const pWidth = 816;
        const pHeight = 1056;
        
        // Snap to Vertical Center (Paper Width / 2)
        // We need to account for object origin. Assuming center/center for some, or left/top for others.
        // Fabric objects usually default to Left/Top unless changed.
        
        // Helper to get object center/edges
        const objCenter = target.getCenterPoint();
        const objWidth = target.getScaledWidth();
        const objHeight = target.getScaledHeight();
        
        //-- Vertical Alignments --
        // Snap Left Edge to Page Left (0)
        if (Math.abs(target.left) < snapDist) {
            left = 0;
        }
        // Snap Right Edge to Page Right (816)
        else if (Math.abs((target.left + objWidth) - pWidth) < snapDist) {
             left = pWidth - objWidth;
        }
        // Snap Center to Page Center (408)
        else if (Math.abs(objCenter.x - (pWidth / 2)) < snapDist) {
            left = (pWidth / 2) - (objWidth / 2); // Adjust if origin is TopLeft
            // If originX is 'center', left would be pWidth/2. 
            if (target.originX === 'center') left = pWidth / 2;
        }
        
        //-- Horizontal Alignments --
        // Snap Top Edge to Page Top (0)
        if (Math.abs(target.top) < snapDist) {
            top = 0;
        }
        // Snap Bottom Edge to Page Bottom (1056)
        else if (Math.abs((target.top + objHeight) - pHeight) < snapDist) {
            top = pHeight - objHeight;
        }
        
        // Apply Snap
        // Only apply if the calculated snap position is close to current (implied by the logic above)
        // Actually the logic above sets 'left/top' to Grid FIRST, then overrides if Page Snap is valid.
        // But we should only override grid if we actually HIT a page snap.
        
        // Let's refine: default to current position
        let finalLeft = target.left;
        let finalTop = target.top;
        
        // Grid Snap Candidate
        if (Math.abs(target.left % gridSize) < 10) finalLeft = Math.round(target.left / gridSize) * gridSize;
        if (Math.abs(target.top % gridSize) < 10) finalTop = Math.round(target.top / gridSize) * gridSize;
        
        // Page Snap Candidate (Higher Priority)
        // Left Edge -> 0
        if (Math.abs(target.left) < snapDist) finalLeft = 0;
        // Right Edge -> 816
        if (Math.abs((target.left + objWidth) - pWidth) < snapDist) finalLeft = pWidth - objWidth;
        
        // Top Edge -> 0
        if (Math.abs(target.top) < snapDist) finalTop = 0;
        
        target.set({ left: finalLeft, top: finalTop });
    });

    fabricRef.current = canvas;
    setFabricCanvas(canvas);

    return () => {
      console.log("Disposing Fabric Canvas");
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasRef, options.width, options.height]); // Re-init if dimensions change drastically

  return fabricCanvas;
};
