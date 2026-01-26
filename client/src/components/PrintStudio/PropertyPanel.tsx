
import React from 'react';

interface PropertyPanelProps {
  selectedObject: any; // Using any for now until we have typed Fabric objects
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedObject }) => {
  if (!selectedObject) {
    return <div className="p-4 text-zinc-400 text-sm">Select an object to edit properties</div>;
  }

  const type = selectedObject.type;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm uppercase text-zinc-500 border-b pb-2">{type} Properties</h3>
      
      <div className="space-y-2">
         <label className="text-xs font-semibold block">Position (X, Y)</label>
         <div className="grid grid-cols-2 gap-2">
             <div className="bg-zinc-100 p-2 rounded text-xs">{Math.round(selectedObject.left)}</div>
             <div className="bg-zinc-100 p-2 rounded text-xs">{Math.round(selectedObject.top)}</div>
         </div>
      </div>

      {type === 'textbox' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold block">Font Size</label>
            <div className="bg-zinc-100 p-2 rounded text-xs">{selectedObject.fontSize} px</div>
          </div>
      )}

      {(type === 'rect' || type === 'circle') && (
          <div className="space-y-2">
             <label className="text-xs font-semibold block">Fill Color</label>
             
             {/* Simple Strings (Solid Color) */}
             {typeof selectedObject.fill === 'string' && (
                 <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer shadow-sm group">
                        <input 
                            type="color" 
                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                            value={String(selectedObject.fill).startsWith('#') ? (selectedObject.fill as string) : '#000000'} // Fallback for rgba/named colors
                            onChange={(e) => {
                                selectedObject.set('fill', e.target.value);
                                selectedObject.canvas?.requestRenderAll();
                            }}
                        />
                    </div>
                    <span className="text-xs font-mono text-zinc-600 bg-zinc-100 px-2 py-1 rounded select-all">
                        {selectedObject.fill}
                    </span>
                 </div>
             )}

             {/* Gradient Handling */}
             {typeof selectedObject.fill === 'object' && selectedObject.fill.type === 'linear' && (
                 <div className="space-y-2 border p-2 rounded bg-zinc-50">
                     <span className="text-xs font-bold text-zinc-500">Gradient Fill</span>
                     {selectedObject.fill.colorStops?.map((stop: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-2">
                             <span className="text-xs w-8">Stop {idx+1}</span>
                             <div className="w-4 h-4 border rounded" style={{ backgroundColor: stop.color }}></div>
                             <span className="text-xs text-zinc-400">{stop.color}</span>
                             {/* Future: Add Color Picker Here */}
                         </div>
                     ))}
                     <div className="text-[10px] text-brand-primary mt-1 italic">
                         Gradient editing coming soon
                     </div>
                 </div>
             )}
          </div>
      )}

      {type === 'group' && (
          <div className="space-y-2">
             <div className="bg-blue-50 text-blue-800 p-2 rounded text-xs font-bold">
                 Photo Grid Group
             </div>
             {selectedObject.gridConfig && (
                 <div className="text-xs text-zinc-500">
                     Layout: {selectedObject.gridConfig.rows}x{selectedObject.gridConfig.cols}
                 </div>
             )}
          </div>
      )}
    </div>
  );
};
