export interface PrintSection {
  id: string;
  label: string;
  included: boolean;
  order: number;
  /** When true, forces a page break before this section regardless of available space */
  forcePageBreakBefore?: boolean;
}

export interface PrintSpacing {
  type: 'compact' | 'standard' | 'relaxed';
  sectionGap: number;      // px between sections
  elementGap: number;      // px between elements within sections
  tablePadding: number;    // px padding in table cells
}

/**
 * Image position within its container (for cropping/clipping)
 * Uses percentage values for object-position CSS property
 * Default is center (50% 50%)
 */
export interface ImagePosition {
  x: number;  // 0-100, percentage from left
  y: number;  // 0-100, percentage from top
  zoom?: number; // 1-3, scale factor
  crop?: { // Pixel crop (React Easy Crop format)
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Per-photo position configuration
 * Key is the photo index, value is the position
 */
export type PhotoPositions = Record<number, ImagePosition>;

/**
 * Manual page break inserted by user within a section (between rows)
 */
export interface ManualPageBreak {
  sectionId: string;      // e.g., "progress", "safety", "materials"
  afterRowIndex: number;  // Break after row at this index (0-based)
  afterRowId?: string;    // Optional: row ID for more stable reference
  type: 'simple' | 'split'; // simple = just break; split = cut table (repeat headers, flat borders)
}

export interface BrandingConfig {
  primaryColor: string; // Hex color for main accents (headers, dividers)
  headingFont: 'Inter' | 'Roboto' | 'Outfit' | 'Times New Roman';
  secondaryColor?: string; // Optional secondary accent
  useSecondaryColor: boolean;
}

/**
 * Per-section padding overrides (in pixels at 96 DPI).
 * Allows users to manually push sections down or add spacing after,
 * similar to paragraph spacing controls in Word.
 */
export interface SectionPaddingConfig {
  top: number;     // 0–120, extra space above the section
  bottom: number;  // 0–120, extra space below the section
}

export interface PrintConfig {
  sections: PrintSection[];
  spacing: PrintSpacing;
  logoScale: number;           // 20-200, percentage
  logoAlign: 'left' | 'center' | 'right';
  heroPhotoIndex: number | null;
  heroPhotoPosition: ImagePosition;  // Position of hero image within its container
  stripPhotoIndexes: number[];
  stripPhotoPositions: PhotoPositions;  // Position of each strip photo
  photoPositions: PhotoPositions;  // Position of each photo in the photos section
  showPageNumbers: boolean;
  showFooter: boolean;
  showCoverPhotos: boolean;
  /** Global branding settings */
  branding?: BrandingConfig;
  /** Manual page breaks inserted within sections (session-only by default) */
  manualBreaks?: ManualPageBreak[];
  /** Per-section padding overrides for manual layout adjustment */
  sectionPadding?: Record<string, SectionPaddingConfig>;
}

export interface PagePlacement {
  sectionId: string;
  startsOnPage: number;
  estimatedHeight: number;
  continuesFromPrevious: boolean;
  dataRange?: { start: number; end: number }; // For split sections like Progress
  renderConfig?: {
    showHeader?: boolean;
    showFooter?: boolean;
    showContinuedHeader?: boolean;  // Show minimal header for continuation pages
    isSplitTop?: boolean; // For "Cut" tables: bottom borders flat
    isSplitBottom?: boolean; // For "Cut" tables: top borders flat
    [key: string]: boolean | undefined;
  };
  /** CSS-based layout hints for page break control */
  cssHints?: {
    pageBreakBefore?: boolean;   // Force page break before this section
    avoidBreakInside?: boolean;  // Try to keep section together
  };
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

import { WeeklyReport } from '../../../types';

export type ReportData = WeeklyReport;
