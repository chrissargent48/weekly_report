
import React, { useRef, useState, useEffect } from 'react';
import { useFabric } from '../hooks/useFabric';
import { CanvasToolbar } from '../components/PrintStudio/CanvasToolbar';
import { PropertyPanel } from '../components/PrintStudio/PropertyPanel';
import * as fabric from 'fabric';

interface PrintStudioProps {
    onBack: () => void;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ onBack }) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeObj, setActiveObj] = useState<any>(null);

  // Measure container for canvas size
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (containerRef.current) {
        setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
        });
    }
    const handleResize = () => {
        if(containerRef.current) {
             setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const fabricCanvas = useFabric(canvasEl, { width: dimensions.width, height: dimensions.height });

  useEffect(() => {
      if (!fabricCanvas) return;
      
      const updateSelection = () => {
          setActiveObj(fabricCanvas.getActiveObject());
      };

      fabricCanvas.on('selection:created', updateSelection);
      fabricCanvas.on('selection:updated', updateSelection);
      fabricCanvas.on('selection:cleared', () => setActiveObj(null));

      return () => {
          fabricCanvas.off('selection:created', updateSelection);
          fabricCanvas.off('selection:updated', updateSelection);
          fabricCanvas.off('selection:cleared');
      };
  }, [fabricCanvas]);

  // Tools
  const addRect = () => {
      if (!fabricCanvas) return;
      const rect = new fabric.Rect({
          left: 100, top: 100, width: 100, height: 100, fill: 'red'
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
  };

  const addCircle = () => {
      if (!fabricCanvas) return;
      const circle = new fabric.Circle({
          left: 200, top: 200, radius: 50, fill: 'blue'
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
  };

  const addText = () => {
      if (!fabricCanvas) return;
      const text = new fabric.Textbox('Hello World', {
          left: 300, top: 100, width: 200, fontSize: 20
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
  };


  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Top Header */}
      <header className="h-14 bg-white border-b flex items-center px-4 justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800">← Back</button>
              <h1 className="font-bold text-lg">Print Studio <span className="text-xs font-normal text-zinc-400 ml-2">Phase 1: Canvas Core</span></h1>
          </div>
          <div>
              <button className="bg-brand-primary text-white px-4 py-2 rounded text-sm font-bold">Export PDF (Coming Soon)</button>
          </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
          {/* Left Toolbar */}
          <CanvasToolbar onAddRect={addRect} onAddCircle={addCircle} onAddText={addText} />

          {/* Center Canvas Area */}
          <div ref={containerRef} className="flex-1 bg-zinc-200 relative overflow-hidden flex items-center justify-center">
              <canvas ref={canvasEl} />
          </div>

          {/* Right Properties Panel */}
          <div className="w-64 bg-white border-l shadow-sm overflow-y-auto shrink-0 z-10">
              <PropertyPanel selectedObject={activeObj} />
          </div>
      </div>
    </div>
  );
};
