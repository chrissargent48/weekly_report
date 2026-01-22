import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { RichTextEditor } from '../components/RichTextEditor';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  onUpdateReport?: (data: ReportData) => void;
}

export function ExecutiveSummary({ config, reportData, onUpdateReport }: Props) {
  // Use WeeklyReport structure
  const overview = reportData.overview;
  if (!overview) return null;

  // Handle Text Update
  const handleSummaryChange = (newHtml: string) => {
    if (onUpdateReport) {
      onUpdateReport({
        ...reportData,
        overview: {
          ...reportData.overview!,
          executiveSummary: newHtml
        }
      });
    }
  };

  // Calculate manpower breakdown by category
  const manpower = reportData.resources?.manpower || [];
  
  // Helper function to sum daily hours for a manpower entry
  const sumDailyHours = (sum: number, m: any) => {
    const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    return sum + Number(dh.mon || 0) + Number(dh.tue || 0) + Number(dh.wed || 0) + Number(dh.thu || 0) + Number(dh.fri || 0) + Number(dh.sat || 0) + Number(dh.sun || 0);
  };

  // RECON Onsite: type='recon' AND location='onsite' (or missing location, default to onsite)
  const reconOnsite = manpower
    .filter((m: any) => m.type === 'recon' && (m.location === 'onsite' || !m.location))
    .reduce(sumDailyHours, 0);

  // RECON Remote: type='recon' AND location='remote'
  const reconRemote = manpower
    .filter((m: any) => m.type === 'recon' && m.location === 'remote')
    .reduce(sumDailyHours, 0);

  // Subcontractors: type='subcontractor'
  const subcontractors = manpower
    .filter((m: any) => m.type === 'subcontractor')
    .reduce(sumDailyHours, 0);

  // Week Total: Sum of all three categories
  const weekTotal = reconOnsite + reconRemote + subcontractors;

  // Job to Date: Pull from overview.kpis.manHoursTotal
  const jobToDate = overview.kpis?.manHoursTotal || 0;

  // Calculate weather impact from actual weather data
  // Standard workday = 10 hours, so convert hours lost to fractional days
  const weather = reportData.overview?.weather || [];
  const totalHoursLost = weather.reduce((sum: number, day: any) => sum + (day.hoursLost || 0), 0);
  const hoursPerDay = 10;
  const daysLost = totalHoursLost / hoursPerDay; // Convert hours to fractional days

  return (
    <SectionWrapper config={config} title="Weekly Summary">
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Left Column: Executive Summary Narrative */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border border-zinc-300 rounded p-4 flex-1 h-full min-h-[300px] flex flex-col">
            <h3 className="text-[10px] font-bold mb-2 uppercase text-zinc-600 tracking-wider">
              Weekly Recap
            </h3>
            {/* Rich Text Editor */}
            <div className="flex-1">

              {onUpdateReport ? (
                <RichTextEditor
                  value={overview.executiveSummary || ''}
                  onChange={handleSummaryChange}
                  className="min-h-full border-none shadow-none"
                />
              ) : (
                 <div 
                   className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none"
                   dangerouslySetInnerHTML={{ __html: overview.executiveSummary || 'No summary provided.' }}
                 />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Two Stacked Boxes - Equal Height Container */}
        <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-4">
          {/* Manpower Summary Box */}
          <div className="bg-white border-2 border-zinc-400 rounded p-4 flex flex-col flex-1 h-full">
            <h3 className="text-[10px] font-bold mb-3 uppercase text-zinc-600 tracking-wider">
              Manpower Summary
            </h3>
            <div className="flex flex-col space-y-1">
              {/* RECON Onsite */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-zinc-700">RECON Onsite</span>
                <span className="font-mono text-sm text-zinc-900">{reconOnsite} hrs</span>
              </div>

              {/* RECON Remote */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-zinc-700">RECON Remote</span>
                <span className="font-mono text-sm text-zinc-900">{reconRemote} hrs</span>
              </div>

              {/* Subcontractors */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-zinc-700">Subcontractors</span>
                <span className="font-mono text-sm text-zinc-900">{subcontractors} hrs</span>
              </div>
            </div>

            {/* Spacer to push totals to bottom */}
            <div className="flex-1 min-h-[20px]" />
            
            <div>
              {/* Divider */}
              <div className="border-t border-zinc-300 my-2" />

              {/* Week Total */}
              <div className="flex justify-between items-center py-1 font-bold">
                <span className="text-sm text-zinc-900">Week Total</span>
                <span className="font-mono text-sm text-zinc-900">{weekTotal} hrs</span>
              </div>

              {/* Job to Date */}
              <div className="flex justify-between items-center py-1 font-bold">
                <span className="text-sm text-zinc-900">Job to Date</span>
                <span className="font-mono text-sm text-zinc-900">{jobToDate.toLocaleString()} hrs</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Box */}
          <div className="bg-white border-2 border-zinc-400 rounded p-4 flex-shrink-0">
            <h3 className="text-[10px] font-bold mb-3 uppercase text-zinc-600 tracking-wider">
              Key Metrics
            </h3>
            <div className="space-y-2">
              {/* % Complete */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-600 uppercase tracking-wide">% Complete</span>
                <span className="font-mono text-base font-bold text-brand-primary">
                  {overview.kpis?.percentComplete || 0}%
                </span>
              </div>

              {/* Weather Lost */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-600 uppercase tracking-wide">Weather Lost</span>
                <span className={`font-mono text-base font-bold ${daysLost > 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                  {daysLost > 0 ? `${daysLost.toFixed(1)} days` : '0 days'}
                </span>
              </div>

              {/* Safety Incidents */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-600 uppercase tracking-wide">Safety Incidents</span>
                <span className={`font-mono text-base font-bold ${
                  (reportData.safety?.stats?.recordables?.week || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {reportData.safety?.stats?.recordables?.week || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
