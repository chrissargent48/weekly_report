import React, { useMemo } from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../utils/dataMapper';
import { marginsPxToPt } from '../utils/layoutUtils';
import { CoverPage } from './sections/CoverPage';
import { WeatherSection } from './sections/WeatherSection';
import { ExecutiveSection } from './sections/ExecutiveSection';
import { ProgressSection } from './sections/ProgressSection';
import { PhotosSection } from './sections/PhotosSection';
import { SafetySection } from './sections/SafetySection';
import { LookAheadSection } from './sections/LookAheadSection';

interface ReportDocumentProps {
  data: ReportData;
  enabledSections: Record<string, boolean>;
  sectionConfigs?: Record<string, any>;
  sectionOrder?: string[];
  documentSettings?: any;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0, // Sections handle their own padding
  },
});

export const ReportDocument: React.FC<ReportDocumentProps> = ({ 
  data, 
  enabledSections,
  sectionConfigs = {},
  sectionOrder = ['cover', 'executive', 'weather', 'progress', 'lookahead', 'photos', 'safety'],
  documentSettings = {}
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

  return (
    <Document>
      {sectionOrder.map(sectionId => {
        if (!enabledSections[sectionId]) return null;

        switch (sectionId) {
          case 'cover':
            return (
              <Page key="cover" size="LETTER" style={styles.page}>
                <CoverPage data={data} config={sectionConfigs.cover} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'executive':
            return (
              <Page key="executive" size="LETTER" style={styles.page}>
                <ExecutiveSection data={data} config={sectionConfigs.executive} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'weather':
            return (
              <Page key="weather" size="LETTER" style={styles.page}>
                <WeatherSection data={data} config={sectionConfigs.weather} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'progress':
            return (
              <Page key="progress" size="LETTER" style={styles.page}>
                <ProgressSection data={data} config={sectionConfigs.progress} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'lookahead':
            return (
              <Page key="lookahead" size="LETTER" style={styles.page}>
                <LookAheadSection data={data} config={sectionConfigs.lookahead} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'photos':
            return (
              <Page key="photos" size="LETTER" style={styles.page}>
                <PhotosSection data={data} config={sectionConfigs.photos} documentSettings={pdfDocSettings} />
              </Page>
            );
          case 'safety':
            return (
              <Page key="safety" size="LETTER" style={styles.page}>
                <SafetySection data={data} config={sectionConfigs.safety} documentSettings={pdfDocSettings} />
              </Page>
            );
          default:
            return null;
        }
      })}
      {/* Add other sections here as we build them */}
      {/* {enabledSections.weather && <WeatherSection data={data} />} */}
    </Document>
  );
};
