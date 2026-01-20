# PRINT STUDIO ARCHITECTURE REFACTOR v2

## CONTEXT

I have a Print Studio feature that generates Weekly Progress Reports for construction projects. Currently, everything is controlled by a single component `PrintPreviewModal.tsx` which handles state management, UI controls, HTML preview rendering, AND PDF generation. This monolithic approach is causing layout issues - specifically, content overflows page boundaries because the HTML preview and PDF generator don't share a common layout calculation layer.

**PDF Library in use: pdfmake**

The immediate symptom: The "Safety is a core value" banner and content below it spills past where page 1 should end, creating misaligned page breaks.

---

## GOAL

Refactor the Print Studio into an enterprise-grade architecture with these layers:

1. **Configuration Layer** - Single source of truth for all print options
2. **Layout Engine** - Pre-calculates page breaks BEFORE rendering
3. **Renderers** - Separate HTML preview and PDF generator that BOTH consume the same page map

---

## TARGET FOLDER STRUCTURE

Create this structure under `/client/src/features/print-studio/`:

```
/client/src/features/print-studio/
│
├── index.ts                          # Public exports for the feature
│
├── /config/
│   ├── index.ts                      # Config exports
│   ├── printConfig.types.ts          # TypeScript interfaces for all print options
│   ├── defaultSections.ts            # Default sections array with order and visibility
│   └── styleTokens.ts                # Spacing values, colors, fonts, measurements
│
├── /layout-engine/
│   ├── index.ts                      # Layout engine exports
│   ├── calculatePageMap.ts           # Main function - determines what goes on each page
│   ├── measureSection.ts             # Height estimation for each section type
│   ├── measureCover.ts               # Height calculation for cover/first page content
│   └── pageConstants.ts              # Page dimensions, margins, DPI constants
│
├── /renderers/
│   ├── /html-preview/
│   │   ├── index.ts                  # HTML preview exports
│   │   ├── PrintPreview.tsx          # Main preview component - renders array of pages
│   │   ├── PreviewPage.tsx           # Single page wrapper with enforced dimensions
│   │   └── previewStyles.ts          # Preview-specific CSS-in-JS or class mappings
│   │
│   └── /pdf-generator/
│       ├── index.ts                  # PDF generator exports
│       ├── generatePDF.ts            # Main PDF orchestration function (pdfmake)
│       ├── buildDocDefinition.ts     # Builds pdfmake document definition from PageMap
│       ├── pdfStyles.ts              # pdfmake style definitions
│       ├── pdfHelpers.ts             # Utility functions for pdfmake content
│       └── pdfAssets.ts              # Logo, fonts, images handling for PDF
│
├── /sections/
│   ├── index.ts                      # Section exports
│   ├── SectionWrapper.tsx            # Common wrapper with consistent padding/margins
│   ├── CoverSection.tsx              # Cover page content (header image, title, photos, client info)
│   ├── ExecutiveSummary.tsx          # Executive summary section
│   ├── WeatherSection.tsx            # Weather log table
│   ├── ProgressSection.tsx           # Progress content
│   ├── LookAheadSection.tsx          # 3-week look ahead table
│   ├── ManpowerSection.tsx           # Manpower log table
│   ├── EquipmentSection.tsx          # Equipment usage table
│   ├── MaterialsSection.tsx          # Material deliveries table
│   ├── ProcurementSection.tsx        # Procurement/long lead items table
│   ├── SafetySection.tsx             # Safety stats and narrative
│   ├── FinancialsSection.tsx         # Financial summary and invoice table
│   ├── ScheduleMilestonesSection.tsx # Schedule milestones section
│   ├── IssuesRisksSection.tsx        # Issues and risks section
│   ├── DocumentsSection.tsx          # Documents section
│   └── PhotosSection.tsx             # Photo documentation grid
│
├── /components/
│   ├── index.ts                      # Component exports
│   ├── PrintStudioModal.tsx          # Main modal shell - orchestrates everything
│   ├── Sidebar.tsx                   # Left sidebar container
│   ├── SectionList.tsx               # Draggable/toggleable section list
│   ├── LayoutControls.tsx            # Spacing, logo scale controls
│   ├── PhotoSelector.tsx             # Hero photo and strip photo selection
│   ├── PreviewControls.tsx           # Zoom, page navigation for preview
│   └── DownloadButton.tsx            # Download button with loading state
│
└── /hooks/
    ├── index.ts                      # Hook exports
    ├── usePrintConfig.ts             # Central state management for all print options
    ├── usePageMap.ts                 # Calls layout engine, memoizes result
    └── usePDFGeneration.ts           # Handles async PDF generation with loading states
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Config & Layout Engine)

| Status | File | Description |
|--------|------|-------------|
| [ ] | `config/printConfig.types.ts` | Define `PrintConfig`, `PageMap`, `PagePlacement`, `ReportData` interfaces |
| [ ] | `config/defaultSections.ts` | Default sections array with order and visibility |
| [ ] | `config/styleTokens.ts` | Spacing presets, colors, fonts |
| [ ] | `layout-engine/pageConstants.ts` | Page dimensions (Letter size), margins, DPI |
| [ ] | `layout-engine/measureSection.ts` | Logic to estimate height of each section |
| [ ] | `layout-engine/measureCover.ts` | Calculate cover/first page element heights |
| [ ] | `layout-engine/calculatePageMap.ts` | Core algorithm to distribute sections across pages |
| [ ] | `hooks/usePrintConfig.ts` | State management hook for all print options |
| [ ] | `hooks/usePageMap.ts` | Memoized layout calculation hook |

### Phase 2: Section Components

| Status | File | Description |
|--------|------|-------------|
| [ ] | `sections/SectionWrapper.tsx` | Shared wrapper for consistent styling |
| [ ] | `sections/CoverSection.tsx` | Header image, title, photos, client info |
| [ ] | `sections/ExecutiveSummary.tsx` | Stats row + narrative |
| [ ] | `sections/WeatherSection.tsx` | 7-day weather table |
| [ ] | `sections/ProgressSection.tsx` | Progress narrative |
| [ ] | `sections/LookAheadSection.tsx` | 3-week look ahead table |
| [ ] | `sections/ManpowerSection.tsx` | Manpower log table |
| [ ] | `sections/EquipmentSection.tsx` | Equipment usage table |
| [ ] | `sections/MaterialsSection.tsx` | Material deliveries table |
| [ ] | `sections/ProcurementSection.tsx` | Long lead items table |
| [ ] | `sections/SafetySection.tsx` | Safety stats + narrative |
| [ ] | `sections/FinancialsSection.tsx` | Financial summary + invoices |
| [ ] | `sections/ScheduleMilestonesSection.tsx` | Schedule milestones |
| [ ] | `sections/IssuesRisksSection.tsx` | Issues and risks |
| [ ] | `sections/DocumentsSection.tsx` | Documents list |
| [ ] | `sections/PhotosSection.tsx` | Photo documentation grid |

### Phase 3: HTML Preview Renderer

| Status | File | Description |
|--------|------|-------------|
| [ ] | `renderers/html-preview/PreviewPage.tsx` | Single page with fixed dimensions |
| [ ] | `renderers/html-preview/PrintPreview.tsx` | Iterates PageMap, renders pages |
| [ ] | `renderers/html-preview/previewStyles.ts` | Preview-specific styles |

### Phase 4: UI Components & Modal

| Status | File | Description |
|--------|------|-------------|
| [ ] | `components/Sidebar.tsx` | Left sidebar container |
| [ ] | `components/SectionList.tsx` | Drag-and-drop section list |
| [ ] | `components/LayoutControls.tsx` | Spacing, logo scale controls |
| [ ] | `components/PhotoSelector.tsx` | Photo selection UI |
| [ ] | `components/PreviewControls.tsx` | Zoom, page nav |
| [ ] | `components/DownloadButton.tsx` | Download with loading state |
| [ ] | `components/PrintStudioModal.tsx` | Main orchestrator |
| [ ] | `hooks/usePDFGeneration.ts` | Async PDF generation hook |

### Phase 5: PDF Generator (pdfmake Integration)

| Status | File | Description |
|--------|------|-------------|
| [ ] | `renderers/pdf-generator/pdfStyles.ts` | pdfmake style definitions |
| [ ] | `renderers/pdf-generator/pdfHelpers.ts` | Helper functions for pdfmake content |
| [ ] | `renderers/pdf-generator/pdfAssets.ts` | Logo, fonts, images handling |
| [ ] | `renderers/pdf-generator/buildDocDefinition.ts` | Build pdfmake doc from PageMap |
| [ ] | `renderers/pdf-generator/generatePDF.ts` | Main generation function |

### Phase 6: Integration, Swap & Cleanup

| Status | Task | Description |
|--------|------|-------------|
| [ ] | Update import | Change import in `ProjectSetup.tsx` to new modal |
| [ ] | Test all functionality | Verify all features work |
| [ ] | Delete old files | Remove `PrintPreviewModal.tsx` and `PrintView.tsx` |
| [ ] | Create index files | Add all index.ts exports |

---

## FILE IMPLEMENTATIONS

### 1. `/config/printConfig.types.ts`

```typescript
// =============================================================================
// PRINT CONFIGURATION TYPES
// =============================================================================

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

