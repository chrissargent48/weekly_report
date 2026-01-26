
import React, { useRef, useState, useEffect } from 'react';
import { useFabric } from '../hooks/useFabric';
import { CanvasToolbar } from '../components/PrintStudio/CanvasToolbar';
import { PropertyPanel } from '../components/PrintStudio/PropertyPanel';
import * as fabric from 'fabric';
import { createPhotoGrid } from '../features/print-studio/utils/gridHelpers';
import { createCoverPage } from '../features/print-studio/utils/coverPageHelper';

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

  // Initialize the "Paper" Sheet
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Check if paper already exists
    let paper = fabricCanvas.getObjects().find((o: any) => o.id === 'paper-sheet');
    
    if (!paper) {
        // Create Letter Size Paper (8.5 x 11 inches @ 96 DPI approx -> 816 x 1056)
        // Or specific print dimensions. Let's use 816x1056.
        const pageWidth = 816;
        const pageHeight = 1056;
        
        paper = new fabric.Rect({
            left: (fabricCanvas.getWidth() - pageWidth) / 2,
            top: 40, // Top margin on desk
            width: pageWidth,
            height: pageHeight,
            fill: '#ffffff',
            stroke: '#d4d4d8', // Slight border
            strokeWidth: 1,
            selectable: false,
            evented: false, 
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 30, offsetX: 0, offsetY: 0 }),
            hoverCursor: 'default'
        });
        (paper as any).id = 'paper-sheet';
        
        fabricCanvas.add(paper);
        fabricCanvas.sendObjectToBack(paper);
        
        // Center the paper horizontally
        const centerPaper = () => {
             const zoom = fabricCanvas.getZoom();
             const vpt = fabricCanvas.viewportTransform;
             if(vpt) {
                 vpt[4] = (fabricCanvas.getWidth() / zoom - pageWidth) / 2 * zoom; // Center horizontally
                 fabricCanvas.requestRenderAll();
             }
        };
        // Initial center
        // Horizontal centering is handled via viewportTransform in centerPaper() or similar logic
        // paper.centerH() does not exist in Fabric 6.
        
        fabricCanvas.requestRenderAll();
    }
    
    // Recenter paper on resize?
    // For now, just ensure it exists.
    
  }, [fabricCanvas, dimensions]);

  useEffect(() => {
      if (!fabricCanvas) return;
      
      const updateSelection = () => {
          setActiveObj(fabricCanvas.getActiveObject());
      };

      fabricCanvas.on('selection:created', updateSelection);
      fabricCanvas.on('selection:updated', updateSelection);
      fabricCanvas.on('selection:cleared', () => setActiveObj(null));

      // Double Click Handler for Image Uploads
      // Double Click Handler for Image Uploads
      fabricCanvas.on('mouse:dblclick', (opt) => {
          const target = opt.target as any;
          if (target && target.isPlaceholder) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = (f) => {
                      const data = f.target?.result as string;
                      fabric.FabricImage.fromURL(data).then((img) => {
                          if(!img) return;
                          
                          if (target.placeholderType === 'hero') {
                              // HERO LOGIC: Fit to width, keep aspect ratio, position at top
                              const scale = fabricCanvas.getWidth() / img.width!;
                              img.set({
                                  left: 0, 
                                  top: 0, 
                                  scaleX: scale, 
                                  scaleY: scale,
                                  selectable: false
                              });
                              
                              // Add image
                              fabricCanvas.add(img);
                              
                              // Send to back (but above paper if it exists)
                              fabricCanvas.sendObjectToBack(img);
                              const paper = fabricCanvas.getObjects().find(o => (o as any).id === 'paper-sheet');
                              if(paper) {
                                  img.moveCursor = 'move'; // Should be above paper
                                  fabricCanvas.moveObjectTo(img, fabricCanvas.getObjects().indexOf(paper) + 1);
                              } 

                              // Remove the gray placeholder
                              fabricCanvas.remove(target);
                              
                          } else if (target.placeholderType === 'sub-image') {
                              // PHOTO STRIP LOGIC: Scale to fit inside the placeholder box
                              // Target is a Group (Placeholder). We want to replace it or fill it.
                              
                              const boxW = target.width! * target.scaleX!;
                              const boxH = target.height! * target.scaleY!;
                              
                              // Scale image to cover the box (crop-like effect)
                              const scale = Math.max(boxW / img.width!, boxH / img.height!);
                              
                              img.set({
                                  left: target.left,
                                  top: target.top,
                                  scaleX: scale,
                                  scaleY: scale,
                                  clipPath: new fabric.Rect({
                                      left: -img.width!/2, // relative to image center
                                      top: -img.height!/2,
                                      width: img.width!, 
                                      height: img.height!, 
                                      originX: 'center', 
                                      originY: 'center'
                                  })
                              });
                              
                              // Crop isn't working perfectly in Fabric simple add. 
                              // Alternative: Scale to fit width, mask.
                              // For MVP: Just scale to width and center.
                              img.scaleToWidth(boxW);
                              img.set({
                                  left: target.left! + (boxW/2),
                                  top: target.top! + (boxH/2),
                                  originX: 'center',
                                  originY: 'center'
                              });


                              fabricCanvas.add(img);
                              fabricCanvas.remove(target);
                          }
                          
                          fabricCanvas.requestRenderAll();
                      });
                  };
                  reader.readAsDataURL(file);
              };
              input.click();
          }
      });

      return () => {
          fabricCanvas.off('selection:created', updateSelection);
          fabricCanvas.off('selection:updated', updateSelection);
          fabricCanvas.off('selection:cleared');
          fabricCanvas.off('mouse:dblclick');
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

  const addGrid = (rows: number, cols: number) => {
      if (!fabricCanvas) return;
      // Default to 6 inch wide grid (approx 576px at 96 DPI)
      const grid = createPhotoGrid(rows, cols, {
          left: 100,
          top: 100,
          width: 500,
          height: 500,
          gap: 10
      });
      fabricCanvas.add(grid);
      fabricCanvas.setActiveObject(grid);
  };

  // History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveHistory = () => {
    if(!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  
  // Hook history onto object modification
  useEffect(() => {
     if(!fabricCanvas) return;
     fabricCanvas.on('object:modified', saveHistory);
     fabricCanvas.on('object:added', saveHistory);
     return () => {
         fabricCanvas.off('object:modified', saveHistory);
         fabricCanvas.off('object:added', saveHistory);
     }
  }, [fabricCanvas, history, historyStep]);

  const undo = () => {
      if(historyStep > 0) {
          if(!fabricCanvas) return;
          const prev = history[historyStep - 1];
          fabricCanvas.loadFromJSON(JSON.parse(prev), () => {
              fabricCanvas.renderAll();
              setHistoryStep(historyStep - 1);
              // Re-bind paper id if lost? Fabric serialization should keep custom props if allowed.
          });
      }
  };

  const redo = () => {
      if(historyStep < history.length - 1) {
          if(!fabricCanvas) return;
          const next = history[historyStep + 1];
          fabricCanvas.loadFromJSON(JSON.parse(next), () => {
              fabricCanvas.renderAll();
              setHistoryStep(historyStep + 1);
          });
      }
  };

  // Ensure cover elements are relative to the paper!
  const addCover = () => {
      if (!fabricCanvas) return;
      
      // Get the Paper
      const paper = fabricCanvas.getObjects().find((o: any) => o.id === 'paper-sheet');
      const paperLeft = paper?.left || 0;
      const paperTop = paper?.top || 0;
      
      // Clear legacy elements but KEEP PAPER
      const objects = fabricCanvas.getObjects();
      objects.forEach(o => {
          if((o as any).id !== 'paper-sheet') fabricCanvas.remove(o);
      });
      
      const elements = createCoverPage({
          width: 816, 
          height: 1056, 
          projectName: 'FORD CITY - FORMER FACILITY SLA'
      });
      
      elements.forEach(el => {
          // Adjust position to be relative to Paper
          el.left = (el.left || 0) + paperLeft;
          el.top = (el.top || 0) + paperTop;
          fabricCanvas.add(el);
      });
      
      fabricCanvas.requestRenderAll();
      saveHistory(); // Save state
  };
  
  // Updated Header with Undo/Redo
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-4 justify-between shrink-0 z-30 shadow-sm relative">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1 text-sm font-medium"><span>←</span> Back</button>
              <div className="h-6 w-px bg-zinc-200 mx-2"></div>
              <h1 className="font-bold text-lg tracking-tight text-slate-800">Print Studio <span className="text-xs font-normal text-slate-400 ml-2 tracking-normal bg-slate-100 px-2 py-0.5 rounded-full">Phase 1: Canvas Core</span></h1>
              
              {/* History Controls */}
              <div className="flex items-center gap-2 ml-8">
                  <button onClick={undo} disabled={historyStep <= 0} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30" title="Undo">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                  </button>
                  <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30" title="Redo">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                  </button>
              </div>
          </div>
          <div>
              <button className="bg-brand-primary hover:bg-brand-primary-dark text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95">
                Export PDF <span className="opacity-70 font-normal ml-1">(Coming Soon)</span>
              </button>
          </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
          {/* Left Toolbar - Sidebar */}
          <CanvasToolbar 
            onAddRect={addRect} 
            onAddCircle={addCircle} 
            onAddText={addText} 
            onAddGrid={addGrid}
            onAddCover={addCover}
          />

          {/* Center Canvas Area - Workspace */}
          <div ref={containerRef} className="flex-1 ps-workspace relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
              <canvas ref={canvasEl} className="shadow-2xl" />
          </div>

          {/* Right Properties Panel */}
          <div className="w-80 bg-white border-l border-zinc-200 shadow-xl overflow-y-auto shrink-0 z-20">
              <PropertyPanel selectedObject={activeObj} />
          </div>
      </div>
    </div>
  );
};
