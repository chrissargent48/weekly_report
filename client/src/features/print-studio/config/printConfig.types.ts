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

/**
 * Image position within its container (for cropping/clipping)
 * Uses percentage values for object-position CSS property
 * Default is center (50% 50%)
 */
export interface ImagePosition {
  x: number;  // 0-100, percentage from left
  y: number;  // 0-100, percentage from top
}

/**
 * Per-photo position configuration
 * Key is the photo index, value is the position
 */
export type PhotoPositions = Record<number, ImagePosition>;

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

// We can augment this as we migrate more types, for now it matches existing
export interface ReportData {
  // Your existing report data structure
  // For strict typing, we'd import the main WeeklyReport type here
  [key: string]: any;
}
