import React from 'react';
import { WidgetProps } from '../types/widgetTypes';

/**
 * DOM Bridge
 * ----------
 * Renders widgets using standard HTML/CSS/Tailwind.
 * This is used for:
 * 1. The Interactive Editor
 * 2. The "Phantom" Layout Engine (for measurement)
 */
export const DomBridge = <T extends any>({ type, data, config }: WidgetProps<T>) => {
  
  // Render based on widget type
  switch (type) {
    case 'text':
      return (
        <div className={`text-widget ${config?.className || ''}`} style={config?.style}>
          <p>{String(data)}</p>
        </div>
      );
      
    case 'table':
      // Placeholder for TanStack Table implementation
      return (
        <div className={`table-widget w-full border border-gray-200 ${config?.className || ''}`}>
          <div className="bg-gray-50 p-2 font-medium border-b">Table Widget</div>
          <div className="p-4 text-center text-gray-500">
             {/* Actual table component will go here */}
             Table Content ({Array.isArray(data) ? data.length : 0} rows)
          </div>
        </div>
      );

    case 'chart':
      // Placeholder for Recharts implementation
      return (
        <div className={`chart-widget h-64 w-full bg-white border rounded ${config?.className || ''}`}>
           <div className="flex items-center justify-center h-full text-gray-400">
             [Interactive Chart: {config?.title || 'Untitled'}]
           </div>
        </div>
      );

    case 'summary':
       return (
         <div className="summary-widget bg-white p-4 rounded shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-2">{config?.title || 'Summary'}</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
         </div>
       );

    default:
      return (
        <div className="text-red-500 p-2 border border-red-200 rounded text-sm">
          Unknown Widget Type: {type}
        </div>
      );
  }
};
