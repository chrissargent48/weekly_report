import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function ExecutiveSummary({ config, reportData }: Props) {
  const summary = reportData.executiveSummary;
  if (!summary) return null;

  return (
    <SectionWrapper config={config} title="Executive Summary">
      <div className="flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 p-3 rounded border border-zinc-100">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-cyan-700">{summary.totalHours || 0}</div>
          </div>
          <div className="bg-zinc-50 p-3 rounded border border-zinc-100">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Days Lost</div>
            <div className="text-2xl font-bold text-red-600">{summary.daysLost || 0}</div>
          </div>
        </div>
        
        {/* Narrative */}
        <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {summary.narrative || 'No summary provided.'}
        </div>
      </div>
    </SectionWrapper>
  );
}
