import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { WeeklyReport, ProjectConfig } from '../../../../types';
import { PrintConfig, PageMap } from '../../config/printConfig.types';
import { buildDocumentDefinition } from './buildDocDefinition';
import { ensureReportImagesAreSafe } from './pdfAssets';

// Initialize pdfmake with fonts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
pdfMake.vfs = (pdfFonts as any).vfs;

/**
 * Generate and download a PDF for the given weekly report
 */
export async function generateReportPDF(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintConfig,
    pageMap: PageMap
): Promise<void> {
    // PRE-PROCESSING: Ensure all photos are base64 encoded
    const safeReport = await ensureReportImagesAreSafe(report);

    // Build the document definition
    const docDefinition = await buildDocumentDefinition(safeReport, config, options, pageMap);
    
    // Generate filename
    const filename = `WeeklyReport_${config.identity.jobNumber || '0000'}_${report.weekEnding || 'Draft'}.pdf`;
    
    // Create and download
    pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Open PDF in new browser tab (useful for preview)
 */
export async function openReportPDF(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintConfig,
    pageMap: PageMap
): Promise<void> {
    const safeReport = await ensureReportImagesAreSafe(report);
    const docDefinition = await buildDocumentDefinition(safeReport, config, options, pageMap);
    pdfMake.createPdf(docDefinition).open();
}
