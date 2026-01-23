// using native fetch


// Mock Report Data
const mockReport = {
    id: "test-report-1",
    weekEnding: "2026-01-23",
    periodStart: "2026-01-19",
    overview: {
        executiveSummary: "This is a test executive summary. It should be measured by the layout engine. The quick brown fox jumps over the lazy dog.",
        weather: [
            { date: "2026-01-19", condition: "Sunny", tempHigh: 75, tempLow: 50, wind: 5, notes: "", hoursLost: 0 },
            { date: "2026-01-20", condition: "Cloudy", tempHigh: 70, tempLow: 48, wind: 10, notes: "", hoursLost: 0 }
        ],
        kpis: {
            percentComplete: 50,
            schedulePerformanceIndex: 1.0,
            manHoursWeek: 100,
            manHoursTotal: 1000,
            safetyIncidents: 0,
            weatherDaysLost: 0
        }
    },
    safety: {
        stats: {
           nearMisses: { week: 0, ytd: 0 },
           firstAids: { week: 0, ytd: 0 },
           recordables: { week: 0, ytd: 0 },
           lostTime: { week: 0, ytd: 0 },
           stopWorks: { week: 0, ytd: 0 }
        },
        narrative: "No safety incidents."
    },
    resources: { manpower: [], equipment: { onSite: [], mobilized: [], demobilized: [] }, materials: [], procurement: [] },
    progress: { bidItems: [], activitiesThisWeek: [] },
    financials: { invoices: [], summary: { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 } },
    schedule: { milestones: [], analysis: "" },
    photos: [],
    issues: [],
    rfis: [],
    submittals: []
};

async function runTest() {
    console.log("Sending request to Layout Engine...");
    
    try {
        const response = await fetch('http://localhost:3001/api/layout/calculate', {
            method: 'POST',
            body: JSON.stringify(mockReport),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const layout = await response.json();
        console.log("Layout Received:");
        console.log(JSON.stringify(layout, null, 2));
        
        if (layout.pages && layout.pages.length > 0 && layout.pages[0].items.length > 0) {
            console.log("SUCCESS: Layout engine returned nodes.");
        } else {
            console.error("FAILURE: Layout engine returned empty results.");
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

runTest();
