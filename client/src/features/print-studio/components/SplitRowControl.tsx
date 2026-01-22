import React from 'react';
import { Scissors } from 'lucide-react';

interface SplitRowControlProps {
  sectionId: string;
  rowIndex: number;
  hasBreak: boolean;
  onToggle: () => void;
}

export function SplitRowControl({ sectionId, rowIndex, hasBreak, onToggle }: SplitRowControlProps) {
  return (
    <div className="absolute left-0 right-0 -bottom-3 z-10 flex justify-center opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
       {/* The clickable area needs pointer-events-auto */}
       <div className="pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider transition transform hover:scale-105 ${
              hasBreak 
                ? 'bg-brand-primary text-white ring-2 ring-brand-primary/20' 
                : 'bg-white border border-zinc-200 text-zinc-500 hover:text-brand-primary hover:border-brand-primary shadow-sm'
            }`}
            title={hasBreak ? "Remove Page Break" : "Insert Page Break Here"}
          >
            <Scissors size={12} className={hasBreak ? 'text-white' : ''} />
            {hasBreak ? 'Break Active' : 'Split Page'}
          </button>
       </div>
       
       {/* Visual line extension if break is active */}
       {hasBreak && (
         <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-primary border-t border-dashed border-brand-primary opacity-50 -z-10" />
       )}
    </div>
  );
}
