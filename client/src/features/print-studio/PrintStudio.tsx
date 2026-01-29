import React, { useState, useRef, useEffect } from 'react';
import { 
  Undo, Redo, ZoomOut, ZoomIn, Grid3X3, Eye, Check, Download,
  ChevronLeft, AlertCircle
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; 
import { SectionPalette } from './components/SectionPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { WeeklyReport, ProjectConfig } from '../../types';
import { ReportDocument } from './react-pdf/ReportDocument'; 
import { mapReportData } from './utils/dataMapper'; 
import { useAutoSave } from './hooks/useAutoSave';
import { SelectionProvider } from './context/SelectionContext';
import { ImagePositionProvider } from './context/ImagePositionContext';
import { PrintConfig } from './config/printConfig.types';

interface PrintStudioProps {
  onBack?: () => void;
  report?: WeeklyReport;
  projectConfig?: ProjectConfig;
  onUpdate?: (updatedReport: WeeklyReport) => void;
  projectId?: string;
}

interface DocumentSettings {
  defaultMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  applyToAll: boolean;
  spacing?: Partial<PrintConfig['spacing']>;
  logoScale?: number;
  logoAlign?: 'left' | 'center' | 'right';
  showPageNumbers?: boolean;
  showFooter?: boolean;
}

export const PrintStudio: React.FC<PrintStudioProps> = ({ 
  onBack, 
  report,
  projectConfig,
  onUpdate,
  projectId
}) => {
  // --- State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(65);
  
  React.useEffect(() => {
    // Auto-zoom to fit page on mount
    if (containerRef.current) {
      const availableWidth = containerRef.current.clientWidth;
      const padding = 60; // ~30px padding on each side
      const baseWidth = 612; // Letter size pt
      
      let targetZoom = ((availableWidth - padding) / baseWidth) * 100;
      // Clamp between reasonable limits (e.g. 50% to 150%)
      targetZoom = Math.max(50, Math.min(targetZoom, 150));
      
      setZoom(Math.floor(targetZoom));
    }
  }, []);

  const [showGrid, setShowGrid] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('document');
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => 
    report?.printSettings?.documentSettings || {
      defaultMargins: {
        top: 24,
        bottom: 24,
        left: 24,
        right: 24,
      },
      applyToAll: true,
    }
  );

  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>(() => 
    report?.printSettings?.enabledSections || {
      cover: true,
      executive: true,
      weather: true,
      progress: true,
      lookahead: false,
      photos: true,
      personnel: false,
      equipment: false,
      safety: true,
      financials: false,
    }
  );

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => 
    report?.printSettings?.sectionOrder || [
      'cover', 'executive', 'weather', 'progress', 'lookahead', 'photos', 'personnel', 'equipment', 'safety', 'financials'
    ]
  );
  
  const [isSaving, setIsSaving] = useState(false);

  const [sectionConfigs, setSectionConfigs] = useState<Record<string, any>>(() => 
    report?.printSettings?.sectionConfigs || {
      cover: {
        subtitle: '2024 Site Improvements',
        showPhotoGrid: true,
        showSafetyQuote: true,
        heroOverlayColor: '#008B8B',
        marginTop: 0,
        marginBottom: 0,
        coverPhotos: [null, null, null],
        dividerLine: {
          show: true,
          color: '#008B8B',
          width: 100,
          thickness: 2,
        }
      },
      weather: {
        showSummary: true,
        tempUnit: 'F',
        showWorkImpact: true,
        marginTop: 0,
        marginBottom: 0,
      },
      executive: {
        marginTop: 0,
        marginBottom: 0,
      },
      progress: {
        showPercent: true,
        showNotes: true,
        marginTop: 0,
        marginBottom: 0,
      },
      photos: {
        columns: 2,
        showCaptions: true,
        showDates: true,
        marginTop: 0,
        marginBottom: 0,
      },
      safety: {
        showTable: true,
        showCards: true,
        marginTop: 0,
        marginBottom: 0,
      }
    }
  );

  // --- Stable PrintConfig for the hoisted ImagePositionProvider ---
  const shimPrintConfig: PrintConfig = React.useMemo(() => ({
    sections: [],
    spacing: {
      type: documentSettings?.spacing?.type || 'standard',
      sectionGap: documentSettings?.spacing?.sectionGap ?? 24,
      elementGap: documentSettings?.spacing?.elementGap ?? 12,
      tablePadding: documentSettings?.spacing?.tablePadding ?? 8,
    },
    logoScale: documentSettings?.logoScale || 100,
    logoAlign: documentSettings?.logoAlign || 'left',
    heroPhotoIndex: sectionConfigs?.cover?.heroPhotoId ? 0 : null,
    heroPhotoPosition: { x: 50, y: 50 },
    stripPhotoIndexes: [],
    stripPhotoPositions: {},
    photoPositions: {},
    showPageNumbers: documentSettings?.showPageNumbers ?? true,
    showFooter: documentSettings?.showFooter ?? true,
    showCoverPhotos: sectionConfigs?.cover?.showPhotoGrid ?? true,
  }), [documentSettings, sectionConfigs]);

  // No-op setters for the hoisted ImagePositionProvider (Canvas is read-only preview)
  const noOp = React.useCallback(() => {}, []);

  // Combine settings into single object for the hook
  const printSettings = React.useMemo(() => ({
    enabledSections,
    sectionOrder,
    sectionConfigs,
    documentSettings,
  }), [enabledSections, sectionOrder, sectionConfigs, documentSettings]);

  // Auto-save whenever settings change
  useAutoSave(projectId, report?.weekEnding, printSettings, setSaveStatus);

  const updateSectionConfig = (sectionId: string, updates: any) => {
    setSectionConfigs(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...updates
      }
    }));
  };

  // --- Handlers ---
  const handleZoomIn = () => setZoom(prev => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom(prev => Math.max(30, prev - 10));

  const handleGeneratePDF = async () => {
    if (!report || !projectConfig) {
      console.log('Missing data:', { report: !!report, projectConfig: !!projectConfig });
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Starting PDF generation...');

      // Helper to convert image URL to base64
      const imageUrlToBase64 = async (url: string): Promise<string | null> => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;

        try {
          // If it's a relative URL starting with /uploads, prepend the server base
          // This is needed because the frontend runs on port 5173 but images are on port 3000
          const API_BASE = 'http://localhost:3000';
          const fetchUrl = url.startsWith('/uploads') ? `${API_BASE}${url}` : url;

          console.log('[PDF] Fetching image:', fetchUrl.substring(0, 80) + '...');
          const response = await fetch(fetchUrl);

          if (!response.ok) {
            console.warn('[PDF] Failed to fetch image, status:', response.status);
            return null;
          }

          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('[PDF] Failed to convert image to base64:', url, e);
          return null;
        }
      };

      // 1. Prepare Project Config with Base64 Logo
      let pdfProjectConfig = { ...projectConfig };
      const originalLogoUrl = projectConfig.identity?.logoUrl;

      if (originalLogoUrl) {
         console.log('Converting logo to base64...');
         const logoBase64 = await imageUrlToBase64(originalLogoUrl);

         if (logoBase64) {
           pdfProjectConfig = {
             ...projectConfig,
             identity: {
               ...projectConfig.identity,
               logoUrl: logoBase64
             }
           };
           console.log('[PDF] Logo converted successfully, length:', logoBase64.length);
         } else {
           console.warn('[PDF] Logo conversion returned null, using original');
         }
      }

      // 2. Prepare Report with Base64 Photos
      let pdfReport = { ...report };
      if (report.photos && report.photos.length > 0) {
        console.log(`Converting ${report.photos.length} photos to base64...`);
        const processedPhotos = await Promise.all(report.photos.map(async (p) => {
           const base64Url = await imageUrlToBase64(p.url);
           return {
             ...p,
             url: base64Url || p.url
           };
        }));

        pdfReport = {
          ...report,
          photos: processedPhotos
        };
        console.log('Photos converted successfully');
      }

      console.log('Sections enabled:', enabledSections);

      const reportData = mapReportData(pdfReport, pdfProjectConfig, sectionConfigs);
      console.log('Report Data mapped:', {
        projectName: reportData.projectName,
        logoUrlLength: reportData.logoUrl?.length || 0,
        logoUrlStart: reportData.logoUrl?.substring(0, 30),
        heroPhotoId: sectionConfigs.cover?.heroPhotoId
      });
      
      const blob = await pdf(
        <ReportDocument 
          data={reportData} 
          enabledSections={enabledSections} 
          sectionConfigs={sectionConfigs}
          sectionOrder={sectionOrder}
          documentSettings={documentSettings}
        />
      ).toBlob();
      
      console.log('Blob created:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }
      
      // Open PDF in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Console log for debug
      const filename = `${reportData.projectName.replace(/[^a-z0-9]/gi, '_')}_${report.weekEnding}.pdf`;
      console.log('PDF ready:', filename, blob.size, 'bytes');
      
      // Clean up after delay
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Resizable Sidebars ---
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(208);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(224);
  const isResizing = useRef<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      if (isResizing.current === 'left') {
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(200, Math.min(500, startWidth.current + delta));
        setLeftSidebarWidth(newWidth);
      } else { // right
        // For right sidebar, moving left (decreasing x) increases width
        const delta = startX.current - e.clientX; 
        const newWidth = Math.max(200, Math.min(500, startWidth.current + delta));
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []); // Intentionally empty deps as refs are used

  const startResize = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    isResizing.current = side;
    startX.current = e.clientX;
    startWidth.current = side === 'left' ? leftSidebarWidth : rightSidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <SelectionProvider>
    <ImagePositionProvider
      config={shimPrintConfig}
      setHeroPhotoPosition={noOp}
      setStripPhotoPosition={noOp}
      setPhotoPosition={noOp}
      setPhotoZoom={noOp}
      setPhotoCrop={noOp}
    >
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 text-sm overflow-hidden font-sans">

      {/* 1. Top Toolbar */}
      <div className="h-11 bg-white border-b border-gray-200 flex items-center px-3 gap-1.5 shrink-0 z-20 shadow-sm">
        
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="mr-2 p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Undo/Redo Group */}
        <div className="flex items-center gap-0.5 pr-3 border-r border-gray-200">
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400" disabled>
            <Undo size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400" disabled>
            <Redo size={16} />
          </button>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          <button onClick={handleZoomOut} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-medium w-10 text-center text-gray-600 select-none">
            {zoom}%
          </span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <ZoomIn size={14} />
          </button>
        </div>

        {/* View Options */}
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
            showGrid ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <Grid3X3 size={14} /> Grid
        </button>

        <button className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1 text-xs text-gray-500">
          <Eye size={14} /> Preview
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status & Actions */}
        <div className="text-xs text-gray-400 flex items-center gap-1 mr-4">
          {saveStatus === 'saving' && (
            <span className="animate-pulse">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={12} className="text-green-500" /> Saved
            </>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 flex items-center gap-1">
               <AlertCircle size={12} /> Save failed
            </span>
          )}
        </div>

        <button 
          onClick={handleGeneratePDF}
          disabled={!report || !projectConfig || isSaving}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center gap-1.5 text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> {isSaving ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>

      {/* 2. Main Content Grid (3-Panel Layout) */}
      <div 
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: `${leftSidebarWidth}px 1fr ${rightSidebarWidth}px` }}
      >
        
        {/* Left Panel: Section Palette */}
        <div className="bg-white border-r border-gray-200 overflow-hidden flex flex-col relative group">
          <SectionPalette 
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            enabledSections={enabledSections}
            onToggleSection={(id) => setEnabledSections(prev => ({...prev, [id]: !prev[id]}))}
            sectionOrder={sectionOrder}
            onReorder={setSectionOrder}
          />
          {/* Right Handle for Left Panel */}
          <div 
            onMouseDown={startResize('left')}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-teal-500/20 z-50 transition-colors opacity-0 group-hover:opacity-100"
          />
        </div>

        {/* Center Panel: Canvas */}
        <div 
          ref={containerRef}
          className="bg-gray-400/20 overflow-hidden relative flex flex-col items-center"
        >
             <Canvas
                 zoom={zoom}
                 showGrid={showGrid}
                 enabledSections={enabledSections}
                  onSelectSection={setSelectedSection}
                  report={report || undefined}
                  projectConfig={projectConfig || undefined}
                  sectionConfigs={sectionConfigs}
                  sectionOrder={sectionOrder}
                  documentSettings={documentSettings}
                />
        </div>

        {/* Right Panel: Properties */}
        <div className="bg-white border-l border-gray-200 overflow-hidden flex flex-col relative group">
          {/* Left Handle for Right Panel */}
          <div 
            onMouseDown={startResize('right')}
            className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-teal-500/20 z-50 transition-colors opacity-0 group-hover:opacity-100"
          />
          <PropertiesPanel 
            selectedSection={selectedSection}
            report={report || undefined}
            projectConfig={projectConfig || undefined}
            onUpdateReport={onUpdate}
            enabledSections={enabledSections}
            onToggleSection={(id: string) => {
              if (id === 'document') {
                setSelectedSection('document');
              } else {
                setEnabledSections(prev => ({...prev, [id]: !prev[id]}));
              }
            }}
            config={sectionConfigs[selectedSection]}
            onUpdateConfig={(updates: any) => updateSectionConfig(selectedSection, updates)}
            documentSettings={documentSettings}
            onUpdateDocumentSettings={(updates: any) => setDocumentSettings(prev => ({ ...prev, ...updates }))}
          />
        </div>

      </div>
    </div>
    </ImagePositionProvider>
    </SelectionProvider>
  );
};
