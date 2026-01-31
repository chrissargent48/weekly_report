import React from 'react';
import { WeeklyReport } from '../../../types';

export interface PrintSection {
  id: string;
  label: string;
  included: boolean;
  order: number;
  forcePageBreakBefore?: boolean;
}

export interface PrintSpacing {
  type: 'compact' | 'standard' | 'relaxed';
  sectionGap: number;
  elementGap: number;
  tablePadding: number;
}

export interface PrintBranding {
  primaryColor: string;
  secondaryColor?: string;
  useSecondaryColor: boolean;
  headingFont: string;
  bodyFont?: string;
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

export interface PrintConfig {
  sections: PrintSection[];
  spacing: PrintSpacing;
  branding?: PrintBranding;
  
  logoScale: number;
  logoAlign: 'left' | 'center' | 'right';
  
  heroPhotoIndex: number | null;
  heroPhotoPosition: ImagePosition;
  
  // Section-specific shims (legacy/transitional)
  stripPhotoIndexes: number[];
  stripPhotoPositions: PhotoPositions;
  photoPositions: PhotoPositions;
  
  showPageNumbers: boolean;
  showFooter: boolean;
  showCoverPhotos: boolean;

  // Manual page breaks
  manualBreaks?: ManualPageBreak[];
  
// Section-specific padding
  sectionPadding?: Record<string, { top: number; bottom: number }>;

  // Section-specific configs (New Pattern)
  cover?: CoverConfig;
}

export interface CoverConfig {
  subtitle?: string;
  showPhotoGrid?: boolean;
  showSafetyQuote?: boolean;
  safetySlogan?: string;
  heroOverlayColor?: string;
  heroOverlayOpacity?: number;
  dividerLine?: {
    show: boolean;
    color: string;
    width: number;
    thickness: number;
    alignment: 'left' | 'center' | 'right';
  };
  coverPhotos?: (string | null)[];
}

export interface ManualPageBreak {
    sectionId: string;
    afterRowIndex: number; // 0-based index relative to data array
}

// Data structures for the report mapping
export type ReportData = WeeklyReport;

export interface PageContent {
  pageNumber: number;
  isFirstPage: boolean;
  sections: PagePlacement[];
  usedHeight: number;
  availableHeight: number;
}

export interface PagePlacement {
  sectionId: string;
  startsOnPage: number;
  estimatedHeight: number;
  continuesFromPrevious: boolean;
  dataRange?: { start: number; end: number };
  renderConfig?: {
      showHeader?: boolean;
      showContinuedHeader?: boolean;
      showFooter?: boolean;
  };
  cssHints?: React.CSSProperties;
}

export interface PageMap {
  totalPages: number;
  pages: PageContent[];
  sectionPlacements: Map<string, PagePlacement>;
}
