import React, { forwardRef } from 'react';
import { PrintConfig, PageMap, ReportData } from '../../config/printConfig.types';
import { PreviewPage } from './PreviewPage';
import { LayoutDebugView } from '../../../../components/Print/LayoutDebugView';
import { layoutApi } from '../../../../services/layoutApi';
import { ReportLayout } from '../../../../../../server/types';

// Import all section components using index files
// (Ideally we'd have a barrel file, but importing directly for now)
import { CoverSection } from '../../sections/CoverSection';
import { ExecutiveSummary } from '../../sections/ExecutiveSummary';
import { WeatherSection } from '../../sections/WeatherSection';
import { ProgressSection } from '../../sections/ProgressSection';
import { LookAheadSection } from '../../sections/LookAheadSection';
import { ManpowerSection } from '../../sections/ManpowerSection';
import { EquipmentSection } from '../../sections/EquipmentSection';
import { MaterialsSection } from '../../sections/MaterialsSection';
import { ProcurementSection } from '../../sections/ProcurementSection';
import { SafetySection } from '../../sections/SafetySection';
import { FinancialsSection } from '../../sections/FinancialsSection';
import { ScheduleSection } from '../../sections/ScheduleSection';
import { IssuesSection } from '../../sections/IssuesSection';
import { PhotosSection } from '../../sections/PhotosSection';

import { ProjectConfig, ProjectBaselines } from '../../../../types';

interface PrintPreviewProps {
  config: PrintConfig;
  pageMap: PageMap;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines | null;
  sectionConfigs?: Record<string, any>;
  showPageBreakGuides?: boolean;
  totalPages?: number;
  onUpdateReport?: (data: ReportData) => void;
  onToggleRowBreak?: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
  onEditPhoto?: (photoId: string, url: string) => void;
  onSelectSection?: (sectionId: string) => void;
  selectedSection?: string;
}

// Map section IDs to their components
import { KeyPersonnelSection } from '../../sections/KeyPersonnelSection';

// ... (existing imports)

// Map layout-engine section IDs back to sectionConfigs keys
const SECTION_CONFIG_KEY_MAP: Record<string, string> = {
  overview: 'executive',
  key_personnel: 'personnel',
};

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  key_personnel: KeyPersonnelSection,
  overview: ExecutiveSummary,
  weather: WeatherSection,
  progress: ProgressSection,
  lookahead: LookAheadSection,
  manpower: ManpowerSection,
  equipment: EquipmentSection,
  materials: MaterialsSection,
  procurement: ProcurementSection,
  safety: SafetySection,
  financials: FinancialsSection,
  schedule: ScheduleSection,
  issues: IssuesSection,
  photos: PhotosSection,
};

/**
 * Main preview component that renders all pages based on the page map.
 * Uses forwardRef to allow parent to capture the container for PDF generation.
 */
export const PrintPreview = forwardRef<HTMLDivElement, PrintPreviewProps>(function PrintPreview(
  {
    config,
    pageMap,
    reportData,
    projectConfig,
    baselines,
    sectionConfigs,
    showPageBreakGuides = false,
    onUpdateReport,
    onToggleRowBreak,
    onEditPhoto,
    onSelectSection,
    selectedSection,
  },
  ref
) {
  const totalPages = pageMap.pages.length;
  const [debugLayout, setDebugLayout] = React.useState<ReportLayout | null>(null);
  const [isDebugLoading, setIsDebugLoading] = React.useState(false);

  const toggleDebug = async () => {
    if (debugLayout) {
        setDebugLayout(null);
        return;
    }

    setIsDebugLoading(true);
    try {
        const fullReport: any = {
            ...reportData,
            id: reportData.id || 'preview-id', 
        };
        
        const layout = await layoutApi.calculateLayout(fullReport);
        setDebugLayout(layout);
    } catch (e) {
        console.error("Failed to fetch layout:", e);
        alert("Failed to calculate server layout. See console.");
    } finally {
        setIsDebugLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
        <div className="fixed bottom-4 right-4 z-50 print:hidden">
            <button 
                onClick={toggleDebug}
                className={`px-4 py-2 rounded shadow-lg font-bold text-white transition-colors ${debugLayout ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
                {isDebugLoading ? 'Calculating...' : debugLayout ? 'Disable Layout Debug' : 'Debug Server Layout'}
            </button>
        </div>

    <div
      ref={ref}
      className="print-preview-container flex flex-col items-center min-h-full gap-8"
      style={{
        // Remove padding for PDF capture - each page handles its own margins
        padding: 0,
        position: 'relative' // Needed for absolute overlay
      }}
    >
      {debugLayout && (
          <LayoutDebugView layout={debugLayout} />
      )}
      {pageMap.pages.map((page, index) => (
        <PreviewPage
          key={page.pageNumber}
          page={page}
          showPageBreakGuide={showPageBreakGuides}
          footerText={projectConfig.identity.projectName}
          totalPages={totalPages}
          isLastPage={index === pageMap.pages.length - 1}
          projectConfig={projectConfig}
          weekEnding={reportData.weekEnding}
        >
          {/* First page includes cover section */}
          {page.isFirstPage && (
            <CoverSection
              config={config}
              reportData={reportData}
              projectConfig={projectConfig}
              sectionConfig={sectionConfigs?.cover}
            />
          )}

          {/* Render sections assigned to this page */}
          {page.sections.map((placement) => {
            // Handle continued sections (like photos spanning pages)
            // e.g. 'photos_continued_1' -> 'photos'
            const baseId = placement.sectionId.split('_continued_')[0];
            const SectionComponent = SECTION_COMPONENTS[baseId];

            if (!SectionComponent) {
              // Graceful fallback for unknown sections
              return null;
            }

            const isSelected = selectedSection === baseId;
            // Get brand color
            const brandColor = config.branding?.primaryColor || '#008B8B';
            // Section padding from config
            const sectionPad = config.sectionPadding?.[baseId];

            return (
              <div
                key={placement.sectionId}
                className={`relative transition-all duration-200 ${isSelected ? 'z-10' : ''}`}
                style={{
                  paddingTop: sectionPad?.top || 0,
                  paddingBottom: sectionPad?.bottom || 0,
                }}
                onClick={(e) => {
                   e.stopPropagation();
                   onSelectSection?.(baseId);
                }}
              >
                  {/* Selection Ring */}
                  {isSelected && (
                    <div 
                      className="absolute inset-0 pointer-events-none border-[3px] rounded bg-teal-50/5"
                      style={{ borderColor: brandColor }}
                    />
                  )}
                  
                  {/* Hover Indicator */}
                  {!isSelected && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 border-2 border-dashed border-gray-300 pointer-events-none rounded transition-opacity" />
                  )}

                  <SectionComponent
                    config={config}
                    reportData={reportData}
                    projectConfig={projectConfig}
                    baselines={baselines}
                    placement={placement}
                    sectionConfig={sectionConfigs?.[SECTION_CONFIG_KEY_MAP[baseId] || baseId]}
                    onUpdateReport={onUpdateReport}
                    onToggleRowBreak={onToggleRowBreak}
                    onEditPhoto={onEditPhoto}
                  />
              </div>
            );
          })}
        </PreviewPage>
      ))}
    </div>
    </div>
  );
});


