import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { WeeklyReport, ProjectConfig } from '../../../../types';
import { PrintConfig, PageMap } from '../../config/printConfig.types';
import { pdfStyles } from './pdfStyles';
import {
    buildCoverHeader,
    buildPageHeader,
    buildOverviewSection,
    buildWeatherSection,
    buildProgressSection,
    buildLookAheadSection,
    buildManpowerSection,
    buildEquipmentSection,
    buildMaterialsSection,
    buildProcurementSection,
    buildSafetySection,
    buildFinancialsSection,
    buildScheduleSection,
    buildIssuesSection,
    buildDocumentsSection,
    buildPhotosSection
} from './pdfHelpers';

// =====================================================
// DOCUMENT BUILDER
// =====================================================

export async function buildDocumentDefinition(
    report: WeeklyReport,
    config: ProjectConfig,
    options: PrintConfig,
    pageMap: PageMap
): Promise<TDocumentDefinitions> {
    
    const content: Content[] = [];

    // Iterate through pages in the PageMap to build content stack
    for (let i = 0; i < pageMap.pages.length; i++) {
        const page = pageMap.pages[i];

        // Add page break if not first page
        if (i > 0) {
            content.push({ text: '', pageBreak: 'before' });
        }

        // 1. HEADER / COVER
        if (page.isFirstPage) {
            content.push(buildCoverHeader(report, config, options));
        } else {
            content.push(buildPageHeader(config, report));
        }

        // 2. SECTIONS
        for (const placement of page.sections) {
            const baseId = placement.sectionId.split('_continued_')[0];
            let sectionContent: Content | null = null;
            
            if (baseId === 'photos') {
                sectionContent = buildPhotosSection(report, options, placement); 
            } else {
               sectionContent = await buildSectionContent(baseId, report, options);
            }

            if (sectionContent) {
                // Add vertical spacing
                content.push({ text: '', margin: [0, options.spacing.sectionGap / 2, 0, 0] }); 
                content.push(sectionContent);
            }
        }
    }

    // Determine margins based on density preset
    const sideMargin = options.spacing.type === 'compact' ? 30 : options.spacing.type === 'relaxed' ? 50 : 40;

    return {
        pageSize: 'A4',
        pageMargins: [sideMargin, 30, sideMargin, 60], 
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10,
            color: '#111827'
        },
        footer: (currentPage, pageCount) => {
            return {
                margin: [sideMargin, 10, sideMargin, 0],
                columns: [
                   { 
                       text: `${config.identity.projectName}`, 
                       style: 'footerText', 
                       alignment: 'left',
                       width: '*'
                   },
                   { 
                       text: `Page ${currentPage} of ${pageCount}`, 
                       style: 'footerText', 
                       alignment: 'right',
                       width: 'auto'
                   }
                ]
            };
        }
    };
}

// Route section ID to builder
async function buildSectionContent(sectionId: string, report: WeeklyReport, options: PrintConfig): Promise<Content | null> {
    switch(sectionId) {
        case 'overview': return buildOverviewSection(report);
        case 'weather': return buildWeatherSection(report);
        case 'progress': return buildProgressSection(report);
        case 'lookahead': return buildLookAheadSection(report);
        case 'manpower': return buildManpowerSection(report);
        case 'equipment': return buildEquipmentSection(report);
        case 'materials': return buildMaterialsSection(report);
        case 'procurement': return buildProcurementSection(report);
        case 'safety': return buildSafetySection(report);
        case 'financials': return buildFinancialsSection(report);
        case 'schedule': return buildScheduleSection(report);
        case 'issues': return buildIssuesSection(report);
        case 'documents': return buildDocumentsSection(report);
        default: return null;
    }
}
