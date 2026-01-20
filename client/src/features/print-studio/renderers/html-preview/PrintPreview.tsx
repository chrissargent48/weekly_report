import React from 'react';
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

import { ProjectConfig } from '../../../../types';

interface PrintPreviewProps {
  config: PrintConfig;
  pageMap: PageMap;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  showPageBreakGuides?: boolean;
}

// Map section IDs to their components
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
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
 */
export function PrintPreview({
  config,
  pageMap,
  reportData,
  projectConfig,
  showPageBreakGuides = false,
}: PrintPreviewProps) {
  return (
    <div className="print-preview-container flex flex-col items-center py-8 bg-zinc-100/50 min-h-full">
      {pageMap.pages.map((page) => (
        <PreviewPage
          key={page.pageNumber}
          page={page}
          showPageBreakGuide={showPageBreakGuides}
          footerText={projectConfig.identity.projectName}
        >
          {/* First page includes cover section */}
          {page.isFirstPage && (
            <CoverSection
              config={config}
              reportData={reportData}
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
                placement={placement}
              />
            );
          })}
        </PreviewPage>
      ))}
    </div>
  );
}
