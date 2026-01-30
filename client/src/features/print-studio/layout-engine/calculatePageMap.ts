import {
  PrintConfig,
  PrintSection,
  PageMap,
  PageContent,
  PagePlacement,
  ReportData,
  ManualPageBreak
} from '../config/printConfig.types';
import { PAGE_POINTS, FOOTER_POINTS, SAFETY_MARGIN, ORPHAN_THRESHOLD, MIN_CONTENT_AFTER_HEADER, MIN_ROWS_PER_PAGE } from './pageConstants';
import { measureCover } from './measureCover';
import { measureSection, getSectionMetrics, SectionMetrics } from './measureSection';

import { ProjectConfig, ProjectBaselines } from '../../../types';

/**
 * MAIN LAYOUT ENGINE FUNCTION
 * 
 * Calculates exactly what content goes on each page BEFORE rendering.
 * Uses a generic generic splitting strategy for lists/tables to ensure fluid layout.
 */
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
  
  // Initialize page 1
  let currentPage: PageContent = {
    pageNumber: 1,
    isFirstPage: true,
    sections: [],
    usedHeight: coverMeasurement.totalHeight,
    availableHeight: PAGE_POINTS.USABLE_HEIGHT - coverMeasurement.totalHeight - FOOTER_POINTS.HEIGHT,
  };
  
  // Process each section
  for (const section of visibleSections) {
    // Get granular metrics for smart splitting
    const metrics = getSectionMetrics({
        section,
        spacing: config.spacing,
        reportData,
        projectConfig,
        baselines
    });

    // MANUAL PAGE BREAK: If user has set forcePageBreakBefore, start a new page
    if (section.forcePageBreakBefore && currentPage.sections.length > 0) {
      pages.push(currentPage);
      currentPage = createNewPage(pages.length + 1);
    }

    // 1. Handle Photos (Grid Layout - Special Case)
    if (section.id === 'photos') {
      const photosPlacements = handlePhotosSection(
        section,
        currentPage,
        pages,
        reportData
      );
      
      currentPage = photosPlacements.currentPage;
      photosPlacements.placements.forEach((p, idx) => {
        if (idx === 0) sectionPlacements.set(section.id, p);
      });
      continue;
    }

    // 2. Handle Splittable Lists (Tables, Observations, etc.)
    if (metrics.isSplittable) {
       // Get manual breaks for this section
       const sectionBreaks = (config.manualBreaks || []).filter(
         b => b.sectionId === section.id
       );

       const listPlacements = handleSplittableList(
           section,
           metrics,
           currentPage,
           pages,
           sectionBreaks
       );

       currentPage = listPlacements.currentPage;
       listPlacements.placements.forEach((p, idx) => {
           if (idx === 0) sectionPlacements.set(section.id, p);
       });
       continue;
    }
    
    // 3. Handle Monolithic Blocks (Overview, etc.)
    // Standard measuring for non-splittable blocks
    const baseSectionHeight = measureSection({
      section,
      spacing: config.spacing,
      reportData,
      projectConfig,
      baselines,
    });

    // Add user-defined section padding (Word-style spacing)
    const sectionPad = config.sectionPadding?.[section.id];
    const sectionHeight = baseSectionHeight + (sectionPad?.top || 0) + (sectionPad?.bottom || 0);

    // ORPHAN PREVENTION: Check if header would be orphaned at page bottom
    const forcePageBreak = shouldForcePageBreak(currentPage.availableHeight, metrics);
    
    if (!forcePageBreak && sectionHeight <= currentPage.availableHeight) {
      // Fits on current page
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
      // Force new page (either orphan prevention or doesn't fit)
      if (currentPage.sections.length > 0) {
        pages.push(currentPage);
        currentPage = createNewPage(pages.length + 1);
      }
      
      const placement: PagePlacement = {
        sectionId: section.id,
        startsOnPage: currentPage.pageNumber,
        estimatedHeight: sectionHeight,
        continuesFromPrevious: false,
        // Add CSS hint for forced page break
        cssHints: forcePageBreak ? { pageBreakBefore: true } : undefined,
      };
      
      currentPage.sections.push(placement);
      currentPage.usedHeight += sectionHeight;
      currentPage.availableHeight -= sectionHeight;
      sectionPlacements.set(section.id, placement);
    }
  }
  
  // Push final page
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
 * Creates a new blank page structure
 */
