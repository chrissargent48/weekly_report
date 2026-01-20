import { 
  PrintConfig, 
  PrintSection, 
  PageMap, 
  PageContent, 
  PagePlacement,
  ReportData 
} from '../config/printConfig.types';
import { PAGE_POINTS, FOOTER_POINTS } from './pageConstants';
import { measureCover } from './measureCover';
import { measureSection } from './measureSection';

/**
 * MAIN LAYOUT ENGINE FUNCTION
 * 
 * Calculates exactly what content goes on each page BEFORE rendering.
 * Both the HTML preview and PDF generator consume this same page map,
 * ensuring consistent page breaks across both outputs.
 */
export function calculatePageMap(
  config: PrintConfig,
  reportData: ReportData
): PageMap {
  const pages: PageContent[] = [];
  const sectionPlacements = new Map<string, PagePlacement>();
  
  // Get sorted, visible sections
  const visibleSections = config.sections
    .filter(s => s.included)
    .sort((a, b) => a.order - b.order);
  
  // Calculate cover height for page 1
  const coverMeasurement = measureCover(config);
  
  // Initialize page 1 with cover content already "used"
  let currentPage: PageContent = {
    pageNumber: 1,
    isFirstPage: true,
    sections: [],
    usedHeight: coverMeasurement.totalHeight,
    availableHeight: PAGE_POINTS.USABLE_HEIGHT - coverMeasurement.totalHeight - FOOTER_POINTS.HEIGHT,
  };
  
  // Process each section
  for (const section of visibleSections) {
    const sectionHeight = measureSection({
      section,
      spacing: config.spacing,
      reportData,
    });
    
    // Special case: Photos section may need to split across multiple pages
    if (section.id === 'photos') {
      const photosPlacements = handlePhotosSection(
        section,
        sectionHeight,
        currentPage,
        pages,
        config,
        reportData
      );
      
      // Update current page reference and add placements
      currentPage = photosPlacements.currentPage;
      photosPlacements.placements.forEach((p, idx) => {
        if (idx === 0) {
          sectionPlacements.set(section.id, p);
        }
      });
      continue;
    }
    
    // Check if section fits on current page
    if (sectionHeight <= currentPage.availableHeight) {
      // Section fits - add it to current page
      const placement: PagePlacement = {
        sectionId: section.id,
        startsOnPage: currentPage.pageNumber,
        estimatedHeight: sectionHeight,
        continuesFromPrevious: false,
      };
      
      currentPage.sections.push(placement);
      currentPage.usedHeight += sectionHeight;
      currentPage.availableHeight -= sectionHeight;
      sectionPlacements.set(section.id, placement);
      
    } else {
      // Section doesn't fit - start new page
      pages.push(currentPage);
      
      currentPage = {
        pageNumber: pages.length + 1,
        isFirstPage: false,
        sections: [],
        usedHeight: 0,
        availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
      };
      
      const placement: PagePlacement = {
        sectionId: section.id,
        startsOnPage: currentPage.pageNumber,
        estimatedHeight: sectionHeight,
        continuesFromPrevious: false,
      };
      
      currentPage.sections.push(placement);
      currentPage.usedHeight += sectionHeight;
      currentPage.availableHeight -= sectionHeight;
      sectionPlacements.set(section.id, placement);
    }
  }
  
  // Don't forget to push the last page if it has content or if we created a new empty one to fill
  if (currentPage.sections.length > 0 || currentPage.isFirstPage) {
    pages.push(currentPage);
  }
  
  return {
    totalPages: pages.length,
    pages,
    sectionPlacements,
  };
}

/**
 * Special handler for photos section since it may span multiple pages
 */
function handlePhotosSection(
  section: PrintSection,
  totalHeight: number,
  currentPage: PageContent,
  pages: PageContent[],
  config: PrintConfig,
  reportData: ReportData
): { currentPage: PageContent; placements: PagePlacement[] } {
  const placements: PagePlacement[] = [];
  const photosPerPage = 6; // 2 columns x 3 rows
  const photoPageHeight = 600; // Height for one "page" of 6 photos
  const photoCount = reportData.photos?.length || 0;
  // If no photos, just skip
  if (photoCount === 0) return { currentPage, placements };

  const photoPages = Math.ceil(photoCount / photosPerPage);
  
  let workingPage = currentPage;
  
  for (let i = 0; i < photoPages; i++) {
    const isFirstPhotoPage = i === 0;
    const heightNeeded = photoPageHeight;
    
    if (heightNeeded <= workingPage.availableHeight) {
      // Fits on current page
      const placement: PagePlacement = {
        sectionId: isFirstPhotoPage ? section.id : `${section.id}_continued_${i}`,
        startsOnPage: workingPage.pageNumber,
        estimatedHeight: heightNeeded,
        continuesFromPrevious: !isFirstPhotoPage,
      };
      
      workingPage.sections.push(placement);
      workingPage.usedHeight += heightNeeded;
      workingPage.availableHeight -= heightNeeded;
      placements.push(placement);
      
    } else {
      // Need new page
      pages.push(workingPage);
      
      workingPage = {
        pageNumber: pages.length + 1,
        isFirstPage: false,
        sections: [],
        usedHeight: 0,
        availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
      };
      
      const placement: PagePlacement = {
        sectionId: isFirstPhotoPage ? section.id : `${section.id}_continued_${i}`,
        startsOnPage: workingPage.pageNumber,
        estimatedHeight: heightNeeded,
        continuesFromPrevious: !isFirstPhotoPage,
      };
      
      workingPage.sections.push(placement);
      workingPage.usedHeight += heightNeeded;
      workingPage.availableHeight -= heightNeeded;
      placements.push(placement);
    }
  }
  
  return { currentPage: workingPage, placements };
}

/**
 * Utility function to check if a section will fit on the current page
 */
export function willFitOnPage(
  sectionHeight: number,
  availableHeight: number,
  minHeightThreshold: number = 100
): boolean {
  // Don't start a section if there's very little room - push to next page
  if (availableHeight < minHeightThreshold) {
    return false;
  }
  return sectionHeight <= availableHeight;
}
