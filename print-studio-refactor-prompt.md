# PRINT STUDIO ARCHITECTURE REFACTOR

## CONTEXT

I have a Print Studio feature that generates Weekly Progress Reports for construction projects. Currently, everything is controlled by a single component `PrintPreviewModal.tsx` which handles state management, UI controls, HTML preview rendering, AND PDF generation. This monolithic approach is causing layout issues - specifically, content overflows page boundaries because the HTML preview and PDF generator don't share a common layout calculation layer.

The immediate symptom: The "Safety is a core value" banner and content below it spills past where page 1 should end, creating misaligned page breaks.

---

## GOAL

Refactor the Print Studio into an enterprise-grade architecture with these layers:

1. **Configuration Layer** - Single source of truth for all print options
2. **Layout Engine** - Pre-calculates page breaks BEFORE rendering
3. **Renderers** - Separate HTML preview and PDF generator that BOTH consume the same page map

---

## TARGET FOLDER STRUCTURE

Create this structure under `/src/features/print-studio/`:

```
/src/features/print-studio/
│
├── /config/
│   ├── printConfig.types.ts      # TypeScript interfaces for all print options
│   ├── defaultSections.ts        # Default sections array with order and visibility
│   └── styleTokens.ts            # Spacing values, colors, fonts, measurements
│
├── /layout-engine/
│   ├── index.ts                  # Public exports
│   ├── calculatePageMap.ts       # Main function - determines what goes on each page
│   ├── measureSection.ts         # Height estimation for each section type
│   ├── measureCover.ts           # Height calculation for cover/first page content
│   └── pageConstants.ts          # Page dimensions, margins, DPI constants
│
├── /renderers/
│   ├── /html-preview/
│   │   ├── index.ts
│   │   ├── PrintPreview.tsx      # Main preview component - renders array of pages
│   │   ├── PreviewPage.tsx       # Single page wrapper with enforced dimensions
│   │   └── previewStyles.ts      # Preview-specific CSS-in-JS or class mappings
│   │
│   └── /pdf-generator/
│       ├── index.ts
│       ├── generatePDF.ts        # Main PDF orchestration function
│       ├── buildPDFPage.ts       # Builds a single PDF page
│       ├── pdfStyles.ts          # PDF-specific style constants (jsPDF/pdfmake compatible)
│       └── pdfAssets.ts          # Logo, fonts, images handling for PDF
│
├── /sections/
│   ├── index.ts
│   ├── CoverSection.tsx          # Cover page content (header image, title, photos, client info)
│   ├── ExecutiveSummary.tsx      # Executive summary section
│   ├── WeatherSection.tsx        # Weather log table
│   ├── ProgressSection.tsx       # Progress content
│   ├── LookAheadSection.tsx      # 3-week look ahead table
│   ├── ManpowerSection.tsx       # Manpower log table
│   ├── EquipmentSection.tsx      # Equipment usage table
│   ├── MaterialsSection.tsx      # Material deliveries table
│   ├── ProcurementSection.tsx    # Procurement/long lead items table
│   ├── SafetySection.tsx         # Safety stats and narrative
│   ├── FinancialsSection.tsx     # Financial summary and invoice table
│   ├── PhotosSection.tsx         # Photo documentation grid
│   └── SectionWrapper.tsx        # Common wrapper with consistent padding/margins
│
├── /components/
│   ├── PrintStudioModal.tsx      # Main modal shell - orchestrates everything
│   ├── Sidebar.tsx               # Left sidebar container
│   ├── SectionList.tsx           # Draggable/toggleable section list
│   ├── LayoutControls.tsx        # Spacing, logo scale controls
│   ├── PhotoSelector.tsx         # Hero photo and strip photo selection
│   ├── PreviewControls.tsx       # Zoom, page navigation for preview
│   └── DownloadButton.tsx        # Download button with loading state
│
├── /hooks/
│   ├── usePrintConfig.ts         # Central state management for all print options
│   ├── usePageMap.ts             # Calls layout engine, memoizes result
│   └── usePDFGeneration.ts       # Handles async PDF generation with loading states
│
└── index.ts                       # Public exports for the feature
```

---

## FILE IMPLEMENTATIONS

### 1. `/config/printConfig.types.ts`

