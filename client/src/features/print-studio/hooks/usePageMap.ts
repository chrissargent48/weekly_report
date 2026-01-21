import { useMemo } from 'react';
import { PrintConfig, PageMap, ReportData } from '../config/printConfig.types';
import { calculatePageMap } from '../layout-engine/calculatePageMap';

/**
 * Hook that calculates and memoizes the page map.
 * Only recalculates when config or report data changes.
 */
import { ProjectConfig, ProjectBaselines } from '../../../types';

export function usePageMap(config: PrintConfig, reportData: ReportData, projectConfig?: ProjectConfig, baselines?: ProjectBaselines | null): PageMap {
  const pageMap = useMemo(() => {
    return calculatePageMap(config, reportData, projectConfig, baselines);
  }, [
    // Stringify sections to detect order/visibility changes
    JSON.stringify(config.sections),
    config.spacing.type,
    config.logoScale,
    config.showCoverPhotos,
    config.stripPhotoIndexes.length,
    // Only re-calculate if report data that affects heights changes
    reportData.photos?.length,
    reportData.overview?.weather?.length,
    reportData.progress?.lookAheadItems?.length,
    reportData.resources?.manpower?.length,
    reportData.resources?.equipment?.onSite?.length,
    reportData.resources?.materials?.length,
    reportData.resources?.procurement?.length,
    reportData.overview?.executiveSummary?.length,
    reportData.safety?.narrative?.length,
    reportData.financials?.invoices?.length,
    // Add personnel dependencies for key_personnel section height
    projectConfig?.personnel?.client?.representatives?.length,
    projectConfig?.personnel?.engineer?.representatives?.length,
    projectConfig?.personnel?.engineer?.representatives?.length,
    projectConfig?.personnel?.recon?.length,
    baselines?.bidItems?.length,
  ]);
  
  return pageMap;
}