function createNewPage(pageNumber: number): PageContent {
    return {
        pageNumber,
        isFirstPage: false,
        sections: [],
        usedHeight: 0,
        availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
    };
}

/**
 * ORPHAN PREVENTION CHECK
 * 
 * Determines if we should force a page break before placing a section.
 * Returns true if:
 * 1. Section has orphan risk AND available space is below threshold
 * 2. There's not enough room for header + minimum content
 */
function shouldForcePageBreak(
  availableHeight: number,
  metrics: SectionMetrics
): boolean {
  // If section has internal headers (KPI cards, topic boxes) and would start 
  // within ORPHAN_THRESHOLD of page bottom, force page break
  if (metrics.hasOrphanRisk && availableHeight < ORPHAN_THRESHOLD) {
    return true;
  }
  
  // If section can't fit header + minimum content, start a new page
  if (availableHeight < metrics.headerHeight + MIN_CONTENT_AFTER_HEADER) {
    return true;
  }
  
  return false;
}

/**
 * GENERIC SPLITTING LOGIC
 * Handles any section that consists of a list of items (rows) + optional header/footer.
 * Respects manual page breaks inserted by the user.
 */
function handleSplittableList(
    section: PrintSection,
    metrics: SectionMetrics,
    currentPage: PageContent,
    pages: PageContent[],
    manualBreaks: ManualPageBreak[] = []
): { currentPage: PageContent; placements: PagePlacement[] } {
    const placements: PagePlacement[] = [];
    let workingPage = currentPage;
    
    const { headerHeight, rowHeight, footerHeight, itemCount } = metrics;
    const totalItems = itemCount;
    let processedItems = 0;
    let pageIndex = 0;

    // Handle empty state separately or as 0 items
    if (totalItems === 0) {
        // Just render the "No Data" state (Header + small buffer)
        // Treated as monolithic small block
        const emptyStateHeight = headerHeight + 40; 
        
        if (emptyStateHeight > workingPage.availableHeight) {
             pages.push(workingPage);
             workingPage = createNewPage(pages.length + 1);
        }
        
         const placement: PagePlacement = {
             sectionId: section.id,
             startsOnPage: workingPage.pageNumber,
             estimatedHeight: emptyStateHeight,
             continuesFromPrevious: false,
             dataRange: { start: 0, end: 0 },
             renderConfig: { showHeader: true, showFooter: true }
         };
         workingPage.sections.push(placement);
         workingPage.usedHeight += emptyStateHeight;
         workingPage.availableHeight -= emptyStateHeight;
         placements.push(placement);
         
         return { currentPage: workingPage, placements };
    }

    // Process items
    while (processedItems < totalItems) {
        const isFirstSectionPage = pageIndex === 0;
        
        // Use the enhanced metrics for header height:
        // - First page gets full section header (title, KPI cards, etc.)
        // - Continuation pages get just the table header
        const currentHeaderHeight = isFirstSectionPage 
            ? headerHeight 
            : metrics.continuedHeaderHeight;
        
        const remainingItemsInList = totalItems - processedItems;
        
        // Calculate how many items fit on current page
        // Available space = Page - Header - Safety margin
        let availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        
        // ORPHAN PREVENTION: Ensure we can fit at least minItemsPerPage rows
        // If not enough space for minimum rows, start a new page
        const minRowsNeeded = Math.min(metrics.minItemsPerPage, remainingItemsInList);
        if (availableForRows < rowHeight * minRowsNeeded) {
            // Not enough space for minimum viable content. Push to next page.
            if (workingPage.sections.length > 0) {
                pages.push(workingPage);
                workingPage = createNewPage(pages.length + 1);
            }
            availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        }

        // Potential rows that fit
        const maxRowsThatFit = Math.floor(availableForRows / rowHeight);

        // How many should we take?
        let itemsToTake = Math.min(remainingItemsInList, maxRowsThatFit);

        // CHECK FOR MANUAL PAGE BREAKS
        // Find the first manual break within the range [processedItems, processedItems + itemsToTake)
        // A break at index N means "break AFTER row N", so we include row N in current page
        const firstBreakInRange = manualBreaks
            .filter(b => b.afterRowIndex >= processedItems && b.afterRowIndex < processedItems + itemsToTake)
            .sort((a, b) => a.afterRowIndex - b.afterRowIndex)[0];

        let forcePageBreakAfter = false;
        if (firstBreakInRange) {
            // Truncate to include only rows up to and including the break point
            // afterRowIndex is 0-based, so if break is after row 2, we take rows 0,1,2 (3 items from start)
            const rowsToBreakPoint = firstBreakInRange.afterRowIndex - processedItems + 1;
            if (rowsToBreakPoint < itemsToTake) {
                itemsToTake = rowsToBreakPoint;
                forcePageBreakAfter = true;
            }
        }

        // IF we took ALL remaining items, can we ALSO fit the footer?
        const canFinishHere = itemsToTake === remainingItemsInList && !forcePageBreakAfter;
        
        if (canFinishHere) {
            // Check footer space
            const heightNeeded = currentHeaderHeight + (itemsToTake * rowHeight) + footerHeight;
            
            if (heightNeeded <= workingPage.availableHeight) {
                // SUCCESS: Fits completely (Items + Footer)
                const placement: PagePlacement = {
                    sectionId: isFirstSectionPage ? section.id : `${section.id}_continued_${pageIndex}`,
                    startsOnPage: workingPage.pageNumber,
                    estimatedHeight: heightNeeded,
                    continuesFromPrevious: !isFirstSectionPage,
                    dataRange: { start: processedItems, end: processedItems + itemsToTake },
                    // Show full header on first page, continued header on subsequent pages
                    renderConfig: { 
                        showHeader: isFirstSectionPage, 
                        showContinuedHeader: !isFirstSectionPage,
                        showFooter: true 
                    }
                };
                
                workingPage.sections.push(placement);
                workingPage.usedHeight += heightNeeded;
                workingPage.availableHeight -= heightNeeded;
                placements.push(placement);
                
                processedItems += itemsToTake; // Done
            } else {
                // FAILURE: Items fit, but Footer implies overflow.
                // Strategy: Render items here, push Footer to orphan page? 
                // OR push some items to next page to keep footer company? (Widow/Orphan control)
                // START SIMPLE: Render items, push Footer to new page.
                
                const heightWithoutFooter = currentHeaderHeight + (itemsToTake * rowHeight) + SAFETY_MARGIN;
                
                 const placement: PagePlacement = {
                    sectionId: isFirstSectionPage ? section.id : `${section.id}_continued_${pageIndex}`,
                    startsOnPage: workingPage.pageNumber,
                    estimatedHeight: heightWithoutFooter,
                    continuesFromPrevious: !isFirstSectionPage,
                    dataRange: { start: processedItems, end: processedItems + itemsToTake },
                    renderConfig: { 
                        showHeader: isFirstSectionPage, 
                        showContinuedHeader: !isFirstSectionPage,
                        showFooter: false 
                    }
                };
                workingPage.sections.push(placement);
                workingPage.usedHeight += heightWithoutFooter;
                workingPage.availableHeight -= heightWithoutFooter;
                placements.push(placement);
                processedItems += itemsToTake;
                
                // Now create generic footer-only placement handling
                // Ideally the next iteration handles 0 items?
                // Let's force a loop continuation with 0 remaining items?
                // Actually if we break loop, we need to handle footer explicitly.
                
                // Create separate footer placement
                pages.push(workingPage);
                workingPage = createNewPage(pages.length + 1);
                
                const footerPlacement: PagePlacement = {
                     sectionId: `${section.id}_footer`,
                     startsOnPage: workingPage.pageNumber,
                     estimatedHeight: footerHeight + 40, // + buffer
                     continuesFromPrevious: true,
                     dataRange: { start: totalItems, end: totalItems }, // No items
                     renderConfig: { showHeader: false, showFooter: true }
                };
                workingPage.sections.push(footerPlacement);
                workingPage.usedHeight += (footerHeight + 40);
                workingPage.availableHeight -= (footerHeight + 40);
                placements.push(footerPlacement);
            }
        } else {
            // Cannot finish here (either not enough space OR manual break forces split)
            // Ensure we take at least 1 row if we forced a new page, otherwise we loop forever
            // (The check `availableForRows < rowHeight` above handles this usually)

            const rowsTaking = Math.max(1, itemsToTake); // Force progress
            const height = currentHeaderHeight + (rowsTaking * rowHeight) + SAFETY_MARGIN;

             const placement: PagePlacement = {
                sectionId: isFirstSectionPage ? section.id : `${section.id}_continued_${pageIndex}`,
                startsOnPage: workingPage.pageNumber,
                estimatedHeight: height,
                continuesFromPrevious: !isFirstSectionPage,
                dataRange: { start: processedItems, end: processedItems + rowsTaking },
                renderConfig: {
                    showHeader: isFirstSectionPage,
                    showContinuedHeader: !isFirstSectionPage,
                    showFooter: false
                },
                // Add CSS hint for manual breaks
                cssHints: forcePageBreakAfter ? { pageBreakBefore: true } : undefined,
            };

            workingPage.sections.push(placement);
            workingPage.usedHeight += height;
            workingPage.availableHeight -= height;
            placements.push(placement);

            processedItems += rowsTaking;

            // Force new page for next chunk (natural split or manual break)
            pages.push(workingPage);
            workingPage = createNewPage(pages.length + 1);
        }
        
        pageIndex++;
    }

    return { currentPage: workingPage, placements };
}