```typescript
export interface PrintSection {
  id: string;
  label: string;
  included: boolean;
  order: number;
}

export interface PrintSpacing {
  type: 'compact' | 'standard' | 'relaxed';
  sectionGap: number;      // px between sections
  elementGap: number;      // px between elements within sections
  tablePadding: number;    // px padding in table cells
}

export interface PrintConfig {
  sections: PrintSection[];
  spacing: PrintSpacing;
  logoScale: number;           // 20-200, percentage
  heroPhotoIndex: number | null;
  stripPhotoIndexes: number[];
  showPageNumbers: boolean;
  showFooter: boolean;
  showCoverPhotos: boolean;
}

export interface PagePlacement {
  sectionId: string;
  startsOnPage: number;
  estimatedHeight: number;
  continuesFromPrevious: boolean;
}

export interface PageContent {
  pageNumber: number;
  isFirstPage: boolean;
  sections: PagePlacement[];
  usedHeight: number;
  availableHeight: number;
}

export interface PageMap {
  totalPages: number;
  pages: PageContent[];
  sectionPlacements: Map<string, PagePlacement>;
}

export interface ReportData {
  // Your existing report data structure
  projectName: string;
  projectAddress: string;
  client: string;
  jobNumber: string;
  weekEnding: string;
  photos: ReportPhoto[];
  executiveSummary: ExecutiveSummaryData;
  weather: WeatherLogEntry[];
  lookAhead: LookAheadItem[];
  manpower: ManpowerEntry[];
  equipment: EquipmentEntry[];
  materials: MaterialDelivery[];
  procurement: ProcurementItem[];
  safety: SafetyData;
  financials: FinancialsData;
  // ... etc
}
```

---

### 2. `/config/styleTokens.ts`

```typescript
export const SPACING_PRESETS = {
  compact: {
    type: 'compact' as const,
    sectionGap: 16,
    elementGap: 8,
    tablePadding: 4,
  },
  standard: {
    type: 'standard' as const,
    sectionGap: 24,
    elementGap: 12,
    tablePadding: 8,
  },
  relaxed: {
    type: 'relaxed' as const,
    sectionGap: 32,
    elementGap: 16,
    tablePadding: 12,
  },
} as const;

export const COLORS = {
  primary: '#0891B2',        // Teal/cyan brand color
  primaryDark: '#0E7490',
  accent: '#F59E0B',         // Yellow accent
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  background: '#FFFFFF',
  safetyBanner: '#0891B2',
} as const;

export const FONTS = {
  heading: "'Inter', 'Helvetica Neue', sans-serif",
  body: "'Inter', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
} as const;
```

---

### 3. `/layout-engine/pageConstants.ts`

```typescript
// All measurements in pixels at 96 DPI (standard screen resolution)
// PDF generation will convert these to points (72 DPI) as needed

export const PAGE = {
  // Letter size: 8.5" x 11" at 96 DPI
  WIDTH: 816,
  HEIGHT: 1056,
  
  // Margins
  MARGIN_TOP: 48,
  MARGIN_BOTTOM: 72,      // Extra room for footer
  MARGIN_LEFT: 48,
  MARGIN_RIGHT: 48,
  
  // Calculated usable area
  get USABLE_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get USABLE_HEIGHT() {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  },
} as const;

export const FOOTER = {
  HEIGHT: 48,
  MARGIN_TOP: 16,
} as const;

// First page has different constraints due to cover content
export const FIRST_PAGE = {
  HEADER_IMAGE_HEIGHT: 200,      // The RECON branded header image
  TITLE_BLOCK_HEIGHT: 100,       // Project name, address, report type
  PHOTO_STRIP_HEIGHT: 150,       // 3 thumbnail photos
  CLIENT_INFO_HEIGHT: 80,        // Client, Address, Job # block
  SAFETY_BANNER_HEIGHT: 40,      // "Safety is a core value" banner
  
  get COVER_TOTAL_HEIGHT() {
    return (
      this.HEADER_IMAGE_HEIGHT +
      this.TITLE_BLOCK_HEIGHT +
      this.PHOTO_STRIP_HEIGHT +
      this.CLIENT_INFO_HEIGHT +
      this.SAFETY_BANNER_HEIGHT
    );
  },
  
  // What's left for content on page 1 after cover elements
  get REMAINING_HEIGHT() {
    return PAGE.USABLE_HEIGHT - this.COVER_TOTAL_HEIGHT;
  },
} as const;

// Approximate heights for section types (will be refined by measureSection)
export const SECTION_BASE_HEIGHTS = {
  executiveSummary: 280,      // Stats row + paragraph
  weather: 320,               // 7-day table
  progress: 200,              // Variable - paragraph content
  lookAhead: 400,             // Table with ~15 rows
  manpower: 350,              // Table with ~12 rows
  equipment: 280,             // Table with ~8 rows
  materials: 200,             // Table with ~4 rows
  procurement: 280,           // Table with ~8 rows
  safety: 200,                // Stats + narrative paragraph
  financials: 180,            // Summary + invoice table
  photos: 600,                // 2x3 photo grid per "page" of photos
} as const;
```

