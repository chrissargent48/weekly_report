/**
 * Main Report Document for @react-pdf/renderer
 *
 * This is the top-level Document component that orchestrates
 * all sections and handles page layout.
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { styles, COLORS, PAGE } from './styles';
import { PrintConfig, PagePlacement, PageMap } from '../config/printConfig.types';
import { WeeklyReport, ProjectConfig, ProjectBaselines } from '../../../types';

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
  pageMap?: PageMap;
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

// Footer component with page numbers
function PageFooter({ projectName, showFooter }: { projectName: string; showFooter: boolean }) {
  if (!showFooter) return null;
  return (
    <View style={footerStyles.footer} fixed>
      <Text style={footerStyles.footerText}>{projectName} - Weekly Report</Text>
      <Text
        style={footerStyles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

// Section renderer - maps section ID to component
function renderSection(
  sectionId: string,
  props: {
    config: PrintConfig;
    reportData: WeeklyReport;
    projectConfig: ProjectConfig;
    baselines?: ProjectBaselines;
    placement?: PagePlacement;
  }
) {
  const { config, reportData, projectConfig, baselines, placement } = props;

  switch (sectionId) {
    case 'overview':
      return <ExecutiveSummary config={config} reportData={reportData} placement={placement} />;
    case 'weather':
      return <WeatherSection config={config} reportData={reportData} placement={placement} />;
    case 'progress':
      return <ProgressSection config={config} reportData={reportData} placement={placement} />;
    case 'lookahead':
      return <LookAheadSection config={config} reportData={reportData} placement={placement} />;
    case 'manpower':
      return <ManpowerSection config={config} reportData={reportData} placement={placement} />;
    case 'equipment':
      return <EquipmentSection config={config} reportData={reportData} placement={placement} />;
    case 'materials':
      return <MaterialsSection config={config} reportData={reportData} placement={placement} />;
    case 'procurement':
      return <ProcurementSection config={config} reportData={reportData} placement={placement} />;
    case 'safety':
      return <SafetySection config={config} reportData={reportData} placement={placement} />;
    case 'financials':
      return (
        <FinancialsSection
          config={config}
          reportData={reportData}
          projectConfig={projectConfig}
          baselines={baselines}
          placement={placement}
        />
      );
    case 'schedule':
      return <ScheduleSection config={config} reportData={reportData} placement={placement} />;
    case 'issues':
      return <IssuesSection config={config} reportData={reportData} placement={placement} />;
    case 'photos':
      return <PhotosSection config={config} reportData={reportData} placement={placement} />;
    case 'key_personnel':
      return (
        <KeyPersonnelSection
          config={config}
          reportData={reportData}
          projectConfig={projectConfig}
          placement={placement}
        />
      );
    default:
      return null;
  }
}

export function ReportDocument({
  config,
  reportData,
  projectConfig,
  baselines,
  pageMap,
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
      <Page size="LETTER" style={styles.coverPage}>
        <CoverSection
          config={config}
          reportData={reportData}
          projectConfig={projectConfig}
        />
      </Page>

      {/* Content Pages */}
      <Page size="LETTER" style={styles.page} wrap>
        {/* Render all visible sections */}
        {visibleSections.map((section) => {
          // Skip cover-only sections
          if (section.id === 'cover') return null;

          // Get placement from pageMap if available
          const placement = pageMap?.sectionPlacements?.get(section.id);

          // Check for forced page break
          if (section.forcePageBreakBefore) {
            return (
              <View key={section.id} break>
                {renderSection(section.id, {
                  config,
                  reportData,
                  projectConfig,
                  baselines,
                  placement,
                })}
              </View>
            );
          }

          return (
            <View key={section.id}>
              {renderSection(section.id, {
                config,
                reportData,
                projectConfig,
                baselines,
                placement,
              })}
            </View>
          );
        })}

        {/* Footer */}
        {showFooter && showPageNumbers && (
          <PageFooter projectName={projectName} showFooter={showFooter} />
        )}
      </Page>
    </Document>
  );
}

export default ReportDocument;
