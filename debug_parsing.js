

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const cleanRow = (row) => row.map(cell => (cell?.toString() || "").trim());

function processSchedule(filePath) {
    const output = [];
    output.push(`--- Processing ${path.basename(filePath)} ---`);
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    output.push("First 3 rows (Raw):");
    rows.slice(0, 3).forEach((r, i) => output.push(`[${i}] ${JSON.stringify(r)}`));

    const firstCell = rows[0]?.[0]?.toString().toLowerCase() || "";
    const hasHeader = firstCell.includes('bid') || firstCell.includes('task') || firstCell.includes('name');
    output.push(`Has Header detected: ${hasHeader}`);
    
    const startIdx = hasHeader ? 1 : 0;
    
    // Simulate mapping
    rows.slice(startIdx, startIdx + 5).forEach((rowRaw, i) => {
        const row = cleanRow(rowRaw);
        if (row.length < 2 || !row[1]?.trim()) {
            output.push(`Skipping row ${i + startIdx} (too short/empty)`);
            return;
        }

        const task = {
             name: row[1]?.trim(),  // Column 1: Task Name
             baselineStart: row[4],    // Column 4: Start
             baselineFinish: row[5],   // Column 5: Finish
             baselineDuration: parseInt(row[3]),  // Column 3: Duration
             percentComplete: row[2],  // Column 2: % Complete
             linkedBidItem: rowRaw[0]  // Column 0: Bid Item
        };
        output.push(`Row ${i + startIdx} parsed as: ${JSON.stringify(task)}`);
    });
    
    fs.writeFileSync('debug_output.txt', output.join('\n'));
}

try {
    processSchedule('Schedule.xlsx');
} catch (e) {
    console.error("Error processing Schedule.xlsx:", e.message);
}

