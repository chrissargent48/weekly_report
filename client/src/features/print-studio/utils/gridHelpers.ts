
import * as fabric from 'fabric';

interface GridOptions {
    left: number;
    top: number;
    width: number;
    height: number;
    gap?: number;
}

export const createPhotoGrid = (rows: number, cols: number, options: GridOptions) => {
    const { left, top, width, height, gap = 10 } = options;
    
    // Calculate cell dimensions
    const totalGapWidth = (cols - 1) * gap;
    const totalGapHeight = (rows - 1) * gap;
    
    const cellWidth = (width - totalGapWidth) / cols;
    const cellHeight = (height - totalGapHeight) / rows;
    
    const cells: fabric.Rect[] = [];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellLeft = -width/2 + (c * (cellWidth + gap)) + cellWidth/2;
            const cellTop = -height/2 + (r * (cellHeight + gap)) + cellHeight/2;
            
            const rect = new fabric.Rect({
                left: cellLeft,
                top: cellTop,
                width: cellWidth,
                height: cellHeight,
                fill: '#e4e4e7', // zinc-200
                stroke: '#a1a1aa', // zinc-400
                strokeWidth: 1,
                strokeDashArray: [5, 5],
                originX: 'center',
                originY: 'center'
            });
            
            // Custom properties to identify this as a dropzone later
            (rect as any).isGridCell = true;
            (rect as any).rowIndex = r;
            (rect as any).colIndex = c;
            
            cells.push(rect);
        }
    }
    
    // Create a Group
    const group = new fabric.Group(cells, {
        left: left,
        top: top,
        originX: 'left',
        originY: 'top',
        subTargetCheck: false, // Set to false so the group is selected as one unit
        interactive: true,
    });
    
    // Custom prop to identify the group
    (group as any).isPhotoGrid = true;
    (group as any).gridConfig = { rows, cols };
    
    return group;
};