// =============================================================================
// REPORT DATA TYPES (match your existing data structure)
// =============================================================================

export interface ReportPhoto {
  id: string;
  filename: string;
  caption?: string;
  date?: string;
  base64?: string;
  url?: string;
}

export interface ExecutiveSummaryData {
  narrative: string;
  percentComplete: number;
  manHours: number;
  weatherLost: number;
  safetyIncidents: number;
}

export interface WeatherLogEntry {
  date: string;
  condition: string;
  high: number;
  low: number;
  wind: string;
  lost: string;
  notes?: string;
}

export interface LookAheadItem {
  activity: string;
  starts: string;
  finishes: string;
  type: string;
  notes?: string;
}

export interface ManpowerEntry {
  name: string;
  role: string;
  totalHours: number;
}

export interface EquipmentEntry {
  type: string;
  status: string;
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;
  total?: number;
}

export interface MaterialDelivery {
  date: string;
  description: string;
  ticketNumber: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface ProcurementItem {
  item: string;
  vendor: string;
  status: string;
  eta?: string;
  delivered?: string;
  notes?: string;
}

export interface SafetyData {
  narrative: string;
  nearMissesWeek: number;
  nearMissesYTD: number;
  firstAidsWeek: number;
  firstAidsYTD: number;
  recordablesWeek: number;
  recordablesYTD: number;
}

export interface InvoiceEntry {
  invoiceNumber: string;
  period: string;
  amount: number;
  retainage: number;
  net: number;
  paid: string;
}

export interface FinancialsData {
  earned: number;
  invoices: InvoiceEntry[];
}

export interface ReportData {
  projectName: string;
  projectAddress: string;
  client: string;
  jobNumber: string;
  weekEnding: string;
  pmName?: string;
  superintendent?: string;
  contractValue?: number;
  photos: ReportPhoto[];
  executiveSummary: ExecutiveSummaryData;
  weather: WeatherLogEntry[];
  progress?: string;
  lookAhead: LookAheadItem[];
  manpower: ManpowerEntry[];
  equipment: EquipmentEntry[];
  materials: MaterialDelivery[];
  procurement: ProcurementItem[];
  safety: SafetyData;
  financials: FinancialsData;
  scheduleMilestones?: any[];
  issuesRisks?: any[];
  documents?: any[];
}
```

---

### 2. `/config/defaultSections.ts`

```typescript
import { PrintSection } from './printConfig.types';

/**
 * Default sections in their standard order.
 * These match the sections visible in the Print Studio sidebar.
 */
export const DEFAULT_SECTIONS: Omit<PrintSection, 'order'>[] = [
  { id: 'executiveSummary', label: 'Executive Summary', included: true },
  { id: 'weather', label: 'Weather', included: true },
  { id: 'progress', label: 'Progress', included: true },
  { id: 'lookAhead', label: 'Look Ahead', included: true },
  { id: 'manpower', label: 'Manpower', included: true },
  { id: 'equipment', label: 'Equipment', included: true },
  { id: 'materials', label: 'Materials', included: true },
  { id: 'procurement', label: 'Procurement', included: true },
  { id: 'safety', label: 'Safety', included: true },
  { id: 'financials', label: 'Financials', included: true },
  { id: 'scheduleMilestones', label: 'Schedule Milestones', included: true },
  { id: 'issuesRisks', label: 'Issues & Risks', included: true },
  { id: 'documents', label: 'Documents', included: false },
  { id: 'photos', label: 'Photos', included: true },
];

/**
 * Returns a fresh copy of default sections with order property
 */
export function getDefaultSections(): PrintSection[] {
  return DEFAULT_SECTIONS.map((section, index) => ({
    ...section,
    order: index,
  }));
}
```

---

### 3. `/config/styleTokens.ts`

```typescript
// =============================================================================
// SPACING PRESETS
// =============================================================================

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

// =============================================================================
// COLORS - Match your existing RECON brand
// =============================================================================

export const COLORS = {
  // Brand colors
  primary: '#0891B2',        // Teal/cyan brand color
  primaryDark: '#0E7490',
  accent: '#F59E0B',         // Yellow accent (RECON logo)
  
  // Text colors
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  
  // UI colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  
  // Semantic colors
  safetyBanner: '#0891B2',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

// =============================================================================
// FONTS
// =============================================================================

export const FONTS = {
  heading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
} as const;

// =============================================================================
// PDFMAKE-SPECIFIC STYLE DEFINITIONS
// =============================================================================

export const PDFMAKE_STYLES = {
  // Headers
  h1: {
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    margin: [0, 0, 0, 8] as [number, number, number, number],
  },
  h2: {
    fontSize: 18,
    bold: true,
    color: COLORS.primary,
    margin: [0, 16, 0, 8] as [number, number, number, number],
  },
  h3: {
    fontSize: 14,
    bold: true,
    color: COLORS.text,
    margin: [0, 12, 0, 4] as [number, number, number, number],
  },
  
  // Body text
  body: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  bodySmall: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  
  // Table styles
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: COLORS.text,
    fillColor: COLORS.backgroundAlt,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
  },
  
  // Special styles
  label: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 10,
    color: COLORS.text,
  },
  statNumber: {
    fontSize: 28,
    bold: true,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  
  // Footer
  footer: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
} as const;
```

---

### 4. `/layout-engine/pageConstants.ts`

```typescript
// =============================================================================
// PAGE DIMENSION CONSTANTS
// All measurements in points (72 DPI) for pdfmake compatibility
// =============================================================================

export const PAGE = {
  // Letter size: 8.5" x 11" at 72 DPI
  WIDTH: 612,    // 8.5 * 72
  HEIGHT: 792,   // 11 * 72
  
  // Margins (in points)
  MARGIN_TOP: 40,
  MARGIN_BOTTOM: 60,    // Extra room for footer
  MARGIN_LEFT: 40,
  MARGIN_RIGHT: 40,
  
  // Calculated usable area
  get USABLE_WIDTH(): number {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get USABLE_HEIGHT(): number {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  },
} as const;

// =============================================================================
// FOOTER CONSTANTS
// =============================================================================

export const FOOTER = {
  HEIGHT: 36,
  MARGIN_TOP: 12,
} as const;

// =============================================================================
// FIRST PAGE (COVER) CONSTANTS
// =============================================================================

export const FIRST_PAGE = {
  HEADER_IMAGE_HEIGHT: 150,      // The RECON branded header image
  TITLE_BLOCK_HEIGHT: 80,        // Project name, address, report type
  PHOTO_STRIP_HEIGHT: 100,       // 3 thumbnail photos
  CLIENT_INFO_HEIGHT: 60,        // Client, Address, Job # block
  SAFETY_BANNER_HEIGHT: 30,      // "Safety is a core value" banner
  
  get COVER_TOTAL_HEIGHT(): number {
    return (
      this.HEADER_IMAGE_HEIGHT +
      this.TITLE_BLOCK_HEIGHT +
      this.PHOTO_STRIP_HEIGHT +
      this.CLIENT_INFO_HEIGHT +
      this.SAFETY_BANNER_HEIGHT
    );
  },
  
  // What's left for content on page 1 after cover elements
  get REMAINING_HEIGHT(): number {
    return PAGE.USABLE_HEIGHT - this.COVER_TOTAL_HEIGHT - FOOTER.HEIGHT;
  },
} as const;

// =============================================================================
// SECTION BASE HEIGHTS (in points)
// These are starting estimates - measureSection.ts refines based on actual data
// =============================================================================

export const SECTION_BASE_HEIGHTS: Record<string, number> = {
  executiveSummary: 200,      // Stats row + paragraph
  weather: 240,               // 7-day table
  progress: 150,              // Variable - paragraph content
  lookAhead: 300,             // Table with ~15 rows
  manpower: 260,              // Table with ~12 rows
  equipment: 200,             // Table with ~8 rows
  materials: 150,             // Table with ~4 rows
  procurement: 200,           // Table with ~8 rows
  safety: 150,                // Stats + narrative paragraph
  financials: 140,            // Summary + invoice table
  scheduleMilestones: 180,    // Milestones table
  issuesRisks: 150,           // Issues list
  documents: 120,             // Documents list
  photos: 450,                // 2x3 photo grid per "page" of photos
} as const;

// =============================================================================
// CONVERSION HELPERS
// =============================================================================

/**
 * Convert pixels (96 DPI screen) to points (72 DPI print)
 */
export function pxToPoints(px: number): number {
  return (px * 72) / 96;
}

/**
 * Convert points to pixels
 */
export function pointsToPx(points: number): number {
  return (points * 96) / 72;
}

/**
 * Convert inches to points
 */
export function inchesToPoints(inches: number): number {
  return inches * 72;
}
```

---

### 5. `/layout-engine/measureSection.ts`

```typescript
import { PrintSection, PrintSpacing, ReportData } from '../config/printConfig.types';
import { SECTION_BASE_HEIGHTS } from './pageConstants';

interface MeasurementContext {
  section: PrintSection;
  spacing: PrintSpacing;
  reportData: ReportData;
}

/**
 * Estimates the rendered height of a section in points.
 * This is an approximation used for page break calculations.
 */
export function measureSection(ctx: MeasurementContext): number {
  const { section, spacing, reportData } = ctx;
  const baseHeight = SECTION_BASE_HEIGHTS[section.id] || 150;
  
  // Adjust for spacing preset
  const spacingMultiplier = 
    spacing.type === 'compact' ? 0.85 : 
    spacing.type === 'relaxed' ? 1.15 : 
    1;
  
  // Section-specific adjustments based on actual data
  let dynamicHeight = baseHeight;
  
  switch (section.id) {
    case 'executiveSummary':
      // Estimate based on text length (roughly 10 chars per point height at font size 10)
      const summaryLength = reportData.executiveSummary?.narrative?.length || 0;
      const summaryLines = Math.ceil(summaryLength / 80); // ~80 chars per line
      dynamicHeight = 100 + (summaryLines * 12); // 12pt line height
      break;
      
    case 'weather':
      // 7 days * row height + header
      const weatherRows = reportData.weather?.length || 7;
      dynamicHeight = 40 + (weatherRows * 24); // 24pt per row
      break;
      
    case 'progress':
      const progressLength = reportData.progress?.length || 0;
      const progressLines = Math.ceil(progressLength / 80);
      dynamicHeight = 40 + (progressLines * 12);
      break;
      
    case 'lookAhead':
      const lookAheadRows = reportData.lookAhead?.length || 10;
      dynamicHeight = 40 + (lookAheadRows * 24);
      break;
      
    case 'manpower':
      const manpowerRows = reportData.manpower?.length || 8;
      dynamicHeight = 40 + (manpowerRows * 20);
      break;
      
    case 'equipment':
      const equipmentRows = reportData.equipment?.length || 6;
      dynamicHeight = 40 + (equipmentRows * 20);
      break;
      
    case 'materials':
      const materialRows = reportData.materials?.length || 3;
      dynamicHeight = 40 + (materialRows * 20);
      break;
      
    case 'procurement':
      const procurementRows = reportData.procurement?.length || 5;
      dynamicHeight = 40 + (procurementRows * 24);
      break;
      
    case 'safety':
      const safetyNarrativeLength = reportData.safety?.narrative?.length || 0;
      const safetyLines = Math.ceil(safetyNarrativeLength / 80);
      dynamicHeight = 80 + (safetyLines * 12); // 80pt for stats grid
      break;
      
    case 'financials':
      const invoiceRows = reportData.financials?.invoices?.length || 1;
      dynamicHeight = 60 + (invoiceRows * 20);
      break;
      
    case 'scheduleMilestones':
      const milestoneRows = reportData.scheduleMilestones?.length || 5;
      dynamicHeight = 40 + (milestoneRows * 20);
      break;
      
    case 'issuesRisks':
      const issueRows = reportData.issuesRisks?.length || 3;
      dynamicHeight = 40 + (issueRows * 24);
      break;
      
    case 'documents':
      const docRows = reportData.documents?.length || 2;
      dynamicHeight = 40 + (docRows * 18);
      break;
      
    case 'photos':
      // 6 photos per page section, 2 columns x 3 rows
      const photoCount = reportData.photos?.length || 0;
      const photoPages = Math.ceil(photoCount / 6);
      dynamicHeight = photoPages * 450;
      break;
  }
  
  // Add section header height (title + spacing)
  const sectionHeaderHeight = 36;
  
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

### 6. `/layout-engine/measureCover.ts`

```typescript
import { PrintConfig } from '../config/printConfig.types';
import { FIRST_PAGE } from './pageConstants';

export interface CoverMeasurement {
  totalHeight: number;
  headerImageHeight: number;
  titleBlockHeight: number;
  photoStripHeight: number;
  clientInfoHeight: number;
  safetyBannerHeight: number;
}

/**
 * Calculates the height of the cover/first page elements.
 * These are fixed elements that always appear on page 1.
 */
export function measureCover(config: PrintConfig): CoverMeasurement {
  // Header image scales with logoScale setting
  const headerImageHeight = Math.round(
    FIRST_PAGE.HEADER_IMAGE_HEIGHT * (config.logoScale / 100)
  );
  
  // Photo strip only shown if enabled and photos selected
  const showPhotoStrip = config.showCoverPhotos && config.stripPhotoIndexes.length > 0;
  const photoStripHeight = showPhotoStrip ? FIRST_PAGE.PHOTO_STRIP_HEIGHT : 0;
  
  // Spacing adjustments
  const spacingMultiplier = 
    config.spacing.type === 'compact' ? 0.85 : 
    config.spacing.type === 'relaxed' ? 1.15 : 
    1;
  
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

### 7. `/layout-engine/calculatePageMap.ts` (CORE ALGORITHM)

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
  
  // Calculate usable height per page (accounting for footer)
  const usableHeightPerPage = PAGE.USABLE_HEIGHT - FOOTER.HEIGHT;
  
  // Initialize page 1 with cover content already "used"
  let currentPage: PageContent = {
    pageNumber: 1,
    isFirstPage: true,
    sections: [],
    usedHeight: coverMeasurement.totalHeight,
    availableHeight: usableHeightPerPage - coverMeasurement.totalHeight,
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
        reportData,
        usableHeightPerPage
      );
      
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
        availableHeight: usableHeightPerPage,
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
  reportData: ReportData,
  usableHeightPerPage: number
): { currentPage: PageContent; placements: PagePlacement[] } {
  const placements: PagePlacement[] = [];
  const photosPerPage = 6; // 2 columns x 3 rows
  const photoPageHeight = 450; // Height for one "page" of 6 photos
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
        availableHeight: usableHeightPerPage,
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
  minHeightThreshold: number = 80
): boolean {
  // Don't start a section if there's very little room - push to next page
  if (availableHeight < minHeightThreshold) {
    return false;
  }
  return sectionHeight <= availableHeight;
}
```

---

### 8. `/hooks/usePrintConfig.ts`

```typescript
import { useState, useCallback } from 'react';
import { PrintConfig, PrintSection } from '../config/printConfig.types';
import { SPACING_PRESETS } from '../config/styleTokens';
import { getDefaultSections } from '../config/defaultSections';

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
    sections: getDefaultSections(),
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
      sections: getDefaultSections(),
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

### 9. `/hooks/usePageMap.ts`

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
    reportData.scheduleMilestones?.length,
    reportData.issuesRisks?.length,
    reportData.documents?.length,
  ]);
  
  return pageMap;
}
```

---

### 10. `/hooks/usePDFGeneration.ts`

```typescript
import { useState, useCallback } from 'react';
import { PrintConfig, PageMap, ReportData } from '../config/printConfig.types';
import { generatePDF } from '../renderers/pdf-generator/generatePDF';

interface UsePDFGenerationReturn {
  generatePDF: (config: PrintConfig, pageMap: PageMap, reportData: ReportData) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook that handles async PDF generation with loading states
 */
export function usePDFGeneration(): UsePDFGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generate = useCallback(async (
    config: PrintConfig,
    pageMap: PageMap,
    reportData: ReportData
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await generatePDF(config, pageMap, reportData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  return {
    generatePDF: generate,
    isGenerating,
    error,
  };
}
```

---

### 11. `/renderers/html-preview/PreviewPage.tsx`

```typescript
import React from 'react';
import { PageContent } from '../../config/printConfig.types';
import { PAGE, FOOTER, pointsToPx } from '../../layout-engine/pageConstants';

interface PreviewPageProps {
  page: PageContent;
  children: React.ReactNode;
  showPageBreakGuide?: boolean;
  projectName?: string;
}

/**
 * Renders a single page with enforced dimensions.
 * Converts points to pixels for screen display.
 */
export function PreviewPage({ 
  page, 
  children, 
  showPageBreakGuide = false,
  projectName = 'Weekly Report'
}: PreviewPageProps) {
  // Convert point dimensions to pixels for screen display
  const width = pointsToPx(PAGE.WIDTH);
  const height = pointsToPx(PAGE.HEIGHT);
  const marginTop = pointsToPx(PAGE.MARGIN_TOP);
  const marginBottom = pointsToPx(PAGE.MARGIN_BOTTOM);
  const marginLeft = pointsToPx(PAGE.MARGIN_LEFT);
  const marginRight = pointsToPx(PAGE.MARGIN_RIGHT);
  const footerHeight = pointsToPx(FOOTER.HEIGHT);
  const usableHeight = pointsToPx(PAGE.USABLE_HEIGHT - FOOTER.HEIGHT);
  
  return (
    <div
      className="preview-page"
      style={{
        width,
        minHeight: height,
        maxHeight: height,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        padding: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
      }}
    >
      {/* Page content */}
      <div
        className="preview-page-content"
        style={{
          height: usableHeight,
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
          bottom: marginBottom,
          left: marginLeft,
          right: marginRight,
          height: footerHeight,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid #E5E7EB',
          paddingTop: pointsToPx(FOOTER.MARGIN_TOP),
          fontSize: 10,
          color: '#6B7280',
        }}
      >
        <span>{projectName}</span>
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

### 12. `/renderers/pdf-generator/generatePDF.ts` (pdfmake)

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PrintConfig, PageMap, ReportData } from '../../config/printConfig.types';
import { buildDocDefinition } from './buildDocDefinition';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Generates and downloads the PDF using pdfmake.
 * The PageMap determines exactly what content goes on each page.
 */
export async function generatePDF(
  config: PrintConfig,
  pageMap: PageMap,
  reportData: ReportData
): Promise<void> {
  // Build the pdfmake document definition from our PageMap
  const docDefinition = buildDocDefinition(config, pageMap, reportData);
  
  // Generate filename
  const dateStr = reportData.weekEnding.replace(/\//g, '-');
  const filename = `WeeklyReport_${reportData.jobNumber}_${dateStr}.pdf`;
  
  // Create and download the PDF
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download(filename, () => {
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Alternative: Open PDF in new tab instead of download
 */
export async function openPDFInNewTab(
  config: PrintConfig,
  pageMap: PageMap,
  reportData: ReportData
): Promise<void> {
  const docDefinition = buildDocDefinition(config, pageMap, reportData);
  
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.open({}, window);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get PDF as blob for custom handling
 */
export async function getPDFBlob(
  config: PrintConfig,
  pageMap: PageMap,
  reportData: ReportData
): Promise<Blob> {
  const docDefinition = buildDocDefinition(config, pageMap, reportData);
  
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}
```

---

### 13. `/renderers/pdf-generator/buildDocDefinition.ts` (pdfmake)

```typescript
import { TDocumentDefinitions, Content, ContentColumns, ContentTable } from 'pdfmake/interfaces';
import { PrintConfig, PageMap, ReportData, PageContent } from '../../config/printConfig.types';
import { PAGE } from '../../layout-engine/pageConstants';
import { PDFMAKE_STYLES, COLORS } from '../../config/styleTokens';
import { 
  buildCoverContent,
  buildExecutiveSummaryContent,
  buildWeatherContent,
  buildLookAheadContent,
  buildManpowerContent,
  buildEquipmentContent,
  buildMaterialsContent,
  buildProcurementContent,
  buildSafetyContent,
  buildFinancialsContent,
  buildPhotosContent,
} from './pdfHelpers';

/**
 * Builds the complete pdfmake document definition from the PageMap.
 * This is the bridge between our layout engine and pdfmake.
 */
export function buildDocDefinition(
  config: PrintConfig,
  pageMap: PageMap,
  reportData: ReportData
): TDocumentDefinitions {
  // Build content for each page based on the PageMap
  const content: Content[] = [];
  
  for (const page of pageMap.pages) {
    const pageContent = buildPageContent(page, config, reportData);
    content.push(...pageContent);
    
    // Add page break after each page except the last
    if (page.pageNumber < pageMap.totalPages) {
      content.push({ text: '', pageBreak: 'after' });
    }
  }
  
  return {
    pageSize: 'LETTER',
    pageMargins: [PAGE.MARGIN_LEFT, PAGE.MARGIN_TOP, PAGE.MARGIN_RIGHT, PAGE.MARGIN_BOTTOM],
    
    content,
    
    styles: PDFMAKE_STYLES,
    
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: COLORS.text,
    },
    
    // Footer with page numbers
    footer: (currentPage: number, pageCount: number): Content => {
      if (!config.showFooter) return { text: '' };
      
      return {
        columns: [
          {
            text: `${reportData.projectName}`,
            alignment: 'left',
            style: 'footer',
            margin: [PAGE.MARGIN_LEFT, 0, 0, 0],
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            style: 'footer',
            margin: [0, 0, PAGE.MARGIN_RIGHT, 0],
          },
        ],
        margin: [0, 20, 0, 0],
      };
    },
    
    // Header (optional - you can add a running header if needed)
    // header: ...
  };
}

/**
 * Builds content for a single page based on PageMap assignments
 */
function buildPageContent(
  page: PageContent,
  config: PrintConfig,
  reportData: ReportData
): Content[] {
  const content: Content[] = [];
  
  // First page includes cover content
  if (page.isFirstPage) {
    content.push(...buildCoverContent(config, reportData));
  }
  
  // Render sections assigned to this page
  for (const placement of page.sections) {
    // Handle continued sections (like photos spanning pages)
    const baseId = placement.sectionId.split('_continued_')[0];
    const sectionContent = buildSectionContent(baseId, placement, config, reportData);
    
    if (sectionContent) {
      content.push(...sectionContent);
    }
  }
  
  return content;
}

/**
 * Routes to the appropriate section builder based on section ID
 */
function buildSectionContent(
  sectionId: string,
  placement: any,
  config: PrintConfig,
  reportData: ReportData
): Content[] | null {
  switch (sectionId) {
    case 'executiveSummary':
      return buildExecutiveSummaryContent(reportData, config);
    case 'weather':
      return buildWeatherContent(reportData, config);
    case 'progress':
      return buildProgressContent(reportData, config);
    case 'lookAhead':
      return buildLookAheadContent(reportData, config);
    case 'manpower':
      return buildManpowerContent(reportData, config);
    case 'equipment':
      return buildEquipmentContent(reportData, config);
    case 'materials':
      return buildMaterialsContent(reportData, config);
    case 'procurement':
      return buildProcurementContent(reportData, config);
    case 'safety':
      return buildSafetyContent(reportData, config);
    case 'financials':
      return buildFinancialsContent(reportData, config);
    case 'photos':
      return buildPhotosContent(reportData, config, placement);
    default:
      console.warn(`No content builder for section: ${sectionId}`);
      return null;
  }
}

/**
 * Build progress section content
 */
function buildProgressContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.progress) return [];
  
  return [
    { text: 'PROGRESS', style: 'h2' },
    { text: reportData.progress, style: 'body', margin: [0, 0, 0, config.spacing.sectionGap] },
  ];
}
```

---

### 14. `/renderers/pdf-generator/pdfHelpers.ts` (pdfmake content builders)

```typescript
import { Content, ContentTable, ContentColumns } from 'pdfmake/interfaces';
import { PrintConfig, ReportData } from '../../config/printConfig.types';
import { COLORS } from '../../config/styleTokens';

// =============================================================================
// COVER SECTION
// =============================================================================

export function buildCoverContent(config: PrintConfig, reportData: ReportData): Content[] {
  const content: Content[] = [];
  
  // Header image (if you have a base64 logo)
  // content.push({
  //   image: 'data:image/png;base64,...',
  //   width: 500,
  //   margin: [0, 0, 0, 20],
  // });
  
  // Title block
  content.push({
    text: reportData.projectName,
    style: 'h1',
    margin: [0, 20, 0, 4],
  });
  
  content.push({
    text: reportData.projectAddress,
    fontSize: 12,
    color: COLORS.primary,
    margin: [0, 0, 0, 16],
  });
  
  // Divider
  content.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 3, lineColor: COLORS.accent }],
    margin: [0, 0, 0, 16],
  });
  
  // Report type and date
  content.push({
    text: 'WEEKLY PROGRESS REPORT',
    fontSize: 12,
    bold: true,
    margin: [0, 0, 0, 4],
  });
  
  content.push({
    text: `Week Ending: ${reportData.weekEnding}`,
    fontSize: 11,
    color: COLORS.primary,
    margin: [0, 0, 0, 20],
  });
  
  // Photo strip (if enabled)
  if (config.showCoverPhotos && config.stripPhotoIndexes.length > 0) {
    const photoColumns: Content[] = config.stripPhotoIndexes
      .map(idx => reportData.photos[idx])
      .filter(Boolean)
      .map(photo => ({
        image: photo.base64 || photo.url || '',
        width: 160,
        height: 100,
        fit: [160, 100] as [number, number],
      }));
    
    if (photoColumns.length > 0) {
      content.push({
        columns: photoColumns,
        columnGap: 10,
        margin: [0, 0, 0, 20],
      } as ContentColumns);
    }
  }
  
  // Client info block
  content.push({
    columns: [
      { text: 'Client:', style: 'label', width: 60 },
      { text: reportData.client, style: 'value' },
    ],
    margin: [0, 0, 0, 4],
  } as ContentColumns);
  
  content.push({
    columns: [
      { text: 'Address:', style: 'label', width: 60 },
      { text: reportData.projectAddress, style: 'value' },
    ],
    margin: [0, 0, 0, 4],
  } as ContentColumns);
  
  content.push({
    columns: [
      { text: 'Job #:', style: 'label', width: 60 },
      { text: reportData.jobNumber, style: 'value' },
    ],
    margin: [0, 0, 0, 20],
  } as ContentColumns);
  
  // Safety banner
  content.push({
    table: {
      widths: ['*'],
      body: [[
        {
          text: 'Safety is a core value',
          alignment: 'center',
          color: '#FFFFFF',
          fontSize: 11,
          bold: true,
          fillColor: COLORS.safetyBanner,
          margin: [0, 8, 0, 8],
        }
      ]],
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 20],
  });
  
  return content;
}

// =============================================================================
// EXECUTIVE SUMMARY
// =============================================================================

export function buildExecutiveSummaryContent(reportData: ReportData, config: PrintConfig): Content[] {
  const summary = reportData.executiveSummary;
  if (!summary) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'EXECUTIVE SUMMARY', style: 'h2' });
  
  // Stats row
  content.push({
    columns: [
      buildStatBox(summary.percentComplete.toString() + '%', '% Complete'),
      buildStatBox(summary.manHours.toString(), 'Man Hours (Wk)'),
      buildStatBox(summary.weatherLost.toString(), 'Weather Lost'),
      buildStatBox(summary.safetyIncidents.toString(), 'Safety Incidents'),
    ],
    columnGap: 16,
    margin: [0, 0, 0, 16],
  } as ContentColumns);
  
  // Narrative
  content.push({
    text: summary.narrative,
    style: 'body',
    margin: [0, 0, 0, config.spacing.sectionGap],
  });
  
  return content;
}

function buildStatBox(value: string, label: string): Content {
  return {
    stack: [
      { text: value, style: 'statNumber', alignment: 'center' },
      { text: label, style: 'statLabel', alignment: 'center' },
    ],
    width: '*',
  };
}

// =============================================================================
// WEATHER TABLE
// =============================================================================

export function buildWeatherContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.weather?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'WEATHER LOG', style: 'h2' });
  
  const tableBody = [
    // Header row
    [
      { text: 'Date', style: 'tableHeader' },
      { text: 'Condition', style: 'tableHeader' },
      { text: 'High/Low', style: 'tableHeader' },
      { text: 'Wind', style: 'tableHeader' },
      { text: 'Lost', style: 'tableHeader' },
      { text: 'Notes', style: 'tableHeader' },
    ],
    // Data rows
    ...reportData.weather.map(entry => [
      { text: entry.date, style: 'tableCell' },
      { text: entry.condition, style: 'tableCell' },
      { text: `${entry.high}°/${entry.low}°`, style: 'tableCell' },
      { text: entry.wind, style: 'tableCell' },
      { text: entry.lost || '-', style: 'tableCell' },
      { text: entry.notes || '-', style: 'tableCell' },
    ]),
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: [70, 80, 60, 50, 40, '*'],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// LOOK AHEAD TABLE
// =============================================================================

export function buildLookAheadContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.lookAhead?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: '3-WEEK LOOK AHEAD', style: 'h2' });
  
  const tableBody = [
    [
      { text: 'Activity', style: 'tableHeader' },
      { text: 'Starts', style: 'tableHeader' },
      { text: 'Finishes', style: 'tableHeader' },
      { text: 'Type', style: 'tableHeader' },
      { text: 'Notes', style: 'tableHeader' },
    ],
    ...reportData.lookAhead.map(item => [
      { text: item.activity, style: 'tableCell' },
      { text: item.starts, style: 'tableCell' },
      { text: item.finishes, style: 'tableCell' },
      { text: item.type, style: 'tableCell' },
      { text: item.notes || '-', style: 'tableCell' },
    ]),
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 70, 70, 60, 80],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// MANPOWER TABLE
// =============================================================================

export function buildManpowerContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.manpower?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'MANPOWER LOG', style: 'h2' });
  
  const totalHours = reportData.manpower.reduce((sum, entry) => sum + entry.totalHours, 0);
  
  const tableBody = [
    [
      { text: 'Name/Company', style: 'tableHeader' },
      { text: 'Role', style: 'tableHeader' },
      { text: 'Total Hrs', style: 'tableHeader', alignment: 'right' },
    ],
    ...reportData.manpower.map(entry => [
      { text: entry.name, style: 'tableCell' },
      { text: entry.role, style: 'tableCell' },
      { text: entry.totalHours.toString(), style: 'tableCell', alignment: 'right' },
    ]),
    // Total row
    [
      { text: 'Total:', style: 'tableHeader', colSpan: 2 },
      {},
      { text: totalHours.toString(), style: 'tableHeader', alignment: 'right' },
    ],
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 150, 60],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// EQUIPMENT TABLE
// =============================================================================

export function buildEquipmentContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.equipment?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'EQUIPMENT USAGE', style: 'h2' });
  
  const tableBody = [
    [
      { text: 'Type', style: 'tableHeader' },
      { text: 'Status', style: 'tableHeader' },
      { text: 'M', style: 'tableHeader', alignment: 'center' },
      { text: 'T', style: 'tableHeader', alignment: 'center' },
      { text: 'W', style: 'tableHeader', alignment: 'center' },
      { text: 'T', style: 'tableHeader', alignment: 'center' },
      { text: 'F', style: 'tableHeader', alignment: 'center' },
      { text: 'S', style: 'tableHeader', alignment: 'center' },
      { text: 'S', style: 'tableHeader', alignment: 'center' },
      { text: 'Tot', style: 'tableHeader', alignment: 'center' },
    ],
    ...reportData.equipment.map(entry => [
      { text: entry.type, style: 'tableCell' },
      { text: entry.status, style: 'tableCell' },
      { text: entry.monday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.tuesday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.wednesday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.thursday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.friday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.saturday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.sunday?.toString() || '-', style: 'tableCell', alignment: 'center' },
      { text: entry.total?.toString() || '-', style: 'tableCell', alignment: 'center' },
    ]),
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 70, 25, 25, 25, 25, 25, 25, 25, 30],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// MATERIALS TABLE
// =============================================================================

export function buildMaterialsContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.materials?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'MATERIAL DELIVERIES', style: 'h2' });
  
  const tableBody = [
    [
      { text: 'Date', style: 'tableHeader' },
      { text: 'Description', style: 'tableHeader' },
      { text: 'Ticket #', style: 'tableHeader' },
      { text: 'Qty', style: 'tableHeader', alignment: 'right' },
      { text: 'Unit', style: 'tableHeader' },
      { text: 'Notes', style: 'tableHeader' },
    ],
    ...reportData.materials.map(entry => [
      { text: entry.date, style: 'tableCell' },
      { text: entry.description, style: 'tableCell' },
      { text: entry.ticketNumber, style: 'tableCell' },
      { text: entry.quantity.toString(), style: 'tableCell', alignment: 'right' },
      { text: entry.unit, style: 'tableCell' },
      { text: entry.notes || '-', style: 'tableCell' },
    ]),
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: [60, '*', 60, 40, 40, 80],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// PROCUREMENT TABLE
// =============================================================================

export function buildProcurementContent(reportData: ReportData, config: PrintConfig): Content[] {
  if (!reportData.procurement?.length) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'PROCUREMENT LOG (LONG LEAD ITEMS)', style: 'h2' });
  
  const tableBody = [
    [
      { text: 'Item', style: 'tableHeader' },
      { text: 'Vendor', style: 'tableHeader' },
      { text: 'Status', style: 'tableHeader' },
      { text: 'ETA', style: 'tableHeader' },
      { text: 'Delivered', style: 'tableHeader' },
      { text: 'Notes', style: 'tableHeader' },
    ],
    ...reportData.procurement.map(item => [
      { text: item.item, style: 'tableCell' },
      { text: item.vendor, style: 'tableCell' },
      { text: item.status, style: 'tableCell' },
      { text: item.eta || '-', style: 'tableCell' },
      { text: item.delivered || '-', style: 'tableCell' },
      { text: item.notes || '-', style: 'tableCell' },
    ]),
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 80, 60, 60, 60, 80],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, config.spacing.sectionGap],
  } as ContentTable);
  
  return content;
}

// =============================================================================
// SAFETY SECTION
// =============================================================================

export function buildSafetyContent(reportData: ReportData, config: PrintConfig): Content[] {
  const safety = reportData.safety;
  if (!safety) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'SAFETY STATS & NARRATIVE', style: 'h2' });
  
  // Stats table
  const statsBody = [
    [
      { text: 'Metric', style: 'tableHeader' },
      { text: 'Week', style: 'tableHeader', alignment: 'center' },
      { text: 'YTD', style: 'tableHeader', alignment: 'center' },
    ],
    [
      { text: 'Near Misses', style: 'tableCell' },
      { text: safety.nearMissesWeek.toString(), style: 'tableCell', alignment: 'center' },
      { text: safety.nearMissesYTD.toString(), style: 'tableCell', alignment: 'center' },
    ],
    [
      { text: 'First Aids', style: 'tableCell' },
      { text: safety.firstAidsWeek.toString(), style: 'tableCell', alignment: 'center' },
      { text: safety.firstAidsYTD.toString(), style: 'tableCell', alignment: 'center' },
    ],
    [
      { text: 'Recordables', style: 'tableCell' },
      { text: safety.recordablesWeek.toString(), style: 'tableCell', alignment: 'center' },
      { text: safety.recordablesYTD.toString(), style: 'tableCell', alignment: 'center' },
    ],
  ];
  
  content.push({
    table: {
      headerRows: 1,
      widths: [100, 60, 60],
      body: statsBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => config.spacing.tablePadding,
      paddingRight: () => config.spacing.tablePadding,
      paddingTop: () => config.spacing.tablePadding,
      paddingBottom: () => config.spacing.tablePadding,
    },
    margin: [0, 0, 0, 12],
  } as ContentTable);
  
  // Narrative
  content.push({
    text: safety.narrative,
    style: 'body',
    margin: [0, 0, 0, config.spacing.sectionGap],
  });
  
  return content;
}

// =============================================================================
// FINANCIALS SECTION
// =============================================================================

export function buildFinancialsContent(reportData: ReportData, config: PrintConfig): Content[] {
  const financials = reportData.financials;
  if (!financials) return [];
  
  const content: Content[] = [];
  
  content.push({ text: 'FINANCIAL SUMMARY', style: 'h2' });
  
  content.push({
    text: `Earned: $${financials.earned.toLocaleString()}`,
    style: 'body',
    bold: true,
    margin: [0, 0, 0, 12],
  });
  
  if (financials.invoices?.length) {
    const tableBody = [
      [
        { text: 'Invoice #', style: 'tableHeader' },
        { text: 'Period', style: 'tableHeader' },
        { text: 'Amount', style: 'tableHeader', alignment: 'right' },
        { text: 'Retainage', style: 'tableHeader', alignment: 'right' },
        { text: 'Net', style: 'tableHeader', alignment: 'right' },
        { text: 'Paid', style: 'tableHeader' },
      ],
      ...financials.invoices.map(inv => [
        { text: inv.invoiceNumber, style: 'tableCell' },
        { text: inv.period, style: 'tableCell' },
        { text: `$${inv.amount.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
        { text: `$${inv.retainage.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
        { text: `$${inv.net.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
        { text: inv.paid, style: 'tableCell' },
      ]),
    ];
    
    content.push({
      table: {
        headerRows: 1,
        widths: [70, 70, 70, 60, 70, 60],
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COLORS.border,
        vLineColor: () => COLORS.border,
        paddingLeft: () => config.spacing.tablePadding,
        paddingRight: () => config.spacing.tablePadding,
        paddingTop: () => config.spacing.tablePadding,
        paddingBottom: () => config.spacing.tablePadding,
      },
      margin: [0, 0, 0, config.spacing.sectionGap],
    } as ContentTable);
  }
  
  return content;
}

// =============================================================================
// PHOTOS SECTION
// =============================================================================

export function buildPhotosContent(
  reportData: ReportData, 
  config: PrintConfig,
  placement: any
): Content[] {
  if (!reportData.photos?.length) return [];
  
  const content: Content[] = [];
  
  // Only add header on first photo page
  if (!placement.continuesFromPrevious) {
    content.push({ text: 'PHOTOGRAPHIC DOCUMENTATION', style: 'h2' });
  }
  
  // Calculate which photos to show based on placement
  const photosPerPage = 6;
  const continuedIndex = placement.sectionId.includes('_continued_') 
    ? parseInt(placement.sectionId.split('_continued_')[1]) 
    : 0;
  const startIdx = continuedIndex * photosPerPage;
  const endIdx = Math.min(startIdx + photosPerPage, reportData.photos.length);
  const photosForPage = reportData.photos.slice(startIdx, endIdx);
  
  // Build 2-column grid
  for (let i = 0; i < photosForPage.length; i += 2) {
    const row: Content[] = [];
    
    for (let j = 0; j < 2 && (i + j) < photosForPage.length; j++) {
      const photo = photosForPage[i + j];
      row.push({
        stack: [
          {
            image: photo.base64 || photo.url || '',
            width: 240,
            height: 160,
            fit: [240, 160] as [number, number],
          },
          { text: photo.filename, fontSize: 8, bold: true, margin: [0, 4, 0, 2] },
          { text: photo.caption || '', fontSize: 7, color: COLORS.textMuted },
        ],
        width: '*',
      });
    }
    
    content.push({
      columns: row,
      columnGap: 16,
      margin: [0, 0, 0, 16],
    } as ContentColumns);
  }
  
  return content;
}
```

---

### 15. `/components/PrintStudioModal.tsx` (Main Orchestrator)

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
  const { generatePDF, isGenerating, error } = usePDFGeneration();
  
  const handleDownload = async () => {
    await generatePDF(config, pageMap, reportData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🖨️</span> Print Studio
            </h2>
            <p className="text-sm text-gray-500">Customize report layout</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
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
          <div className="flex-1 bg-gray-100 overflow-auto p-8">
            <div className="flex flex-col items-center">
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
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {pageMap.totalPages} page{pageMap.totalPages !== 1 ? 's' : ''}
            </span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPageBreakGuides}
                onChange={(e) => setShowPageBreakGuides(e.target.checked)}
                className="rounded"
              />
              Show Page Break Guides
            </label>
          </div>
          
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
          
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span>📄</span>
                Download Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## DATA FLOW DIAGRAM

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
│  HTML    │   │  pdfmake │
│ Preview  │   │Generator │
│          │   │          │
│ Renders  │   │ Builds   │
│ PageMap  │   │ docDef   │
│ visually │   │ from     │
│          │   │ PageMap  │
└──────────┘   └──────────┘
```

---

## VERIFICATION CHECKLIST

### Automated Checks
- [ ] `npm run build` passes with no TypeScript errors
- [ ] No circular dependency warnings
- [ ] All imports resolve correctly

### Manual Verification
1. **Page Break Consistency**
   - [ ] Page 1 of Preview matches Page 1 of PDF exactly
   - [ ] All subsequent pages match between preview and PDF
   
2. **Overflow Check**
   - [ ] "Safety is a core value" banner stays within page 1 boundary
   - [ ] No content bleeds past page edges
   
3. **Section Reordering**
   - [ ] Dragging "Weather" before "Progress" updates Preview immediately
   - [ ] Downloaded PDF reflects the same order
   
4. **Spacing Settings**
   - [ ] "Compact" visibly reduces spacing in preview
   - [ ] "Relaxed" visibly increases spacing in preview
   - [ ] PDF reflects the same spacing changes
   
5. **Photo Section**
   - [ ] Photos display in 2x3 grid
   - [ ] Photo section correctly spans multiple pages when needed
   - [ ] Cover photos toggle works correctly

---

## SUCCESS CRITERIA

1. ✅ First page contains: header image, title, photos, client info, safety banner - nothing more
2. ✅ Page 2 starts cleanly with Executive Summary (or first enabled section)
3. ✅ HTML preview and PDF output have identical page breaks
4. ✅ Dragging sections in sidebar correctly reorders them in both preview AND PDF
5. ✅ Spacing changes affect both preview AND PDF consistently
6. ✅ Photos section correctly spans multiple pages when needed
7. ✅ pdfmake document definition is built from PageMap, not calculated independently

---

## IMPORTANT NOTES

### pdfmake-Specific Considerations

1. **Font Loading**: pdfmake requires fonts to be embedded. The default `vfs_fonts` includes Roboto. If you need custom fonts, you'll need to add them to the virtual file system.

2. **Images**: pdfmake works best with base64-encoded images. Make sure your photos have base64 data available, or convert URLs to base64 before PDF generation.

3. **Page Breaks**: pdfmake handles page breaks automatically, but we're using `pageBreak: 'after'` to enforce our calculated page breaks from the PageMap.

4. **Tables**: pdfmake tables need explicit widths. Use `'*'` for flexible columns and specific numbers for fixed widths.

5. **Units**: pdfmake uses points (72 per inch). Our `pageConstants.ts` is already configured in points for consistency.

### Migration Strategy

Build the new system parallel to the existing `PrintPreviewModal.tsx`. Once complete and tested:

1. Update the import in `ProjectSetup.tsx` (or wherever the modal is used)
2. Test thoroughly
3. Delete the old `PrintPreviewModal.tsx` and `PrintView.tsx`

---

## QUESTIONS TO ASK IF STUCK

1. "Show me the current structure of PrintPreviewModal.tsx"
2. "What does the report data object look like in the current implementation?"
3. "How are images/photos currently handled - are they base64 or URLs?"
4. "What version of pdfmake is installed?"
5. "Are there any custom fonts being used?"
