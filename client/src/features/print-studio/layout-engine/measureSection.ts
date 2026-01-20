import { PrintSection, PrintSpacing, ReportData } from '../config/printConfig.types';
import { SECTION_BASE_HEIGHTS } from './pageConstants';

interface MeasurementContext {
  section: PrintSection;
  spacing: PrintSpacing;
  reportData: ReportData;
}

/**
 * Estimates the rendered height of a section in pixels.
 * This is an approximation - the actual rendered height may vary slightly,
 * but it should be close enough for page break calculations.
 */
export function measureSection(ctx: MeasurementContext): number {
  const { section, spacing, reportData } = ctx;
  const baseHeight = SECTION_BASE_HEIGHTS[section.id as keyof typeof SECTION_BASE_HEIGHTS] || 200;
  
  // Adjust for spacing preset
  const spacingMultiplier = spacing.type === 'compact' ? 0.85 : spacing.type === 'relaxed' ? 1.15 : 1;
  
  // Section-specific adjustments based on actual data
  let dynamicHeight = baseHeight;
  
  switch (section.id) {
    case 'overview': // Executive Summary
      // Estimate based on text length
      const summaryLength = reportData.executiveSummary?.narrative?.length || 0;
      dynamicHeight = baseHeight + Math.floor(summaryLength / 100) * 16;
      break;
      
    case 'weather':
      // 7 days * row height + header
      const weatherRows = reportData.weather?.length || 7;
      dynamicHeight = 60 + (weatherRows * 36);
      break;
      
    case 'lookahead':
      const lookAheadRows = reportData.lookAhead?.length || 10;
      dynamicHeight = 60 + (lookAheadRows * 36);
      break;
      
    case 'manpower':
      const manpowerRows = reportData.manpower?.length || 8;
      dynamicHeight = 60 + (manpowerRows * 32);
      break;
      
    case 'equipment':
      const equipmentRows = reportData.equipment?.length || 6;
      dynamicHeight = 60 + (equipmentRows * 32);
      break;
      
    case 'materials':
      const materialRows = reportData.materials?.length || 3;
      dynamicHeight = 60 + (materialRows * 32);
      break;
      
    case 'procurement':
      const procurementRows = reportData.procurement?.length || 5;
      dynamicHeight = 60 + (procurementRows * 36);
      break;
      
    case 'safety':
      const safetyNarrativeLength = reportData.safety?.narrative?.length || 0;
      dynamicHeight = 120 + Math.floor(safetyNarrativeLength / 100) * 16;
      break;
      
    case 'financials':
      const invoiceRows = reportData.financials?.invoices?.length || 1;
      dynamicHeight = 100 + (invoiceRows * 32);
      break;
      
    case 'photos':
      // 6 photos per page section, 2 columns x 3 rows
      const photoCount = reportData.photos?.length || 0;
      const photoPages = Math.ceil(photoCount / 6);
      dynamicHeight = photoPages * 600;
      break;
  }
  
  // Add section header height (title + spacing)
  const sectionHeaderHeight = spacing.type === 'compact' ? 40 : 48;
  
  // Apply spacing multiplier and add gaps
  return Math.ceil((dynamicHeight + sectionHeaderHeight) * spacingMultiplier) + spacing.sectionGap;
}

/**
 * Measures multiple sections and returns a map of section ID to height
 */
export function measureAllSections(
  sections: PrintSection[],
  spacing: PrintSpacing,
  reportData: ReportData
): Map<string, number> {
  const measurements = new Map<string, number>();
  
  for (const section of sections) {
    if (section.included) {
      measurements.set(section.id, measureSection({ section, spacing, reportData }));
    }
  }
  
  return measurements;
}
