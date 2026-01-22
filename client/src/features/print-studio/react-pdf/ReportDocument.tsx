/**
 * Main Report Document for @react-pdf/renderer
 *
 * VALIDATED NATIVE FLOW IMPLEMENTATION
 * Uses standard React-PDF wrapping (`<Page wrap>`) instead of manual pagination.
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { styles, COLORS, PAGE } from './styles';
import { PrintConfig, PagePlacement, PageMap } from '../config/printConfig.types';
import { WeeklyReport, ProjectConfig, ProjectBaselines } from '../../../types';
import { PageHeader } from './components/PageHeader';

// Import all section components
import {
  CoverSection,
  ExecutiveSummary,
  WeatherSection,
  ManpowerSection,
  EquipmentSection,
  MaterialsSection,
  SafetySection,
  ProgressSection,
  LookAheadSection,
  ProcurementSection,
  FinancialsSection,
  PhotosSection,
  IssuesSection,
  ScheduleSection,
  KeyPersonnelSection,
} from './sections';

interface ReportDocumentProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines;
  pageMap?: PageMap; // Kept for interface compatibility but unused
}

const footerStyles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 20,
    left: PAGE.MARGIN_LEFT,
    right: PAGE.MARGIN_RIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
});

// Section renderer - maps section ID to component
function renderSection(
  sectionId: string,
  props: {
    config: PrintConfig;
    reportData: WeeklyReport;
    projectConfig: ProjectConfig;
    baselines?: ProjectBaselines;
    // contentBreak: boolean; // Not used in native flow
  }
) {
  const { config, reportData, projectConfig, baselines } = props;

  // Common props for all sections
  const sectionProps = {
    config,
    reportData,
    projectConfig,
    baselines,
  };

  switch (sectionId) {
    case 'overview':
      return <ExecutiveSummary {...sectionProps} />;
    case 'weather':
      return <WeatherSection {...sectionProps} />;
    case 'progress':
      return <ProgressSection {...sectionProps} />;
    case 'lookahead':
      return <LookAheadSection {...sectionProps} />;
    case 'manpower':
      return <ManpowerSection {...sectionProps} />;
    case 'equipment':
      return <EquipmentSection {...sectionProps} />;
    case 'materials':
      return <MaterialsSection {...sectionProps} />;
    case 'procurement':
      return <ProcurementSection {...sectionProps} />;
    case 'safety':
      return <SafetySection {...sectionProps} />;
    case 'financials':
      return <FinancialsSection {...sectionProps} />;
    case 'schedule':
      return <ScheduleSection {...sectionProps} />;
    case 'issues':
      return <IssuesSection {...sectionProps} />;
    case 'photos':
      return <PhotosSection {...sectionProps} />;
    case 'key_personnel':
      return <KeyPersonnelSection {...sectionProps} />;
    default:
      return null;
  }
}

export function ReportDocument({
  config,
  reportData,
  projectConfig,
  baselines,
}: ReportDocumentProps) {
  // Get visible sections in order
  const visibleSections = config.sections
    .filter((s) => s.included)
    .sort((a, b) => a.order - b.order);

  const projectName = projectConfig.identity?.projectName || 'Project';
  const showFooter = config.showFooter ?? true;
  const showPageNumbers = config.showPageNumbers ?? true;

  return (
    <Document
      title={`${projectName} - Weekly Report - ${reportData.weekEnding}`}
      author="RECON"
      subject="Weekly Progress Report"
      creator="Weekly Report Generator"
    >
      {/* Cover Page - No margins, special layout */}
      {config.sections.find(s => s.id === 'cover' && s.included) && (
        <Page size="LETTER" style={styles.coverPage}>
          <CoverSection
            config={config}
            reportData={reportData}
            projectConfig={projectConfig}
          />
        </Page>
      )}

      {/* Content Pages */}
      <Page size="LETTER" style={styles.page} wrap>
        
        {/* Repeating Page Header */}
        <PageHeader 
          projectConfig={projectConfig}
          weekEnding={reportData.weekEnding || ''}
        />

        {/* Fixed Footer */}
        {showFooter && (
          <View style={footerStyles.footer} fixed>
            <Text style={footerStyles.footerText}>{projectName} - Weekly Report</Text>
            {showPageNumbers && (
              <Text
                style={footerStyles.pageNumber}
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              />
            )}
          </View>
        )}

        {/* Render Remaining Sections */}
        {visibleSections.map((section) => {
          if (section.id === 'cover') return null; // Already rendered

          // Force page break if configured
          const forceBreak = section.forcePageBreakBefore;

          return (
            <View key={section.id} break={forceBreak}>
              {renderSection(section.id, {
                config,
                reportData,
                projectConfig,
                baselines,
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

export default ReportDocument;
