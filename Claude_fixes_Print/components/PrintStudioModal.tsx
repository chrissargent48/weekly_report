import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePrintConfig } from '../hooks/usePrintConfig';
import { usePageMap } from '../hooks/usePageMap';
import { PrintPreview } from '../renderers/html-preview/PrintPreview';
import { Sidebar } from './Sidebar';
import { ReportData } from '../config/printConfig.types';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ProjectConfig, WeeklyReport } from '../../../types';
import { usePDFGeneration } from '../hooks/usePDFGeneration';

interface Props {
  open: boolean;
  onClose: () => void;
  reportData: ReportData;
  projectConfig: ProjectConfig;
}

export function PrintStudioModal({ open, onClose, reportData, projectConfig }: Props) {
  const [showPageBreakGuides, setShowPageBreakGuides] = useState(false);
  
  // Custom sensors for drag and drop to preventing scrolling while dragging
  const sensors = useSensors(
     useSensor(PointerSensor),
     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 1. Central Config State
  const {
    config,
    toggleSection,
    reorderSections,
    setSpacing,
    setLogoScale,
    setHeroPhoto,
    setStripPhotos,
    toggleCoverPhotos,
  } = usePrintConfig();
  
  // 2. Calculated Layout
  const pageMap = usePageMap(config, reportData);
  
  // 3. PDF Generation
  const { generatePDF, isGenerating, error } = usePDFGeneration();

  const handleDownload = async () => {
    // Cast reportData to WeeklyReport since they should match structurally
    const report = reportData as unknown as WeeklyReport;
    await generatePDF(report, projectConfig, config, pageMap);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 h-screen w-screen" onClose={onClose}>
        <div className="fixed inset-0 bg-zinc-900/95" aria-hidden="true" />
        
        <div className="fixed inset-0 overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-zinc-900 text-white h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-800">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-primary/20 rounded-lg text-brand-primary">
                     <PrinterIcon className="w-6 h-6" />
                  </div>
                  <div>
                     <h1 className="text-lg font-bold">Print Studio</h1>
                     <div className="text-xs text-zinc-400 flex gap-2">
                        <span>{pageMap.totalPages} Pages</span>
                        <span>•</span>
                        <span>{projectConfig.identity.projectName}</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {error && (
                     <span className="text-red-400 text-sm">{error}</span>
                  )}
                  <button 
                     onClick={handleDownload}
                     disabled={isGenerating}
                     className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold text-sm transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {isGenerating ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition">
                     <XMarkIcon className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
               {/* Sidebar Controls */}
               <DndContext sensors={sensors}> 
                  <Sidebar 
                     config={config}
                     reportData={reportData}  {/* THIS WAS MISSING! Needed for photo thumbnails */}
                     onToggleSection={toggleSection}
                     onReorderSections={reorderSections}
                     onSetSpacing={setSpacing}
                     onSetLogoScale={setLogoScale}
                     onSetHeroPhoto={setHeroPhoto}
                     onSetStripPhotos={setStripPhotos}
                     onToggleCoverPhotos={toggleCoverPhotos}
                     showPageBreakGuides={showPageBreakGuides}
                     onTogglePageBreakGuides={setShowPageBreakGuides}
                  />
               </DndContext>

               {/* Preview Area */}
               <div className="flex-1 overflow-y-auto bg-zinc-100/50 p-8 relative flex flex-col items-center">
                  <PrintPreview
                     config={config}
                     pageMap={pageMap}
                     reportData={reportData}
                     projectConfig={projectConfig}
                     showPageBreakGuides={showPageBreakGuides}
                  />
                  <div className="h-20" /> {/* Spacer at bottom */}
               </div>
            </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
