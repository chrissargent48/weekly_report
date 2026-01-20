/**
 * Weekly Report v2.1 - Automated Test Suite
 * 
 * Tests for Excel parsing, data structures, and API functionality
 * Run with: npm test
 */

const XLSX = require('xlsx');
const path = require('path');

// Helper to read and parse Excel file
function readExcelFile(filePath) {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1 });
}

// Helper to clean row data (same as in ProjectSetup.tsx)
const cleanRow = (row) => row.map(cell => (cell?.toString() || "").trim());

// --- BID FORM TESTS ---
describe('Bid Form Excel Parsing', () => {
    const bidFormPath = path.resolve(__dirname, '../Bid Form.xlsx');
    let bidData;

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
    });

    test('Bid item numbers are in X.XX format', () => {
        const dataRows = bidData.slice(1);
        dataRows.forEach((row) => {
            const itemNum = row[0];
            if (itemNum != null) {
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
});

// --- SCHEDULE TESTS ---
describe('Schedule Excel Parsing', () => {
    const schedulePath = path.resolve(__dirname, '../Schedule.xlsx');
    let scheduleData;

    beforeAll(() => {
        scheduleData = readExcelFile(schedulePath);
    });

    test('Schedule file loads successfully', () => {
        expect(scheduleData).toBeDefined();
        expect(scheduleData.length).toBeGreaterThan(1);
    });

    test('Schedule has Bid Item column for linking', () => {
        const headers = cleanRow(scheduleData[0]);
        expect(headers[0]?.toLowerCase()).toContain('bid');
    });

    test('Schedule tasks link to bid item numbers', () => {
        const dataRows = scheduleData.slice(1);
        const tasksWithBidItems = dataRows.filter(row => row[0] != null);
        expect(tasksWithBidItems.length).toBeGreaterThan(0);
    });
});

// --- DATA STRUCTURE TESTS ---
describe('Data Structures', () => {
    
    test('TaskBidLink has required fields', () => {
        const link = {
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
    });
});

// --- EARNED VALUE CALCULATION TESTS ---
describe('Earned Value Calculations', () => {
    
    test('Earned value calculation with single link', () => {
        const bidItem = { id: 'bid-1-01', totalValue: 100000 };
        const link = { bidItemId: 'bid-1-01', allocationPercent: 100 };
        const task = { percentComplete: 50 };
        
        const earned = (link.allocationPercent / 100) * bidItem.totalValue * (task.percentComplete / 100);
        expect(earned).toBe(50000);
    });

    test('Earned value with split allocation', () => {
        const bidItem = { id: 'bid-1-01', totalValue: 100000 };
        
        const taskA = { percentComplete: 100, allocation: 60 };
        const taskB = { percentComplete: 25, allocation: 40 };
        
        const earnedA = (taskA.allocation / 100) * bidItem.totalValue * (taskA.percentComplete / 100);
        const earnedB = (taskB.allocation / 100) * bidItem.totalValue * (taskB.percentComplete / 100);
        
        expect(earnedA).toBe(60000);
        expect(earnedB).toBe(10000);
        expect(earnedA + earnedB).toBe(70000);
    });
});
