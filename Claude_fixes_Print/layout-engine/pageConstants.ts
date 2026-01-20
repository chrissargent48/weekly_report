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

// First page has different constraints due to cover content
export const FIRST_PAGE = {
  // INCREASED from 280 to 320 for better visual proportions
  HEADER_IMAGE_HEIGHT: 320,      // The branded header image (approx 35% of page)
  TITLE_BLOCK_HEIGHT: 140,       // Project name, address, report type
  PHOTO_STRIP_HEIGHT: 120,       // 3 thumbnail photos + margins (slightly reduced)
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

// Approximate heights for section types (will be refined by measureSection)
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
} as const;
