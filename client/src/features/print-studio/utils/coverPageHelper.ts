
import * as fabric from 'fabric';

interface CoverPageOptions {
    width: number;
    height: number;
    projectName: string;
}

export const createCoverPage = (options: CoverPageOptions) => {
    const { width, height, projectName } = options;
    
    // Colors from tailwind.config.js
    const brandPrimary = '#009fb7';
    const brandAccent = '#fed766';
    const brandDark = '#272727';
    
    // 1. Hero Section (Top 40%)
    // Background Image Placeholder (Gray)
    const heroBg = new fabric.Rect({
        left: 0,
        top: 0,
        width: width,
        height: height * 0.4,
        fill: '#adc1c6', // Placeholder gray-blue
        selectable: true,
        lockMovementX: true,
        lockMovementY: true
    });
    
    // Custom properties for interaction
    (heroBg as any).isPlaceholder = true;
    (heroBg as any).placeholderType = 'hero';
    
    // The "Teal Overlay" (Gradient)
    const heroOverlay = new fabric.Rect({
        left: 0,
        top: 0,
        width: width,
        height: height * 0.4,
        fill: new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: height * 0.4 },
            colorStops: [
                { offset: 0, color: 'rgba(0, 159, 183, 0.9)' }, // Brand Primary top
                { offset: 1, color: 'rgba(0, 80, 100, 0.9)' }   // Darker teal bottom
            ]
        }),
        selectable: false, // Let clicks pass through to the bg? Or make this the trigger?
        evented: false,    // Pass events to the heroBg underneath
        lockMovementX: true,
        lockMovementY: true
    });

    const heroText = new fabric.Textbox('Double Click Background to Upload Project Photo', {
        left: width / 2,
        top: (height * 0.4) / 2,
        width: 400,
        fontSize: 14,
        textAlign: 'center',
        fill: 'rgba(255,255,255,0.7)',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false
    });
    
    // Logo Placeholder (Top Left)
    const logoRect = new fabric.Rect({
        left: 40,
        top: 40,
        width: 150,
        height: 60,
        fill: 'rgba(255,255,255,0.2)',
        stroke: 'white',
        strokeWidth: 2,
        strokeDashArray: [5, 5]
    });
    const logoText = new fabric.Text('LOGO', {
        left: 115,
        top: 70,
        fontSize: 20,
        fontWeight: 'bold',
        fill: 'white',
        originX: 'center',
        originY: 'center'
    });
    const logoGroup = new fabric.Group([logoRect, logoText], {
        left: 40,
        top: 40,
        selectable: true
    });

    // 2. Main Content
    const contentStartY = (height * 0.4) + 40;
    
    const title = new fabric.Textbox(projectName, {
        left: 40,
        top: contentStartY,
        width: width - 80,
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: brandDark
    });
    
    const location = new fabric.Textbox('Project Location (City, State)', {
        left: 40,
        top: contentStartY + 50,
        width: width - 80,
        fontSize: 16,
        fontWeight: 'normal',
        fontFamily: 'Inter',
        fill: brandPrimary
    });
    
    // Gold Accent Line
    const accentLine = new fabric.Rect({
        left: 40,
        top: contentStartY + 90,
        width: 100,
        height: 4,
        fill: brandAccent
    });
    
    const reportLabel = new fabric.Textbox('WEEKLY PROGRESS REPORT', {
        left: 40,
        top: contentStartY + 110,
        width: width - 80,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: brandDark,
        charSpacing: 50
    });
    
    const dateLabel = new fabric.Textbox('Week Ending: Click to Edit', {
        left: 40,
        top: contentStartY + 135,
        width: width - 80,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        fill: brandPrimary
    });

    // 3. Photo Strip (Bottom)
    const stripY = height - 250; // Pin to bottom area
    const stripHeight = 150;
    const gap = 15;
    const availableWidth = width - 80;
    const photoWidth = (availableWidth - (gap * 2)) / 3;

    const photos: fabric.Object[] = [];
    
    for(let i=0; i<3; i++) {
        const pLeft = 40 + (i * (photoWidth + gap));
        
        const pRect = new fabric.Rect({
            left: pLeft,
            top: stripY,
            width: photoWidth,
            height: stripHeight,
            fill: '#f4f4f5',
            stroke: '#d4d4d8',
            strokeWidth: 1
        });
        
        // Simple placeholder visual
        const line1 = new fabric.Line([pLeft, stripY, pLeft + photoWidth, stripY + stripHeight], { stroke: '#e4e4e7', strokeWidth: 1 });
        const line2 = new fabric.Line([pLeft + photoWidth, stripY, pLeft, stripY + stripHeight], { stroke: '#e4e4e7', strokeWidth: 1 });
        
        const pGroup = new fabric.Group([pRect, line1, line2], {
            left: pLeft,
            top: stripY,
            selectable: true,
            subTargetCheck: false
        });
        
        // Custom props for interaction
        (pGroup as any).isPlaceholder = true;
        (pGroup as any).placeholderType = 'sub-image';
        (pGroup as any).index = i;
        
        photos.push(pGroup);
    }
    
    // Bottom Safety Bar
    const footerRect = new fabric.Rect({
        left: 0,
        top: height - 40,
        width: width,
        height: 40,
        fill: brandPrimary,
        selectable: false
    });
    const footerText = new fabric.Text('Safety is a core value', {
        left: width / 2,
        top: height - 20,
        fontSize: 12,
        fontStyle: 'italic',
        fill: 'white',
        originX: 'center',
        originY: 'center',
        selectable: false
    });

    return [heroBg, heroOverlay, heroText, logoGroup, title, location, accentLine, reportLabel, dateLabel, ...photos, footerRect, footerText];
}
