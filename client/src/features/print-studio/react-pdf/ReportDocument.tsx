import React, { useMemo } from 'react';
import { Document, Page, View, StyleSheet } from '@react-pdf/renderer';
import { marginsPxToPt } from '../utils/layoutUtils';
import { CoverSection } from './sections/CoverSection';
import { WeatherSection } from './sections/WeatherSection';
import { ExecutiveSection } from './sections/ExecutiveSection';
import { ProgressSection } from './sections/ProgressSection';
import { PhotosSection } from './sections/PhotosSection';
import { SafetySection } from './sections/SafetySection';
import { LookAheadSection } from './sections/LookAheadSection';
import { PageHeader } from './components/PageHeader';
import { PageFooter } from './components/PageFooter';
import { PrintConfig, PageMap } from '../config/printConfig.types';
import { WeeklyReport, ProjectConfig } from '../../../types';

interface ReportDocumentProps {
  reportData: WeeklyReport;
  sectionConfigs?: Record<string, any>;
  documentSettings?: any;
  projectConfig: ProjectConfig;
  config: PrintConfig;
  pageMap: PageMap;
}

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  contentPage: {
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingBottom: 50,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
});

/**
 * Map from section IDs to react-pdf components.
 * IDs are unified with the UI (executive, personnel, etc.)
 */
const PDF_SECTION_MAP: Record<string, React.ComponentType<any>> = {
  executive: ExecutiveSection,
  weather: WeatherSection,
  progress: ProgressSection,
  safety: SafetySection,
  lookahead: LookAheadSection,
  photos: PhotosSection,
};

/** Extract the base section ID (e.g. 'safety' from 'safety_continued_2') */
function getBaseSectionId(sectionId: string): string {
  return sectionId.replace(/_continued_\d+$/, '').replace(/_footer$/, '');
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({
  reportData,
  sectionConfigs = {},
  documentSettings = {},
  projectConfig,
  config,
  pageMap,
}) => {
  const pdfDocSettings = useMemo(() => {
    const raw = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
    return {
      ...documentSettings,
      defaultMargins: marginsPxToPt(raw),
    };
  }, [documentSettings]);

  const projectName = projectConfig.identity?.projectName || 'Weekly Report';

  return (
    <Document>
      {pageMap.pages.map((page) => {
        // Cover page
        if (page.isFirstPage) {
          return (
            <Page key={page.pageNumber} size="LETTER" style={styles.coverPage}>
              <CoverSection
                config={config}
                reportData={reportData}
                projectConfig={projectConfig}
                sectionConfig={sectionConfigs.cover}
              />
            </Page>
          );
        }

        // Content pages
        return (
          <Page key={page.pageNumber} size="LETTER" style={styles.contentPage}>
            <PageHeader projectConfig={projectConfig} weekEnding={reportData.weekEnding} />

            {page.sections.map((placement) => {
              const baseId = getBaseSectionId(placement.sectionId);
              const Component = PDF_SECTION_MAP[baseId];
              if (!Component) return null;

              const padding = config.sectionPadding?.[baseId];

              return (
                <View
                  key={placement.sectionId}
                  style={{
                    paddingTop: padding?.top || 0,
                    paddingBottom: padding?.bottom || 0,
                  }}
                >
                  <Component
                    reportData={reportData}
                    sectionConfig={sectionConfigs[baseId] || {}}
                    documentSettings={pdfDocSettings}
                    placement={placement}
                  />
                </View>
              );
            })}

            <PageFooter projectName={projectName} />
          </Page>
        );
      })}
    </Document>
  );
};
