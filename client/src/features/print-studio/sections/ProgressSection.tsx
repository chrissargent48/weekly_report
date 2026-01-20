import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function ProgressSection({ config, reportData }: Props) {
  // WeeklyReport structure: progress contains { activitiesThisWeek: string[] }
  const activities = reportData.progress?.activitiesThisWeek || [];
  
  if (activities.length === 0) return null;

  return (
    <SectionWrapper config={config} title="Work Completed This Week">
       <ul className="list-disc pl-5 text-sm text-zinc-700 leading-relaxed space-y-1">
          {activities.map((activity: string, i: number) => (
             <li key={i}>{activity}</li>
          ))}
       </ul>
    </SectionWrapper>
  );
}
