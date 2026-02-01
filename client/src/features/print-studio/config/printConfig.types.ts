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

/**
 * NORMALIZED PAGE MAP ARCHITECTURE
 * --------------------------------
 * Replaces the monolithic list processing with a fragment-based approach.
 */

// The Source of Truth: Raw Data Entities
export interface ReportEntity {
  id: string;
  type: string; // 'table' | 'chart' | 'summary' | etc.
  data: any;
  config?: any;
}

// A specific slice of an entity assigned to a page
export interface LayoutFragment {
  id: string;            // Unique Render ID (e.g., "table-weather-part1")
  entityId: string;      // Reference to Source Data (e.g., "table-weather")
  type: 'full' | 'head' | 'body' | 'tail'; // Split state
  
  // Precise Split Metadata
  slice?: {
    startIndex: number; // e.g., Row 0
    endIndex: number;   // e.g., Row 15
  };
  
  // Continuation Context
  continuation?: {
    hasHeader: boolean;      // Should we repeat the header?
    hasFooter: boolean;
    footerLabel?: string;    // "Continued on next page..."
    pageIndex: number;       // 0-based index of this fragment in the entity's sequence
  };
  
  estimatedHeight: number;
}

// The Page Container
export interface PageDefinition {
  id: string;
  pageIndex: number;
  fragments: LayoutFragment[]; 
  usedHeight: number; 
  availableHeight: number;
}

// The Master State
export interface ReportState {
  // Master list of all raw data items (The Source of Truth)
  entities: Record<string, ReportEntity>; 

  // The calculated physical layout (Derived State)
  pages: Record<string, PageDefinition>;
  
  pageOrder: string[]; // List of Page IDs
}

// Legacy Compatibility (to be phased out or adapted)
export interface PageMap {
  totalPages: number;
  pages: PageContent[];
  sectionPlacements: Map<string, PagePlacement>;
  // New normalized state (optional during migration)
  normalized?: ReportState; 
}
export interface PagePlacement extends Partial<LayoutFragment> {
  // Keeping existing fields for backward compatibility during migration
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
