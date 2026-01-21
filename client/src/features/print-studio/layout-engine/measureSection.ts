import { PrintSection, PrintSpacing, ReportData } from '../config/printConfig.types';
import { SECTION_BASE_HEIGHTS, pxToPoints } from './pageConstants';

import { ProjectConfig, ProjectBaselines } from '../../../types';

interface MeasurementContext {
  section: PrintSection;
  spacing: PrintSpacing;
  reportData: ReportData;
  projectConfig?: ProjectConfig;
  baselines?: ProjectBaselines | null;
}

/**
 * Estimates the rendered height of a section in points (for PDF).
 * This is an approximation - the actual rendered height may vary slightly,
 * but it should be close enough for page break calculations.
 */
export function measureSection(ctx: MeasurementContext): number {
  const { section, spacing, reportData, projectConfig } = ctx;
  const baseHeight = SECTION_BASE_HEIGHTS[section.id as keyof typeof SECTION_BASE_HEIGHTS] || 200;
  
  // Adjust for spacing preset
  const spacingMultiplier = spacing.type === 'compact' ? 0.85 : spacing.type === 'relaxed' ? 1.15 : 1;
  
  // Section-specific adjustments based on actual data
  let dynamicHeight = baseHeight;
  
  switch (section.id) {
    case 'overview': // Executive Summary
      // Estimate based on text length
      const summaryLength = reportData.overview?.executiveSummary?.length || 0;
      dynamicHeight = baseHeight + Math.floor(summaryLength / 100) * 16;
      break;
      
    case 'key_personnel':
      if (projectConfig?.personnel) {
        // Calculate max rows needed (max number of people in any column)
        const clientReps = projectConfig.personnel.client?.representatives?.length || 1;
        const engineerReps = projectConfig.personnel.engineer?.representatives?.length || 1;
        const reconReps = projectConfig.personnel.recon?.length || 1;
        
        const maxReps = Math.max(clientReps, engineerReps, reconReps);
        // Base headers ~60px, plus ~40px per rep
        dynamicHeight = 60 + (maxReps * 40);
      }
      break;
      
    case 'weather':
      // 7 days * row height + header
      const weatherRows = reportData.overview?.weather?.length || 7;
      dynamicHeight = 60 + (weatherRows * 36);
      break;
      
    case 'lookahead':
      // Look Ahead is in progress.lookAheadItems
      const lookAheadRows = reportData.progress?.lookAheadItems?.length || 10;
      dynamicHeight = 60 + (lookAheadRows * 36);
      break;

    case 'progress':
      // Progress uses detailed bid items from Project Baselines
      const bidItemRows = ctx.baselines?.bidItems?.length || 10;
      // KPI Cards (~100px) + Header + Rows
      dynamicHeight = 160 + (bidItemRows * 28); 
      break;
      
    case 'manpower':
      // Manpower is in resources.manpower
      const manpowerRows = reportData.resources?.manpower?.length || 8;
      dynamicHeight = 60 + (manpowerRows * 32);
      break;
      
    case 'equipment':
      // Equipment is in resources.equipment.onSite
      const equipmentRows = reportData.resources?.equipment?.onSite?.length || 6;
      dynamicHeight = 60 + (equipmentRows * 32);
      break;
      
    case 'materials':
      // Materials is in resources.materials
      const materialRows = reportData.resources?.materials?.length || 3;
      dynamicHeight = 60 + (materialRows * 32);
      break;
      
    case 'procurement':
      // Procurement is in resources.procurement
      const procurementRows = reportData.resources?.procurement?.length || 5;
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
  const pixelHeight = Math.ceil((dynamicHeight + sectionHeaderHeight) * spacingMultiplier) + spacing.sectionGap;
  
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