---

### 4. `/layout-engine/measureSection.ts`

```typescript
import { PrintSection, PrintSpacing, ReportData } from '../config/printConfig.types';
import { SECTION_BASE_HEIGHTS, PAGE } from './pageConstants';

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
    case 'executiveSummary':
      // Estimate based on text length
      const summaryLength = reportData.executiveSummary?.narrative?.length || 0;
      dynamicHeight = baseHeight + Math.floor(summaryLength / 100) * 20;
      break;
      
    case 'weather':
      // 7 days * row height + header
      const weatherRows = reportData.weather?.length || 7;
      dynamicHeight = 60 + (weatherRows * 36);
      break;
      
    case 'lookAhead':
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
      dynamicHeight = 120 + Math.floor(safetyNarrativeLength / 100) * 20;
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
  const sectionHeaderHeight = 48;
  
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
```

---

### 5. `/layout-engine/measureCover.ts`

```typescript
import { PrintConfig } from '../config/printConfig.types';
import { FIRST_PAGE } from './pageConstants';

interface CoverMeasurement {
  totalHeight: number;
  headerImageHeight: number;
  titleBlockHeight: number;
  photoStripHeight: number;
  clientInfoHeight: number;
  safetyBannerHeight: number;
}

/**
 * Calculates the height of the cover/first page elements
 * These are fixed elements that always appear on page 1
 */
export function measureCover(config: PrintConfig): CoverMeasurement {
  // Header image scales with logoScale setting
  const headerImageHeight = Math.round(FIRST_PAGE.HEADER_IMAGE_HEIGHT * (config.logoScale / 100));
  
  // Photo strip only shown if enabled and photos selected
  const showPhotoStrip = config.showCoverPhotos && config.stripPhotoIndexes.length > 0;
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
  
  return {
    totalHeight,
    headerImageHeight,
    titleBlockHeight,
    photoStripHeight,
    clientInfoHeight,
    safetyBannerHeight: FIRST_PAGE.SAFETY_BANNER_HEIGHT,
  };
}
```

---

### 6. `/layout-engine/calculatePageMap.ts` (THE KEY FILE)

```typescript
import { 
  PrintConfig, 
  PrintSection, 
  PageMap, 
  PageContent, 
  PagePlacement,
  ReportData 
} from '../config/printConfig.types';
import { PAGE, FOOTER } from './pageConstants';
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
    availableHeight: PAGE.USABLE_HEIGHT - coverMeasurement.totalHeight - FOOTER.HEIGHT,
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
        availableHeight: PAGE.USABLE_HEIGHT - FOOTER.HEIGHT,
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
  
  // Don't forget to add the last page
  pages.push(currentPage);
  
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
        availableHeight: PAGE.USABLE_HEIGHT - FOOTER.HEIGHT,
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
```

---

### 7. `/hooks/usePrintConfig.ts`

