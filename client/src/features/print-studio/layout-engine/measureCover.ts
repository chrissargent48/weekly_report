import { PrintConfig } from '../config/printConfig.types';
import { FIRST_PAGE, pxToPoints } from './pageConstants';

interface CoverMeasurement {
  totalHeight: number;
  headerImageHeight: number;
  titleBlockHeight: number;
  photoStripHeight: number;
  clientInfoHeight: number;
  safetyBannerHeight: number;
}

/**
 * Calculates the height of the cover/first page elements in points (for PDF)
 * These are fixed elements that always appear on page 1
 */
export function measureCover(config: PrintConfig): CoverMeasurement {
  // Header image scales is logic handled in component, but space reserved is fixed layout-wise
  // For now we assume fixed layout height to prevent overflow issues
  const headerImageHeight = FIRST_PAGE.HEADER_IMAGE_HEIGHT;
  
  // Photo strip only shown if enabled and photos selected
  const showPhotoStrip = config.stripPhotoIndexes.length > 0;
  const photoStripHeight = showPhotoStrip ? FIRST_PAGE.PHOTO_STRIP_HEIGHT : 0;
  
  // Spacing adjustments
  const spacingMultiplier = config.spacing.type === 'compact' ? 0.85 : config.spacing.type === 'relaxed' ? 1.15 : 1;
  
  const titleBlockHeight = Math.round(FIRST_PAGE.TITLE_BLOCK_HEIGHT * spacingMultiplier);
  const clientInfoHeight = Math.round(FIRST_PAGE.CLIENT_INFO_HEIGHT * spacingMultiplier);
  
  const totalHeight = 
    headerImageHeight + 
    titleBlockHeight + 
    photoStripHeight + 
    clientInfoHeight + 
    FIRST_PAGE.SAFETY_BANNER_HEIGHT;
  
  // Convert all measurements to points for PDF
  return {
    totalHeight: pxToPoints(totalHeight),
    headerImageHeight: pxToPoints(headerImageHeight),
    titleBlockHeight: pxToPoints(titleBlockHeight),
    photoStripHeight: pxToPoints(photoStripHeight),
    clientInfoHeight: pxToPoints(clientInfoHeight),
    safetyBannerHeight: pxToPoints(FIRST_PAGE.SAFETY_BANNER_HEIGHT),
  };
}
