import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function EquipmentSection({ config, reportData }: Props) {
  const items = reportData.resources?.equipment?.onSite || [];
  if (items.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Equipment Log">
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Equipment Type</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Sun</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Mon</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Tue</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Wed</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Thu</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Fri</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Sat</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24 bg-zinc-100">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => {
               const dailyHours = item.dailyHours || {};
               const total = Object.values(dailyHours).reduce((sum: number, h: any) => sum + (Number(h) || 0), 0);
               const name = item.type || item.name || 'Unknown';
               
               return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                    <td className="px-4 py-2 font-medium text-zinc-900 border-r border-zinc-100">{name}</td>
                    {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                        <td key={day} className="px-4 py-2 text-center text-zinc-600">
                          {dailyHours[day] || '-'}
                        </td>
                    ))}
                    <td className="px-4 py-2 text-center font-bold text-cyan-700 bg-cyan-50 border-l border-zinc-200">
                        {total > 0 ? total : '-'}
                    </td>
                  </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