```typescript
import { useState, useCallback, useMemo } from 'react';
import { PrintConfig, PrintSection, PrintSpacing } from '../config/printConfig.types';
import { SPACING_PRESETS } from '../config/styleTokens';
import { DEFAULT_SECTIONS } from '../config/defaultSections';

interface UsePrintConfigReturn {
  config: PrintConfig;
  // Section management
  toggleSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  resetSections: () => void;
  // Spacing
  setSpacing: (type: 'compact' | 'standard' | 'relaxed') => void;
  // Logo
  setLogoScale: (scale: number) => void;
  // Photos
  setHeroPhoto: (index: number | null) => void;
  setStripPhotos: (indexes: number[]) => void;
  toggleCoverPhotos: (show: boolean) => void;
  // Misc
  togglePageNumbers: (show: boolean) => void;
  toggleFooter: (show: boolean) => void;
}

export function usePrintConfig(initialConfig?: Partial<PrintConfig>): UsePrintConfigReturn {
  const [config, setConfig] = useState<PrintConfig>(() => ({
    sections: DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i })),
    spacing: SPACING_PRESETS.standard,
    logoScale: 100,
    heroPhotoIndex: 0,
    stripPhotoIndexes: [0, 1, 2],
    showPageNumbers: true,
    showFooter: true,
    showCoverPhotos: true,
    ...initialConfig,
  }));
  
  const toggleSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, included: !s.included } : s
      ),
    }));
  }, []);
  
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setConfig(prev => {
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      // Update order property to match new array position
      return {
        ...prev,
        sections: newSections.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);
  
  const resetSections = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      sections: DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i })),
    }));
  }, []);
  
  const setSpacing = useCallback((type: 'compact' | 'standard' | 'relaxed') => {
    setConfig(prev => ({
      ...prev,
      spacing: SPACING_PRESETS[type],
    }));
  }, []);
  
  const setLogoScale = useCallback((scale: number) => {
    setConfig(prev => ({
      ...prev,
      logoScale: Math.min(200, Math.max(20, scale)),
    }));
  }, []);
  
  const setHeroPhoto = useCallback((index: number | null) => {
    setConfig(prev => ({ ...prev, heroPhotoIndex: index }));
  }, []);
  
  const setStripPhotos = useCallback((indexes: number[]) => {
    setConfig(prev => ({ ...prev, stripPhotoIndexes: indexes.slice(0, 3) }));
  }, []);
  
  const toggleCoverPhotos = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showCoverPhotos: show }));
  }, []);
  
  const togglePageNumbers = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showPageNumbers: show }));
  }, []);
  
  const toggleFooter = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showFooter: show }));
  }, []);
  
  return {
    config,
    toggleSection,
    reorderSections,
    resetSections,
    setSpacing,
    setLogoScale,
    setHeroPhoto,
    setStripPhotos,
    toggleCoverPhotos,
    togglePageNumbers,
    toggleFooter,
  };
}
```

---

### 8. `/hooks/usePageMap.ts`

```typescript
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
    reportData.weather?.length,
    reportData.lookAhead?.length,
    reportData.manpower?.length,
    reportData.equipment?.length,
    reportData.materials?.length,
    reportData.procurement?.length,
    reportData.executiveSummary?.narrative?.length,
    reportData.safety?.narrative?.length,
  ]);
  
  return pageMap;
}
```

---

### 9. `/renderers/html-preview/PreviewPage.tsx`

```typescript
import React from 'react';
import { PAGE, FOOTER } from '../../layout-engine/pageConstants';
import { PageContent } from '../../config/printConfig.types';

interface PreviewPageProps {
  page: PageContent;
  children: React.ReactNode;
  showPageBreakGuide?: boolean;
}

/**
 * Renders a single page with enforced dimensions.
 * This ensures the preview accurately represents print output.
 */
export function PreviewPage({ page, children, showPageBreakGuide = false }: PreviewPageProps) {
  return (
    <div
      className="preview-page"
      style={{
        width: PAGE.WIDTH,
        minHeight: PAGE.HEIGHT,
        maxHeight: PAGE.HEIGHT,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden', // Critical: prevents content spill
        // Simulate print margins
        padding: `${PAGE.MARGIN_TOP}px ${PAGE.MARGIN_RIGHT}px ${PAGE.MARGIN_BOTTOM}px ${PAGE.MARGIN_LEFT}px`,
      }}
    >
      {/* Page content */}
      <div
        className="preview-page-content"
        style={{
          height: PAGE.USABLE_HEIGHT - FOOTER.HEIGHT,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      
      {/* Footer */}
      <div
        className="preview-page-footer"
        style={{
          position: 'absolute',
          bottom: PAGE.MARGIN_BOTTOM,
          left: PAGE.MARGIN_LEFT,
          right: PAGE.MARGIN_RIGHT,
          height: FOOTER.HEIGHT,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid #E5E7EB',
          paddingTop: FOOTER.MARGIN_TOP,
          fontSize: 10,
          color: '#6B7280',
        }}
      >
        <span>Ford City - Former Facility SLA - 2024 Site Improvements</span>
        <span>Page {page.pageNumber}</span>
      </div>
      
      {/* Optional page break guide for debugging */}
      {showPageBreakGuide && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: 'red',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
```

