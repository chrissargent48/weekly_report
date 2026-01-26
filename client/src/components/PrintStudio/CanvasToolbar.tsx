
import React from 'react';

interface CanvasToolbarProps {
  onAddRect: () => void;
  onAddText: () => void;
  onAddCircle: () => void;
  onAddGrid: (rows: number, cols: number) => void;
  onAddCover: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onAddRect, onAddText, onAddCircle, onAddGrid, onAddCover }) => {
  return (
    <div className="w-16 ps-sidebar flex flex-col items-center py-4 space-y-4 shadow-sm z-10 border-r border-slate-700">
      <div className="font-bold text-[10px] text-zinc-500 mb-2 tracking-wider">TOOLS</div>
      
      <button onClick={onAddRect} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition shadow-sm" title="Rectangle">
        <div className="w-4 h-4 border-2 border-current"></div>
      </button>

      <button onClick={onAddCircle} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition shadow-sm" title="Circle">
         <div className="w-4 h-4 border-2 border-current rounded-full"></div>
      </button>

      <button onClick={onAddText} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition font-serif font-bold shadow-sm" title="Text">
        T
      </button>

      <div className="w-8 border-t border-slate-700 my-2"></div>

      {/* Photo Grid Buttons */}
      <button onClick={() => onAddGrid(2, 2)} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition shadow-sm" title="2x2 Grid">
        <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-current opacity-50 w-full h-full"></div>
            <div className="bg-current opacity-50 w-full h-full"></div>
            <div className="bg-current opacity-50 w-full h-full"></div>
            <div className="bg-current opacity-50 w-full h-full"></div>
        </div>
      </button>

      <button onClick={() => onAddGrid(3, 3)} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition shadow-sm" title="3x3 Grid">
        <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
            {[...Array(9)].map((_, i) => <div key={i} className="bg-current opacity-50 w-full h-full"></div>)}
        </div>
      </button>

      <div className="w-8 border-t border-slate-700 my-2"></div>
      
      <div className="font-bold text-[10px] text-zinc-500 mb-2 tracking-wider">PAGES</div>
      
      <button onClick={onAddCover} className="w-10 h-10 bg-slate-800 text-zinc-300 hover:bg-brand-primary hover:text-white rounded flex items-center justify-center transition shadow-sm" title="Cover Page Template">
          <div className="flex flex-col w-4 h-5 border border-current opacity-50">
              <div className="h-2 bg-current w-full"></div>
              <div className="h-0.5 bg-current w-2/3 mt-0.5 ml-0.5"></div>
          </div>
      </button>
    </div>
  );
};
