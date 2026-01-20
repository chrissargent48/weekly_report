/**
 * PDF Generator for Weekly Reports using pdfmake
 * 
 * This module generates professional PDF documents from WeeklyReport data.
 * It replaces the Puppeteer-based approach with pure client-side generation.
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { WeeklyReport, ProjectConfig, PrintOptions, PrintSectionConfig } from '../types';
import { pdfStyles, BRAND_COLORS, tableLayouts, PAGE_MARGINS } from './pdfStyles';

// Use 'any' for table cells to avoid strict type checking issues with pdfmake
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TableRow = any[];


// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

// =====================================================
// MAIN EXPORT FUNCTION
// =====================================================

/**
 * Generate and download a PDF for the given weekly report
 * 
 * @param report - The weekly report data
 * @param config - Project configuration (personnel, identity, etc.)
 * @param options - Print options (which sections to include, logo settings)
 */
export async function generateReportPDF(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintOptions
): Promise<void> {
    // PRE-PROCESSING: Ensure all photos are base64 encoded
    // pdfmake in the browser works best with data URIs
    const safeReport = await ensureReportImagesAreSafe(report);

    // Build the document definition
    const docDefinition = await buildDocumentDefinition(safeReport, config, options);
    
    // Generate filename
    const filename = `WeeklyReport_${config.identity.jobNumber}_${report.weekEnding}.pdf`;
    
    // Create and download
    pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Open PDF in new browser tab (useful for preview)
 */
export async function openReportPDF(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintOptions
): Promise<void> {
    const safeReport = await ensureReportImagesAreSafe(report);
    const docDefinition = await buildDocumentDefinition(safeReport, config, options);
    pdfMake.createPdf(docDefinition).open();
}

// --- IMAGE HELPERS ---

async function ensureReportImagesAreSafe(report: WeeklyReport): Promise<WeeklyReport> {
    // Deep clone to avoid mutating original
    const safeReport = JSON.parse(JSON.stringify(report)) as WeeklyReport;
    
    // Process all photos in the photos array
    if (safeReport.photos && safeReport.photos.length > 0) {
        safeReport.photos = await Promise.all(safeReport.photos.map(async (photo) => {
            if (photo.url && !photo.url.startsWith('data:')) {
                try {
                    const base64 = await imgUrlToBase64(photo.url);
                    return { ...photo, url: base64 };
                } catch (e) {
                    console.error(`Failed to convert image ${photo.url} to base64:`, e);
                    return photo; // Return original on failure (pdfmake might fail or ignore)
                }
            }
            return photo;
        }));
    }
    
    return safeReport;
}

async function imgUrlToBase64(url: string): Promise<string> {
    console.log(`[PDF] Converting image: ${url}`);
    try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = 'Anonymous';  // Allow cross-origin if needed
        img.src = url;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (e) => reject(new Error(`Image load failed for ${url}`));
        });

        // Resize config
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to base64 (JPEG 0.8 quality to save space)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log(`[PDF] Resized to ${width}x${height}, size: ${dataUrl.length}`);
        return dataUrl;

    } catch (e) {
        console.error(`[PDF] Conversion failed for ${url}:`, e);
        // Fallback to original fetch method if canvas fails (e.g. strict CORS)
        try {
            console.warn(`[PDF] Fallback to direct blob fetch for ${url}`);
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err2) {
             console.error(`[PDF] Fallback also failed:`, err2);
             throw err2;
        }
    }
}

// =====================================================
// DOCUMENT BUILDER
// =====================================================

async function buildDocumentDefinition(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintOptions
): Promise<TDocumentDefinitions> {
    // Build content based on included sections
    const content: Content[] = [];
    
    // Always add cover page first
    content.push(buildCoverPage(report, config, options));
    
    // Add page break after cover
    content.push({ text: '', pageBreak: 'after' });
    
    // Add content page header (repeated on each page via header function)
    // Then add each included section
    const includedSections = options.sections.filter(s => s.included);
    
    for (const section of includedSections) {
        const sectionContent = buildSection(section, report, config);
        if (sectionContent) {
            content.push(sectionContent);
        }
    }

    // Determine margins based on spacing option
    let pageMargins: [number, number, number, number] = PAGE_MARGINS;
    if (options.spacing === 'compact') {
        pageMargins = [30, 40, 30, 40];
    } else if (options.spacing === 'relaxed') {
        pageMargins = [50, 60, 50, 60];
    }
    
    return {
        pageSize: 'A4',
        pageMargins: pageMargins,
        
        // Dynamic header for content pages (skips cover)
        header: (currentPage: number) => {
            if (currentPage === 1) return null; // Skip on cover page
            return buildPageHeader(config, report);
        },
        
        // Page footer with page numbers
        footer: (currentPage: number, pageCount: number) => {
            if (currentPage === 1) return null; // Skip on cover page
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                style: 'footer',
                margin: [0, 20, 0, 0],
            };
        },
        
        content,
        styles: pdfStyles,
        defaultStyle: {
            font: 'Roboto', // pdfmake default font
            fontSize: 9,
        },
    };
}