---

### 10. `/renderers/html-preview/PrintPreview.tsx`

```typescript
import React from 'react';
import { PrintConfig, PageMap, ReportData } from '../../config/printConfig.types';
import { PreviewPage } from './PreviewPage';
import { CoverSection } from '../../sections/CoverSection';
import { ExecutiveSummary } from '../../sections/ExecutiveSummary';
import { WeatherSection } from '../../sections/WeatherSection';
// ... import all section components

interface PrintPreviewProps {
  config: PrintConfig;
  pageMap: PageMap;
  reportData: ReportData;
  showPageBreakGuides?: boolean;
}

// Map section IDs to their components
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  executiveSummary: ExecutiveSummary,
  weather: WeatherSection,
  progress: ProgressSection,
  lookAhead: LookAheadSection,
  manpower: ManpowerSection,
  equipment: EquipmentSection,
  materials: MaterialsSection,
  procurement: ProcurementSection,
  safety: SafetySection,
  financials: FinancialsSection,
  photos: PhotosSection,
};

/**
 * Main preview component that renders all pages based on the page map.
 */
export function PrintPreview({
  config,
  pageMap,
  reportData,
  showPageBreakGuides = false,
}: PrintPreviewProps) {
  return (
    <div className="print-preview-container">
      {pageMap.pages.map((page) => (
        <PreviewPage
          key={page.pageNumber}
          page={page}
          showPageBreakGuide={showPageBreakGuides}
        >
          {/* First page includes cover section */}
          {page.isFirstPage && (
            <CoverSection
              config={config}
              reportData={reportData}
            />
          )}
          
          {/* Render sections assigned to this page */}
          {page.sections.map((placement) => {
            // Handle continued sections (like photos spanning pages)
            const baseId = placement.sectionId.split('_continued_')[0];
            const SectionComponent = SECTION_COMPONENTS[baseId];
            
            if (!SectionComponent) {
              console.warn(`No component found for section: ${baseId}`);
              return null;
            }
            
            return (
              <SectionComponent
                key={placement.sectionId}
                config={config}
                reportData={reportData}
                placement={placement}
              />
            );
          })}
        </PreviewPage>
      ))}
    </div>
  );
}
```

---

### 11. `/components/PrintStudioModal.tsx` (Main Orchestrator)

```typescript
import React, { useState } from 'react';
import { usePrintConfig } from '../hooks/usePrintConfig';
import { usePageMap } from '../hooks/usePageMap';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import { PrintPreview } from '../renderers/html-preview/PrintPreview';
import { Sidebar } from './Sidebar';
import { ReportData } from '../config/printConfig.types';

interface PrintStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
}

export function PrintStudioModal({ isOpen, onClose, reportData }: PrintStudioModalProps) {
  const [showPageBreakGuides, setShowPageBreakGuides] = useState(false);
  
  // Central configuration state
  const {
    config,
    toggleSection,
    reorderSections,
    setSpacing,
    setLogoScale,
    setHeroPhoto,
    setStripPhotos,
    toggleCoverPhotos,
  } = usePrintConfig();
  
  // Calculate page layout based on config
  const pageMap = usePageMap(config, reportData);
  
  // PDF generation handler
  const { generatePDF, isGenerating } = usePDFGeneration();
  
  const handleDownload = async () => {
    await generatePDF(config, pageMap, reportData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="print-studio-modal-overlay">
      <div className="print-studio-modal">
        {/* Header */}
        <div className="print-studio-header">
          <h2>Print Studio</h2>
          <p>Customize report layout</p>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="print-studio-body">
          {/* Sidebar with controls */}
          <Sidebar
            config={config}
            onToggleSection={toggleSection}
            onReorderSections={reorderSections}
            onSetSpacing={setSpacing}
            onSetLogoScale={setLogoScale}
            onSetHeroPhoto={setHeroPhoto}
            onSetStripPhotos={setStripPhotos}
            onToggleCoverPhotos={toggleCoverPhotos}
            showPageBreakGuides={showPageBreakGuides}
            onTogglePageBreakGuides={setShowPageBreakGuides}
          />
          
          {/* Preview area */}
          <div className="print-studio-preview">
            <div className="preview-scroll-container">
              <PrintPreview
                config={config}
                pageMap={pageMap}
                reportData={reportData}
                showPageBreakGuides={showPageBreakGuides}
              />
            </div>
          </div>
        </div>
        
        {/* Footer with download button */}
        <div className="print-studio-footer">
          <span className="page-count">
            {pageMap.totalPages} page{pageMap.totalPages !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="download-button"
          >
            {isGenerating ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## DATA FLOW SUMMARY

```
User interaction (toggle, drag, slider)
         │
         ▼
