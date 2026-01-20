import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Package } from 'lucide-react';
import { COLORS } from '../config/styleTokens';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function ProcurementSection({ config, reportData }: Props) {
  const items = reportData.procurement || [];
  if (items.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Procurement Log">
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Item Description</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-32">Status</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-32">Expected Date</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => {
               const statusColor = 
                  item.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                  item.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700';

               return (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                  <td className="px-4 py-2 font-medium text-zinc-900">
                     <div className="flex items-center gap-2">
                        <Package size={14} className="text-zinc-400" />
                        {item.item}
                     </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                        {item.status}
                     </span>
                  </td>
                  <td className="px-4 py-2 text-center text-zinc-600 font-mono text-xs">{item.expectedDate}</td>
                  <td className="px-4 py-2 text-center text-zinc-500 text-xs italic">{item.notes || '-'}</td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
