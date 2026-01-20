import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, CloudLightning } from 'lucide-react';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function WeatherSection({ config, reportData }: Props) {
  const weather = reportData.weather || [];
  if (weather.length === 0) return null;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain size={16} className="text-blue-500" />;
    if (c.includes('snow')) return <CloudSnow size={16} className="text-zinc-400" />;
    if (c.includes('storm')) return <CloudLightning size={16} className="text-purple-500" />;
    if (c.includes('cloud')) return <Cloud size={16} className="text-zinc-400" />;
    if (c.includes('wind')) return <Wind size={16} className="text-zinc-400" />;
    return <Sun size={16} className="text-amber-500" />;
  };

  return (
    <SectionWrapper config={config} title="Weekly Weather Log">
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-zinc-500 w-1/4">Date</th>
              <th className="px-4 py-2 text-left font-bold text-zinc-500">Condition</th>
              <th className="px-4 py-2 text-center font-bold text-zinc-500">Temp (H/L)</th>
              <th className="px-4 py-2 text-right font-bold text-zinc-500">Lost Hrs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {weather.map((day: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                <td className="px-4 py-2 text-zinc-900 font-medium">{day.date}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.condition)}
                    <span className="text-zinc-700">{day.condition}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-center text-zinc-600">
                  {day.tempHigh}° / {day.tempLow}°
                </td>
                <td className="px-4 py-2 text-right">
                  {day.hoursLost > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                      {day.hoursLost} hrs
                    </span>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
