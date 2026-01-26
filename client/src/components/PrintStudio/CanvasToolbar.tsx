
import React from 'react';

interface CanvasToolbarProps {
  onAddRect: () => void;
  onAddText: () => void;
  onAddCircle: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onAddRect, onAddText, onAddCircle }) => {
  return (
    <div className="w-16 bg-white border-r border-zinc-200 flex flex-col items-center py-4 space-y-4 shadow-sm z-10">
      <div className="font-bold text-xs text-zinc-400 mb-2">TOOLS</div>
      
      <button onClick={onAddRect} className="w-10 h-10 bg-zinc-100 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition" title="Rectangle">
        <div className="w-4 h-4 border-2 border-current"></div>
      </button>

      <button onClick={onAddCircle} className="w-10 h-10 bg-zinc-100 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition" title="Circle">
         <div className="w-4 h-4 border-2 border-current rounded-full"></div>
      </button>

      <button onClick={onAddText} className="w-10 h-10 bg-zinc-100 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition font-serif font-bold" title="Text">
        T
      </button>

      {/* Placeholder for Photo Grid */}
      <button className="w-10 h-10 bg-zinc-100 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition" title="Photo Grid">
        <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-current opacity-50"></div>
            <div className="bg-current opacity-50"></div>
            <div className="bg-current opacity-50"></div>
            <div className="bg-current opacity-50"></div>
        </div>
      </button>
    </div>
  );
};
