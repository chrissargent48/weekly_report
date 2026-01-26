
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
             <div className="flex items-center gap-2">
                 <div className="w-6 h-6 border rounded" style={{ backgroundColor: selectedObject.fill }}></div>
                 <span className="text-xs">{selectedObject.fill}</span>
             </div>
          </div>
      )}
    </div>
  );
};
