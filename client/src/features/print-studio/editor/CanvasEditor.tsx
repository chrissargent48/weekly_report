import React, { useState, useRef, useEffect } from 'react';
import Moveable, { OnDrag, OnResize, OnRotate } from 'react-moveable';
import Selecto from 'react-selecto';
import { CanvasNode, WeeklyReport } from '../../../types';
import { NodeRenderer } from './adapters/NodeRenderer';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

// Mock Data for Prototype - In real app, this comes from props/context
interface CanvasEditorProps {
    report: WeeklyReport;
    config?: any; // ProjectConfig
    onLayoutChange?: (nodes: CanvasNode[]) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ report, config, onLayoutChange }) => {

  const [items, setItems] = useState<CanvasNode[]>([
    {
      id: 'header-text',
      type: 'text',
      x: 40,
      y: 40,
      width: 300,
      height: 40,
      rotation: 0,
      content: 'Weekly Progress Report',
      style: { fontSize: 24, fontColor: '#333' }
    },
    {
      id: 'overview-section',
      type: 'section',
      sectionType: 'overview',
      x: 40,
      y: 100,
      width: 532, // Full width minus margins
      height: 150,
      rotation: 0,
    }
  ]);
  
  const [selectedTargets, setSelectedTargets] = useState<HTMLElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State Sync ---
  const syncItemState = (target: HTMLElement) => {
    const id = target.getAttribute('data-id');
    if (!id) return;

    const x = parseFloat(target.style.left || '0');
    const y = parseFloat(target.style.top || '0');
    const w = parseFloat(target.style.width || '0');
    const h = parseFloat(target.style.height || '0');
    
    let rot = 0;
    const transform = target.style.transform;
    if (transform && transform.includes('rotate')) {
        const match = transform.match(/rotate\(([-\d.]+)deg\)/);
        if (match) rot = parseFloat(match[1]);
    }

    setItems(prev => prev.map(item => 
        item.id === id ? { ...item, x, y, width: w, height: h, rotation: rot } : item
    ));
  };


  // --- Actions ---
  const addNode = (type: CanvasNode['type'], sectionType?: CanvasNode['sectionType']) => {
      const newNode: CanvasNode = {
          id: `node-${Date.now()}`,
          type,
          sectionType,
          x: 50,
          y: 50,
          width: 200,
          height: 100,
          rotation: 0,
          content: type === 'text' ? 'New Text Block' : undefined
      };
      setItems(prev => [...prev, newNode]);
  };


  return (
    <div className="flex h-full bg-gray-100 overflow-hidden">
        
      {/* SIDEBAR PALETTE */}
      <div className="w-64 bg-white border-r flex flex-col z-10 shadow-sm">
          <div className="p-4 font-bold text-gray-700 border-b">Toolbox</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase">Basics</div>
                  <button onClick={() => addNode('text')} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border rounded text-sm text-left">
                      <span>📝</span> Text Block
                  </button>
                  <button onClick={() => addNode('image')} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border rounded text-sm text-left">
                      <span>🖼️</span> Image Placeholder
                  </button>
              </div>

              <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase">Sections</div>
                  <button onClick={() => addNode('section', 'overview')} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm text-left text-blue-700">
                      <span>📊</span> Overview Logic
                  </button>
                  <button onClick={() => addNode('section', 'weather')} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm text-left text-blue-700">
                      <span>☀️</span> Weather Widget
                  </button>
                  <button onClick={() => addNode('section', 'photos')} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm text-left text-blue-700">
                      <span>📸</span> Photo Grid
                  </button>
              </div>

          </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 overflow-auto p-10 flex justify-center bg-gray-50 relative">
        <div 
            ref={containerRef}
            className="bg-white shadow-2xl transition-shadow relative"
            id="canvas-page"
            onClick={(e) => {
               if(e.target === containerRef.current) setSelectedTargets([]);
            }}
            style={{ width: `${PAGE_WIDTH}px`, height: `${PAGE_HEIGHT}px` }}
        >
            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-5" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '72px 72px' }} 
            />

            {items.map(node => (
                <div
                    key={node.id}
                    className="absolute target-element group hover:z-50"
                    data-id={node.id}
                    style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        width: `${node.width}px`,
                        height: `${node.height}px`,
                        transform: `rotate(${node.rotation}deg)`,
                        zIndex: selectedTargets.some(el => el.getAttribute('data-id') === node.id) ? 100 : (node.zIndex || 1),
                        position: 'absolute',
                    }}
                >
                    <NodeRenderer node={node} data={report} />
                    
                    {/* Hover Selection Border */}
                    <div className="absolute inset-0 border border-blue-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                </div>
            ))}

            <Moveable
                target={selectedTargets}
                container={containerRef.current}
                draggable={true}
                resizable={true}
                rotatable={true}
                snappable={true}
                snapElement={true}
                snapDirections={{"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true}}
                
                onDrag={({ target, left, top }) => { target.style.left = `${left}px`; target.style.top = `${top}px`; }}
                onDragEnd={({ target }) => syncItemState(target as HTMLElement)}

                onResize={({ target, width, height, drag }) => {
                    target.style.width = `${width}px`;
                    target.style.height = `${height}px`;
                    target.style.left = `${drag.left}px`;
                    target.style.top = `${drag.top}px`;
                }}
                onResizeEnd={({ target }) => syncItemState(target as HTMLElement)}

                onRotate={({ target, rotation }) => { target.style.transform = `rotate(${rotation}deg)`; }}
                onRotateEnd={({ target }) => syncItemState(target as HTMLElement)}
            />

            <Selecto
                dragContainer={containerRef.current}
                selectableTargets={[".target-element"]}
                hitRate={0}
                selectByClick={true}
                selectFromInside={false}
                toggleContinueSelect={["shift"]}
                onSelect={e => setSelectedTargets(e.selected as HTMLElement[])}
            />
        </div>
      </div>
    </div>
  );
};
