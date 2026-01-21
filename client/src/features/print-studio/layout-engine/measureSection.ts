import { PrintSection, PrintSpacing, ReportData } from '../config/printConfig.types';
import { 
  SECTION_BASE_HEIGHTS, 
  ROW_HEIGHTS, 
  HEADER_HEIGHTS, 
  SAFETY_MARGIN, 
  pxToPoints 
} from './pageConstants';

import { ProjectConfig, ProjectBaselines } from '../../../types';

export interface MeasurementContext {
  section: PrintSection;
  spacing: PrintSpacing;
  reportData: ReportData;
  projectConfig?: ProjectConfig;
  baselines?: ProjectBaselines | null;
}

export interface SectionMetrics {
  totalHeight: number;
  isSplittable: boolean;
  headerHeight: number;
  rowHeight: number;
  footerHeight: number;
  itemCount: number;
}

/**
 * Calculates detailed metrics for a section to support smart usage of page space.
 * Returns both total height and granular details (header/row/footer) for splitting.
 */
export function getSectionMetrics(ctx: MeasurementContext): SectionMetrics {
  const { section, reportData, projectConfig, baselines } = ctx;
  
  // Default values
  let headerHeight = 0;
  let rowHeight = 0;
  let footerHeight = 0;
  let itemCount = 0;
  let isSplittable = false;
  let totalHeight = 0;

  switch (section.id) {
    case 'overview': // Executive Summary
      const summaryLength = reportData.overview?.executiveSummary?.length || 0;
      // Not splittable in the list sense, but treated as a block
      isSplittable = false;
      totalHeight = SECTION_BASE_HEIGHTS.overview + Math.floor(summaryLength / 100) * 16;
      break;
      
    case 'key_personnel':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.simple;
      rowHeight = ROW_HEIGHTS.large;
      
      if (projectConfig?.personnel) {
        const clientReps = projectConfig.personnel.client?.representatives?.length || 0;
        const engineerReps = projectConfig.personnel.engineer?.representatives?.length || 0;
        const reconReps = projectConfig.personnel.recon?.length || 0;
        // We split by "max row" in the visual grid, but effectively it's one row per person index
        itemCount = Math.max(clientReps, engineerReps, reconReps);
      }
      break;
      
    case 'weather':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.standard;
      rowHeight = ROW_HEIGHTS.weather;
      itemCount = reportData.overview?.weather?.length || 0;
      break;
      
    case 'lookahead':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.lookahead;
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = reportData.progress?.lookAheadItems?.length || 0;
      break;

    case 'progress':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.safety_top; // Reusing large header (KPI cards)
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = baselines?.bidItems?.length || 0;
      break;
      
    case 'manpower':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.manpower;
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = reportData.resources?.manpower?.length || 0;
      break;
      
    case 'equipment':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.standard;
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = reportData.resources?.equipment?.onSite?.length || 0;
      break;
      
    case 'materials':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.standard;
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = reportData.resources?.materials?.length || 0;
      break;
      
    case 'procurement':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.procurement;
      rowHeight = ROW_HEIGHTS.standard;
      itemCount = reportData.resources?.procurement?.length || 0;
      break;
      
    case 'safety':
      isSplittable = true;
      // Estimate Header Height: 
      // 1. Weekly Topic Box (Dynamic)
      const topicNotes = reportData.safety?.weeklyTopicNotes || '';
      const topicHeight = 40 + 40 + Math.ceil(topicNotes.length / 90) * 20; // Title + Padding + Text (safer 20px/line)
      const kpiHeight = 120; // KPI Table
      headerHeight = topicHeight + kpiHeight + 20; // + GAP

      rowHeight = ROW_HEIGHTS.large;
      
      // Estimate Footer Height: Narrative (Dynamic)
      const narrative = reportData.safety?.narrative || '';
      footerHeight = 40 + 40 + Math.ceil(narrative.length / 90) * 20; // Header + Padding + Text
      
      itemCount = reportData.safety?.observations?.length || 0;
      break;
      
    case 'financials':
      isSplittable = true;
      headerHeight = 150; // Summary cards (80) + Title (40) + Table Header (30)
      rowHeight = ROW_HEIGHTS.compact;
      itemCount = reportData.financials?.invoices?.length || 0;
      break;

    case 'issues':
      isSplittable = true;
      headerHeight = HEADER_HEIGHTS.simple;
      rowHeight = ROW_HEIGHTS.issue;
      itemCount = reportData.issues?.length || 0;
      break;
      
    case 'photos':
      // Photos handled specially by calculatePageMap due to grid layout
      isSplittable = false;
      const photoCount = reportData.photos?.length || 0;
      const photoPages = Math.ceil(photoCount / 6);
      totalHeight = photoPages * 600;
      break;

    default:
      // Fallback for unknown or simple sections
      isSplittable = false;
      const base = SECTION_BASE_HEIGHTS[section.id as keyof typeof SECTION_BASE_HEIGHTS] || 200;
      totalHeight = base;
      break;
  }

  // Calculate total height if not manually set
  if (isSplittable && totalHeight === 0) {
    if (itemCount === 0) {
        // Even if empty, usually show header + empty state (or maybe hide? logic depends on component)
        // For now assume we show at least header + small buffer
        totalHeight = headerHeight + 40; 
    } else {
        totalHeight = headerHeight + (itemCount * rowHeight) + footerHeight;
    }
  }

  // Apply Safety Margin
  // We add a safety margin to the TOTAL only, not per row, to handle container padding/borders
  if (totalHeight > 0) {
      totalHeight += SAFETY_MARGIN;
  }

  return {
    totalHeight,
    isSplittable,
    headerHeight,
    rowHeight,
    footerHeight,
    itemCount
  };
}

/**
 * Estimates the rendered height of a section in points (for PDF).
 * This is an approximation - the actual rendered height may vary slightly,
 * but it should be close enough for page break calculations.
 */
export function measureSection(ctx: MeasurementContext): number {
  const { spacing } = ctx;
  
  // Get raw metrics
  const metrics = getSectionMetrics(ctx);
  
  // Adjust for spacing preset (only affects specific visual gaps, not row internals usually,
  // but keeping logic consistent with previous implementation for overall scale)
  const spacingMultiplier = spacing.type === 'compact' ? 0.95 : spacing.type === 'relaxed' ? 1.05 : 1;
  
  // Add section wrapper header height (Title of the section block itself)
  const sectionWrapperHeader = spacing.type === 'compact' ? 40 : 48;
  
  // Calculate final pixel height
  const pixelHeight = Math.ceil((metrics.totalHeight + sectionWrapperHeader) * spacingMultiplier) + spacing.sectionGap;
  
  // Convert to points for PDF
  return pxToPoints(pixelHeight);
}

/**
 * Measures multiple sections and returns a map of section ID to height
 */
export function measureAllSections(
  sections: PrintSection[],
  spacing: PrintSpacing,
  reportData: ReportData,
  projectConfig?: ProjectConfig,
  baselines?: ProjectBaselines | null
): Map<string, number> {
  const measurements = new Map<string, number>();
  
  for (const section of sections) {
    if (section.included) {
      measurements.set(section.id, measureSection({ section, spacing, reportData, projectConfig, baselines }));
    }
  }
  
  return measurements;
}

