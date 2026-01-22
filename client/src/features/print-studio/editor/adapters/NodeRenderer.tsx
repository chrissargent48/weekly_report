import React from 'react';
import { CanvasNode, WeeklyReport } from '../../../../types';

interface NodeRendererProps {
  node: CanvasNode;
  data: WeeklyReport;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ node, data }) => {
  switch (node.type) {
    case 'image':
      return (
        <img 
          src={node.content} 
          alt="" 
          className="w-full h-full object-cover pointer-events-none" 
        />
      );

    case 'text':
      return (
        <div 
           className="w-full h-full p-2" 
           style={{ 
               fontSize: node.style?.fontSize || 12,
               color: node.style?.fontColor || '#000',
               backgroundColor: node.style?.backgroundColor || 'transparent'
           }}
        >
          {node.content}
        </div>
      );

    case 'section':
      return <SectionAdapter node={node} data={data} />;

    default:
      return <div className="w-full h-full bg-red-100 border border-red-500 flex items-center justify-center text-xs">Unknown</div>;
  }
};

const SectionAdapter: React.FC<NodeRendererProps> = ({ node, data }) => {
    // This will eventually delegate to specific adapters like CoverAdapter, OverviewAdapter, etc.
    switch(node.sectionType) {
        case 'cover':
            return <div className="w-full h-full bg-blue-50 border-2 border-blue-200 p-4">COVER PAGE PREVIEW</div>;
        case 'overview':
             return (
                 <div className="w-full h-full bg-white border border-gray-200 overflow-hidden text-xs">
                     <div className="bg-gray-100 p-1 font-bold border-b">Executive Summary</div>
                     <div className="p-2 line-clamp-6">{data.overview.executiveSummary}</div>
                 </div>
             );
        case 'weather':
            return <div className="w-full h-full bg-blue-50 border border-blue-200 flex items-center justify-center">Weather Widget</div>;
        default:
             return <div className="w-full h-full bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center">{node.sectionType}</div>;
    }
}
