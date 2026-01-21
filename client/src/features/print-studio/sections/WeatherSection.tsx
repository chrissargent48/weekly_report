import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

import { PagePlacement } from '../config/printConfig.types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

export function WeatherSection({ config, reportData, placement }: Props) {
  const rawWeather = reportData.overview?.weather || [];
  
  if (rawWeather.length === 0) return null;

  // Anchor to periodStart (Monday) or calculate from weekEnding (Sunday)
  // Use UTC/String parsing to avoid specific timezone shifts
  let startDate: Date;
  
  if (reportData.periodStart) {
    // strict parse "YYYY-MM-DD" to avoid timezone issues
    const [y, m, d] = reportData.periodStart.split('-').map(Number);
    startDate = new Date(y, m - 1, d);
  } else if (reportData.weekEnding) {
    const [y, m, d] = reportData.weekEnding.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    startDate = new Date(end);
    startDate.setDate(end.getDate() - 6);
  } else {
    startDate = new Date(); // Fallback
  }

  // Generate 7 days starting from startDate
  const allWeather = Array.from({ length: 7 }).map((_, index) => {
    // Clone start date and add days
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + index);

    // Find matching data from rawWeather
    // rawWeather is typically ordered Monday (0) -> Sunday (6)
    // We map index 0 to Monday, etc.
    const data = rawWeather[index] || {};

    return {
      date: d,
      tempHigh: data.tempHigh || '-',
      tempLow: data.tempLow || '-',
      condition: data.condition || 'Sunny',
      hoursLost: Number(data.hoursLost) || 0,
      notes: data.notes
    };
  });

  // Slice Logic
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allWeather.length;
  const weather = allWeather.slice(startIdx, endIdx);
  
  // Header Logic
  const showMainHeader = placement?.renderConfig?.showHeader ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const sectionTitle = showMainHeader ? (isContinued ? "Weekly Weather (Continued)" : "Weekly Weather") : undefined;

  const getWeatherIcon = (condition: string) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('rain') || c.includes('storm')) {
      return <CloudRain size={24} className="text-blue-500" />;
    }
    if (c.includes('snow')) {
      return <CloudSnow size={24} className="text-blue-300" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud size={24} className="text-zinc-400" />;
    }
    if (c.includes('wind')) {
      return <Wind size={24} className="text-zinc-500" />;
    }
    // Default to sunny
    return <Sun size={24} className="text-amber-500" />;
  };

  const formatDate = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    return { dayName, monthDay };
  };

  // Filter days with notes
  const daysWithNotes = weather.filter((day: any) => day.notes && day.notes !== 'None' && day.notes.trim() !== '');

  return (
    <SectionWrapper config={config} title={sectionTitle}>
      {/* Horizontal Weather Strip - Use Grid to enforce fit within page width */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weather.map((day: any, index: number) => {
          const { dayName, monthDay } = formatDate(day.date);
          const hasLostHours = day.hoursLost > 0;
          
          return (
            <div
              key={index}
              className={`
                flex flex-col items-center justify-between
                rounded-lg border shadow-sm p-2
                ${hasLostHours ? 'bg-white border-red-300 ring-1 ring-red-100' : 'bg-white border-zinc-200'}
              `}
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  {dayName}
                </span>
                <span className="text-[10px] font-bold text-zinc-900">
                  {monthDay}
                </span>
              </div>

              {/* Icon */}
              <div className="my-1">
                {getWeatherIcon(day.condition)}
              </div>

              {/* Impact Badge (Above Temps) */}
              {hasLostHours && (
                 <div className="mb-1 text-center">
                   <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[8px] font-bold uppercase tracking-wide leading-none inline-block">
                     Impact
                   </span>
                 </div>
               )}

              {/* Stats */}
              <div className="w-full flex flex-col items-center mt-auto">
                 <div className="flex items-center gap-1 text-[10px] leading-tight">
                    <span className="font-bold text-zinc-900">{day.tempHigh}°</span>
                    <span className="text-zinc-400 font-light">|</span>
                    <span className="text-zinc-500">{day.tempLow}°</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather Notes Section - Only if notes exist */}
      {daysWithNotes.length > 0 && (
        <div className="mt-2 bg-zinc-50 border border-zinc-200 rounded-md p-3">
          <h4 className="text-[10px] font-bold uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-1">Weather Impacts & Notes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {daysWithNotes.map((day: any, index: number) => {
              const { dayName, monthDay } = formatDate(day.date);
              return (
                <div key={index} className="flex gap-3 text-sm items-start">
                  <div className="w-14 flex-shrink-0 font-mono text-xs font-bold text-zinc-500 pt-0.5">
                    {dayName} {monthDay}
                  </div>
                  <div className="flex-1 text-zinc-700 text-xs leading-relaxed">
                    {day.notes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
