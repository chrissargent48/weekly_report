import React from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../utils/dataMapper';
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
  return (
    <Document>
      {sectionOrder.map(sectionId => {
        if (!enabledSections[sectionId]) return null;

        switch (sectionId) {
          case 'cover':
            return (
              <Page key="cover" size="LETTER" style={styles.page}>
                <CoverPage data={data} config={sectionConfigs.cover} documentSettings={documentSettings} />
              </Page>
            );
          case 'executive':
            return (
              <Page key="executive" size="LETTER" style={styles.page}>
                <ExecutiveSection data={data} config={sectionConfigs.executive} documentSettings={documentSettings} />
              </Page>
            );
          case 'weather':
            return (
              <Page key="weather" size="LETTER" style={styles.page}>
                <WeatherSection data={data} config={sectionConfigs.weather} documentSettings={documentSettings} />
              </Page>
            );
          case 'progress':
            return (
              <Page key="progress" size="LETTER" style={styles.page}>
                <ProgressSection data={data} config={sectionConfigs.progress} documentSettings={documentSettings} />
              </Page>
            );
          case 'lookahead':
            return (
              <Page key="lookahead" size="LETTER" style={styles.page}>
                <LookAheadSection data={data} config={sectionConfigs.lookahead} documentSettings={documentSettings} />
              </Page>
            );
          case 'photos':
            return (
              <Page key="photos" size="LETTER" style={styles.page}>
                <PhotosSection data={data} config={sectionConfigs.photos} documentSettings={documentSettings} />
              </Page>
            );
          case 'safety':
            return (
              <Page key="safety" size="LETTER" style={styles.page}>
                <SafetySection data={data} config={sectionConfigs.safety} documentSettings={documentSettings} />
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
