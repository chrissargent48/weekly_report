import React, { forwardRef } from 'react';
import { PrintConfig, PageMap, ReportData } from '../../config/printConfig.types';
import { PreviewPage } from './PreviewPage';

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
  showPageBreakGuides?: boolean;
  totalPages?: number;
  onUpdateReport?: (data: ReportData) => void;
}

// Map section IDs to their components
import { KeyPersonnelSection } from '../../sections/KeyPersonnelSection';

// ... (existing imports)

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
    showPageBreakGuides = false,
    onUpdateReport,
  },
  ref
) {
  const totalPages = pageMap.pages.length;

  return (
    <div
      ref={ref}
      className="print-preview-container flex flex-col items-center min-h-full gap-8"
      style={{
        // Remove padding for PDF capture - each page handles its own margins
        padding: 0,
      }}
    >
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

            return (
              <SectionComponent
                key={placement.sectionId}
                config={config}
                reportData={reportData}
                projectConfig={projectConfig}
                baselines={baselines}
                placement={placement}
                onUpdateReport={onUpdateReport}
              />
            );
          })}
        </PreviewPage>
      ))}
    </div>
  );
});


