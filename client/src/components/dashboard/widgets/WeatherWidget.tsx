import React, { useMemo } from 'react';
import { WeeklyReport } from '../../../types';
import { CloudRain, Sun, Cloud, CloudSnow, CloudLightning, Wind } from 'lucide-react';

interface Props {
    report: WeeklyReport;
}

export function WeatherWidget({ report }: Props) {
    // Generate a status for each day based on weather data
    const forecast = useMemo(() => {
        // Default 7 days
        const days = Array(7).fill(null);
        
        // If we have weather entries, map them. 
        if (report?.overview?.weather && report.overview.weather.length > 0) {
            // Sort by date
            const sorted = [...report.overview.weather].sort((a,b) => a.date.localeCompare(b.date));
            
            return sorted.slice(0, 7).map(w => {
                const dateObj = new Date(w.date + 'T12:00:00'); // Clean date parsing
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                
                return {
                    day: dayName,
                    tempHigh: w.tempHigh,
                    tempLow: w.tempLow,
                    condition: w.condition,
                    hoursLost: w.hoursLost,
                    // Any lost hours = Red status to match "Delay" legend
                    status: w.hoursLost > 0 ? 'lost' : 'workable',
                };
            });
        }
        
        // Fallback if no weather data logged yet
        return days.map((_, i) => ({
             day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
             tempHigh: '--',
             tempLow: '--',
             condition: 'Sunny',
             hoursLost: 0,
             status: 'workable'
        }));

    }, [report]);

    const getWeatherIcon = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes('rain')) return <CloudRain size={24} className="text-blue-400" />;
        if (c.includes('snow')) return <CloudSnow size={24} className="text-zinc-400" />;
        if (c.includes('storm') || c.includes('lightning')) return <CloudLightning size={24} className="text-purple-400" />;
        if (c.includes('cloud') || c.includes('overcast')) return <Cloud size={24} className="text-zinc-400" />;
        if (c.includes('wind')) return <Wind size={24} className="text-zinc-400" />;
        return <Sun size={24} className="text-amber-400" />;
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex flex-col h-full bg-gradient-to-b from-zinc-800 to-zinc-900 text-white overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 z-10">
                 <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Weekly Weather</h3>
                    <div className="text-sm font-medium text-zinc-300 mt-0.5">Workability Map</div>
                </div>
                {/* Legend */}
                <div className="flex gap-2 text-[9px] text-zinc-400">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Work</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"/> Delay</span>
                </div>
            </div>

            {/* Daily Strip */}
            <div className="flex justify-between items-center gap-2 z-10 flex-1">
                {forecast.map((day, i) => (
                    <div key={i} className="flex flex-col items-center justify-between h-full py-1 min-w-[32px] relative group">
                        <span className="text-xs font-medium text-zinc-300">{day.day}</span>
                        
                        <div className="my-2 relative">
                            {getWeatherIcon(day.condition)}
                            {/* Hours Lost Overlay */}
                            {day.hoursLost > 0 && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-300 whitespace-nowrap bg-zinc-900/80 px-1 rounded backdrop-blur-sm border border-red-500/30">
                                    {day.hoursLost}h
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-bold text-white">{day.tempHigh}°</span>
                            <span className="text-[10px] text-zinc-500">{day.tempLow}°</span>
                        </div>
                        
                        {/* Status Dot */}
                        <div className={`mt-2 w-1.5 h-1.5 rounded-full shadow-sm transition-colors
                            ${day.status === 'lost' ? 'bg-red-400 shadow-red-400/50' : 'bg-emerald-400 shadow-emerald-400/50'}
                        `} />
                    </div>
                ))}
            </div>
            
            {/* Decorative Overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none" />
        </div>
    );
}
