import React from 'react';
import { ProjectConfig } from '../../../../types';

interface PageHeaderProps {
  projectConfig: ProjectConfig;
  weekEnding: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    // Handle YYYY-MM-DD specifically to avoid timezone shifts
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    // Fallback for other formats
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

export function PageHeader({ projectConfig, weekEnding }: PageHeaderProps) {
  const formattedDate = formatDate(weekEnding);
  
  return (
    <div className="flex justify-between items-start pb-3 mb-4 border-b-2 border-zinc-900 flex-shrink-0">
      {/* Left side - Project details */}
      <div className="flex-1 pr-4">
        <h1 className="text-lg font-bold text-zinc-900 leading-tight">
          {projectConfig.identity.projectName}
        </h1>
        <div className="text-xs text-zinc-600 mt-0.5">
          {projectConfig.identity.location} • Job #{projectConfig.identity.jobNumber}
        </div>
      </div>
      
      {/* Right side - Report label and date */}
      <div className="text-right flex-shrink-0">
        <div className="text-xs font-bold text-brand-primary uppercase tracking-wide">
          WEEKLY REPORT
        </div>
        <div className="text-sm font-semibold text-zinc-900 mt-0.5">
          {formattedDate}
        </div>
      </div>
    </div>
  );
}
