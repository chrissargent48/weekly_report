import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Truck } from 'lucide-react';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function MaterialsSection({ config, reportData }: Props) {
  const items = reportData.resources?.materials || reportData.materials || [];
  if (items.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Material Deliveries">
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
                      {item.material}
                   </div>
                </td>
                <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{item.ticketNumber}</td>
                <td className="px-4 py-2 text-right font-bold text-zinc-700">{item.quantity} {item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
