/**
 * @react-pdf/renderer PDF Generation Module
 *
 * This module provides a complete PDF generation solution using @react-pdf/renderer.
 * It replaces the previous Paged.js / html2pdf.js approaches with a native React-to-PDF
 * pipeline that ensures consistent, predictable output.
 *
 * Key exports:
 * - ReportDocument: The main Document component
 * - PDFPreview: Live preview component
 * - PDFDownloadButton: Download button with auto-generation
 * - usePDFGeneration: Hook for programmatic PDF generation
 * - All section components for individual use
 */

// Main document component
export { ReportDocument } from './ReportDocument';

// Preview and download components
export {
  PDFPreview,
  PDFDownloadButton,
  PDFBlobProvider,
  usePDFGeneration,
} from './PDFPreview';

// Styles and constants
export { styles, COLORS, PAGE, COVER, DENSITY_MULTIPLIERS, type DensityMode } from './styles';

// Primitives
export { Table, SectionHeader, type TableColumn } from './primitives';

// Shared components
export { PageHeader, PageFooter, CoverFooter, AccentLine } from './components';

// Individual section components (for custom documents)
export {
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
