import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import { PagePlacement } from '../config/printConfig.types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

export function IssuesSection({ config, reportData, placement }: Props) {
  const allIssues = reportData.issues || [];
  
  // Handle pagination slicing
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allIssues.length;
  const issues = allIssues.slice(startIdx, endIdx);

  if (issues.length === 0) return null;

  // Header Logic
  const showMainHeader = placement?.renderConfig?.showHeader ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const sectionTitle = showMainHeader ? (isContinued ? "Issues, Risks & Concerns (Continued)" : "Issues, Risks & Concerns") : undefined;

  return (
    <SectionWrapper config={config} title={sectionTitle}>
      <div className="flex flex-col gap-3">
         {issues.map((issue: any, i: number) => (
            <div key={i} className={`p-4 rounded border flex gap-4 ${
               issue.priority === 'High' ? 'bg-red-50 border-red-100' :
               issue.priority === 'Medium' ? 'bg-amber-50 border-amber-100' :
               'bg-zinc-50 border-zinc-100'
            }`}>
               {/* Icon */}
               <div className="shrink-0 mt-0.5">
                  {issue.status === 'Resolved' ? (
                     <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : (
                     <AlertTriangle className={
                        issue.priority === 'High' ? 'text-red-500' : 
                        issue.priority === 'Medium' ? 'text-amber-500' : 'text-zinc-400'
                     } size={20} />
                  )}
               </div>

               {/* Content */}
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                     <h4 className={`font-bold text-sm ${
                        issue.priority === 'High' ? 'text-red-900' : 'text-zinc-900'
                     }`}>
                        {issue.description}
                     </h4>
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        issue.priority === 'High' ? 'bg-white border-red-200 text-red-700' :
                        'bg-white border-zinc-200 text-zinc-500'
                     }`}>
                        {issue.priority} Priority
                     </span>
                  </div>
                  
                  <div className="text-xs text-zinc-600 mb-2">{issue.impact || 'Potential impact not specified.'}</div>
                  
                  <div className="flex items-center gap-4 text-xs">
                     <div className="font-medium text-zinc-500">
                        Owner: <span className="text-zinc-900">{issue.owner || 'Unassigned'}</span>
                     </div>
                     <div className="font-medium text-zinc-500">
                        Due: <span className="text-zinc-900">{issue.dueDate || 'No Date'}</span>
                     </div>
                     {issue.actionPlan && (
                        <div className="flex-1 text-right text-zinc-500 italic truncate ml-4">
                           Action: {issue.actionPlan}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ))}
      </div>
    </SectionWrapper>
  );
}
