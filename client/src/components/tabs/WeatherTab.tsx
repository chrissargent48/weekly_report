import React, { useState } from 'react';
import { WeeklyReport, WeatherDay, ProjectConfig } from '../../types';
import { CloudRain, Sun, Cloud, Wind, RefreshCw, MapPin } from 'lucide-react';
import { api } from '../../api';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
    projectConfig: ProjectConfig;
}

export function WeatherTab({ report, onUpdate, projectConfig }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchedAddress, setMatchedAddress] = useState<string | null>(null);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Ensure we have weather entries for each day
    // This logic might need to ensure consistency with week ending date logic
    // For now, we assume report.overview.weather has 7 entries or we pad it.

    const updateDay = (index: number, field: keyof WeatherDay, value: any) => {
        const newWeather = [...(report.overview.weather || [])];
        if (!newWeather[index]) {
            newWeather[index] = { date: '', condition: 'Sunny', tempLow: 0, tempHigh: 0, wind: 0, hoursLost: 0, notes: '' };
        }
        newWeather[index] = { ...newWeather[index], [field]: value };
        
        onUpdate({ 
            ...report, 
            overview: { 
                ...report.overview, 
                weather: newWeather 
            } 
        });
    };

    const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        setMatchedAddress(null);
        
        const address = projectConfig.identity.location;
        if (!address) {
            setError("No site address set. Go to Project Setup to add the location.");
            setLoading(false);
            return;
        }
        
        if (!report.periodStart) {
            setError("No period start date set.");
            setLoading(false);
            return;
        }
        
        try {
            const result = await api.fetchWeather(address, report.periodStart, report.weekEnding);
            
            if (result.error) {
                setError(result.error);
            } else if (result.weather) {
                setMatchedAddress(result.location?.matchedAddress || null);
                
                // Preserve hours lost and notes from existing entries
                const existingWeather = report.overview.weather || [];
                const mergedWeather = result.weather.map((w, i) => ({
                    ...w,
                    hoursLost: existingWeather[i]?.hoursLost || 0,
                    notes: existingWeather[i]?.notes || ''
                }));
                
                onUpdate({
                    ...report,
                    overview: {
                        ...report.overview,
                        weather: mergedWeather
                    }
                });
            }
        } catch (e) {
            setError("Failed to fetch weather. Check server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                    <CloudRain className="text-brand-primary" />
                    Weather Log
                </h2>
                
                <div className="flex items-center gap-3">
                    {matchedAddress && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <MapPin size={12} /> {matchedAddress}
                        </span>
                    )}
                    <button 
                        onClick={fetchWeather} 
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-primary/90 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Fetching...' : 'Auto-Fetch Weather'}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 w-32">Day</th>
                            <th className="px-4 py-3 text-center w-28">Low (°F)</th>
                            <th className="px-4 py-3 text-center w-28">High (°F)</th>
                            <th className="px-4 py-3 text-center w-40">Condition</th>
                            <th className="px-4 py-3">Rain/Wind Note</th>
                            <th className="px-4 py-3 text-center w-28">Hours Lost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {days.map((day, i) => {
                            const entry = report.overview.weather?.[i] || { date: '', tempLow: 0, tempHigh: 0, condition: 'Sunny', notes: '', hoursLost: 0 };
                            return (
                                <tr key={day} className="hover:bg-zinc-50/50 transition">
                                    <td className="px-4 py-2 font-bold text-zinc-700 text-xs">{day}</td>
                                    <td className="px-4 py-2 text-center">
                                        <input 
                                            type="number" 
                                            className="form-input w-20 text-center font-mono text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white h-8"
                                            value={entry.tempLow}
                                            onChange={e => updateDay(i, 'tempLow', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input 
                                            type="number" 
                                            className="form-input w-20 text-center font-mono text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white h-8"
                                            value={entry.tempHigh}
                                            onChange={e => updateDay(i, 'tempHigh', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <select 
                                            className="form-input w-full text-center text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white h-8 cursor-pointer"
                                            value={entry.condition}
                                            onChange={e => updateDay(i, 'condition', e.target.value)}
                                        >
                                            <option>Sunny</option>
                                            <option>Cloudy</option>
                                            <option>Partly Cloudy</option>
                                            <option>Rain</option>
                                            <option>Snow</option>
                                            <option>Windy</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text" 
                                            className="form-input w-full text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white h-8 placeholder-zinc-300"
                                            placeholder="Add notes..."
                                            value={entry.notes || ''}
                                            onChange={e => updateDay(i, 'notes', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="relative inline-block w-20">
                                            <input 
                                                type="number" 
                                                className={`form-input w-full text-center font-mono font-bold text-xs h-8 ${entry.hoursLost > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-transparent border-transparent text-zinc-400 hover:border-zinc-300 focus:bg-white'}`}
                                                value={entry.hoursLost}
                                                onChange={e => updateDay(i, 'hoursLost', Number(e.target.value))}
                                            />
                                            {entry.hoursLost > 0 && (
                                                <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