// =====================================================
// COVER PAGE - Option 2: Teal Header + Photo Strip Design
// =====================================================

// =====================================================
// COVER PAGE - Option 2 (Polished): Teal Header + Photo Strip
// =====================================================

function buildCoverPage(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintOptions
): Content {
    // 1. Resolve Hero Photo
    const heroIndex = options.heroPhotoIndex ?? 0;
    const heroPhotoCandidate = report.photos[heroIndex];
    // Use the candidate directly as pre-processing handles format
    const heroPhoto = (heroPhotoCandidate?.url) 
        ? heroPhotoCandidate 
        : report.photos.find(p => p.url); // Fallback to first valid

    // 2. Resolve Strip Photos
    const stripIndexes = options.stripPhotoIndexes ?? [1, 2, 3];
    const stripPhotos = stripIndexes
        .map(idx => report.photos[idx])
        .filter(p => p?.url)
        .slice(0, 3); // Max 3

    return {
        stack: [
            // ========================================
            // HEADER SECTION (Hero + Logo)
            // ========================================
            {
                stack: [
                    // A) Hero Image or Solid Background
                    heroPhoto ? {
                        image: heroPhoto.url,
                        width: 595, // Full A4 width
                        height: 280, // Reduced further to 280
                        absolutePosition: { x: 0, y: 0 },
                    } : {
                        canvas: [{
                            type: 'rect' as const,
                            x: 0, 
                            y: 0,
                            w: 595,
                            h: 280,
                            color: BRAND_COLORS.primaryDark,
                        }],
                        absolutePosition: { x: 0, y: 0 },
                    },

                    // B) Teal Gradient Overlay
                    {
                        canvas: [{
                            type: 'rect' as const,
                            x: 0,
                            y: 0,
                            w: 595,
                            h: 280,
                            color: BRAND_COLORS.primary,
                            fillOpacity: 0.85,
                        }],
                        absolutePosition: { x: 0, y: 0 },
                    },

                    // C) Logo Overlay (Top Left)
                    {
                        stack: [
                            buildLogoContent(config, { ...options, logoAlign: 'left' })
                        ],
                        margin: [40, 30, 0, 0], // Reduced top padding
                        absolutePosition: { x: 0, y: 0 }, 
                    }
                ],
                // Reserve space for the header content
                margin: [0, 0, 0, 240], // Reduced from 260
            },

            // ========================================
            // MAIN CONTENT SECTION
            // ========================================
            {
                stack: [
                    // Project Name
                    {
                        text: config.identity.projectName,
                        fontSize: 26, // Reduced from 28
                        bold: true,
                        color: BRAND_COLORS.dark,
                        margin: [0, 15, 0, 5],
                    },
                    
                    // Subtitle / Location
                    {
                        text: config.identity.subtitle || config.identity.location,
                        fontSize: 14,
                        color: BRAND_COLORS.primary,
                        margin: [0, 0, 0, 15],
                    },
                    
                    // Golden Divider
                    {
                        canvas: [{
                            type: 'line',
                            x1: 0, y1: 0,
                            x2: 150, y2: 0,
                            lineWidth: 4,
                            lineColor: BRAND_COLORS.golden,
                        }],
                        margin: [0, 0, 0, 20],
                    },
                    
                    // Report Title & Date
                    {
                        text: 'WEEKLY PROGRESS REPORT',
                        fontSize: 13,
                        bold: true,
                        characterSpacing: 1,
                        color: BRAND_COLORS.dark,
                        margin: [0, 0, 0, 4],
                    },
                    {
                        text: `Week Ending: ${formatDate(report.weekEnding)}`,
                        fontSize: 12,
                        bold: true,
                        color: BRAND_COLORS.primary,
                        margin: [0, 0, 0, 20], 
                    },
                    
                    // Photo Strip
                    (stripPhotos.length > 0) ? {
                        columns: stripPhotos.map(photo => ({
                            image: photo.url,
                            width: (515 - (stripPhotos.length - 1) * 12) / stripPhotos.length,
                            height: 90, // Reduced from 100
                            cover: { width: (515 - (stripPhotos.length - 1) * 12) / stripPhotos.length, height: 90 }
                        })),
                        columnGap: 12, 
                        margin: [0, 0, 0, 24], // Reduced from 32
                    } : { text: '', margin: [0, 0, 0, 24] },
                    
                    // Client / Project Details Table
                    {
                        table: {
                            widths: [60, '*'],
                            body: [
                                [
                                    { text: 'Client:', style: ['small', 'bold', 'muted'] },
                                    { text: config.personnel.client.company || 'Client Name', style: 'bold', color: BRAND_COLORS.dark },
                                ],
                                [
                                    { text: 'Address:', style: ['small', 'bold', 'muted'] },
                                    { text: config.identity.location || config.personnel.client.address || '', color: BRAND_COLORS.text },
                                ],
                                [
                                    { text: 'Job #:', style: ['small', 'bold', 'muted'] },
                                    { text: config.identity.jobNumber || '', color: BRAND_COLORS.text },
                                ],
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 0],
                    }
                ],
                margin: [40, 0, 40, 0] // Content margins
            },

            // ========================================
            // FOOTER BAR
            // ========================================
            {
                stack: [
                    {
                        canvas: [{ type: 'rect' as const, x: 0, y: 0, w: 595, h: 40, color: BRAND_COLORS.primary }]
                    },
                    {
                        text: 'Safety is a core value',
                        style: { italics: true, color: 'white', fontSize: 11 },
                        alignment: 'center',
                        margin: [0, -28, 0, 0] // Pull up into rect
                    }
                ],
                absolutePosition: { x: 0, y: 802 }
            }
        ]
    };
}



function buildLogoContent(config: ProjectConfig, options: PrintOptions): Content {
    // For now, return placeholder if no logo or if we can't embed
    // Note: Logo embedding requires the image to be base64 encoded
    if (config.identity.logoUrl && config.identity.logoUrl.startsWith('data:')) {
        const scale = (options.logoScale || 100) / 100;
        const width = 150 * scale;
        
        return {
            image: config.identity.logoUrl,
            width,
            alignment: options.logoAlign || 'center',
            margin: [0, 0, 0, 20],
        };
    }
    
    // If logo is a URL path (not base64), we'd need to fetch and convert it
    // For now, show placeholder text
    return {
        text: config.identity.projectName.charAt(0),
        fontSize: 40,
        bold: true,
        color: BRAND_COLORS.primary,
        alignment: 'center',
        margin: [0, 20, 0, 20],
    };
}

function buildPersonnelBox(config: ProjectConfig): Content {
    return {
        table: {
            widths: ['50%', '50%'],
            body: [
                // Client & Engineer Row
                [
                    {
                        stack: [
                            { text: 'CLIENT', style: 'subHeader' },
                            { text: config.personnel.client.company || 'Client', style: 'bold', fontSize: 10 },
                            { text: config.personnel.client.address || '', style: 'small', margin: [0, 2, 0, 4] },
                            ...config.personnel.client.representatives.slice(0, 2).map(rep => ({
                                stack: [
                                    { text: rep.name, style: 'bold', fontSize: 8 },
                                    { text: rep.role, style: 'small' },
                                ],
                                margin: [0, 2, 0, 2] as [number, number, number, number],
                            })),
                        ],
                        margin: [8, 8, 8, 8] as [number, number, number, number],
                    },
                    {
                        stack: [
                            { text: 'ENGINEER / CM', style: 'subHeader' },
                            { text: config.personnel.engineer.company || 'Engineer', style: 'bold', fontSize: 10 },
                            { text: config.personnel.engineer.address || '', style: 'small', margin: [0, 2, 0, 4] },
                            ...config.personnel.engineer.representatives.slice(0, 2).map(rep => ({
                                stack: [
                                    { text: rep.name, style: 'bold', fontSize: 8 },
                                    { text: rep.role, style: 'small' },
                                ],
                                margin: [0, 2, 0, 2] as [number, number, number, number],
                            })),
                        ],
                        margin: [8, 8, 8, 8] as [number, number, number, number],
                    },
                ],
                // Contractor Row (full width)
                [
                    {
                        colSpan: 2,
                        stack: [
                            { text: 'CONTRACTOR (RECON)', style: 'subHeader' },
                            {
                                columns: config.personnel.recon.slice(0, 3).map(person => ({
                                    stack: [
                                        { text: person.name, style: 'bold', fontSize: 8 },
                                        { text: person.role, style: 'primary', fontSize: 7, bold: true },
                                        { text: person.email || person.phone || '', style: 'tiny' },
                                    ],
                                    width: 'auto',
                                })),
                                columnGap: 20,
                            },
                        ],
                        margin: [8, 8, 8, 8] as [number, number, number, number],
                    },
                    {},
                ],
            ],
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => BRAND_COLORS.border,
            vLineColor: () => BRAND_COLORS.border,
        },
    };
}

// =====================================================
// PAGE HEADER (for content pages)
// =====================================================

function buildPageHeader(config: ProjectConfig, report: WeeklyReport): Content {
    return {
        columns: [
            {
                stack: [
                    { text: config.identity.projectName, style: 'pageHeader' },
                    { text: `${config.identity.location} • Job #${config.identity.jobNumber}`, style: 'small' },
                ],
                width: '*',
            },
            {
                stack: [
                    { text: 'WEEKLY REPORT', style: 'primary', bold: true, alignment: 'right' },
                    { text: formatDate(report.weekEnding), style: 'bold', alignment: 'right' },
                ],
                width: 'auto',
            },
        ],
        margin: [40, 20, 40, 10],
    };
}

// =====================================================
// SECTION BUILDERS
// =====================================================

function buildSection(
    section: PrintSectionConfig,
    report: WeeklyReport,
    config: ProjectConfig
): Content | null {
    switch (section.id) {
        case 'overview':
            return buildOverviewSection(report);
        case 'weather':
            return buildWeatherSection(report);
        case 'manpower':
            return buildManpowerSection(report);
        case 'equipment':
            return buildEquipmentSection(report);
        case 'materials':
            return buildMaterialsSection(report);
        case 'lookahead':
            return buildLookAheadSection(report);
        case 'financials':
            return buildFinancialsSection(report);
        case 'safety':
            return buildSafetySection(report);
        case 'photos':
            return buildPhotosSection(report);
        case 'issues':
            return buildIssuesSection(report);
        case 'schedule':
            return buildScheduleSection(report);
        case 'procurement':
            return buildProcurementSection(report);
        case 'documents':
            return buildDocumentsSection(report);
        case 'progress':
            return null; // Progress is part of overview KPIs
        default:
            return null;
    }
}

// --- OVERVIEW SECTION ---

function buildOverviewSection(report: WeeklyReport): Content {
    // Calculate man hours from manpower entries
    const totalManHours = report.resources.manpower.reduce((sum, m) => {
        const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
        return sum + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
    }, 0);

    return {
        stack: [
            // Section Header
            { text: 'EXECUTIVE SUMMARY', style: 'sectionHeader' },
            
            // Summary text box
            {
                text: report.overview.executiveSummary || 'No summary provided.',
                style: 'body',
                margin: [0, 0, 0, 12],
            },
            
            // KPI Grid
            {
                columns: [
                    buildKpiBox('% Complete', `${report.overview.kpis.percentComplete}%`),
                    buildKpiBox('Man Hours (Wk)', String(totalManHours)),
                    buildKpiBox('Weather Lost', String(report.overview.kpis.weatherDaysLost), report.overview.kpis.weatherDaysLost > 0),
                    buildKpiBox('Safety Incidents', String(report.safety.stats.recordables.week), report.safety.stats.recordables.week > 0),
                ],
                columnGap: 10,
                margin: [0, 0, 0, 12],
            },
            
            // Schedule Analysis (if weather days lost)
            ...(report.schedule.analysis ? [{
                stack: [
                    { text: 'Schedule Analysis', style: 'sectionHeader' },
                    {
                        text: `"${report.schedule.analysis}"`,
                        italics: true,
                        style: 'body',
                        color: BRAND_COLORS.textMuted,
                    },
                ],
                margin: [0, 0, 0, 12] as [number, number, number, number],
            }] : []),
        ],
    };
}

function buildKpiBox(label: string, value: string, highlight = false): Content {
    return {
        stack: [
            { text: value, style: 'statValue', color: highlight ? BRAND_COLORS.accent : BRAND_COLORS.dark },
            { text: label, style: 'statLabel' },
        ],
        fillColor: highlight ? '#fef3c7' : BRAND_COLORS.bgLight, // amber-100 or zinc-50
        margin: [8, 8, 8, 8],
    };
}

// --- WEATHER SECTION ---

function buildWeatherSection(report: WeeklyReport): Content | null {
    const weather = report.overview.weather;
    if (!weather || weather.length === 0) return null;

    const body: TableRow[] = [
        // Header row
        [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Condition', style: 'tableHeader' },
            { text: 'High/Low', style: 'tableHeader', alignment: 'right' },
            { text: 'Wind', style: 'tableHeader', alignment: 'right' },
            { text: 'Lost', style: 'tableHeader', alignment: 'right' },
            { text: 'Notes', style: 'tableHeader' },
        ],
        // Data rows
        ...weather.map(w => [
            { text: formatDate(w.date), style: 'tableCell' },
            { text: w.condition, style: 'tableCell' },
            { text: `${w.tempHigh}°/${w.tempLow}°`, style: 'tableCellRight' },
            { text: `${w.wind} mph`, style: 'tableCellRight' },
            { text: w.hoursLost > 0 ? `${w.hoursLost} hrs` : '-', style: 'tableCellBold', alignment: 'right', fillColor: w.hoursLost > 0 ? '#fef2f2' : undefined },
            { text: w.notes || '', style: 'tableCell', color: BRAND_COLORS.textMuted, italics: true },
        ]),
    ];

    return {
        stack: [
            { text: 'WEATHER LOG', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: [70, '*', 50, 50, 45, '*'],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- MANPOWER SECTION ---

function buildManpowerSection(report: WeeklyReport): Content {
    const manpower = report.resources.manpower;
    
    const body: TableRow[] = [
        // Header row
        [
            { text: 'Name/Company', style: 'tableHeader' },
            { text: 'Role', style: 'tableHeader' },
            { text: 'Total Hrs', style: 'tableHeader', alignment: 'right' },
        ],
        // Data rows
        ...manpower.map(m => {
            const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
            const total = dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
            const displayName = m.type === 'subcontractor' ? (m.company || m.name || 'Subcontractor') : (m.name || 'RECON');
            
            return [
                { text: displayName, style: 'tableCell' },
                { text: m.role, style: 'tableCell' },
                { text: String(total), style: 'tableCellRight' },
            ];
        }),
        // Total row
        [
            { text: 'Total:', style: 'tableTotal', colSpan: 2, alignment: 'right' },
            {},
            { text: String(manpower.reduce((sum, m) => {
                const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
                return sum + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
            }, 0)), style: 'tableTotal', alignment: 'right' },
        ],
    ];

    return {
        stack: [
            { text: 'MANPOWER LOG', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', 60],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- EQUIPMENT SECTION ---

function buildEquipmentSection(report: WeeklyReport): Content {
    const equipment = report.resources.equipment.onSite;
    if (equipment.length === 0) return { text: '' };

    const body: TableRow[] = [
        [
            { text: 'Type', style: 'tableHeader' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
            { text: 'M', style: 'tableHeader', alignment: 'center' },
            { text: 'T', style: 'tableHeader', alignment: 'center' },
            { text: 'W', style: 'tableHeader', alignment: 'center' },
            { text: 'T', style: 'tableHeader', alignment: 'center' },
            { text: 'F', style: 'tableHeader', alignment: 'center' },
            { text: 'S', style: 'tableHeader', alignment: 'center' },
            { text: 'S', style: 'tableHeader', alignment: 'center' },
            { text: 'Tot', style: 'tableHeader', alignment: 'center' },
        ],
        ...equipment.map(e => {
            const dh = e.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
            const total = dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
            
            return [
                { text: e.type, style: 'tableCellBold' },
                { text: e.status, style: 'tableCell', alignment: 'center', color: e.status === 'Active' ? BRAND_COLORS.success : BRAND_COLORS.textMuted },
                { text: dh.mon || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.tue || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.wed || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.thu || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.fri || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.sat || '-', style: 'tableCell', alignment: 'center' },
                { text: dh.sun || '-', style: 'tableCell', alignment: 'center' },
                { text: String(total || '-'), style: 'tableCellBold', alignment: 'center' },
            ];
        }),
    ];

    return {
        stack: [
            { text: 'EQUIPMENT USAGE', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 50, 22, 22, 22, 22, 22, 22, 22, 30],
                    body,
                },
                layout: tableLayouts.lightGrid,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- MATERIALS SECTION ---

function buildMaterialsSection(report: WeeklyReport): Content | null {
    const materials = report.resources.materials;
    if (!materials || materials.length === 0) return null;

    const body: TableRow[] = [
        [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Description', style: 'tableHeader' },
            { text: 'Ticket #', style: 'tableHeader' },
            { text: 'Qty', style: 'tableHeader', alignment: 'right' },
            { text: 'Unit', style: 'tableHeader' },
            { text: 'Notes', style: 'tableHeader' },
        ],
        ...materials.sort((a, b) => b.date.localeCompare(a.date)).map(m => [
            { text: formatDate(m.date), style: 'tableCell' },
            { text: m.description, style: 'tableCellBold' },
            { text: m.ticketNumber || '-', style: 'tableCell' },
            { text: String(m.quantity), style: 'tableCellRight', bold: true },
            { text: m.uom, style: 'tableCell' },
            { text: m.notes || '', style: 'tableCell', italics: true, color: BRAND_COLORS.textMuted },
        ]),
    ];

    return {
        stack: [
            { text: 'MATERIAL DELIVERIES', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: [60, '*', 60, 40, 35, '*'],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- LOOK AHEAD SECTION ---

function buildLookAheadSection(report: WeeklyReport): Content {
    const items = report.progress.lookAheadItems?.filter(i => i.included) || [];
    
    if (items.length === 0 && (!report.progress.lookAheadThreeWeek || report.progress.lookAheadThreeWeek.length === 0)) {
        return {
            stack: [
                { text: '3-WEEK LOOK AHEAD', style: 'sectionHeader' },
                { text: 'No look ahead items.', style: 'body', italics: true, color: BRAND_COLORS.textMuted },
            ],
            margin: [0, 0, 0, 12],
        };
    }

    const body: TableRow[] = [
        [
            { text: 'Activity', style: 'tableHeader' },
            { text: 'Starts', style: 'tableHeader' },
            { text: 'Finishes', style: 'tableHeader' },
            { text: 'Type', style: 'tableHeader', alignment: 'center' },
            { text: 'Notes', style: 'tableHeader' },
        ],
        ...items.map(item => [
            { text: item.description, style: 'tableCellBold' },
            { text: item.forecastStart || item.baselineStart || '-', style: 'tableCell' },
            { text: item.forecastFinish || item.baselineFinish || '-', style: 'tableCell' },
            { text: item.type === 'schedule' ? 'Schedule' : 'Custom', style: 'tableCell', alignment: 'center' },
            { text: item.notes || '', style: 'tableCell', italics: true, color: BRAND_COLORS.textMuted },
        ]),
    ];

    return {
        stack: [
            { text: '3-WEEK LOOK AHEAD', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 65, 65, 50, '*'],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- FINANCIALS SECTION ---

function buildFinancialsSection(report: WeeklyReport): Content {
    const invoices = report.financials.invoices || [];

    const body: TableRow[] = [
        [
            { text: 'Invoice #', style: 'tableHeader' },
            { text: 'Period', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
            { text: 'Retainage', style: 'tableHeader', alignment: 'right' },
            { text: 'Net', style: 'tableHeader', alignment: 'right' },
            { text: 'Paid', style: 'tableHeader', alignment: 'center' },
        ],
        ...(invoices.length > 0 ? invoices.map(inv => [
            { text: inv.invoiceNumber, style: 'tableCellBold' },
            { text: inv.period, style: 'tableCell' },
            { text: `$${inv.amount.toLocaleString()}`, style: 'tableCellRight' },
            { text: `$${inv.retainage.toLocaleString()}`, style: 'tableCellRight' },
            { text: `$${(inv.amount - inv.retainage).toLocaleString()}`, style: 'tableCellBold', alignment: 'right' },
            { text: inv.datePaid || 'Pending', style: 'tableCell', alignment: 'center' },
        ]) : [
            [{ text: 'No invoices generated.', style: 'tableCell', colSpan: 6, alignment: 'center', italics: true }, {}, {}, {}, {}, {}],
        ]),
    ];

    return {
        stack: [
            {
                columns: [
                    { text: 'FINANCIAL SUMMARY', style: 'sectionHeader', width: '*' },
                    { text: `Earned: $${report.financials.summary.earnedToDate.toLocaleString()}`, style: 'bold', alignment: 'right', width: 'auto', fontSize: 10 },
                ],
            },
            {
                table: {
                    headerRows: 1,
                    widths: [70, '*', 70, 60, 70, 60],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- SAFETY SECTION ---

function buildSafetySection(report: WeeklyReport): Content {
    const stats = report.safety.stats;

    return {
        stack: [
            { text: 'SAFETY STATS & NARRATIVE', style: 'sectionHeader' },
            
            // Narrative
            {
                text: report.safety.narrative || 'No safety narrative provided.',
                style: 'body',
                margin: [0, 0, 0, 8],
            },
            
            // Stats table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 60, 60],
                    body: [
                        [
                            { text: 'Metric', style: 'tableHeader' },
                            { text: 'Week', style: 'tableHeader', alignment: 'center' },
                            { text: 'YTD', style: 'tableHeader', alignment: 'center' },
                        ],
                        [
                            { text: 'Near Misses', style: 'tableCell' },
                            { text: String(stats.nearMisses.week), style: 'tableCell', alignment: 'center' },
                            { text: String(stats.nearMisses.ytd), style: 'tableCell', alignment: 'center' },
                        ],
                        [
                            { text: 'First Aids', style: 'tableCell' },
                            { text: String(stats.firstAids.week), style: 'tableCell', alignment: 'center' },
                            { text: String(stats.firstAids.ytd), style: 'tableCell', alignment: 'center' },
                        ],
                        [
                            { text: 'Recordables', style: 'tableCell' },
                            { text: String(stats.recordables.week), style: 'tableCell', alignment: 'center', color: stats.recordables.week > 0 ? BRAND_COLORS.danger : undefined },
                            { text: String(stats.recordables.ytd), style: 'tableCell', alignment: 'center' },
                        ],
                    ],
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- PHOTOS SECTION ---

function buildPhotosSection(report: WeeklyReport): Content {
    const photos = report.photos;
    
    if (photos.length === 0) {
        return {
            stack: [
                { text: 'PHOTOGRAPHIC DOCUMENTATION', style: 'sectionHeader' },
                { text: 'No photos attached.', style: 'body', italics: true, color: BRAND_COLORS.textMuted },
            ],
            margin: [0, 0, 0, 12],
        };
    }

    // Build 2-column grid of photos
    const photoRows: Content[] = [];
    for (let i = 0; i < photos.length; i += 2) {
        const row: Content[] = [];
        
        // First photo
        row.push(buildPhotoCell(photos[i]));
        
        // Second photo (if exists)
        if (photos[i + 1]) {
            row.push(buildPhotoCell(photos[i + 1]));
        } else {
            row.push({ text: '' }); // Empty cell
        }
        
        photoRows.push({
            columns: row,
            columnGap: 10,
            margin: [0, 0, 0, 10],
        });
    }

    return {
        stack: [
            { text: 'PHOTOGRAPHIC DOCUMENTATION', style: 'sectionHeader' },
            ...photoRows,
        ],
        margin: [0, 0, 0, 12],
    };
}

function buildPhotoCell(photo: { url: string; caption: string; directionLooking: string }): Content {
    // Use the URL directly (pre-processing handles conversion to base64)
    if (photo.url) {
        return {
            stack: [
                {
                    image: photo.url,
                    width: 230,
                    height: 150,
                    margin: [0, 0, 0, 4],
                },
                { text: photo.caption, style: 'bold', fontSize: 8 },
                { text: `Looking: ${photo.directionLooking}`, style: 'tiny' },
            ],
        };
    }
    
    // Placeholder for non-base64 URLs
    return {
        stack: [
            {
                text: '[Image]',
                alignment: 'center',
                fontSize: 20,
                color: BRAND_COLORS.textLight,
                margin: [0, 60, 0, 60],
            },
            { text: photo.caption, style: 'bold', fontSize: 8 },
            { text: `Looking: ${photo.directionLooking}`, style: 'tiny' },
        ],
    };
}

// --- ISSUES SECTION ---

function buildIssuesSection(report: WeeklyReport): Content | null {
    const issues = report.issues;
    if (!issues || issues.length === 0) return null;

    const body: TableRow[] = [
        [
            { text: 'Description', style: 'tableHeader' },
            { text: 'Assigned To', style: 'tableHeader' },
            { text: 'Due Date', style: 'tableHeader' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
        ],
        ...issues.map(issue => [
            { text: issue.description, style: 'tableCellBold' },
            { text: issue.assignedTo, style: 'tableCell' },
            { text: issue.dueDate, style: 'tableCell' },
            { text: issue.status, style: 'tableCell', alignment: 'center', bold: true },
        ]),
    ];

    return {
        stack: [
            { text: 'ISSUES, RISKS & LAYOUT ITEMS', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 80, 70, 60],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- SCHEDULE SECTION ---

function buildScheduleSection(report: WeeklyReport): Content | null {
    const milestones = report.schedule.milestones;
    if (!milestones || milestones.length === 0) return null;

    const body: TableRow[] = [
        [
            { text: 'Milestone', style: 'tableHeader' },
            { text: 'Start', style: 'tableHeader' },
            { text: 'Finish', style: 'tableHeader' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
        ],
        ...milestones.map(ms => [
            { text: ms.milestone, style: 'tableCellBold' },
            { text: ms.startDate, style: 'tableCell' },
            { text: ms.finishDate, style: 'tableCell' },
            { 
                text: ms.status, 
                style: ms.status === 'Complete' ? 'badgeSuccess' : ms.status === 'In Progress' ? 'badgeNeutral' : 'badgeNeutral',
                alignment: 'center',
            },
        ]),
    ];

    return {
        stack: [
            { text: 'KEY SCHEDULE MILESTONES', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 70, 70, 70],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- PROCUREMENT SECTION ---

function buildProcurementSection(report: WeeklyReport): Content | null {
    const procurement = report.resources.procurement;
    if (!procurement || procurement.length === 0) return null;

    const body: TableRow[] = [
        [
            { text: 'Item', style: 'tableHeader' },
            { text: 'Vendor', style: 'tableHeader' },
            { text: 'Status', style: 'tableHeader', alignment: 'center' },
            { text: 'ETA', style: 'tableHeader' },
            { text: 'Delivered', style: 'tableHeader' },
            { text: 'Notes', style: 'tableHeader' },
        ],
        ...procurement.map(item => {
            const statusStyle = item.status === 'Delivered' ? 'badgeSuccess' 
                : item.status === 'Delayed' ? 'badgeDanger' 
                : item.status === 'Shipped' ? 'badgeNeutral' 
                : 'badgeNeutral';
            
            return [
                { text: item.item, style: 'tableCellBold' },
                { text: item.vendor || '', style: 'tableCell' },
                { text: item.status, style: statusStyle, alignment: 'center' },
                { text: item.eta || '-', style: 'tableCell' },
                { text: item.deliveryDate || '-', style: 'tableCell' },
                { text: item.notes || '', style: 'tableCell', italics: true, color: BRAND_COLORS.textMuted },
            ];
        }),
    ];

    return {
        stack: [
            { text: 'PROCUREMENT LOG (LONG LEAD ITEMS)', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 80, 60, 60, 60, '*'],
                    body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// --- DOCUMENTS SECTION ---

function buildDocumentsSection(report: WeeklyReport): Content {
    const rfis = report.rfis || [];
    const submittals = report.submittals || [];

    return {
        stack: [
            { text: 'PROJECT DOCUMENTS', style: 'sectionHeader' },
            {
                columns: [
                    // RFIs
                    {
                        stack: [
                            { text: 'RFIs', style: 'subHeader' },
                            rfis.length > 0 ? {
                                table: {
                                    headerRows: 1,
                                    widths: [40, '*', 50],
                                    body: [
                                        [
                                            { text: '#', style: 'tableHeader' },
                                            { text: 'Subject', style: 'tableHeader' },
                                            { text: 'Status', style: 'tableHeader', alignment: 'center' },
                                        ],
                                        ...rfis.map(r => [
                                            { text: r.rfiNumber, style: 'tableCell' },
                                            { text: r.subject, style: 'tableCell' },
                                            { text: String(r.status), style: 'tableCell', alignment: 'center' as const },
                                        ]),
                                    ],
                                },
                                layout: tableLayouts.standardTable,
                            } : { text: 'No RFIs logged.', style: 'small', italics: true },
                        ],
                        width: '48%',
                    },
                    // Submittals
                    {
                        stack: [
                            { text: 'Submittals', style: 'subHeader' },
                            submittals.length > 0 ? {
                                table: {
                                    headerRows: 1,
                                    widths: [40, '*', 50],
                                    body: [
                                        [
                                            { text: '#', style: 'tableHeader' },
                                            { text: 'Description', style: 'tableHeader' },
                                            { text: 'Status', style: 'tableHeader', alignment: 'center' },
                                        ],
                                        ...submittals.map(s => [
                                            { text: s.submittalNumber, style: 'tableCell' },
                                            { text: s.description, style: 'tableCell' },
                                            { text: String(s.status), style: 'tableCell', alignment: 'center' as const },
                                        ]),
                                    ],
                                },
                                layout: tableLayouts.standardTable,
                            } : { text: 'No Submittals logged.', style: 'small', italics: true },
                        ],
                        width: '48%',
                    },
                ],
                columnGap: 15,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format a date string for display
 * Converts YYYY-MM-DD to a more readable format
 */
function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch {
        return dateStr;
    }
}
