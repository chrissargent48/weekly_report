import React, { useMemo } from 'react';
import { ProjectConfig, WeeklyReport } from '../../../types';
import { PrintConfig } from '../config/printConfig.types';
import { AlertTriangle } from 'lucide-react';
// Section Components
import { CoverSection } from '../sections/CoverSection';
import { ExecutiveSummary } from '../sections/ExecutiveSummary';
import { WeatherSection } from '../sections/WeatherSection';
import { ProgressSection } from '../sections/ProgressSection';
import { LookAheadSection } from '../sections/LookAheadSection';
import { PhotosSection } from '../sections/PhotosSection';
import { SafetySection } from '../sections/SafetySection';

interface CanvasProps {
  zoom: number;
  showGrid: boolean;
  enabledSections: Record<string, boolean>;
  onSelectSection: (sectionId: string) => void;
  report?: WeeklyReport;
  projectConfig?: ProjectConfig;
  sectionConfigs?: Record<string, any>;
  sectionOrder?: string[];
  documentSettings?: any;
  selectedSection?: string; // Added for highlighting
}

// Simple Error Boundary for Sections
class SectionErrorBoundary extends React.Component<{ children: React.ReactNode, sectionId: string }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode, sectionId: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-red-50 text-red-600 border border-red-200 rounded">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-sm mb-1">Error Loading {this.props.sectionId}</h3>
          <p className="text-xs text-center opacity-80">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Canvas: React.FC<CanvasProps> = ({ 
  zoom, 
  showGrid, 
  enabledSections,
  onSelectSection,
  report, 
  projectConfig,
  sectionConfigs = {},
  sectionOrder = ['cover', 'executive', 'weather', 'progress', 'lookahead', 'photos', 'safety'],
  documentSettings = {},
  selectedSection
}) => {
  
  // Apply standard letter size
  const BASE_WIDTH = 612;
  const BASE_HEIGHT = 792;

  // Calculate pixel dimensions based on zoom percentage
  // Calculate pixel dimensions based on zoom percentage
  const width = (BASE_WIDTH * zoom) / 100;
  const height = (BASE_HEIGHT * zoom) / 100;

  // --- DATA NORMALIZATION & DEBUGGING ---
  const normalizedReport = useMemo(() => {
    if (!report) return undefined;

    // 1. Locate photos array from various possible locations
    const rawPhotos = report.photos || (report as any).photoLog || (report as any).media?.photos || [];

    // 2. Normalize photo objects (ensure 'url' property)
    const safePhotos = Array.isArray(rawPhotos) ? rawPhotos.map((p: any) => ({
      ...p,
      url: p.url || p.path || p.src || '', // Handle varied field names
      caption: p.caption || p.description || '',
      includedInReport: p.includedInReport ?? true // Default to true if missing
    })) : [];

    // 3. Ensure coverPhoto string
    const safeCoverPhoto = report.coverPhoto || safePhotos[0]?.url;

    return {
      ...report,
      photos: safePhotos,
      coverPhoto: safeCoverPhoto
    } as WeeklyReport;
  }, [report]);

  // Shim Baselines for Progress Section preview
  const shimBaselines = useMemo(() => {
     if (!normalizedReport?.progress?.bidItems) return null;
     
     // Construct valid MasterBidItems from weekly progress
     // This allows the Progress table to render even without full baseline data
     const bidItems = normalizedReport.progress.bidItems.map(item => ({
        id: item.itemId,
        itemNumber: item.itemNumber || '00',
        description: item.description || 'Activity',
        unit: 'LS',
        contractQty: 0, 
        unitPrice: 0,
        category: 'General'
     }));

     return {
        id: 'shim-baselines',
        projectId: 'shim',
        bidItems,
        createdAt: '',
        updatedAt: ''
     } as any; 
  }, [normalizedReport]);

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-gray-300 flex flex-col items-center py-8 space-y-8 scroll-smooth custom-scrollbar">
      {sectionOrder.map(sectionId => {
        // Only render enabled sections
        if (!enabledSections[sectionId]) return null;

        const isSelected = selectedSection === sectionId;

        return (
          <div
            key={sectionId}
            onClick={(e) => {
              e.stopPropagation(); // Prevent bubbling if needed
              onSelectSection(sectionId);
            }}
            className={`bg-white relative cursor-pointer transition-all duration-200 shrink-0 overflow-hidden group
              ${isSelected 
                ? 'ring-4 ring-offset-4 shadow-2xl z-10' 
                : 'hover:ring-4 hover:ring-opacity-50 shadow-lg hover:shadow-xl'
              }
            `}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              paddingTop: `${(documentSettings?.defaultMargins?.top || 24) * zoom / 100}px`,
              paddingBottom: `${(documentSettings?.defaultMargins?.bottom || 24) * zoom / 100}px`,
              paddingLeft: `${(documentSettings?.defaultMargins?.left || 24) * zoom / 100}px`,
              paddingRight: `${(documentSettings?.defaultMargins?.right || 24) * zoom / 100}px`,
              // Dynamic brand color for ring
              ['--tw-ring-color' as any]: documentSettings?.branding?.primaryColor || '#2dd4bf' // Default teal-400
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-20 opacity-20 mix-blend-multiply"
                style={{ 
                  backgroundImage: `linear-gradient(to right, #008B8B 1px, transparent 1px), 
                                    linear-gradient(to bottom, #008B8B 1px, transparent 1px)`,
                  backgroundSize: `${20 * (zoom/100)}px ${20 * (zoom/100)}px` 
                }} 
              />
            )}

            {/* Real WYSIWYG Content */}
            <div className="w-full h-full overflow-hidden">
             <SectionErrorBoundary sectionId={sectionId}>
                {/* 
                  Shim a PrintConfig object to satisfy the props.
                  We mix globally available settings with defaults.
                */}
                {(() => {
                  const shimConfig: PrintConfig = {
                    sections: [], // Not used by individual components usually
                    spacing: {
                      type: 'standard',
                      sectionGap: 24,
                      elementGap: 12,
                      tablePadding: 8,
                      ...documentSettings?.spacing
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
                    branding: documentSettings?.branding // Pass branding down
                  };

                  // If data is missing
                  if (!normalizedReport) {
                    return (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                         No Data available
                       </div>
                    );
                  }

                  // Default values if props are missing
                  // Cast to unknown first to avoid "sufficient overlap" error, then to ProjectConfig
                  const safeProjectConfig = (projectConfig || {
                    id: 'default',
                    identity: { 
                      projectName: 'Project', 
                      location: 'Location',
                      subtitle: '',
                      jobNumber: '00-00000'
                    },
                    personnel: {},
                    contract: {},
                    distributionList: []
                  }) as unknown as ProjectConfig;

                  const data = normalizedReport as WeeklyReport;

                  // Mock placement for Canvas view (full section visible)
                  const mockPlacement = {
                    sectionId: sectionId,
                    startsOnPage: 1,
                    estimatedHeight: 0,
                    continuesFromPrevious: false,
                    renderConfig: { showHeader: true, showFooter: true }
                  };

                   return (() => {
                         switch(sectionId) {
                           case 'cover':
                             return (
                                  <CoverSection
                                    config={shimConfig}
                                    reportData={data}
                                    projectConfig={safeProjectConfig}
                                  />
                             );
                           case 'executive':
                             return (
                                <ExecutiveSummary
                                  config={shimConfig}
                                  reportData={data}
                                />
                             );
                           case 'weather':
                             return (
                                <WeatherSection
                                  config={shimConfig}
                                  reportData={data}
                                  placement={mockPlacement}
                                />
                             );
                           case 'progress':
                             return (
                                <ProgressSection
                                  config={shimConfig}
                                  reportData={data}
                                  placement={mockPlacement}
                                  projectConfig={safeProjectConfig}
                                  baselines={shimBaselines}
                                />
                             );
                           case 'lookahead':
                             return (
                                <LookAheadSection
                                  config={shimConfig}
                                  reportData={data}
                                  placement={mockPlacement}
                                />
                             );
                           case 'photos':
                             return (
                                  <PhotosSection
                                    config={shimConfig}
                                    reportData={data}
                                    placement={mockPlacement}
                                  />
                             );
                           case 'safety':
                             return (
                                <SafetySection
                                  config={shimConfig}
                                  reportData={data}
                                  placement={mockPlacement}
                                />
                             );
                           default:
                             return (
                               <div className="w-full h-full flex flex-col items-center justify-center p-8 text-gray-300">
                                  <span className="text-xl font-bold uppercase tracking-widest">{sectionId}</span>
                                  <span className="text-xs">No preview available</span>
                               </div>
                             );
                         }
                       })();
                })()}
              </SectionErrorBoundary>
            </div>

            {/* Selection/Hover Indicator */}
            <div className="absolute -left-24 top-0 w-20 text-right pr-4 pt-2 hidden group-hover:block">
                <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded">
                    {sectionId}
                </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
