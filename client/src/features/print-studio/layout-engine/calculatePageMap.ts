import {
  PrintConfig,
  PrintSection,
  PageMap,
  PageContent,
  PagePlacement,
  ReportData,
  ManualPageBreak,
  ReportState,
  PageDefinition,
  LayoutFragment
} from '../config/printConfig.types';
import { PAGE_POINTS, FOOTER_POINTS, SAFETY_MARGIN, ORPHAN_THRESHOLD, MIN_CONTENT_AFTER_HEADER } from './pageConstants';
import { measureCover } from './measureCover';
import { getSectionMetrics, SectionMetrics, measureSection } from './measureSection';

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
  // 1. Initialize State
  const state: ReportState = {
      entities: {},
      pages: {},
      pageOrder: []
  };

  const sectionPlacements = new Map<string, PagePlacement>();
  
  // Get sorted, visible sections
  const visibleSections = config.sections
    .filter(s => s.included)
    .sort((a, b) => a.order - b.order);
  
  // Calculate cover height for page 1
  const coverMeasurement = measureCover(config);
  
  // Initialize page 1
  let currentPageId = 'page_1';
  let currentPage: PageDefinition = {
    id: currentPageId,
    pageIndex: 1,
    fragments: [],
    usedHeight: coverMeasurement.totalHeight,
    availableHeight: PAGE_POINTS.USABLE_HEIGHT - coverMeasurement.totalHeight - FOOTER_POINTS.HEIGHT,
  };
  
  // Process each section
  for (const section of visibleSections) {
    // Register Entity
    state.entities[section.id] = {
        id: section.id,
        type: section.id, // e.g. 'weather', 'progress'
        data: reportData, // Pass full data context for now, ideally scoped
        config: config.cover // pass section config
    };

    // Get granular metrics for smart splitting
    const metrics = getSectionMetrics({
        section,
        spacing: config.spacing,
        reportData,
        projectConfig,
        baselines
    });

    // MANUAL PAGE BREAK: If user has set forcePageBreakBefore, start a new page
    if (section.forcePageBreakBefore && currentPage.fragments.length > 0) {
      // Commit current page
      state.pages[currentPageId] = currentPage;
      state.pageOrder.push(currentPageId);

      // Start new page
      currentPageId = `page_${state.pageOrder.length + 1}`;
      currentPage = createNewPageDef(currentPageId, state.pageOrder.length + 1);
    }

    // 1. Handle Photos (Grid Layout - Special Case)
    if (section.id === 'photos') {
      const result = handlePhotosSection(
        section,
        currentPage,
        state,
        reportData
      );
      
      currentPage = result.currentPage;
      // Legacy placements update
      result.params.forEach((p, idx) => {
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

       const result = handleSplittableList(
           section,
           metrics,
           currentPage,
           state,
           sectionBreaks
       );

       currentPage = result.currentPage;
       result.params.forEach((p, idx) => {
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
    // We treat monolithic blocks as "Head" type fragments that shouldn't be split
    const forcePageBreak = shouldForcePageBreak(currentPage.availableHeight, metrics);
    
    if (!forcePageBreak && sectionHeight <= currentPage.availableHeight) {
      // Fits on current page
      const fragment: LayoutFragment = {
          id: `${section.id}_full`,
          entityId: section.id,
          type: 'full',
          estimatedHeight: sectionHeight
      };
      
      currentPage.fragments.push(fragment);
      currentPage.usedHeight += sectionHeight;
      currentPage.availableHeight -= sectionHeight;
      
      sectionPlacements.set(section.id, { sectionId: section.id, startsOnPage: currentPage.pageIndex, estimatedHeight: sectionHeight, continuesFromPrevious: false });
      
    } else {
      // Force new page
      if (currentPage.fragments.length > 0) {
        state.pages[currentPageId] = currentPage;
        state.pageOrder.push(currentPageId);

        currentPageId = `page_${state.pageOrder.length + 1}`;
        currentPage = createNewPageDef(currentPageId, state.pageOrder.length + 1);
      }

      const fragment: LayoutFragment = {
          id: `${section.id}_full`,
          entityId: section.id,
          type: 'full',
          estimatedHeight: sectionHeight
      };

      currentPage.fragments.push(fragment);
      currentPage.usedHeight += sectionHeight;
      currentPage.availableHeight -= sectionHeight;

      sectionPlacements.set(section.id, {
          sectionId: section.id,
          startsOnPage: currentPage.pageIndex,
          estimatedHeight: sectionHeight,
          continuesFromPrevious: false,
          cssHints: forcePageBreak ? { pageBreakBefore: 'always' } : undefined
      });
    }
  }
  
  // Push final page
  if (currentPage.fragments.length > 0 || currentPage.pageIndex === 1) {
    state.pages[currentPageId] = currentPage;
    state.pageOrder.push(currentPageId);
  }

  // Reconstruct the pages array from normalized state so ALL pages are included.
  // Helper functions (handleSplittableList, handlePhotosSection) commit intermediate
  // pages to state.pages/state.pageOrder but not to the legacy pages[] array.
  const finalPages = state.pageOrder.map((pageId, idx) =>
    mapPageDefToContent(state.pages[pageId], idx === 0)
  );

  return {
    totalPages: finalPages.length,
    pages: finalPages,
    sectionPlacements,
    normalized: state // Return the full normalized state tree
  };
}

/**
 * Creates a new blank page definition
 */
function createNewPageDef(id: string, index: number): PageDefinition {
    return {
        id,
        pageIndex: index,
        fragments: [],
        usedHeight: 0,
        availableHeight: PAGE_POINTS.USABLE_HEIGHT - FOOTER_POINTS.HEIGHT,
    };
}

/**
 * Maps the new structure back to the old PageContent structure for compatibility
 */
function mapPageDefToContent(def: PageDefinition, isFirst: boolean): PageContent {
    return {
        pageNumber: def.pageIndex,
        isFirstPage: isFirst,
        usedHeight: def.usedHeight,
        availableHeight: def.availableHeight,
        sections: def.fragments.map(f => ({
            sectionId: f.entityId,
            startsOnPage: def.pageIndex,
            estimatedHeight: f.estimatedHeight,
            continuesFromPrevious: f.type === 'body' || f.type === 'tail',
            dataRange: f.slice ? { start: f.slice.startIndex, end: f.slice.endIndex } : undefined,
            renderConfig: {
                showHeader: f.type === 'head' || f.type === 'full',
                showContinuedHeader: f.continuation?.hasHeader,
                showFooter: f.continuation?.hasFooter
            }
        }))
    };
}

/**
 * ORPHAN PREVENTION CHECK
 */
function shouldForcePageBreak(
  availableHeight: number,
  metrics: SectionMetrics
): boolean {
  if (metrics.hasOrphanRisk && availableHeight < ORPHAN_THRESHOLD) {
    return true;
  }
  if (availableHeight < metrics.headerHeight + MIN_CONTENT_AFTER_HEADER) {
    return true;
  }
  return false;
}

/**
 * GENERIC SPLITTING LOGIC (Normalized)
 */
function handleSplittableList(
    section: PrintSection,
    metrics: SectionMetrics,
    currentPage: PageDefinition,
    state: ReportState,
    manualBreaks: ManualPageBreak[] = []
): { currentPage: PageDefinition; params: PagePlacement[] } { // returning params for legacy map
    const placements: PagePlacement[] = [];
    let workingPage = currentPage;
    let workingPageId = workingPage.id;
    
    const { headerHeight, rowHeight, footerHeight, itemCount } = metrics;
    const totalItems = itemCount;
    let processedItems = 0;
    let pageIndex = 0; // Index within this section

    // Handle empty state
    if (totalItems === 0) {
        const emptyStateHeight = headerHeight + 40; 
        
        if (emptyStateHeight > workingPage.availableHeight) {
             state.pages[workingPageId] = workingPage;
             state.pageOrder.push(workingPageId);
             
             workingPageId = `page_${state.pageOrder.length + 1}`;
             workingPage = createNewPageDef(workingPageId, state.pageOrder.length + 1);
        }
        
         const fragment: LayoutFragment = {
             id: `${section.id}_empty`,
             entityId: section.id,
             type: 'full',
             estimatedHeight: emptyStateHeight,
             slice: { startIndex: 0, endIndex: 0 },
             continuation: { hasHeader: true, hasFooter: true, pageIndex: 0 }
         };

         workingPage.fragments.push(fragment);
         workingPage.usedHeight += emptyStateHeight;
         workingPage.availableHeight -= emptyStateHeight;
         placements.push(makePlacement(fragment, workingPage.pageIndex));
         
         return { currentPage: workingPage, params: placements };
    }

    // Process items
    while (processedItems < totalItems) {
        const isFirstSectionPage = pageIndex === 0;
        const currentHeaderHeight = isFirstSectionPage ? headerHeight : metrics.continuedHeaderHeight;
        const remainingItemsInList = totalItems - processedItems;
        
        // Calculate items that fit
        let availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        
        // Orphan Prevention
        const minRowsNeeded = Math.min(metrics.minItemsPerPage, remainingItemsInList);
        if (availableForRows < rowHeight * minRowsNeeded) {
            // Push to next page
            if (workingPage.fragments.length > 0) {
                state.pages[workingPageId] = workingPage;
                state.pageOrder.push(workingPageId);
                
                workingPageId = `page_${state.pageOrder.length + 1}`;
                workingPage = createNewPageDef(workingPageId, state.pageOrder.length + 1);
            }
            availableForRows = workingPage.availableHeight - currentHeaderHeight - SAFETY_MARGIN;
        }

        const maxRowsThatFit = Math.floor(availableForRows / rowHeight);
        let itemsToTake = Math.min(remainingItemsInList, maxRowsThatFit);

        // Check Manual Breaks
        const firstBreakInRange = manualBreaks
            .filter(b => b.afterRowIndex >= processedItems && b.afterRowIndex < processedItems + itemsToTake)
            .sort((a, b) => a.afterRowIndex - b.afterRowIndex)[0];

        let forcePageBreakAfter = false;
        if (firstBreakInRange) {
            const rowsToBreakPoint = firstBreakInRange.afterRowIndex - processedItems + 1;
            if (rowsToBreakPoint < itemsToTake) {
                itemsToTake = rowsToBreakPoint;
                forcePageBreakAfter = true;
            }
        }

        const canFinishHere = itemsToTake === remainingItemsInList && !forcePageBreakAfter;
        
        if (canFinishHere) {
            // Check footer space
            const heightNeeded = currentHeaderHeight + (itemsToTake * rowHeight) + footerHeight;
            
            if (heightNeeded <= workingPage.availableHeight) {
                // SUCCESS
                const fragment: LayoutFragment = {
                    id: `${section.id}_part${pageIndex}`,
                    entityId: section.id,
                    type: isFirstSectionPage ? 'full' : 'tail',
                    estimatedHeight: heightNeeded,
                    slice: { startIndex: processedItems, endIndex: processedItems + itemsToTake },
                    continuation: { 
                        hasHeader: isFirstSectionPage, 
                        hasFooter: true,
                        pageIndex: pageIndex 
                    }
                };
                
                workingPage.fragments.push(fragment);
                workingPage.usedHeight += heightNeeded;
                workingPage.availableHeight -= heightNeeded;
                placements.push(makePlacement(fragment, workingPage.pageIndex));
                
                processedItems += itemsToTake;
            } else {
                // Fits items but not footer -> Push Footer to orphan page
                const heightWithoutFooter = currentHeaderHeight + (itemsToTake * rowHeight) + SAFETY_MARGIN;
                
                 const fragment: LayoutFragment = {
                    id: `${section.id}_part${pageIndex}`,
                    entityId: section.id,
                    type: isFirstSectionPage ? 'head' : 'body',
                    estimatedHeight: heightWithoutFooter,
                    slice: { startIndex: processedItems, endIndex: processedItems + itemsToTake },
                    continuation: { 
                        hasHeader: isFirstSectionPage, 
                        hasFooter: false,
                        pageIndex: pageIndex 
                    }
                };
                workingPage.fragments.push(fragment);
                workingPage.usedHeight += heightWithoutFooter;
                workingPage.availableHeight -= heightWithoutFooter;
                placements.push(makePlacement(fragment, workingPage.pageIndex));
                processedItems += itemsToTake;
                
                // New Page for Footer
                state.pages[workingPageId] = workingPage;
                state.pageOrder.push(workingPageId);
                
                workingPageId = `page_${state.pageOrder.length + 1}`;
                workingPage = createNewPageDef(workingPageId, state.pageOrder.length + 1);
                
                const footerFragment: LayoutFragment = {
                     id: `${section.id}_footer`,
                     entityId: section.id,
                     type: 'tail',
                     estimatedHeight: footerHeight + 40,
                     slice: { startIndex: totalItems, endIndex: totalItems }, 
                     continuation: { hasHeader: false, hasFooter: true, pageIndex: pageIndex + 1 }
                };
                workingPage.fragments.push(footerFragment);
                workingPage.usedHeight += (footerHeight + 40);
                workingPage.availableHeight -= (footerHeight + 40);
                placements.push(makePlacement(footerFragment, workingPage.pageIndex));
            }
        } else {
            // Cannot finish here
            const rowsTaking = Math.max(1, itemsToTake);
            const height = currentHeaderHeight + (rowsTaking * rowHeight) + SAFETY_MARGIN;

             const fragment: LayoutFragment = {
                id: `${section.id}_part${pageIndex}`,
                entityId: section.id,
                type: isFirstSectionPage ? 'head' : 'body',
                estimatedHeight: height,
                slice: { startIndex: processedItems, endIndex: processedItems + rowsTaking },
                continuation: { 
                    hasHeader: isFirstSectionPage, 
                    hasFooter: false,
                    pageIndex: pageIndex 
                }
            };

            workingPage.fragments.push(fragment);
            workingPage.usedHeight += height;
            workingPage.availableHeight -= height;
            
            placements.push({
                ...makePlacement(fragment, workingPage.pageIndex),
                cssHints: forcePageBreakAfter ? { pageBreakBefore: 'always' } : undefined
            });

            processedItems += rowsTaking;

            // Force new page
            state.pages[workingPageId] = workingPage;
            state.pageOrder.push(workingPageId);
            
            workingPageId = `page_${state.pageOrder.length + 1}`;
            workingPage = createNewPageDef(workingPageId, state.pageOrder.length + 1);
        }
        
        pageIndex++;
    }

    return { currentPage: workingPage, params: placements };
}

function makePlacement(f: LayoutFragment, pageIdx: number): PagePlacement {
    return {
        sectionId: f.entityId,
        startsOnPage: pageIdx,
        estimatedHeight: f.estimatedHeight,
        continuesFromPrevious: f.type === 'body' || f.type === 'tail',
        dataRange: f.slice ? { start: f.slice.startIndex, end: f.slice.endIndex } : undefined,
        renderConfig: {
            showHeader: f.continuation?.hasHeader,
            showContinuedHeader: f.type === 'body' || f.type === 'tail', // approximate
            showFooter: f.continuation?.hasFooter
        }
    };
}


/**
 * Special handler for photos section (Normalized)
 */
function handlePhotosSection(
  section: PrintSection,
  currentPage: PageDefinition,
  state: ReportState,
  reportData: ReportData
): { currentPage: PageDefinition; params: PagePlacement[] } {
  const placements: PagePlacement[] = [];
  const photosPerPage = 6; 
  const photoPageHeight = 600; 
  const photoCount = reportData.photos?.length || 0;
  
  if (photoCount === 0) return { currentPage, params: placements };

  const photoPages = Math.ceil(photoCount / photosPerPage);
  let workingPage = currentPage;
  let workingPageId = workingPage.id;
  
  for (let i = 0; i < photoPages; i++) {
    const isFirstPhotoPage = i === 0;
    const heightNeeded = photoPageHeight;
    
    if (heightNeeded > workingPage.availableHeight) {
        state.pages[workingPageId] = workingPage;
        state.pageOrder.push(workingPageId);
        
        workingPageId = `page_${state.pageOrder.length + 1}`;
        workingPage = createNewPageDef(workingPageId, state.pageOrder.length + 1);
    }
    
    const fragment: LayoutFragment = {
        id: `${section.id}_page${i}`,
        entityId: section.id,
        type: isFirstPhotoPage ? 'head' : 'body',
        estimatedHeight: heightNeeded,
        slice: { startIndex: i * photosPerPage, endIndex: (i + 1) * photosPerPage },
        continuation: { hasHeader: isFirstPhotoPage, hasFooter: false, pageIndex: i }
    };
      
    workingPage.fragments.push(fragment);
    workingPage.usedHeight += heightNeeded;
    workingPage.availableHeight -= heightNeeded;
    placements.push(makePlacement(fragment, workingPage.pageIndex));
  }
  
  return { currentPage: workingPage, params: placements };
}

