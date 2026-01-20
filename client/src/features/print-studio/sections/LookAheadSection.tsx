import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { COLORS } from '../config/styleTokens';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function LookAheadSection({ config, reportData }: Props) {
  const items = reportData.progress?.lookAheadItems || reportData.lookAhead || [];
  if (items.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Three Week Look Ahead">
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500 w-16">Item</th>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Activity / Task</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Start</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">End</th>
              {/* <th className="px-4 py-2 text-center font-bold text-zinc-500 w-28">% Complete</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-zinc-900">{item.description || item.task}</td>
                <td className="px-4 py-2 text-center text-zinc-600 font-mono text-xs">
                   {item.forecastStart || item.baselineStart || '-'}
                </td>
                <td className="px-4 py-2 text-center text-zinc-600 font-mono text-xs">
                   {item.forecastFinish || item.baselineFinish || '-'}
                </td>
                {/* 
                <td className="px-4 py-2">
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${item.progress || 0}%`, backgroundColor: COLORS.primary }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 w-8 text-right">{item.progress || 0}%</span>
                   </div>
                </td>
                */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
