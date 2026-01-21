import React, { useState, useRef, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePrintConfig } from '../hooks/usePrintConfig';
import { usePageMap } from '../hooks/usePageMap';
import { PrintPreview } from '../renderers/html-preview/PrintPreview';
import { Sidebar } from './Sidebar';
import { ThumbnailNavigator } from './ThumbnailNavigator';
import { PropertiesPanel } from './PropertiesPanel';
import { OverflowWarnings } from './OverflowWarnings';
import { SelectionProvider } from '../context/SelectionContext';
import { ImagePositionProvider } from '../context/ImagePositionContext';
import { ReportData } from '../config/printConfig.types';
import { XMarkIcon, PrinterIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ProjectConfig, ProjectBaselines } from '../../../types';
// New react-pdf generation
import { usePDFGeneration, PDFPreview } from '../react-pdf';

interface Props {
  open: boolean;
  onClose: () => void;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines | null;
  onUpdateReport: (data: ReportData) => void;
}

export function PrintStudioModal({ open, onClose, reportData, projectConfig, baselines, onUpdateReport }: Props) {
  const [showPageBreakGuides, setShowPageBreakGuides] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewScale, setPreviewScale] = useState(0.7); // Default 70% scale
  const [previewMode, setPreviewMode] = useState<'edit' | 'pdf'>('edit'); // Toggle between edit and PDF preview
  const previewRef = useRef<HTMLDivElement>(null);

  // Custom sensors for drag and drop to preventing scrolling while dragging
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 1. Central Config State (with auto-save per project)
  const {
    config,
    toggleSection,
    togglePageBreak,
    toggleRowBreak,
    clearRowBreaks,
    reorderSections,
    setSpacing,
    setLogoScale,
    setHeroPhoto,
    setStripPhotos,
    toggleCoverPhotos,
    setHeroPhotoPosition,
    setStripPhotoPosition,
    setPhotoPosition,
  } = usePrintConfig(projectConfig.identity.jobNumber);

  // 2. Calculated Layout
  const pageMap = usePageMap(config, reportData, projectConfig, baselines);

  // 3. PDF Generation - Using @react-pdf/renderer for reliable output
  const { downloadPDF, isGenerating, error } = usePDFGeneration();

  const handleDownload = async () => {
    // Generate filename from project name and date
    const dateStr = reportData.weekEnding || new Date().toISOString().split('T')[0];
    const filename = `${projectConfig.identity.projectName.replace(/\s+/g, '_')}_Weekly_Report_${dateStr}.pdf`;

    await downloadPDF(config, reportData, projectConfig, baselines || undefined, pageMap, filename);
  };

  // Track scroll position to update current page indicator
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const pages = container.querySelectorAll('.preview-page');
    const containerTop = container.scrollTop + container.offsetHeight / 3;

    pages.forEach((page, index) => {
      const rect = page.getBoundingClientRect();
      const pageTop = page.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;

      if (pageTop <= containerTop && pageTop + rect.height > containerTop) {
        setCurrentPage(index + 1);
      }
    });
  }, []);

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
                  <span>Page {currentPage}</span>
                  <span>•</span>
                  <span>{projectConfig.identity.projectName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Mode Toggle */}
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('edit')}
                  className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                    previewMode === 'edit'
                      ? 'bg-brand-primary text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Edit mode - interactive preview"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode('pdf')}
                  className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                    previewMode === 'pdf'
                      ? 'bg-brand-primary text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="PDF preview - exact output"
                >
                  <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>

              {/* Zoom Controls - only in edit mode */}
              {previewMode === 'edit' && (
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))}
                    className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition"
                    title="Zoom out"
                  >
                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-400 w-10 text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))}
                    className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition"
                    title="Zoom in"
                  >
                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && <span className="text-red-400 text-sm">{error}</span>}
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold text-sm transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Workspace - Wrapped with Providers */}
          <SelectionProvider>
            <ImagePositionProvider
              config={config}
              setHeroPhotoPosition={setHeroPhotoPosition}
              setStripPhotoPosition={setStripPhotoPosition}
              setPhotoPosition={setPhotoPosition}
            >
              <div className="flex-1 flex overflow-hidden">
                {/* Thumbnail Navigator */}
                <ThumbnailNavigator
                  pageMap={pageMap}
                  currentPage={currentPage}
                  onPageSelect={setCurrentPage}
                  previewRef={previewRef}
                />

                {/* Sidebar Controls */}
                <DndContext sensors={sensors}>
                  <div className="w-80 md:w-96 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 z-10 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      <Sidebar
                        config={config}
                        reportData={reportData}
                        onToggleSection={toggleSection}
                        onReorderSections={reorderSections}
                        onSetSpacing={setSpacing}
                        onSetLogoScale={setLogoScale}
                        onSetHeroPhoto={setHeroPhoto}
                        onSetStripPhotos={setStripPhotos}
                        onToggleCoverPhotos={toggleCoverPhotos}
                        onTogglePageBreak={togglePageBreak}
                        showPageBreakGuides={showPageBreakGuides}
                        onTogglePageBreakGuides={setShowPageBreakGuides}
                      />

                      {/* Properties Panel - Shows when element selected */}
                      <div className="p-6">
                        <PropertiesPanel
                          config={config}
                          onSetHeroPhotoPosition={setHeroPhotoPosition}
                          onSetStripPhotoPosition={setStripPhotoPosition}
                          onSetPhotoPosition={setPhotoPosition}
                        />

                        {/* Overflow Warnings */}
                        <OverflowWarnings
                          previewRef={previewRef}
                          totalPages={pageMap.totalPages}
                        />
                      </div>
                    </div>
                  </div>
                </DndContext>

                {/* Preview Area */}
                <div
                  className="flex-1 overflow-auto bg-zinc-200 relative"
                  onScroll={previewMode === 'edit' ? handleScroll : undefined}
                  style={{
                    // Create visual depth with inset shadow
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {previewMode === 'edit' ? (
                    // Edit Mode - Interactive HTML Preview
                    <div
                      className="flex flex-col items-center py-8"
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        // Adjust container width to prevent horizontal scroll at small scales
                        minWidth: `calc(100% / ${previewScale})`,
                      }}
                    >
                      <PrintPreview
                        ref={previewRef}
                        config={config}
                        pageMap={pageMap}
                        reportData={reportData}
                        projectConfig={projectConfig}
                        baselines={baselines}
                        showPageBreakGuides={showPageBreakGuides}
                        onUpdateReport={onUpdateReport}
                        onToggleRowBreak={toggleRowBreak}
                      />
                      <div className="h-20" /> {/* Spacer at bottom */}
                    </div>
                  ) : (
                    // PDF Mode - React-PDF Preview (exact output)
                    <div className="w-full h-full p-4">
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                        <PDFPreview
                          config={config}
                          reportData={reportData}
                          projectConfig={projectConfig}
                          baselines={baselines || undefined}
                          pageMap={pageMap}
                          showViewer={true}
                          viewerWidth="100%"
                          viewerHeight="100%"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ImagePositionProvider>
          </SelectionProvider>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
