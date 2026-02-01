import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Truck } from 'lucide-react';
import { RowBreakDivider, useHasBreakAtRow } from '../components/RowBreakDivider';

import { PagePlacement } from '../config/printConfig.types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
  onToggleRowBreak?: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
}

export function MaterialsSection({ config, reportData, placement, onToggleRowBreak }: Props) {
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
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => {
              // Calculate the actual row index in the full dataset
              const actualRowIndex = startIdx + i;
              const isLastRow = i === items.length - 1;
              const hasBreak = useHasBreakAtRow(config.manualBreaks, 'materials', actualRowIndex);

              return (
                <React.Fragment key={i}>
                  <tr className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                    <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{item.date}</td>
                    <td className="px-4 py-2 font-medium text-zinc-900">
                       <div className="flex items-center gap-2">
                          <Truck size={14} className="text-zinc-400" />
                          {item.description}
                       </div>
                    </td>
                    <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{item.ticketNumber}</td>
                    <td className="px-4 py-2 text-right font-bold text-zinc-700">{item.quantity} {item.uom}</td>
                    <td className="px-4 py-2 text-xs text-zinc-500 italic">{item.notes || '-'}</td>
                  </tr>
                  {/* Row break divider - show after each row except the last */}
                  {!isLastRow && onToggleRowBreak && (
                    <RowBreakDivider
                      hasBreak={hasBreak}
                      onToggleBreak={() => onToggleRowBreak('materials', actualRowIndex)}
                      compact
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
