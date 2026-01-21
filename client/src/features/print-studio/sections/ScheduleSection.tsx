import React from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Calendar } from 'lucide-react';
import { RowBreakDivider, useHasBreakAtRow } from '../components/RowBreakDivider';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
  onToggleRowBreak?: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
}

export function ScheduleSection({ config, reportData, placement, onToggleRowBreak }: Props) {
  const allMilestones = reportData.schedule?.milestones || [];

  // Handle pagination slicing
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allMilestones.length;
  const milestones = allMilestones.slice(startIdx, endIdx);

  if (milestones.length === 0) return null;

  // Header Logic
  const showMainHeader = placement?.renderConfig?.showHeader ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const sectionTitle = showMainHeader ? (isContinued ? "Key Schedule Milestones (Continued)" : "Key Schedule Milestones") : undefined;

  return (
    <SectionWrapper config={config} title={sectionTitle}>
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
               const actualRowIndex = startIdx + i;
               const isLastRow = i === milestones.length - 1;
               const hasBreak = useHasBreakAtRow(config.manualBreaks, 'schedule', actualRowIndex);
               const isComplete = ms.status === 'Complete';
               const isLate = !isComplete && new Date(ms.targetDate) < new Date(); // Simple check, ideally use actual dates

               return (
                  <React.Fragment key={i}>
                    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                       <td className="px-4 py-2 font-medium text-zinc-900 border-l-4 border-l-transparent pl-3">
                          {ms.milestone}
                       </td>
                       <td className="px-4 py-2 text-center font-mono text-zinc-600 text-xs">
                          {ms.finishDate}
                       </td>
                       <td className="px-4 py-2 text-center font-mono text-zinc-600 text-xs">
                          {ms.status === 'Complete' ? ms.finishDate : '-'}
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
                    {/* Row break divider */}
                    {!isLastRow && onToggleRowBreak && (
                      <RowBreakDivider
                        hasBreak={hasBreak}
                        onToggleBreak={() => onToggleRowBreak('schedule', actualRowIndex, ms.id)}
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
