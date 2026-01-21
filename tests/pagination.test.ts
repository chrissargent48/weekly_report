import { calculatePageMap } from '../calculatePageMap';
import { PrintConfig, ReportData, PrintSection } from '../../config/printConfig.types';
import { PAGE } from '../pageConstants';

// Mock Data
const mockStats = { nearMisses: {}, firstAids: {}, recordables: {}, lostTime: {}, stopWorks: {}, hofs: {}, safetyAudits: {} };

const mockReportData: ReportData = {
    id: 'test-report',
    projectId: 'test-project',
    weekEnding: '2024-01-21',
    status: 'draft',
    overview: {},
    resources: {
        manpower: Array.from({ length: 50 }).map((_, i) => ({
            company: 'Test Co ' + i,
            name: 'Person ' + i,
            role: 'Worker',
            hours: 40,
            days: 5
        }))
    },
    safety: { stats: mockStats }, // Minimal required
    issues: [],
    photos: []
};

const mockConfig: PrintConfig = {
    scale: 1,
    spacing: { type: 'standard', sectionGap: 20 },
    sections: [
        { id: 'manpower', title: 'Manpower', included: true, order: 1 }
    ]
};

describe('calculatePageMap', () => {
    it('should split long manpower section across multiple pages', () => {
        // Run calculation
        const pageMap = calculatePageMap(mockConfig, mockReportData);
        
        // Assertions
        const pages = pageMap.pages;
        console.log(`Generated ${pages.length} pages`);
        
        expect(pages.length).toBeGreaterThan(1);
        
        // Find manpower sections
        const p1Sections = pages[0].sections.filter(s => s.sectionId.startsWith('manpower'));
        const p2Sections = pages[1].sections.filter(s => s.sectionId.startsWith('manpower'));
        
        expect(p1Sections.length).toBe(1);
        expect(p2Sections.length).toBe(1);
        
        const p1 = p1Sections[0];
        const p2 = p2Sections[0];
        
        console.log('Page 1 Range:', p1.dataRange);
        console.log('Page 2 Range:', p2.dataRange);
        
        expect(p1.dataRange).toBeDefined();
        expect(p2.dataRange).toBeDefined();
        
        expect(p1.dataRange?.start).toBe(0);
        expect(p1.dataRange?.end).toBe(p2.dataRange?.start);
        
        expect(p1.continuesFromPrevious).toBeFalsy();
        expect(p2.continuesFromPrevious).toBeTruthy();
    });
});
