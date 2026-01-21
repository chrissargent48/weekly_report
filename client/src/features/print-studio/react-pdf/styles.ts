/**
 * @react-pdf/renderer StyleSheet definitions
 *
 * These styles mirror the Tailwind/CSS styles from our HTML preview
 * but are expressed in react-pdf's StyleSheet format.
 */

import { StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (using built-in fonts for now, can add custom later)
// Font.register({
//   family: 'Inter',
//   src: '/fonts/Inter-Regular.ttf',
// });

// Brand colors matching styleTokens.ts
export const COLORS = {
  primary: '#0891B2',        // Teal/cyan brand color
  primaryDark: '#0E7490',
  accent: '#D4A84B',         // Golden accent (was F59E0B)
  text: '#18181b',           // zinc-900
  textMuted: '#71717a',      // zinc-500
  textLight: '#a1a1aa',      // zinc-400
  border: '#e4e4e7',         // zinc-200
  borderLight: '#f4f4f5',    // zinc-100
  background: '#FFFFFF',
  backgroundAlt: '#fafafa',  // zinc-50
  safetyBanner: '#0891B2',
  green: '#16a34a',
  greenLight: '#dcfce7',
  amber: '#d97706',
  amberLight: '#fef3c7',
  red: '#dc2626',
  redLight: '#fee2e2',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  teal: '#0d9488',
  tealLight: '#ccfbf1',
} as const;

// Page dimensions in points (72 DPI)
export const PAGE = {
  WIDTH: 612,    // 8.5" Letter
  HEIGHT: 792,   // 11" Letter
  MARGIN_TOP: 40,
  MARGIN_BOTTOM: 50,
  MARGIN_LEFT: 40,
  MARGIN_RIGHT: 40,
  get USABLE_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get USABLE_HEIGHT() {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  },
} as const;

// Cover section constants
export const COVER = {
  HEADER_HEIGHT: 180,
  TITLE_BLOCK_HEIGHT: 100,
  PHOTO_STRIP_HEIGHT: 100,
  CLIENT_INFO_HEIGHT: 60,
  SAFETY_BANNER_HEIGHT: 30,
} as const;

// Main stylesheet
export const styles = StyleSheet.create({
  // ===== PAGE LAYOUTS =====
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.background,
    paddingTop: PAGE.MARGIN_TOP,
    paddingBottom: PAGE.MARGIN_BOTTOM,
    paddingLeft: PAGE.MARGIN_LEFT,
    paddingRight: PAGE.MARGIN_RIGHT,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.text,
  },
  coverPage: {
    flexDirection: 'column',
    backgroundColor: COLORS.background,
    padding: 0, // Cover page has no padding - handled internally
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.text,
  },

  // ===== TYPOGRAPHY =====
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  h2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  h3: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  body: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  bodySmall: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.3,
  },
  label: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 9,
  },

  // ===== SECTIONS =====
  section: {
    marginBottom: 16,
  },
  sectionCompact: {
    marginBottom: 12,
  },
  sectionRelaxed: {
    marginBottom: 24,
  },

  // ===== TABLES =====
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderAlt: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableHeaderCellDark: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundAlt,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.text,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tableCellMuted: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  tableCellRight: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: 'right',
  },
  tableCellCenter: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: 'center',
  },

  // ===== COVER PAGE =====
  coverHeader: {
    width: '100%',
    height: COVER.HEADER_HEIGHT,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  coverHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    opacity: 0.9,
  },
  coverLogo: {
    position: 'absolute',
    top: 20,
    left: 30,
  },
  coverLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  coverLogoSubtext: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  coverContent: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 12,
  },
  coverAccentBar: {
    width: 100,
    height: 4,
    backgroundColor: COLORS.accent,
    marginBottom: 16,
  },
  coverReportType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coverDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  coverPhotoStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  coverPhoto: {
    flex: 1,
    height: 80,
    borderRadius: 3,
    objectFit: 'cover',
    backgroundColor: COLORS.borderLight,
  },
  coverInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  coverInfoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textLight,
    width: 50,
  },
  coverInfoValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  coverSafetyBanner: {
    width: '100%',
    height: COVER.SAFETY_BANNER_HEIGHT,
    backgroundColor: COLORS.safetyBanner,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  coverSafetyText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // ===== CARDS =====
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardHeaderGreen: {
    backgroundColor: COLORS.greenLight,
    borderBottomColor: '#bbf7d0',
  },
  cardHeaderBlue: {
    backgroundColor: COLORS.blueLight,
    borderBottomColor: '#bfdbfe',
  },
  cardHeaderAmber: {
    backgroundColor: COLORS.amberLight,
    borderBottomColor: '#fde68a',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ===== BADGES =====
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeGreen: {
    backgroundColor: COLORS.tealLight,
    color: COLORS.teal,
  },
  badgeBlue: {
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
  },
  badgeAmber: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  badgeRed: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },

  // ===== STATS =====
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ===== PHOTOS GRID =====
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoContainer: {
    width: '48%',
    marginBottom: 10,
  },
  photo: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 3,
    marginBottom: 4,
  },
  photoCaption: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  photoDescription: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ===== FOOTER =====
  footer: {
    position: 'absolute',
    bottom: 20,
    left: PAGE.MARGIN_LEFT,
    right: PAGE.MARGIN_RIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  footerPageNumber: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // ===== UTILITIES =====
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  gap4: {
    gap: 4,
  },
  gap8: {
    gap: 8,
  },
  gap12: {
    gap: 12,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  mt4: {
    marginTop: 4,
  },
  mt8: {
    marginTop: 8,
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },

  // ===== DAY INDICATORS =====
  dayIndicatorRow: {
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
  dayIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  dayIndicatorInactive: {
    backgroundColor: COLORS.backgroundAlt,
  },
  dayIndicatorText: {
    fontSize: 6,
    fontWeight: 'bold',
  },
  dayIndicatorTextActive: {
    color: '#FFFFFF',
  },
  dayIndicatorTextInactive: {
    color: COLORS.textLight,
  },
});

// Spacing multipliers for density modes
export const DENSITY_MULTIPLIERS = {
  compact: 0.85,
  standard: 1.0,
  relaxed: 1.2,
} as const;

export type DensityMode = keyof typeof DENSITY_MULTIPLIERS;
