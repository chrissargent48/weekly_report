/**
 * Weekly Report v2.1 - Automated Test Suite
 * 
 * Tests for Excel parsing, data structures, and API functionality
 * Run with: npm test
 */

const XLSX = require('xlsx');
const path = require('path');

// Helper to read and parse Excel file
function readExcelFile(filePath: string): any[][] {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1 });
}

// Helper to clean row data (same as in ProjectSetup.tsx)
const cleanRow = (row: any[]) => row.map(cell => (cell?.toString() || "").trim());

// --- BID FORM TESTS ---
describe('Bid Form Excel Parsing', () => {
    const bidFormPath = path.resolve(__dirname, '../Bid Form.xlsx');
    let bidData: any[][];

    beforeAll(() => {
        bidData = readExcelFile(bidFormPath);
    });

    test('Bid Form file loads successfully', () => {
        expect(bidData).toBeDefined();
        expect(bidData.length).toBeGreaterThan(1);
    });

    test('Bid Form has correct header columns', () => {
        const headers = cleanRow(bidData[0]);
        expect(headers[0]?.toLowerCase()).toContain('item');
        expect(headers[1]?.toLowerCase()).toContain('description');
        expect(headers[2]?.toLowerCase()).toContain('quantity');
        expect(headers[3]?.toLowerCase()).toContain('unit');
        expect(headers[4]?.toLowerCase()).toContain('cost'); // Unit Cost
    });

    test('Bid item numbers are in X.XX format', () => {
        const dataRows = bidData.slice(1);
        dataRows.forEach((row, i) => {
            const itemNum = row[0];
            if (itemNum != null) {
                // Should be a number like 1.01, 2.03, etc.
                expect(typeof itemNum).toBe('number');
                const formatted = itemNum.toFixed(2);
                expect(formatted).toMatch(/^\d+\.\d{2}$/);
            }
        });
    });

    test('Bid items have descriptions', () => {
        const dataRows = bidData.slice(1);
        const itemsWithDescriptions = dataRows.filter(row => row[1]?.toString().trim().length > 0);
        expect(itemsWithDescriptions.length).toBeGreaterThan(0);
    });

    test('Quantities and prices are numbers', () => {
        const dataRows = bidData.slice(1);
        dataRows.forEach(row => {
            if (row[0] != null) {
                expect(typeof row[2] === 'number' || !isNaN(parseFloat(row[2]))).toBeTruthy();
                expect(typeof row[4] === 'number' || !isNaN(parseFloat(row[4]))).toBeTruthy();
            }
        });
    });
});

// --- SCHEDULE TESTS ---
describe('Schedule Excel Parsing', () => {
    const schedulePath = path.resolve(__dirname, '../Schedule.xlsx');
    let scheduleData: any[][];

    beforeAll(() => {
        scheduleData = readExcelFile(schedulePath);
    });

    test('Schedule file loads successfully', () => {
        expect(scheduleData).toBeDefined();
        expect(scheduleData.length).toBeGreaterThan(1);
    });

    test('Schedule has correct header columns', () => {
        const headers = cleanRow(scheduleData[0]);
        expect(headers[0]?.toLowerCase()).toContain('bid');
        // Header can be 'task' or 'name'
        expect(headers[1]?.toLowerCase().includes('task') || headers[1]?.toLowerCase().includes('name')).toBe(true);
        // Header can be 'complete' or '%'
        expect(headers[2]?.toLowerCase().includes('complete') || headers[2]?.toLowerCase().includes('%')).toBe(true);
        expect(headers[3]?.toLowerCase()).toContain('duration');
    });

    test('Schedule tasks link to bid item numbers', () => {
        const dataRows = scheduleData.slice(1);
        const tasksWithBidItems = dataRows.filter(row => row[0] != null);
        expect(tasksWithBidItems.length).toBeGreaterThan(0);
        
        // Bid items should be in X.XX format
        tasksWithBidItems.forEach(row => {
            const bidItem = row[0];
            if (typeof bidItem === 'number') {
                const formatted = bidItem.toFixed(2);
                expect(formatted).toMatch(/^\d+\.\d{2}$/);
            }
        });
    });

    test('Percent complete is between 0 and 1 (or 0 and 100)', () => {
        const dataRows = scheduleData.slice(1);
        dataRows.forEach(row => {
            const pct = parseFloat(row[2] || 0);
            // Could be 0-1 format or 0-100 format
            expect(pct).toBeGreaterThanOrEqual(0);
            expect(pct).toBeLessThanOrEqual(100);
        });
    });
});

// --- DATA STRUCTURE TESTS ---
describe('Data Structures', () => {
    
    test('TaskBidLink has required fields', () => {
        interface TaskBidLink {
            bidItemId: string;
            allocationPercent: number;
        }
        
        const link: TaskBidLink = {
            bidItemId: 'bid-1-01',
            allocationPercent: 50
        };
        
        expect(link.bidItemId).toBeDefined();
        expect(link.allocationPercent).toBeGreaterThanOrEqual(0);
        expect(link.allocationPercent).toBeLessThanOrEqual(100);
    });

    test('Allocation percentages sum correctly', () => {
        const links = [
            { bidItemId: 'bid-1-01', allocationPercent: 50 },
            { bidItemId: 'bid-1-02', allocationPercent: 30 },
            { bidItemId: 'bid-1-03', allocationPercent: 20 },
        ];
        
        const total = links.reduce((sum, l) => sum + l.allocationPercent, 0);
        expect(total).toBe(100);
    });

    test('Personnel structure supports dynamic lists', () => {
        const personnel = {
            recon: [
                { name: 'John Doe', role: 'Project Manager', email: 'john@example.com', phone: '555-1234' }
            ],
            client: { 
                company: 'ACME Corp', 
                representatives: [
                    { name: 'Jane Smith', role: "Owner's Rep", email: 'jane@acme.com', phone: '555-5678' }
                ]
            },
            engineer: {
                company: 'Engineering Inc',
                representatives: []
            },
            stakeholders: []
        };
        
        expect(Array.isArray(personnel.recon)).toBe(true);
        expect(personnel.client.company).toBeDefined();
        expect(Array.isArray(personnel.client.representatives)).toBe(true);
        expect(Array.isArray(personnel.engineer.representatives)).toBe(true);
    });
});

// --- EARNED VALUE CALCULATION TESTS ---
describe('Earned Value Calculations', () => {
    
    test('Earned value calculation with single link', () => {
        const bidItem = { id: 'bid-1-01', totalValue: 100000 };
        const link = { bidItemId: 'bid-1-01', allocationPercent: 100 };
        const task = { percentComplete: 50 };
        
        // Earned = allocation% * bid total * percent complete
        const earned = (link.allocationPercent / 100) * bidItem.totalValue * (task.percentComplete / 100);
        expect(earned).toBe(50000);
    });

    test('Earned value with split allocation', () => {
        const bidItem = { id: 'bid-1-01', totalValue: 100000 };
        
        // 60% to Task A (100% complete), 40% to Task B (25% complete)
        const taskA = { percentComplete: 100, allocation: 60 };
        const taskB = { percentComplete: 25, allocation: 40 };
        
        const earnedA = (taskA.allocation / 100) * bidItem.totalValue * (taskA.percentComplete / 100);
        const earnedB = (taskB.allocation / 100) * bidItem.totalValue * (taskB.percentComplete / 100);
        
        expect(earnedA).toBe(60000); // 60% * 100K * 100%
        expect(earnedB).toBe(10000); // 40% * 100K * 25%
        expect(earnedA + earnedB).toBe(70000); // Total earned from this bid item
    });
});
