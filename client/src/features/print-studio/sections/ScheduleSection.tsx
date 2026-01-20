import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Calendar } from 'lucide-react';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function ScheduleSection({ config, reportData }: Props) {
  const milestones = reportData.schedule || [];
  if (milestones.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Key Schedule Milestones">
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Milestone Phase / Description</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-32">Target Date</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-32">Actual Date</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {milestones.map((ms: any, i: number) => {
               const isComplete = ms.status === 'Complete';
               const isLate = !isComplete && new Date(ms.targetDate) < new Date(); // Simple check, ideally use actual dates
               
               return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                     <td className="px-4 py-2 font-medium text-zinc-900 border-l-4 border-l-transparent pl-3">
                        {ms.description}
                     </td>
                     <td className="px-4 py-2 text-center font-mono text-zinc-600 text-xs">
                        {ms.targetDate}
                     </td>
                     <td className="px-4 py-2 text-center font-mono text-zinc-600 text-xs">
                        {ms.actualDate || '-'}
                     </td>
                     <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                           ${isComplete ? 'bg-emerald-100 text-emerald-700' : 
                             isLate ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                        `}>
                           {ms.status}
                        </span>
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