/**
 * Special handler for photos section
 */
function handlePhotosSection(
  section: PrintSection,
  currentPage: PageContent,
  pages: PageContent[],
  reportData: ReportData
): { currentPage: PageContent; placements: PagePlacement[] } {
  const placements: PagePlacement[] = [];
  const photosPerPage = 6; 
  const photoPageHeight = 600; 
  const photoCount = reportData.photos?.length || 0;
  
  if (photoCount === 0) return { currentPage, placements };

  const photoPages = Math.ceil(photoCount / photosPerPage);
  let workingPage = currentPage;
  
  for (let i = 0; i < photoPages; i++) {
    const isFirstPhotoPage = i === 0;
    const heightNeeded = photoPageHeight;
    
    if (heightNeeded > workingPage.availableHeight) {
        pages.push(workingPage);
        workingPage = createNewPage(pages.length + 1);
    }
    
    const placement: PagePlacement = {
        sectionId: isFirstPhotoPage ? section.id : `${section.id}_continued_${i}`,
        startsOnPage: workingPage.pageNumber,
        estimatedHeight: heightNeeded,
        continuesFromPrevious: !isFirstPhotoPage,
        dataRange: { start: i * photosPerPage, end: (i + 1) * photosPerPage }
    };
      
    workingPage.sections.push(placement);
    workingPage.usedHeight += heightNeeded;
    workingPage.availableHeight -= heightNeeded;
    placements.push(placement);
  }
  
  return { currentPage: workingPage, placements };
}

