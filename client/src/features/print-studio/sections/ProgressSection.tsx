import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function ProgressSection({ config, reportData }: Props) {
  // Assuming progress can be either narrative or bullet list in data
  // Adapting to existing data structure where it might be `weeklyProgress`
  const progress = reportData.weeklyProgress || reportData.progress; 
  if (!progress) return null;

  return (
    <SectionWrapper config={config} title="Work Completed This Week">
       <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {progress}
        </div>
    </SectionWrapper>
  );
}
