import { 
  PrintConfig, 
  PrintSection, 
  PrintSpacing,
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
import { ProjectConfig, ProjectBaselines } from '../../../types';

export function calculatePageMap(
  config: PrintConfig,
  reportData: ReportData,
  projectConfig?: ProjectConfig,
  baselines?: ProjectBaselines | null
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
      projectConfig,
      baselines,
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

    // Special case: Progress section (multi-page table)
    if (section.id === 'progress') {
        const progressPlacements = handleProgressSection(
            section,
            { spacing: config.spacing, reportData, projectConfig, baselines },
            currentPage,
            pages
        );

        currentPage = progressPlacements.currentPage;
        progressPlacements.placements.forEach((p, idx) => {
            if (idx === 0) sectionPlacements.set(section.id, p);
        });
        continue;
    }
    
    // Special case: Safety section (multi-page)
    if (section.id === 'safety') {
        const safetyPlacements = handleSafetySection(
            section,
            reportData,
            currentPage,
            pages
        );

        currentPage = safetyPlacements.currentPage;
        safetyPlacements.placements.forEach((p, idx) => {
            if (idx === 0) sectionPlacements.set(section.id, p);
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
 * Special handler for progress section since it may span multiple pages
 */
function handleProgressSection(
  section: PrintSection,
  ctx: {
    spacing: PrintSpacing;
    reportData: ReportData;
    projectConfig?: ProjectConfig;
    baselines?: ProjectBaselines | null;
  },
  currentPage: PageContent,
  pages: PageContent[],
): { currentPage: PageContent; placements: PagePlacement[] } {
  const placements: PagePlacement[] = [];
  const bidItems = ctx.baselines?.bidItems || [];
  
  if (bidItems.length === 0) return { currentPage, placements };

  // Constants
  const KPI_HEADER_HEIGHT = 160; // Title + KPIs
  const TABLE_HEADER_HEIGHT = 44; // Just the table header (4px buffer)
  const ROW_HEIGHT = 34; // Increased from 28 to 34 to account for padding/borders
  const FOOTER_BUFFER = 60; // Increased buffer to avoid footer overlap

  let remainingItems = [...bidItems];
  let pageIndex = 0;
  let workingPage = currentPage;

  while (remainingItems.length > 0) {
    const isFirstPage = pageIndex === 0;
    const headerOverhead = isFirstPage ? KPI_HEADER_HEIGHT : TABLE_HEADER_HEIGHT;
    
    // Check if we need to start a fresh page immediately if header doesn't even fit
    // Minimum 2 rows to be worth it
    const minHeightNeeded = headerOverhead + (2 * ROW_HEIGHT) + FOOTER_BUFFER;
    
    if (workingPage.availableHeight < minHeightNeeded) {
        // Push current page and start a new one
        pages.push(workingPage);
        workingPage = {
            pageNumber: pages.length + 1,
            isFirstPage: false,
            sections: [],
            usedHeight: 0,
            availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
        };
    }

    // Calculate how many rows fit on this page
    const availableForRows = workingPage.availableHeight - headerOverhead - FOOTER_BUFFER;
    const rowsThatFit = Math.max(0, Math.floor(availableForRows / ROW_HEIGHT));
    
    // Take that many items
    const itemsForThisPage = remainingItems.slice(0, rowsThatFit);
    const startIndex = bidItems.length - remainingItems.length;
    
    // Check if we exhausted all items
    if (itemsForThisPage.length === remainingItems.length) {
        // All fit!
        const totalHeight = headerOverhead + (itemsForThisPage.length * ROW_HEIGHT);
        
        const placement: PagePlacement = {
            sectionId: isFirstPage ? section.id : `${section.id}_continued_${pageIndex}`,
            startsOnPage: workingPage.pageNumber,
            estimatedHeight: totalHeight,
            continuesFromPrevious: !isFirstPage,
            dataRange: { start: startIndex, end: startIndex + itemsForThisPage.length }
        };
        
        workingPage.sections.push(placement);
        workingPage.usedHeight += totalHeight;
        workingPage.availableHeight -= totalHeight;
        placements.push(placement);
        
        remainingItems = []; // Done loop
    } else {
        // Only some fit
        const totalHeight = headerOverhead + (itemsForThisPage.length * ROW_HEIGHT);
        
        const placement: PagePlacement = {
            sectionId: isFirstPage ? section.id : `${section.id}_continued_${pageIndex}`,
            startsOnPage: workingPage.pageNumber,
            estimatedHeight: totalHeight,
            continuesFromPrevious: !isFirstPage,
            dataRange: { start: startIndex, end: startIndex + itemsForThisPage.length }
        };
        
        workingPage.sections.push(placement);
        workingPage.usedHeight += totalHeight;
        workingPage.availableHeight -= totalHeight;
        placements.push(placement);
        
        // Remove processed items
        remainingItems = remainingItems.slice(rowsThatFit);
        
        // Force new page for next iteration
        pages.push(workingPage);
        workingPage = {
            pageNumber: pages.length + 1,
            isFirstPage: false,
            sections: [],
            usedHeight: 0,
            availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
        };
    }
    
    pageIndex++;
  }

  return { currentPage: workingPage, placements };
}

/**
 * Handle splitting of Safety Section
 */
function handleSafetySection(
    section: PrintSection,
    reportData: ReportData,
    currentPage: PageContent,
    pages: PageContent[]
): { currentPage: PageContent; placements: PagePlacement[] } {
    const placements: PagePlacement[] = [];
    
    // 1. Calculate Heights
    const HEADER_HEIGHT = 450; // Topic (~120) + Stats Table (~330)
    const OBS_OFFSET_TOP = 80; // "Observations" header + spacing
    const OBS_ROW_HEIGHT = 42; 
    const NARRATIVE_BUFFER = 150; // Text box at bottom
    
    const observations = reportData.safety?.observations || [];
    let remainingObs = [...observations];
    
    let workingPage = currentPage;
    let pageIndex = 0;

    // Safety Loop
    // We treat the "Content" as a list of Observations.
    // However, if Observations is EMPTY, we still have to render Header + Narrative.
    
    const hasObs = remainingObs.length > 0;
    
    if (!hasObs) {
        // Simple Case: Just Header + Narrative
        // Check if fits
        const totalHeight = HEADER_HEIGHT + NARRATIVE_BUFFER;
        if (workingPage.availableHeight < totalHeight) {
            pages.push(workingPage);
            workingPage = {
                 pageNumber: pages.length + 1,
                 isFirstPage: false,
                 sections: [],
                 usedHeight: 0,
                 availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
            };
        }
        
        const placement: PagePlacement = {
            sectionId: section.id,
            startsOnPage: workingPage.pageNumber,
            estimatedHeight: totalHeight,
            continuesFromPrevious: false,
            renderConfig: { showHeader: true, showFooter: true } // Show all
        };
        workingPage.sections.push(placement);
        workingPage.usedHeight += totalHeight;
        workingPage.availableHeight -= totalHeight;
        placements.push(placement);
        
        return { currentPage: workingPage, placements };
    }
    
    // Complex Case: Observations exist
    while (remainingObs.length > 0 || pageIndex === 0) { // Should run at least once logic
        const isFirstPage = pageIndex === 0;
        const currentHeaderHeight = isFirstPage ? HEADER_HEIGHT : 40; // 40 = Obs table header only
        
        // Calculate space for observations
        let availableForObs = workingPage.availableHeight - currentHeaderHeight;
        
        // Check if we can fit ANY observations?
        // If header is huge and we are on a used page, maybe we need to push to fresh page immediately?
        if (availableForObs < (OBS_OFFSET_TOP + OBS_ROW_HEIGHT)) {
             pages.push(workingPage);
             workingPage = {
                 pageNumber: pages.length + 1,
                 isFirstPage: false,
                 sections: [],
                 usedHeight: 0,
                 availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
            };
            availableForObs = workingPage.availableHeight - currentHeaderHeight;
        }

        const maxObsRows = Math.max(0, Math.floor((availableForObs - OBS_OFFSET_TOP - 40) / OBS_ROW_HEIGHT)); // 40 buffer
        
        const itemsThisPage = remainingObs.slice(0, maxObsRows);
        const startIndex = observations.length - remainingObs.length;
        
        // Check if we finished all items
        if (itemsThisPage.length === remainingObs.length) {
            // All items fit. Can we fit the FOOTER (Narrative) too?
            const obsHeight = OBS_OFFSET_TOP + (itemsThisPage.length * OBS_ROW_HEIGHT);
            const heightWithFooter = currentHeaderHeight + obsHeight + NARRATIVE_BUFFER;
            
            if (heightWithFooter <= workingPage.availableHeight) {
                // Yes! Everything fits on this page.
                 const placement: PagePlacement = {
                    sectionId: isFirstPage ? section.id : `${section.id}_continued_${pageIndex}`,
                    startsOnPage: workingPage.pageNumber,
                    estimatedHeight: heightWithFooter,
                    continuesFromPrevious: !isFirstPage,
                    dataRange: { start: startIndex, end: startIndex + itemsThisPage.length },
                    renderConfig: { showHeader: isFirstPage, showFooter: true }
                };
                workingPage.sections.push(placement);
                workingPage.usedHeight += heightWithFooter;
                workingPage.availableHeight -= heightWithFooter;
                placements.push(placement);
                remainingObs = [];
            } else {
                // No. Items fit, but Footer doesn't.
                // Render items here, push footer to next page.
                const heightWithoutFooter = currentHeaderHeight + obsHeight + 20;
                 const placement: PagePlacement = {
                    sectionId: isFirstPage ? section.id : `${section.id}_continued_${pageIndex}`,
                    startsOnPage: workingPage.pageNumber,
                    estimatedHeight: heightWithoutFooter,
                    continuesFromPrevious: !isFirstPage,
                    dataRange: { start: startIndex, end: startIndex + itemsThisPage.length },
                    renderConfig: { showHeader: isFirstPage, showFooter: false }
                };
                workingPage.sections.push(placement);
                workingPage.usedHeight += heightWithoutFooter;
                workingPage.availableHeight -= heightWithoutFooter;
                placements.push(placement);
                remainingObs = []; // Items done
                
                // New Page for Footer
                pages.push(workingPage);
                workingPage = {
                     pageNumber: pages.length + 1,
                     isFirstPage: false,
                     sections: [],
                     usedHeight: 0,
                     availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
                };
                const footerPlacement: PagePlacement = {
                    sectionId: `${section.id}_footer`,
                    startsOnPage: workingPage.pageNumber,
                    estimatedHeight: NARRATIVE_BUFFER + 60, // Header overhead for 'continued' page
                    continuesFromPrevious: true,
                    dataRange: { start: 0, end: 0 }, // No items
                    renderConfig: { showHeader: false, showFooter: true }
                };
                workingPage.sections.push(footerPlacement);
                workingPage.usedHeight += (NARRATIVE_BUFFER + 60);
                workingPage.availableHeight -= (NARRATIVE_BUFFER + 60);
                placements.push(footerPlacement);
            }
        } else {
             // Not all items fit. Fill this page, continue.
             const obsHeight = OBS_OFFSET_TOP + (itemsThisPage.length * OBS_ROW_HEIGHT);
             const pageHeight = currentHeaderHeight + obsHeight + 20;
             
              const placement: PagePlacement = {
                sectionId: isFirstPage ? section.id : `${section.id}_continued_${pageIndex}`,
                startsOnPage: workingPage.pageNumber,
                estimatedHeight: pageHeight,
                continuesFromPrevious: !isFirstPage,
                dataRange: { start: startIndex, end: startIndex + itemsThisPage.length },
                renderConfig: { showHeader: isFirstPage, showFooter: false } // No footer yet
            };
            workingPage.sections.push(placement);
            workingPage.usedHeight += pageHeight;
            workingPage.availableHeight -= pageHeight;
            placements.push(placement);
            
            remainingObs = remainingObs.slice(itemsThisPage.length);
            
            // New Page
            pages.push(workingPage);
            workingPage = {
                 pageNumber: pages.length + 1,
                 isFirstPage: false,
                 sections: [],
                 usedHeight: 0,
                 availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
            };
        }
        
        pageIndex++;
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
