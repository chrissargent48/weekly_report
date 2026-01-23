
import React from 'react';
import { ReportLayout, CanvasNode } from '../../../../server/types';

interface LayoutDebugViewProps {
    layout: ReportLayout | null;
    scale?: number; // Scaling factor if the preview is zoomed
}

// PDF Points to Pixels conversion (assuming 96 DPI screen vs 72 DPI PDF)
// 1 pt = 1/72 inch
// 1 px = 1/96 inch
// px = pt * (96/72) = pt * 1.333
const PT_TO_PX = 96 / 72;

export const LayoutDebugView: React.FC<LayoutDebugViewProps> = ({ layout, scale = 1 }) => {
    if (!layout) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" 
             style={{ 
                 width: '210mm', // A4 width matches the preview container
                 height: 'auto'
             }}>
            {layout.pages.map(page => (
                <div key={page.id} className="relative w-full h-full">
                    {page.items.map(node => (
                        <div
                            key={node.id}
                            className="absolute border border-red-500 bg-red-500/10 text-[8px] text-red-700 flex items-start justify-start overflow-hidden"
                            title={`x:${node.x}, y:${node.y}, w:${node.width}, h:${node.height}`}
                            style={{
                                left: `${node.x * PT_TO_PX * scale}px`,
                                top: `${node.y * PT_TO_PX * scale}px`,
                                width: `${node.width * PT_TO_PX * scale}px`,
                                height: `${node.height * PT_TO_PX * scale}px`,
                                // Assuming 0 rotation for now
                            }}
                        >
                            <span className="bg-white/80 px-0.5">{node.type}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
