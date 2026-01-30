/**
 * PDF Preview Component for @react-pdf/renderer
 *
 * Provides both:
 * 1. Live preview using PDFViewer (for development/preview)
 * 2. Download functionality using pdf().toBlob()
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PDFViewer, PDFDownloadLink, pdf, BlobProvider } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';
import { PrintConfig, PageMap } from '../config/printConfig.types';
import { WeeklyReport, ProjectConfig, ProjectBaselines } from '../../../types';
import { calculatePageMap } from '../layout-engine/calculatePageMap';

interface PDFPreviewProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines;
  sectionConfigs?: Record<string, any>;
  documentSettings?: any;
  pageMap?: PageMap;
  showViewer?: boolean;
  viewerWidth?: string | number;
  viewerHeight?: string | number;
}

interface PDFDownloadButtonProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines;
  sectionConfigs?: Record<string, any>;
  documentSettings?: any;
  pageMap?: PageMap;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

function ensurePageMap(config: PrintConfig, reportData: WeeklyReport, pageMap?: PageMap): PageMap {
  if (pageMap) return pageMap;
  return calculatePageMap(config, reportData);
}

/**
 * PDF Viewer component for live preview in the modal
 */
export function PDFPreview({
  config,
  reportData,
  projectConfig,
  sectionConfigs,
  documentSettings,
  pageMap,
  showViewer = true,
  viewerWidth = '100%',
  viewerHeight = '100%',
}: PDFPreviewProps) {
  const resolvedPageMap = useMemo(() => ensurePageMap(config, reportData, pageMap), [config, reportData, pageMap]);

  const document = useMemo(
    () => (
      <ReportDocument
        reportData={reportData}
        sectionConfigs={sectionConfigs}
        documentSettings={documentSettings}
        projectConfig={projectConfig}
        config={config}
        pageMap={resolvedPageMap}
      />
    ),
    [reportData, sectionConfigs, documentSettings, projectConfig, config, resolvedPageMap]
  );

  if (!showViewer) {
    return null;
  }

  return (
    <PDFViewer
      width={viewerWidth}
      height={viewerHeight}
      showToolbar={false}
      style={{ border: 'none' }}
    >
      {document}
    </PDFViewer>
  );
}

/**
 * PDF Download Button with loading state
 */
export function PDFDownloadButton({
  config,
  reportData,
  projectConfig,
  sectionConfigs,
  documentSettings,
  pageMap,
  filename,
  className = '',
  children,
}: PDFDownloadButtonProps) {
  const projectName = projectConfig.identity?.projectName || 'Project';
  const weekEnding = reportData.weekEnding || 'Report';
  const defaultFilename = `${projectName.replace(/\s+/g, '_')}_Weekly_Report_${weekEnding}.pdf`;
  const actualFilename = filename || defaultFilename;

  const resolvedPageMap = useMemo(() => ensurePageMap(config, reportData, pageMap), [config, reportData, pageMap]);

  const document = useMemo(
    () => (
      <ReportDocument
        reportData={reportData}
        sectionConfigs={sectionConfigs}
        documentSettings={documentSettings}
        projectConfig={projectConfig}
        config={config}
        pageMap={resolvedPageMap}
      />
    ),
    [reportData, sectionConfigs, documentSettings, projectConfig, config, resolvedPageMap]
  );

  return (
    <PDFDownloadLink
      document={document}
      fileName={actualFilename}
      className={className}
    >
      {({ blob, url, loading, error }) => {
        if (loading) {
          return children || 'Generating PDF...';
        }
        if (error) {
          console.error('PDF generation error:', error);
          return 'Error!';
        }
        return children || 'Download PDF';
      }}
    </PDFDownloadLink>
  );
}

/**
 * Hook for programmatic PDF generation
 * Returns functions to generate blob or download directly
 */
export function usePDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBlob = useCallback(
    async (
      config: PrintConfig,
      reportData: WeeklyReport,
      projectConfig: ProjectConfig,
      baselines?: ProjectBaselines,
      pageMap?: PageMap,
      sectionConfigs?: Record<string, any>,
      documentSettings?: any
    ): Promise<Blob | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const resolvedPageMap = ensurePageMap(config, reportData, pageMap);
        const doc = (
          <ReportDocument
            reportData={reportData}
            sectionConfigs={sectionConfigs}
            documentSettings={documentSettings}
            projectConfig={projectConfig}
            config={config}
            pageMap={resolvedPageMap}
          />
        );

        const blob = await pdf(doc).toBlob();
        return blob;
      } catch (err) {
        console.error('PDF generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate PDF');
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const downloadPDF = useCallback(
    async (
      config: PrintConfig,
      reportData: WeeklyReport,
      projectConfig: ProjectConfig,
      baselines?: ProjectBaselines,
      pageMap?: PageMap,
      filename?: string,
      sectionConfigs?: Record<string, any>,
      documentSettings?: any
    ): Promise<boolean> => {
      const blob = await generateBlob(config, reportData, projectConfig, baselines, pageMap, sectionConfigs, documentSettings);
      if (!blob) return false;

      try {
        const projectName = projectConfig.identity?.projectName || 'Project';
        const weekEnding = reportData.weekEnding || 'Report';
        const defaultFilename = `${projectName.replace(/\s+/g, '_')}_Weekly_Report_${weekEnding}.pdf`;
        const actualFilename = filename || defaultFilename;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = actualFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
      } catch (err) {
        console.error('Download error:', err);
        setError(err instanceof Error ? err.message : 'Failed to download PDF');
        return false;
      }
    },
    [generateBlob]
  );

  return {
    generateBlob,
    downloadPDF,
    isGenerating,
    error,
  };
}

/**
 * BlobProvider wrapper for custom rendering
 */
export function PDFBlobProvider({
  config,
  reportData,
  projectConfig,
  sectionConfigs,
  documentSettings,
  pageMap,
  children,
}: PDFPreviewProps & {
  children: (props: { blob: Blob | null; url: string | null; loading: boolean; error: Error | null }) => React.ReactNode;
}) {
  const resolvedPageMap = useMemo(() => ensurePageMap(config, reportData, pageMap), [config, reportData, pageMap]);
  const document = useMemo(
    () => (
      <ReportDocument
        reportData={reportData}
        sectionConfigs={sectionConfigs}
        documentSettings={documentSettings}
        projectConfig={projectConfig}
        config={config}
        pageMap={resolvedPageMap}
      />
    ),
    [reportData, sectionConfigs, documentSettings, projectConfig, config, resolvedPageMap]
  );

  return <BlobProvider document={document}>{children}</BlobProvider>;
}

export default PDFPreview;
