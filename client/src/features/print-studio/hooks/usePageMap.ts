import { useMemo } from 'react';
import { PrintConfig, PageMap, ReportData } from '../config/printConfig.types';
import { calculatePageMap } from '../layout-engine/calculatePageMap';

/**
 * Hook that calculates and memoizes the page map.
 * Only recalculates when config or report data changes.
 */
export function usePageMap(config: PrintConfig, reportData: ReportData): PageMap {
  const pageMap = useMemo(() => {
    return calculatePageMap(config, reportData);
  }, [
    // Stringify sections to detect order/visibility changes
    JSON.stringify(config.sections),
    config.spacing.type,
    config.logoScale,
    config.showCoverPhotos,
    config.stripPhotoIndexes.length,
    // Only re-calculate if report data that affects heights changes
    reportData.photos?.length,
    reportData.overview?.weather?.length, // Updated to access via overview if needed, or directly if report structure flattened
    reportData.weather?.length, // Fallback if direct
    reportData.lookAhead?.length,
    reportData.manpower?.length,
    reportData.equipment?.length,
    reportData.materials?.length,
    reportData.procurement?.length,
    reportData.executiveSummary?.narrative?.length,
    reportData.safety?.narrative?.length,
    reportData.financials?.invoices?.length,
  ]);
  
  return pageMap;
}