┌─────────────────────────────────┐
│  usePrintConfig (state hook)    │
│  Updates config object          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  usePageMap (layout hook)       │
│  Calls calculatePageMap()       │
│  Returns PageMap with exact     │
│  page break positions           │
└────────────┬────────────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌──────────┐   ┌──────────┐
│  HTML    │   │  PDF     │
│ Preview  │   │Generator │
│          │   │          │
│ Renders  │   │ Builds   │
│ PageMap  │   │ PageMap  │
│ visually │   │ to file  │
└──────────┘   └──────────┘
```

---

## MIGRATION STEPS

1. **Create the folder structure** as specified above
2. **Start with the config types and constants** - these are the foundation
3. **Build the layout engine** - `calculatePageMap.ts` is the critical piece
4. **Create the hooks** - `usePrintConfig` and `usePageMap`
5. **Build PreviewPage component** - enforced page dimensions
6. **Migrate section components** - move existing section rendering code into individual files
7. **Wire up PrintPreview** - consumes PageMap to render pages
8. **Update PDF generator** - modify to consume the same PageMap
9. **Build the new modal** - orchestrates everything
10. **Test page breaks** - verify cover content stays on page 1, sections break correctly

---

## IMMEDIATE WIN (QUICK FIX)

While building the full refactor, apply this CSS fix to the current `PrintPreviewModal.tsx` to stop the overflow:

```css
/* Add to the first page container */
.cover-page-container {
  max-height: 936px; /* PAGE_HEIGHT - margins - footer */
  overflow: hidden;
  page-break-after: always;
}

/* Force the Safety banner to be the LAST element on page 1 */
.safety-banner {
  margin-bottom: 0;
}

/* Everything after safety banner starts on page 2 */
.post-cover-content {
  page-break-before: always;
}
```

---

## SUCCESS CRITERIA

1. ✅ First page contains: header image, title, photos, client info, safety banner - nothing more
2. ✅ Page 2 starts cleanly with Executive Summary (or first enabled section)
3. ✅ HTML preview and PDF output have identical page breaks
4. ✅ Dragging sections in sidebar correctly reorders them in both preview AND PDF
5. ✅ Spacing changes affect both preview AND PDF consistently
6. ✅ Photos section correctly spans multiple pages when needed

---

## ADDITIONAL NOTES FOR IMPLEMENTATION

### Understanding the Layout Engine Concept

Think of the layout engine like a book publisher's typesetter. Before actually printing a book, the typesetter figures out:
- How much space each chapter takes
- Where page breaks need to happen
- What goes on each page

The `calculatePageMap()` function does exactly this. It runs BEFORE any rendering happens and produces a "blueprint" that both the screen preview and PDF generator follow.

### Why This Matters

Without a shared layout engine:
- HTML uses CSS flow layout (content just flows down)
- PDF generator makes its own decisions about page breaks
- Result: They don't match

With a shared layout engine:
- Both renderers read from the same "blueprint"
- Page breaks are predetermined
- Result: Perfect consistency

### Key TypeScript Concepts Used

- **Interfaces**: Define the shape of data (like `PrintConfig`, `PageMap`)
- **Generics**: `Map<string, PagePlacement>` stores section placements by ID
- **Hooks**: `usePrintConfig` and `usePageMap` manage state and calculations
- **Memoization**: `useMemo` prevents recalculating the page map on every render

---

## QUESTIONS TO ASK IF STUCK

1. "Show me the current structure of PrintPreviewModal.tsx"
2. "What PDF library is being used? (jsPDF, pdfmake, react-pdf?)"
3. "How are sections currently defined and where?"
4. "What does the report data object look like?"
