// All measurements in pixels at 96 DPI (standard screen resolution)
// PDF generation will convert these to points (72 DPI) as needed

export const PAGE = {
  // A4 size: 210mm x 297mm
  // In pixels (96 DPI): 794px x 1123px
  WIDTH: 794,
  HEIGHT: 1123,
  
  // Margins
  MARGIN_TOP: 40,
  MARGIN_BOTTOM: 60,      // Extra room for footer
  MARGIN_LEFT: 40,
  MARGIN_RIGHT: 40,
  
  // Calculated usable area
  get USABLE_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get USABLE_HEIGHT() {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  },
} as const;

export const FOOTER = {
  HEIGHT: 40,
  MARGIN_TOP: 16,
} as const;

// Safety margin to prevent edge-case overflows (e.g. slight browser font rendering differences)
export const SAFETY_MARGIN = 20; 

// =============================================================================
// ORPHAN & WIDOW PREVENTION CONSTANTS
// =============================================================================

/**
 * If a section header would be placed within this threshold of the page bottom,
 * force a page break before the section to prevent orphaned headers.
 */
export const ORPHAN_THRESHOLD = 100;

/**
 * Minimum content height that must fit after a section header.
 * If there's not enough room for the header + this minimum, start a new page.
 */
export const MIN_CONTENT_AFTER_HEADER = 80;

/**
 * Minimum number of table rows to place on a page to avoid orphaned rows.
 * Ensures we don't leave a lonely 1-2 rows at the top/bottom of a page.
 */
export const MIN_ROWS_PER_PAGE = 3;

/**
 * Layout density multipliers for Standard/Compact/Relaxed modes.
 * These affect line-heights and bounding boxes across sections.
 */
export const DENSITY_MULTIPLIERS = {
  compact: 0.92,   // Tighter spacing, smaller fonts
  standard: 1.0,   // Default layout
  relaxed: 1.08,   // More breathing room
} as const;

export type DensityType = keyof typeof DENSITY_MULTIPLIERS;

/**
 * Apply density multiplier to a pixel height based on spacing type
 */
export function applyDensityMultiplier(height: number, densityType: DensityType): number {
  return Math.ceil(height * DENSITY_MULTIPLIERS[densityType]);
} 

// First page has different constraints due to cover content
export const FIRST_PAGE = {
  // INCREASED from 280 to 320 for better visual proportions
  HEADER_IMAGE_HEIGHT: 420,      // The branded header image (approx 40% of page)
  TITLE_BLOCK_HEIGHT: 140,       // Project name, address, report type
  PHOTO_STRIP_HEIGHT: 240,       // 3 thumbnail photos + margins (expanded to fill page)
  CLIENT_INFO_HEIGHT: 80,        // Client, Address, Job # block (slightly reduced)
  SAFETY_BANNER_HEIGHT: 40,      // "Safety is a core value" banner
  
  get COVER_TOTAL_HEIGHT() {
    return (
      this.HEADER_IMAGE_HEIGHT +
      this.TITLE_BLOCK_HEIGHT +
      this.PHOTO_STRIP_HEIGHT +
      this.CLIENT_INFO_HEIGHT +
      this.SAFETY_BANNER_HEIGHT +
      60 // Buffer for internal margins/gaps
    );
  },
  
  // What's left for content on page 1 after cover elements
  get REMAINING_HEIGHT() {
    return PAGE.USABLE_HEIGHT - this.COVER_TOTAL_HEIGHT;
  },
} as const;

/**
 * TUNED CONSTANTS FOR FLUID LAYOUT
 * These values match the rendered pixel heights of standard components
 */
export const ROW_HEIGHTS = {
  standard: 38,     // Standard table row (Manpower, Procurement)
  compact: 32,      // Compact row (Financials)
  large: 44,        // Larger row (Safety Observations, Key Personnel)
  weather: 36,      // Weather table row
  milestone: 34,    // Schedule milestone
  issue: 48,        // Issue item 
} as const;

export const HEADER_HEIGHTS = {
  standard: 60,     // Section Header + Table Header
  simple: 40,       // Just Section Header (List)
  complex: 100,     // Section Header + Subtitles/Filters
  manpower: 60,     // Title + Table Header
  procurement: 60,
  safety_top: 160,  // Title + KPI Cards
  lookahead: 60,
} as const;

// Approximate heights for section types (will be refined by measureSection)
// Kept for backward compatibility and fallback
export const SECTION_BASE_HEIGHTS = {
  overview: 280,              // Executive Summary - Stats row + paragraph
  weather: 320,               // 7-day table
  progress: 200,              // Variable - paragraph content
  lookahead: 400,             // Table with ~15 rows
  manpower: 350,              // Table with ~12 rows
  equipment: 280,             // Table with ~8 rows
  materials: 200,             // Table with ~4 rows
  procurement: 280,           // Table with ~8 rows
  safety: 200,                // Stats + narrative paragraph
  financials: 180,            // Summary + invoice table
  schedule: 300,             // Milestones table
  issues: 250,               // Issues list
  photos: 600,                // 2x3 photo grid per "page" of photos
  documents: 100,            // Link list
  key_personnel: 240,        // 3 columns of personnel info
} as const;

// =============================================================================
// PDF POINT-BASED CONSTANTS (72 DPI for pdfmake compatibility)
// =============================================================================

export const PAGE_POINTS = {
  // A4 size in points: 595.28 x 841.89
  WIDTH: 595.28,
  HEIGHT: 841.89,
  
  // Margins in points
  MARGIN_TOP: 30,
  MARGIN_BOTTOM: 45,
  MARGIN_LEFT: 30,
  MARGIN_RIGHT: 30,
  
  // Calculated usable area
  get USABLE_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get USABLE_HEIGHT() {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  },
} as const;

export const FOOTER_POINTS = {
  HEIGHT: 30,
  MARGIN_TOP: 12,
} as const;

// =============================================================================
// CONVERSION UTILITIES
// =============================================================================

/**
 * Convert pixels (96 DPI screen) to points (72 DPI PDF)
 */
export function pxToPoints(px: number): number {
  return px * (72 / 96);
}

/**
 * Convert points (72 DPI PDF) to pixels (96 DPI screen)
 */
export function pointsToPx(points: number): number {
  return points * (96 / 72);
}

