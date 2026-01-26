
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
      backgroundColor: options.backgroundColor || '#f3f4f6', // Light gray background
      selection: true,
      preserveObjectStacking: true,
    });

    // Set up a "Paper" area
    // Letter size at 96 DPI is approx 816 x 1056
    // We'll center it.
    const paperWidth = 816;
    const paperHeight = 1056;
    
    // Create the white paper sheet
    const paperOption = {
        left: (options.width - paperWidth) / 2,
        top: 50,
        fill: '#ffffff',
        width: paperWidth,
        height: paperHeight,
        selectable: false,
        hoverCursor: 'default',
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 5, offsetY: 5 }),
        id: 'paper-sheet' // Custom ID to identify it
    };
    
    const paper = new fabric.Rect(paperOption);
    canvas.add(paper);
    // Fabric 6+ / 7+ API: moveObjectTo(object, index)
    canvas.moveObjectTo(paper, 0);

    // Zoom Handling
    canvas.on('mouse:wheel', (opt) => {
      if (opt.e.ctrlKey) { // Only zoom with Ctrl
          const delta = opt.e.deltaY;
          let zoom = canvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          
          const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
          canvas.zoomToPoint(point, zoom);
          
          opt.e.preventDefault();
          opt.e.stopPropagation();
      } else {
          // Panning with wheel
          const vpt = canvas.viewportTransform;
          if (vpt) {
             vpt[5] -= opt.e.deltaY;
             vpt[4] -= opt.e.deltaX;
             canvas.requestRenderAll();
          }
      }
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
