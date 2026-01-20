import React, { useEffect, useState, useMemo } from 'react';
import { ProjectConfig, ProjectBaselines, WeeklyReport } from '../types';
import { api } from '../api';
import { CreateReportCard } from './dashboard/CreateReportCard';
import { ReportHistoryTable } from './dashboard/ReportHistoryTable';
import { SafetyWidget } from './dashboard/widgets/SafetyWidget';
import { ManpowerChart } from './dashboard/widgets/ManpowerChart';
import { WeatherWidget } from './dashboard/widgets/WeatherWidget';
import { PhotoGrid } from './dashboard/widgets/PhotoGrid';
import { Layers } from 'lucide-react';

interface Props {
  config: ProjectConfig;
  reports: string[];
  onCreate: (date: string) => void;
  onOpen: (date: string) => void;
  projectId: string;
}

export function Dashboard({ config, reports, onCreate, onOpen, projectId }: Props) {
  const [baselines, setBaselines] = useState<ProjectBaselines | null>(null);
  const [latestReport, setLatestReport] = useState<WeeklyReport | null>(null);

  // Load Real Data
  useEffect(() => {
      if(!projectId) return;

      // 1. Get Baselines
      api.getBaselines(projectId).then(setBaselines);

      // 2. Get Latest Report for KPIs
      if (reports.length > 0) {
          const sorted = [...reports].sort().reverse();
          const latestDate = sorted[0];
          api.getReport(projectId, latestDate).then(setLatestReport);
      }
  }, [projectId, reports]);

  // Fallback for "Project Health" if no report exists
  const showWidgets = latestReport !== null;

  return (
    <div className="flex-1 overflow-auto bg-brand-surface-light p-8 text-zinc-900 font-sans">
       <header className="mb-8 flex justify-between items-end">
          <div>
              <h1 className="text-3xl font-extrabold text-brand-dark mb-1">{config.identity.projectName || "New Project"}</h1>
              <div className="flex items-center gap-6">
                  <p className="text-brand-dim font-medium">{config.identity.location}</p>
                  {latestReport && (
                      <span className="text-sm font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                          Week Ending: {latestReport.weekEnding}
                      </span>
                  )}
              </div>
          </div>
          <div className="text-right">
              <div className="text-sm font-bold text-brand-dim uppercase">Total Reports</div>
              <div className="text-2xl font-bold text-brand-navy">{reports.length}</div>
          </div>
       </header>

       {/* WIDGET GRID - 4 Columns */}
       <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
           
            {/* ROW 1: METRICS & ACTIONS */}
            {!showWidgets ? (
                 <div className="xl:col-span-3 bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-400">
                     <Layers className="mx-auto mb-4 opacity-50" size={48}/>
                     <h3 className="text-lg font-bold text-zinc-600">No Reports Generated Yet</h3>
                     <p className="text-sm">Create your first weekly report to see project health metrics.</p>
                 </div>
            ) : (
                <>
                    {/* Safety (Double Wide) */}
                    <div className="xl:col-span-2 h-[260px]">
                        <SafetyWidget report={latestReport} />
                    </div>
                    {/* Weather (Single) */}
                    <div className="xl:col-span-1 h-[260px]">
                        <WeatherWidget report={latestReport} />
                    </div>
                </>
            )}

            {/* Create Actions (Always Visible) */}
            <div className="xl:col-span-1 h-[260px]">
                 <CreateReportCard onCreate={onCreate} />
            </div>

            {/* ROW 2: MANPOWER & PHOTOS */}
            {showWidgets && (
                <>
                     {/* Manpower (Aligns with Safety) */}
                     <div className="xl:col-span-2 h-[320px]">
                         <ManpowerChart report={latestReport} />
                     </div>

                     {/* Photos (Aligns with Weather + Create Report) */}
                     <div className="xl:col-span-2 h-[320px]">
                         <PhotoGrid report={latestReport} />
                     </div>
                </>
            )}
       </div>

       {/* BOTTOM SECTION: REPORT HISTORY TABLE */}
       <div>
           <h3 className="text-sm font-bold text-brand-text-muted uppercase mb-4">Report History</h3>
           <div className="h-[500px]"> {/* Fixed height for table scrolling */}
               <ReportHistoryTable reports={reports} onOpen={onOpen} />
           </div>
       </div>

    </div>
  );
}
