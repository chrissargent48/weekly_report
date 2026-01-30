import React, { useMemo } from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../utils/dataMapper';
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
import { PrintConfig } from '../config/printConfig.types';
import { WeeklyReport, ProjectConfig } from '../../../types';

interface ReportDocumentProps {
  data: ReportData;
  enabledSections: Record<string, boolean>;
  sectionConfigs?: Record<string, any>;
  sectionOrder?: string[];
  documentSettings?: any;
  projectConfig?: ProjectConfig;
  printConfig?: PrintConfig;
  report?: WeeklyReport;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0, // Sections handle their own padding
  },
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

export const ReportDocument: React.FC<ReportDocumentProps> = ({
  data,
  enabledSections,
  sectionConfigs = {},
  sectionOrder = ['cover', 'executive', 'safety', 'weather', 'progress', 'lookahead', 'photos'],
  documentSettings = {},
  projectConfig,
  printConfig,
  report,
}) => {
  // Convert CSS-pixel margins (96 DPI) → PDF points (72 DPI) so the PDF
  // matches the Canvas preview exactly.
  const pdfDocSettings = useMemo(() => {
    const raw = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
    return {
      ...documentSettings,
      defaultMargins: marginsPxToPt(raw),
    };
  }, [documentSettings]);

  const projectName = data.projectName || 'Weekly Report';

  return (
    <Document>
      {sectionOrder.map(sectionId => {
        if (!enabledSections[sectionId]) return null;

        switch (sectionId) {
          case 'cover':
            // Use CoverSection which matches the HTML preview layout
            if (projectConfig && report) {
              return (
                <Page key="cover" size="LETTER" style={styles.coverPage}>
                  <CoverSection
                    config={printConfig || {
                      sections: [],
                      spacing: { type: 'standard', sectionGap: 24, elementGap: 12, tablePadding: 8 },
                      logoScale: 100,
                      logoAlign: 'left',
                      heroPhotoIndex: 0,
                      heroPhotoPosition: { x: 50, y: 50 },
                      stripPhotoIndexes: [1, 2, 3],
                      stripPhotoPositions: {},
                      photoPositions: {},
                      showPageNumbers: true,
                      showFooter: true,
                      showCoverPhotos: sectionConfigs?.cover?.showPhotoGrid ?? true,
                    } as PrintConfig}
                    reportData={report}
                    projectConfig={projectConfig}
                  />
                </Page>
              );
            }
            // Fallback if no projectConfig/report - shouldn't happen
            return null;

          case 'executive':
            return (
              <Page key="executive" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <ExecutiveSection data={data} config={sectionConfigs.executive} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          case 'safety':
            return (
              <Page key="safety" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <SafetySection data={data} config={sectionConfigs.safety} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          case 'weather':
            return (
              <Page key="weather" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <WeatherSection data={data} config={sectionConfigs.weather} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          case 'progress':
            return (
              <Page key="progress" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <ProgressSection data={data} config={sectionConfigs.progress} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          case 'lookahead':
            return (
              <Page key="lookahead" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <LookAheadSection data={data} config={sectionConfigs.lookahead} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          case 'photos':
            return (
              <Page key="photos" size="LETTER" style={styles.contentPage}>
                {projectConfig && (
                  <PageHeader projectConfig={projectConfig} weekEnding={data.reportDate} />
                )}
                <PhotosSection data={data} config={sectionConfigs.photos} documentSettings={pdfDocSettings} />
                <PageFooter projectName={projectName} />
              </Page>
            );
          default:
            return null;
        }
      })}
    </Document>
  );
};
