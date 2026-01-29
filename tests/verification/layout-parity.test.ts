import { LayoutEngine } from '../../server/services/LayoutEngine';
import { WeeklyReport } from '../../server/types';

async function runTest() {
    console.log("--- Starting Layout Parity Verification ---");
    const engine = new LayoutEngine();

    const mockReport: Partial<WeeklyReport> = {
        id: 'test-report',
        weekEnding: '2026-01-25',
        overview: {
            executiveSummary: "This is a stress test for the new authoritative layout engine. It should correctly wrap this long sentence onto multiple lines if the width is constrained to A4 dimensions. We are testing for visual drift avoidance by ensuring the server-side calculation is the source of truth.",
            weather: [
                { date: '2026-01-19', condition: 'Sunny', tempHigh: 45, tempLow: 28, wind: 10, hoursLost: 0, notes: '' },
                { date: '2026-01-20', condition: 'Cloudy', tempHigh: 40, tempLow: 30, wind: 5, hoursLost: 0, notes: '' }
            ],
            kpis: {
                percentComplete: 45,
                schedulePerformanceIndex: 1.02,
                manHoursWeek: 1200,
                manHoursTotal: 15400,
                safetyIncidents: 0,
                weatherDaysLost: 0
            }
        },
        safety: {
            stats: {
                nearMisses: { week: 0, ytd: 1 },
                firstAids: { week: 0, ytd: 2 },
                recordables: { week: 0, ytd: 0 },
                lostTime: { week: 0, ytd: 0 },
                stopWorks: { week: 0, ytd: 0 },
                hofs: { week: 0, ytd: 0 },
                safetyAudits: { week: 0, ytd: 0 }
            },
            narrative: "All work proceeded safely this week. We conducted a toolbox talk on Tuesday regarding winter preparation and slips/trips/falls prevention.",
        },
        resources: {
            manpower: [],
            equipment: { onSite: [], mobilized: [], demobilized: [] },
            materials: [],
            procurement: []
        },
        progress: {
            bidItems: [],
            activitiesThisWeek: [],
            lookAheadItems: []
        },
        financials: {
            invoices: [],
            summary: { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 }
        },
        schedule: {
            milestones: [],
            analysis: ""
        },
        photos: []
    };

    console.log("Calculating layout...");
    const layout = engine.calculateLayout(mockReport as WeeklyReport);

    console.log("Layout Result Summary:");
    layout.pages.forEach((page: any, idx: number) => {
        console.log(`Page ${idx + 1}: ${page.items.length} items`);
        // Check for specific items
        const summaryItem = page.items.find((item: any) => item.height > 20 && item.y > 50);
        if (summaryItem) {
          console.log(` - Executive Summary Node height: ${summaryItem.height.toFixed(2)} pts`);
        }
    });

    if (layout.pages.length > 0 && layout.pages[0].items.length > 0) {
        console.log("SUCCESS: Layout Engine calculated successfully.");
    } else {
        console.error("FAILURE: Layout Engine returned empty pages.");
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
