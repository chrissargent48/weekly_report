import React from 'react';
import { PrintConfig, PrintSection } from '../config/printConfig.types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, X } from 'lucide-react';

interface SidebarProps {
  config: PrintConfig;
  onToggleSection: (id: string) => void;
  onReorderSections: (from: number, to: number) => void;
  onSetSpacing: (type: 'compact' | 'standard' | 'relaxed') => void;
  onSetLogoScale: (scale: number) => void;
  onSetHeroPhoto: (index: number | null) => void;
  onSetStripPhotos: (indexes: number[]) => void;
  onToggleCoverPhotos: (show: boolean) => void;
  
  // Debug
  showPageBreakGuides: boolean;
  onTogglePageBreakGuides: (show: boolean) => void;
}

export function Sidebar({
  config,
  onToggleSection,
  onReorderSections,
  onSetSpacing,
  onSetLogoScale,
  onToggleCoverPhotos,
  showPageBreakGuides,
  onTogglePageBreakGuides,
}: SidebarProps) {
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       const oldIndex = config.sections.findIndex(s => s.id === active.id);
       const newIndex = config.sections.findIndex(s => s.id === over.id);
       onReorderSections(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-80 md:w-96 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 z-10 overflow-hidden">
      <div className="p-6 border-b border-zinc-100">
         <h2 className="text-lg font-bold text-zinc-900">Print Settings</h2>
         <p className="text-xs text-zinc-500 mt-1">Configure layout and sections</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
         {/* 1. SECTIONS LIST */}
         <div>
            <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Report Sections</p>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={config.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                     {config.sections.map(section => (
                        <SortableSectionItem 
                           key={section.id} 
                           section={section} 
                           onToggle={() => onToggleSection(section.id)} 
                        />
                     ))}
                  </ul>
               </SortableContext>
            </DndContext>
         </div>

         {/* 2. LAYOUT OPTIONS */}
         <div className="border-t border-zinc-100 pt-6">
            <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Layout Density</p>
            <div className="grid grid-cols-3 gap-2">
               {['compact', 'standard', 'relaxed'].map((type) => (
                  <button
                     key={type}
                     onClick={() => onSetSpacing(type as any)}
                     className={`px-3 py-2 text-xs font-medium rounded border transition ${
                        config.spacing.type === type
                           ? 'bg-zinc-900 text-white border-zinc-900'
                           : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                     }`}
                  >
                     {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
               ))}
            </div>
         </div>

         {/* 3. LOGO SCALE */}
         <div className="border-t border-zinc-100 pt-6">
            <div className="flex justify-between items-center mb-4">
               <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Logo Size</p>
               <span className="text-xs font-mono text-zinc-500">{config.logoScale}%</span>
            </div>
            <input 
               type="range" 
               min="20" 
               max="200" 
               value={config.logoScale} 
               onChange={(e) => onSetLogoScale(parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
         </div>
         
         {/* 4. DEBUG TOOLS */}
         <div className="border-t border-zinc-100 pt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
               <input 
                  type="checkbox" 
                  checked={showPageBreakGuides}
                  onChange={(e) => onTogglePageBreakGuides(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary"
               />
               <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition">Show Page Break Guides</span>
            </label>
         </div>
      </div>
    </div>
  );
}

function SortableSectionItem({ section, onToggle }: { section: PrintSection, onToggle: () => void }) {
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
   
   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: section.included ? 1 : 0.5,
      filter: section.included ? 'none' : 'grayscale(1)',
   };

   return (
      <li ref={setNodeRef} style={style} className="group bg-white border border-zinc-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:border-zinc-300 transition">
         <div className="flex items-center gap-3 flex-1">
            <button {...attributes} {...listeners} className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
               <GripVertical size={16} />
            </button>
            <span className={`text-sm font-medium ${section.included ? 'text-zinc-900' : 'text-zinc-400'}`}>
               {section.label}
            </span>
         </div>
         <button 
            onClick={onToggle}
            className={`p-1.5 rounded-md transition ${
               section.included ? 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100' : 'text-zinc-300 hover:text-zinc-500'
            }`}
         >
            {section.included ? <Eye size={16} /> : <EyeOff size={16} />}
         </button>
      </li>
   );
}
