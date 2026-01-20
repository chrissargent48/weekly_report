import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function SafetySection({ config, reportData }: Props) {
  const safety = reportData.safety;
  if (!safety) return null;

  return (
    <SectionWrapper config={config} title="Safety Report">
       <div className="flex flex-col gap-4">
          {/* Safety Stats */}
          <div className="grid grid-cols-4 gap-4">
             {[
                { label: 'Incidents', value: safety.incidents || 0, good: true },
                { label: 'Near Misses', value: safety.nearMisses || 0, good: true },
                { label: 'Toolbox Talks', value: safety.toolboxTalks || 0, good: false },
                { label: 'Site Inductions', value: safety.inductions || 0, good: false },
             ].map((stat, i) => (
                <div key={i} className="bg-zinc-50 p-3 rounded border border-zinc-100 text-center">
                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</div>
                   <div className={`text-xl font-bold ${stat.good && stat.value === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      {stat.value}
                   </div>
                </div>
             ))}
          </div>

          {/* Narrative */}
          {safety.narrative && (
             <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap bg-blue-50/50 p-4 rounded border border-blue-100">
                <span className="font-bold text-blue-800 block mb-1 text-xs uppercase tracking-wide">Safety Observations</span>
                {safety.narrative}
             </div>
          )}
       </div>
    </SectionWrapper>
  );
}
