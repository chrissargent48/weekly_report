import { Content, ContentTable, ContentColumns } from 'pdfmake/interfaces';
import { ProjectConfig } from '../../../../types';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';
import { BRAND_COLORS, tableLayouts } from './pdfStyles';
import { buildLogoContent } from './pdfAssets';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TableRow = any[];

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// =====================================================
// COVER HEADER
// =====================================================

export function buildCoverHeader(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintConfig
): Content {
    // 1. Resolve Hero Photo
    const heroIndex = options.heroPhotoIndex ?? 0;
    const heroPhotoCandidate = report.photos[heroIndex];
    const heroPhoto = (heroPhotoCandidate?.url) 
        ? heroPhotoCandidate 
        : report.photos.find(p => p.url);

    // 2. Resolve Strip Photos
    const stripIndexes = options.stripPhotoIndexes ?? [1, 2, 3];
    const stripPhotos = stripIndexes
        .map(idx => report.photos[idx])
        .filter(p => p?.url)
        .slice(0, 3);

    return {
        stack: [
            // HEADER SECTION (Hero + Logo)
            {
                stack: [
                    heroPhoto ? {
                        image: heroPhoto.url,
                        width: 595,
                        height: 315,
                        absolutePosition: { x: 0, y: 0 },
                    } : {
                        canvas: [{
                            type: 'rect' as const,
                            x: 0, y: 0, w: 595, h: 315,
                            color: BRAND_COLORS.primaryDark,
                        }],
                        absolutePosition: { x: 0, y: 0 },
                    },
                    {
                        canvas: [{
                            type: 'rect' as const,
                            x: 0, y: 0, w: 595, h: 315,
                            color: BRAND_COLORS.primary,
                            fillOpacity: 0.85,
                        }],
                        absolutePosition: { x: 0, y: 0 },
                    },
                    {
                        stack: [
                            buildLogoContent(config, { ...options, logoAlign: 'left' })
                        ],
                        margin: [40, 30, 0, 0], 
                        absolutePosition: { x: 0, y: 0 }, 
                    }
                ],
                margin: [0, 0, 0, 280],
            },

            // MAIN CONTENT SECTION
            {
                stack: [
                    {
                        text: config.identity.projectName,
                        fontSize: 26,
                        bold: true,
                        color: BRAND_COLORS.dark,
                        margin: [0, 15, 0, 5],
                    },
                    {
                        text: config.identity.subtitle || config.identity.location,
                        fontSize: 14,
                        color: BRAND_COLORS.primary,
                        margin: [0, 0, 0, 15],
                    },
                    {
                        canvas: [{
                            type: 'line',
                            x1: 0, y1: 0, x2: 150, y2: 0,
                            lineWidth: 4, lineColor: BRAND_COLORS.golden,
                        }],
                        margin: [0, 0, 0, 20],
                    },
                    {
                        text: 'WEEKLY PROGRESS REPORT',
                        fontSize: 13, bold: true, characterSpacing: 1,
                        color: BRAND_COLORS.dark, margin: [0, 0, 0, 4],
                    },
                    {
                        text: `Week Ending: ${formatDate(report.weekEnding)}`,
                        fontSize: 12, bold: true, color: BRAND_COLORS.primary,
                        margin: [0, 0, 0, 20], 
                    },
                    (stripPhotos.length > 0) ? {
                        columns: stripPhotos.map(photo => ({
                            image: photo.url,
                            width: (515 - (stripPhotos.length - 1) * 12) / stripPhotos.length,
                            height: 180,
                            cover: { width: (515 - (stripPhotos.length - 1) * 12) / stripPhotos.length, height: 180 }
                        })),
                        columnGap: 12, 
                        margin: [0, 0, 0, 24], 
                    } : { text: '', margin: [0, 0, 0, 24] },
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
                margin: [40, 0, 40, 0] 
            },

            // SAFETY BANNER - Using table for full-width background (no absolute positioning)
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: 'Safety is a core value',
                            italics: true,
                            color: 'white',
                            fontSize: 11,
                            alignment: 'center',
                            fillColor: BRAND_COLORS.primary,
                            margin: [0, 12, 0, 12]
                        }
                    ]]
                },
                layout: 'noBorders',
                margin: [-40, 20, -40, 0], // Negative margins to extend to page edges
                pageBreak: 'after' // Ensure page 2 starts fresh
            }
        ]
    };
}

// =====================================================
// PAGE HEADER
// =====================================================

