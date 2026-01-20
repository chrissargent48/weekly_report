import React from 'react';
import { WeeklyReport } from '../../../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Activity, AlertOctagon } from 'lucide-react';

interface Props {
    report: WeeklyReport;
}

export function SafetyWidget({ report }: Props) {
    const stats = report.safety.stats;
    const incidents = stats.recordables.week + stats.nearMisses.week + stats.lostTime.week + stats.firstAids.week;
    
    // Calculate total hours this week
    const safeManHours = report.resources.manpower.reduce((sum, m) => {
        const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
        return sum + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
    }, 0);

    // Extract first line of narrative
    const safetyTopic = report.safety.narrative 
        ? report.safety.narrative.split('\n')[0].substring(0, 100) + (report.safety.narrative.length > 100 ? '...' : '')
        : "General Site Safety Awareness";

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between h-full relative overflow-hidden group">
             {/* Header */}
             <div className="flex justify-between items-start mb-4 z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${incidents > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {incidents > 0 ? <ShieldAlert size={24} /> : <CheckCircle size={24} />}
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold text-zinc-900">{safeManHours.toLocaleString()}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Safe Man-Hours</div>
                    </div>
                </div>
            </div>

            {/* Breakdown Stats */}
            <div className="grid grid-cols-3 gap-2 z-10">
                <div className="bg-zinc-50 rounded-lg p-2 text-center border border-zinc-100">
                    <div className={`text-lg font-bold ${stats.nearMisses.week > 0 ? 'text-amber-500' : 'text-zinc-700'}`}>{stats.nearMisses.week}</div>
                    <div className="text-[9px] text-zinc-400 uppercase font-medium">Near Miss</div>
                </div>
                <div className="bg-zinc-50 rounded-lg p-2 text-center border border-zinc-100">
                    <div className={`text-lg font-bold ${stats.firstAids.week > 0 ? 'text-orange-500' : 'text-zinc-700'}`}>{stats.firstAids.week}</div>
                    <div className="text-[9px] text-zinc-400 uppercase font-medium">First Aid</div>
                </div>
                <div className="bg-zinc-50 rounded-lg p-2 text-center border border-zinc-100">
                    <div className={`text-lg font-bold ${stats.recordables.week > 0 ? 'text-red-600' : 'text-zinc-700'}`}>{stats.recordables.week}</div>
                    <div className="text-[9px] text-zinc-400 uppercase font-medium">Recordable</div>
                </div>
            </div>

            {/* Topic */}
            <div className="mt-5 pt-4 border-t border-zinc-100 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                     <Activity size={12} className="text-brand-primary"/>
                     <span className="text-[10px] font-bold text-brand-primary uppercase">Weekly Topic</span>
                </div>
                <div className="text-xs font-medium text-zinc-600 line-clamp-2 leading-relaxed">
                    "{safetyTopic}"
                </div>
            </div>

            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 transition-transform duration-700 group-hover:scale-110 ${incidents > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
        </div>
    );
}
