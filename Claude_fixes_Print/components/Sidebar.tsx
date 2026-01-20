import React from 'react';
import { PrintConfig, PrintSection, ReportData } from '../config/printConfig.types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Check, ImageIcon } from 'lucide-react';

interface SidebarProps {
  config: PrintConfig;
  reportData: ReportData; // ADDED - needed for photo thumbnails!
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
  reportData,
  onToggleSection,
  onReorderSections,
  onSetSpacing,
  onSetLogoScale,
  onSetHeroPhoto,
  onSetStripPhotos,
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

  // Photo data from report
  const photos = reportData.photos || [];
  const heroIndex = config.heroPhotoIndex ?? 0;
  const stripIndexes = config.stripPhotoIndexes || [];

  // Toggle a photo in/out of the strip selection
  const toggleStripPhoto = (index: number) => {
    if (index === heroIndex) return; // Can't add hero to strip
    
    if (stripIndexes.includes(index)) {
      // Remove from strip
      onSetStripPhotos(stripIndexes.filter(i => i !== index));
    } else if (stripIndexes.length < 3) {
      // Add to strip (max 3)
      onSetStripPhotos([...stripIndexes, index]);
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

         {/* 2. COVER PHOTOS - THIS WAS MISSING! */}
         <div className="border-t border-zinc-100 pt-6">
            <div className="flex justify-between items-center mb-4">
               <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Cover Photos</p>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                     type="checkbox"
                     checked={config.showCoverPhotos}
                     onChange={(e) => onToggleCoverPhotos(e.target.checked)}
                     className="w-4 h-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-xs text-zinc-500">Show Strip</span>
               </label>
            </div>
            
            {photos.length > 0 ? (
               <div className="space-y-4">
                  {/* Hero Photo Selection */}
                  <div>
                     <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                        <ImageIcon size={12} />
                        Hero Image (background)
                     </p>
                     <div className="grid grid-cols-4 gap-2">
                        {photos.slice(0, 8).map((photo, idx) => (
                           <button
                              key={idx}
                              onClick={() => onSetHeroPhoto(idx)}
                              className={`aspect-square rounded overflow-hidden border-2 transition relative ${
                                 heroIndex === idx 
                                    ? 'border-brand-primary ring-2 ring-brand-primary/30' 
                                    : 'border-zinc-200 hover:border-zinc-300'
                              }`}
                              title={`Select as hero image`}
                           >
                              <img 
                                 src={photo.url} 
                                 alt={`Photo ${idx + 1}`}
                                 className="w-full h-full object-cover"
                              />
                              {heroIndex === idx && (
                                 <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white drop-shadow" />
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  {/* Strip Photos Selection */}
                  {config.showCoverPhotos && (
                     <div>
                        <p className="text-xs text-zinc-500 mb-2">Strip Photos (select up to 3)</p>
                        <div className="grid grid-cols-4 gap-2">
                           {photos.slice(0, 8).map((photo, idx) => {
                              const isHero = heroIndex === idx;
                              const isInStrip = stripIndexes.includes(idx);
                              
                              return (
                                 <button
                                    key={idx}
                                    onClick={() => !isHero && toggleStripPhoto(idx)}
                                    disabled={isHero}
                                    className={`aspect-square rounded overflow-hidden border-2 transition relative ${
                                       isHero 
                                          ? 'border-zinc-100 opacity-40 cursor-not-allowed' 
                                          : isInStrip 
                                             ? 'border-cyan-500 ring-2 ring-cyan-500/30' 
                                             : 'border-zinc-200 hover:border-zinc-300'
                                    }`}
                                    title={isHero ? 'Already used as hero' : isInStrip ? 'Click to remove' : 'Click to add'}
                                 >
                                    <img 
                                       src={photo.url} 
                                       alt={`Photo ${idx + 1}`}
                                       className="w-full h-full object-cover"
                                    />
                                    {isInStrip && (
                                       <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl font-bold">
                                          {stripIndexes.indexOf(idx) + 1}
                                       </div>
                                    )}
                                 </button>
                              );
                           })}
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 italic">
                           {stripIndexes.length}/3 selected
                        </p>
                     </div>
                  )}
               </div>
            ) : (
               <p className="text-xs text-zinc-400 italic">No photos available in report</p>
            )}
         </div>

         {/* 3. LAYOUT OPTIONS */}
         <div className="border-t border-zinc-100 pt-6">
            <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Layout Density</p>
            <div className="grid grid-cols-3 gap-2">
               {['compact', 'standard', 'relaxed'].map((type) => (
                  <button
                     key={type}
                     onClick={() => onSetSpacing(type as 'compact' | 'standard' | 'relaxed')}
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

         {/* 4. LOGO SCALE */}
         <div className="border-t border-zinc-100 pt-6">
            <div className="flex justify-between items-center mb-4">
               <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Logo Size</p>
               <span className="text-xs font-mono text-zinc-500">{config.logoScale}%</span>
            </div>
            <input 
               type="range" 
               min="50" 
               max="150" 
               value={config.logoScale} 
               onChange={(e) => onSetLogoScale(parseInt(e.target.value))}
               className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
               <span>Small</span>
               <span>Large</span>
            </div>
         </div>
         
         {/* 5. DEBUG TOOLS */}
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
