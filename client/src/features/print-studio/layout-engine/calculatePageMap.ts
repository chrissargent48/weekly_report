import { 
  PrintConfig, 
  PrintSection, 
  PageMap, 
  PageContent, 
  PagePlacement,
  ReportData 
} from '../config/printConfig.types';
import { PAGE_POINTS, FOOTER_POINTS, SAFETY_MARGIN } from './pageConstants';
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
       const listPlacements = handleSplittableList(
           section,
           metrics,
           currentPage,
           pages
       );

       currentPage = listPlacements.currentPage;
       listPlacements.placements.forEach((p, idx) => {
           if (idx === 0) sectionPlacements.set(section.id, p);
       });
       continue;
    }
    
    // 3. Handle Monolithic Blocks (Overview, etc.)
    // Standard measuring for non-splittable blocks
    const sectionHeight = measureSection({
      section,
      spacing: config.spacing,
      reportData,
      projectConfig,
      baselines,
    });

    if (sectionHeight <= currentPage.availableHeight) {
      // Fits
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
      // Doesn't fit -> New Page
      pages.push(currentPage);
      
      currentPage = createNewPage(pages.length + 1);
      
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
 * GENERIC SPLITTING LOGIC
 * Handles any section that consists of a list of items (rows) + optional header/footer.
 */
function handleSplittableList(
    section: PrintSection,
    metrics: SectionMetrics,
    currentPage: PageContent,
    pages: PageContent[]
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
        
        // Determine header requirement for THIS page chunk
        // If it's the very first page of the section, we need the full header.
        // If it's a continuation page, we might imply a smaller header or just the table header, 
        // but for now we assume the generic splitter repeats the table header logic inside the component 
        // if we flag it as 'continued'. 
        // Simplified: The metric 'headerHeight' from getSectionMetrics is usually the "Start of Section" header.
        // We need a way to know "Continued Header Height" (e.g. just table column headers).
        // For simplicity, we'll assume continuation pages just have a smaller buffer or standard table header (approx 40px).
        
        const currentHeaderHeight = isFirstSectionPage ? headerHeight : 45; // 45px guess for table header only
        const remainingItemsInList = totalItems - processedItems;
        
        // Calculate how many items fit on current page
        // Available space = Page - Header - (Maybe Footer if we can fit it?)
        
        let availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        
        // Check if we should even start here?
        // Minimum viable height: Header + 1 Row
        if (availableForRows < rowHeight) {
            // Not enough space for even one row. Push to next page.
            pages.push(workingPage);
            workingPage = createNewPage(pages.length + 1);
            availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        }

        // Potential rows that fit
        const maxRowsThatFit = Math.floor(availableForRows / rowHeight);
        
        // How many should we take?
        const itemsToTake = Math.min(remainingItemsInList, maxRowsThatFit);
        
        // IF we took ALL remaining items, can we ALSO fit the footer?
        const canFinishHere = itemsToTake === remainingItemsInList;
        
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
                    renderConfig: { showHeader: isFirstSectionPage, showFooter: true } // Show footer!
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
                    renderConfig: { showHeader: isFirstSectionPage, showFooter: false } // Hide footer
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
            // Cannot finish here, populate page and continue
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
                renderConfig: { showHeader: isFirstSectionPage, showFooter: false }
            };
            
            workingPage.sections.push(placement);
            workingPage.usedHeight += height;
            workingPage.availableHeight -= height;
            placements.push(placement);
            
            processedItems += rowsTaking;
            
            // Force new page for next chunk
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

