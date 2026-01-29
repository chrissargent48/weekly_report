import React from 'react';
import { WeeklyReport } from '../../../../types';
import { Type } from 'lucide-react';

interface ExecutivePropertiesProps {
  report?: WeeklyReport;
  onUpdateReport?: (updatedReport: WeeklyReport) => void;
}

export function ExecutiveProperties({ report, onUpdateReport }: ExecutivePropertiesProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Type size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 block">Edit Summary</label>
        <textarea
          value={report?.overview?.executiveSummary || ''}
          onChange={(e) => {
            if (report && onUpdateReport) {
              onUpdateReport({
                ...report,
                overview: {
                  ...report.overview,
                  executiveSummary: e.target.value
                }
              });
            }
          }}
          rows={8}
          className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none resize-none leading-relaxed"
          placeholder="Summarize this week's key activities and milestones..."
        />
      </div>
    </>
  );
}
