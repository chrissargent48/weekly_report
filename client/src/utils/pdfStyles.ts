/**
 * PDF Styles Configuration for pdfmake
 * 
 * This file defines all reusable styles for the weekly report PDF.
 * Styles mirror the visual design from PrintView.tsx as closely as possible.
 */

import { StyleDictionary } from 'pdfmake/interfaces';

/**
 * Brand Colors matching Tailwind config
 * These approximate the brand-primary and zinc color palette
 */
export const BRAND_COLORS = {
    primary: '#009fb7',      // brand-primary (teal)
    primaryDark: '#007a8c',  // darker variant
    golden: '#D4A84B',       // golden yellow for accents (from workplan style)
    dark: '#18181b',         // zinc-900
    text: '#3f3f46',         // zinc-700
    textMuted: '#71717a',    // zinc-500
    textLight: '#a1a1aa',    // zinc-400
    border: '#e4e4e7',       // zinc-200
    bgLight: '#fafafa',      // zinc-50
    accent: '#f59e0b',       // amber for warnings
    success: '#10b981',      // emerald
    danger: '#ef4444',       // red
    white: '#ffffff',        // white
} as const;

/**
 * Style dictionary for pdfmake documents
 * Use these style names when building document content
 */
export const pdfStyles: StyleDictionary = {
    // =====================
    // HEADERS & TITLES
    // =====================
    
    // Cover page project name
    coverTitle: {
        fontSize: 28,
        bold: true,
        color: BRAND_COLORS.dark,
        alignment: 'center',
        margin: [0, 0, 0, 8],
    },
    
    // Cover page subtitle (Weekly Progress Report)
    coverSubtitle: {
        fontSize: 16,
        bold: true,
        color: BRAND_COLORS.primary,
        alignment: 'center',
        margin: [0, 16, 0, 4],
    },
    
    // Cover page location text
    coverLocation: {
        fontSize: 12,
        color: BRAND_COLORS.textMuted,
        alignment: 'center',
        margin: [0, 0, 0, 24],
    },
    
    // Content page header - project name
    pageHeader: {
        fontSize: 16,
        bold: true,
        color: BRAND_COLORS.dark,
    },
    
    // Section headers (Executive Summary, Weather, etc.)
    sectionHeader: {
        fontSize: 11,
        bold: true,
        color: BRAND_COLORS.primary,
        margin: [0, 12, 0, 6],
    },
    
    // Sub-section headers (Client, Engineer, etc.)
    subHeader: {
        fontSize: 9,
        bold: true,
        color: BRAND_COLORS.textLight,
        margin: [0, 8, 0, 4],
    },
    
    // =====================
    // BODY TEXT
    // =====================
    
    // Default body text
    body: {
        fontSize: 9,
        color: BRAND_COLORS.text,
        lineHeight: 1.3,
    },
    
    // Small text for notes, captions
    small: {
        fontSize: 8,
        color: BRAND_COLORS.textMuted,
    },
    
    // Extra small for fine print
    tiny: {
        fontSize: 7,
        color: BRAND_COLORS.textLight,
    },
    
    // Bold text
    bold: {
        bold: true,
    },
    
    // Muted/lighter text
    muted: {
        color: BRAND_COLORS.textMuted,
    },
    
    // Primary colored text
    primary: {
        color: BRAND_COLORS.primary,
    },
    
    // =====================
    // TABLE STYLES
    // =====================
    
    // Table header row
    tableHeader: {
        fontSize: 8,
        bold: true,
        color: BRAND_COLORS.textMuted,
        fillColor: BRAND_COLORS.bgLight,
        margin: [4, 4, 4, 4],
    },
    
    // Table body cell
    tableCell: {
        fontSize: 8,
        color: BRAND_COLORS.text,
        margin: [4, 3, 4, 3],
    },
    
    // Table cell for numbers - right aligned
    tableCellRight: {
        fontSize: 8,
        color: BRAND_COLORS.text,
        alignment: 'right',
        margin: [4, 3, 4, 3],
    },
    
    // Table cell for emphasized values
    tableCellBold: {
        fontSize: 8,
        bold: true,
        color: BRAND_COLORS.dark,
        margin: [4, 3, 4, 3],
    },
    
    // Table cell for totals row
    tableTotal: {
        fontSize: 8,
        bold: true,
        color: BRAND_COLORS.dark,
        fillColor: BRAND_COLORS.bgLight,
        margin: [4, 4, 4, 4],
    },
    
    // =====================
    // KPI / STAT BOXES
    // =====================
    
    // Large stat number
    statValue: {
        fontSize: 20,
        bold: true,
        color: BRAND_COLORS.dark,
        alignment: 'center',
    },
    
    // Stat label
    statLabel: {
        fontSize: 7,
        bold: true,
        color: BRAND_COLORS.textLight,
        alignment: 'center',
    },
    
    // =====================
    // FOOTER
    // =====================
    
    footer: {
        fontSize: 8,
        color: BRAND_COLORS.textLight,
        alignment: 'center',
    },
    
    // =====================
    // STATUS BADGES
    // =====================
    
    badgeSuccess: {
        fontSize: 7,
        bold: true,
        color: '#065f46', // emerald-800
    },
    
    badgeWarning: {
        fontSize: 7,
        bold: true,
        color: '#92400e', // amber-800
    },
    
    badgeDanger: {
        fontSize: 7,
        bold: true,
        color: '#991b1b', // red-800
    },
    
    badgeNeutral: {
        fontSize: 7,
        bold: true,
        color: BRAND_COLORS.textMuted,
    },
};

/**
 * Table layout configurations for pdfmake
 */
export const tableLayouts = {
    // Standard table with light borders
    standardTable: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => BRAND_COLORS.border,
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
    },
    
    // Table with no borders
    noBorders: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
    },
    
    // Light grid for dense data
    lightGrid: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => BRAND_COLORS.border,
        vLineColor: () => BRAND_COLORS.border,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 2,
        paddingBottom: () => 2,
    },
};

/**
 * Default page margins [left, top, right, bottom] in points
 * A4 with reasonable margins for professional documents
 */
export const PAGE_MARGINS: [number, number, number, number] = [40, 50, 40, 50];

/**
 * Cover page margins - slightly different for visual balance
 */
export const COVER_MARGINS: [number, number, number, number] = [60, 80, 60, 60];