export function buildPageHeader(config: ProjectConfig, report: WeeklyReport): Content {
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

export function buildOverviewSection(report: WeeklyReport): Content {
    const totalManHours = report.resources.manpower.reduce((sum, m) => {
        const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
        return sum + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
    }, 0);

    return {
        stack: [
            { text: 'EXECUTIVE SUMMARY', style: 'sectionHeader' },
            {
                text: report.overview.executiveSummary || 'No summary provided.',
                style: 'body',
                margin: [0, 0, 0, 12],
            },
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
            ...(report.schedule.analysis ? [{
                stack: [
                    { text: 'Schedule Analysis', style: 'sectionHeader' },
                    { text: `"${report.schedule.analysis}"`, italics: true, style: 'body', color: BRAND_COLORS.textMuted },
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
        fillColor: highlight ? '#fef3c7' : BRAND_COLORS.bgLight,
        margin: [8, 8, 8, 8],
    };
}

export function buildProgressSection(report: WeeklyReport): Content {
    const text = report.progress.activitiesThisWeek?.length > 0 
        ? report.progress.activitiesThisWeek.join('\n') 
        : 'No progress narrative provided.';
        
    return {
        stack: [
            { text: 'PROGRESS NARRATIVE', style: 'sectionHeader' },
            {
                text: text,
                style: 'body',
                margin: [0, 0, 0, 12],
            }
        ]
    };
}

export function buildWeatherSection(report: WeeklyReport): Content | null {
    const weather = report.overview.weather;
    if (!weather || weather.length === 0) return null;

    const body: TableRow[] = [
        [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Condition', style: 'tableHeader' },
            { text: 'High/Low', style: 'tableHeader', alignment: 'right' },
            { text: 'Wind', style: 'tableHeader', alignment: 'right' },
            { text: 'Lost', style: 'tableHeader', alignment: 'right' },
            { text: 'Notes', style: 'tableHeader' },
        ],
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
                    headerRows: 1, widths: [70, '*', 50, 50, 45, '*'], body,
                },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildManpowerSection(report: WeeklyReport): Content {
    const manpower = report.resources.manpower;
    const body: TableRow[] = [
        [
            { text: 'Name/Company', style: 'tableHeader' },
            { text: 'Role', style: 'tableHeader' },
            { text: 'Total Hrs', style: 'tableHeader', alignment: 'right' },
        ],
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
        [
            { text: 'Total:', style: 'tableTotal', colSpan: 2, alignment: 'right' }, {},
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
                table: { headerRows: 1, widths: ['*', '*', 60], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildEquipmentSection(report: WeeklyReport): Content {
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
                table: { headerRows: 1, widths: ['*', 50, 22, 22, 22, 22, 22, 22, 22, 30], body },
                layout: tableLayouts.lightGrid,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildMaterialsSection(report: WeeklyReport): Content | null {
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
                table: { headerRows: 1, widths: [60, '*', 60, 40, 35, '*'], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildLookAheadSection(report: WeeklyReport): Content {
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
                table: { headerRows: 1, widths: ['*', 65, 65, 50, '*'], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildFinancialsSection(report: WeeklyReport): Content {
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
        unbreakable: true, // Keep financials section together on one page
        stack: [
            {
                columns: [
                    { text: 'FINANCIAL SUMMARY', style: 'sectionHeader', width: '*' },
                    { text: `Earned: $${report.financials.summary.earnedToDate.toLocaleString()}`, style: 'bold', alignment: 'right', width: 'auto', fontSize: 10 },
                ],
            },
            {
                table: { headerRows: 1, widths: [70, '*', 70, 60, 70, 60], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildSafetySection(report: WeeklyReport): Content {
    const stats = report.safety.stats;
    return {
        unbreakable: true, // Keep safety section together on one page
        stack: [
            { text: 'SAFETY STATS & NARRATIVE', style: 'sectionHeader' },
            {
                text: report.safety.narrative || 'No safety narrative provided.',
                style: 'body',
                margin: [0, 0, 0, 8],
            },
            {
                table: {
                    headerRows: 1, widths: ['*', 60, 60],
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

export function buildPhotosSection(report: WeeklyReport, options: PrintConfig, placement?: PagePlacement): Content {
    const photos = report.photos;
    const photosPerPage = 6; // 2 columns x 3 rows

    if (photos.length === 0) {
        return {
            stack: [
                { text: 'PHOTOGRAPHIC DOCUMENTATION', style: 'sectionHeader' },
                { text: 'No photos attached.', style: 'body', italics: true, color: BRAND_COLORS.textMuted },
            ],
            margin: [0, 0, 0, 12],
        };
    }

    // Calculate which photos to show based on placement
    let startIdx = 0;
    let isFirstPhotoPage = true;

    if (placement && placement.sectionId.includes('_continued_')) {
        // Extract continuation index from sectionId like 'photos_continued_1'
        const match = placement.sectionId.match(/_continued_(\d+)$/);
        if (match) {
            const continuationIndex = parseInt(match[1], 10);
            startIdx = continuationIndex * photosPerPage;
            isFirstPhotoPage = false;
        }
    }

    const endIdx = Math.min(startIdx + photosPerPage, photos.length);
    const photosForPage = photos.slice(startIdx, endIdx);

    // If no photos for this page, return empty
    if (photosForPage.length === 0) {
        return { text: '' };
    }

    // Build 2-column grid for this page's photos
    const photoRows: Content[] = [];
    for (let i = 0; i < photosForPage.length; i += 2) {
        const row: Content[] = [];
        row.push(buildPhotoCell(photosForPage[i]));
        if (photosForPage[i + 1]) {
            row.push(buildPhotoCell(photosForPage[i + 1]));
        } else {
            row.push({ text: '' });
        }
        photoRows.push({
            columns: row,
            columnGap: 10,
            margin: [0, 0, 0, 10],
            unbreakable: true // Keep rows together
        });
    }

    // Only show header on first photo page
    const content: Content[] = [];
    if (isFirstPhotoPage) {
        content.push({ text: 'PHOTOGRAPHIC DOCUMENTATION', style: 'sectionHeader' });
    }
    content.push(...photoRows);

    return {
        stack: content,
        margin: [0, 0, 0, 12],
    };
}

function buildPhotoCell(photo: { url: string; caption: string; directionLooking: string }): Content {
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
    return {
        stack: [
            { text: '[Image]', alignment: 'center', fontSize: 20, color: BRAND_COLORS.textLight, margin: [0, 60, 0, 60] },
            { text: photo.caption, style: 'bold', fontSize: 8 },
            { text: `Looking: ${photo.directionLooking}`, style: 'tiny' },
        ],
    };
}

export function buildIssuesSection(report: WeeklyReport): Content | null {
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
                table: { headerRows: 1, widths: ['*', 80, 70, 60], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildScheduleSection(report: WeeklyReport): Content | null {
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
            { text: ms.status, style: ms.status === 'Complete' ? 'badgeSuccess' : ms.status === 'In Progress' ? 'badgeNeutral' : 'badgeNeutral', alignment: 'center' },
        ]),
    ];

    return {
        stack: [
            { text: 'KEY SCHEDULE MILESTONES', style: 'sectionHeader' },
            {
                table: { headerRows: 1, widths: ['*', 70, 70, 70], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildProcurementSection(report: WeeklyReport): Content | null {
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
            const statusStyle = item.status === 'Delivered' ? 'badgeSuccess' : item.status === 'Delayed' ? 'badgeDanger' : item.status === 'Shipped' ? 'badgeNeutral' : 'badgeNeutral';
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
                table: { headerRows: 1, widths: ['*', 80, 60, 60, 60, '*'], body },
                layout: tableLayouts.standardTable,
            },
        ],
        margin: [0, 0, 0, 12],
    };
}

export function buildDocumentsSection(report: WeeklyReport): Content {
    const rfis = report.rfis || [];
    const submittals = report.submittals || [];

    return {
        stack: [
            { text: 'PROJECT DOCUMENTS', style: 'sectionHeader' },
            {
                columns: [
                    {
                        stack: [
                            { text: 'RFIs', style: 'subHeader' },
                            rfis.length > 0 ? {
                                table: {
                                    headerRows: 1, widths: [40, '*', 50],
                                    body: [
                                        [ { text: '#', style: 'tableHeader' }, { text: 'Subject', style: 'tableHeader' }, { text: 'Status', style: 'tableHeader', alignment: 'center' } ],
                                        ...rfis.map(r => [ { text: r.rfiNumber, style: 'tableCell' }, { text: r.subject, style: 'tableCell' }, { text: String(r.status), style: 'tableCell', alignment: 'center' as const } ]),
                                    ],
                                },
                                layout: tableLayouts.standardTable,
                            } : { text: 'No RFIs logged.', style: 'small', italics: true },
                        ],
                        width: '48%',
                    },
                    {
                        stack: [
                            { text: 'Submittals', style: 'subHeader' },
                            submittals.length > 0 ? {
                                table: {
                                    headerRows: 1, widths: [40, '*', 50],
                                    body: [
                                        [ { text: '#', style: 'tableHeader' }, { text: 'Description', style: 'tableHeader' }, { text: 'Status', style: 'tableHeader', alignment: 'center' } ],
                                        ...submittals.map(s => [ { text: s.submittalNumber, style: 'tableCell' }, { text: s.description, style: 'tableCell' }, { text: String(s.status), style: 'tableCell', alignment: 'center' as const } ]),
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

