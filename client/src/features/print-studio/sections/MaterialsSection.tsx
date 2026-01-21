import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Truck } from 'lucide-react';

import { PagePlacement } from '../config/printConfig.types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

export function MaterialsSection({ config, reportData, placement }: Props) {
  const allItems = reportData.resources?.materials || [];
  
  // Handle pagination slicing
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allItems.length;
  const items = allItems.slice(startIdx, endIdx);

  if (items.length === 0) return null;

  // Header Logic
  const showMainHeader = placement?.renderConfig?.showHeader ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const sectionTitle = showMainHeader ? (isContinued ? "Material Deliveries (Continued)" : "Material Deliveries") : undefined;

  return (
    <SectionWrapper config={config} title={sectionTitle}>
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500 w-32">Date</th>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Material / Description</th>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Ticket #</th>
              <th className="px-4 py-2 text-right font-bold text-zinc-500 w-32">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{item.date}</td>
                <td className="px-4 py-2 font-medium text-zinc-900">
                   <div className="flex items-center gap-2">
                      <Truck size={14} className="text-zinc-400" />
                      {item.description}
                   </div>
                </td>
                <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{item.ticketNumber}</td>
                <td className="px-4 py-2 text-right font-bold text-zinc-700">{item.quantity} {item.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
