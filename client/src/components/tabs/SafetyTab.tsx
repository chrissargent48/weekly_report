import React from 'react';
import { WeeklyReport, SafetyObservation } from '../../types';
import { Shield, Trash2, Plus } from 'lucide-react';
import { TabHeader } from '../ui';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
}

export function SafetyTab({ report, onUpdate }: Props) {
    const safety = report.safety;
    const stats = safety.stats || {
        nearMisses: { week: 0, ytd: 0 },
        firstAids: { week: 0, ytd: 0 },
        recordables: { week: 0, ytd: 0 },
        lostTime: { week: 0, ytd: 0 },
        stopWorks: { week: 0, ytd: 0 },
        hofs: { week: 0, ytd: 0 },
        safetyAudits: { week: 0, ytd: 0 }
    };
    const observations = safety.observations || [];

    const updateSafety = (field: string, value: any) => {
        onUpdate({
            ...report,
            safety: { ...safety, [field]: value }
        });
    };

    const updateStat = (statKey: keyof typeof stats, period: 'week' | 'ytd', value: number) => {
        const newStats = {
            ...stats,
            [statKey]: { ...stats[statKey], [period]: value }
        };
        updateSafety('stats', newStats);
    };

    const addObservation = () => {
        const newObs: SafetyObservation = {
            id: `obs-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Corrective',
            description: '',
            actionTaken: ''
        };
        updateSafety('observations', [...observations, newObs]);
    };

    const updateObservation = (id: string, field: keyof SafetyObservation, value: any) => {
        const updated = observations.map(o => o.id === id ? { ...o, [field]: value } : o);
        updateSafety('observations', updated);
    };

    const removeObservation = (id: string) => {
        updateSafety('observations', observations.filter(o => o.id !== id));
    };

    // Stats row definitions matching the screenshot
    const statRows: { key: keyof typeof stats; label: string }[] = [
        { key: 'nearMisses', label: 'Near Misses' },
        { key: 'firstAids', label: 'First Aids' },
        { key: 'recordables', label: 'Recordable' },
        { key: 'lostTime', label: 'Lost Time Accident or Restricted Duty' },
        { key: 'stopWorks', label: 'Total Number of Stop Works' },
        { key: 'hofs', label: "Total Number of HOF's" },
        { key: 'safetyAudits', label: 'Safety Audits (Weekly SSO, WSP, and CAMC)' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <TabHeader 
                icon={<Shield />} 
                title="Safety Management" 
            />

            {/* Weekly Safety Topic */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs">📋</span>
                        Weekly Safety Topic
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Topic</label>
                        <input 
                            type="text"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-base font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Working at Heights - Fall Protection"
                            value={safety.weeklyTopic || ''}
                            onChange={e => updateSafety('weeklyTopic', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Discussion Notes</label>
                        <textarea 
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={2}
                            placeholder="Key points covered, attendance, etc."
                            value={safety.weeklyTopicNotes || ''}
                            onChange={e => updateSafety('weeklyTopicNotes', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Safety Statistics Table */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                    <h3 className="font-bold text-zinc-800">Safety Statistics</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-bold text-zinc-600"></th>
                            <th className="px-4 py-3 text-center font-bold text-zinc-600 w-32">Current Week</th>
                            <th className="px-4 py-3 text-center font-bold text-zinc-600 w-32">Year to Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {statRows.map(row => (
                            <tr key={row.key} className="hover:bg-zinc-50/50">
                                <td className="px-6 py-3 font-medium text-zinc-700">{row.label}</td>
                                <td className="px-4 py-3 text-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        className="w-16 text-center bg-zinc-50 border border-zinc-200 rounded px-2 py-1 font-mono focus:ring-1 focus:ring-brand-primary"
                                        value={stats[row.key]?.week || 0}
                                        onChange={e => updateStat(row.key, 'week', Number(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        className="w-16 text-center bg-zinc-50 border border-zinc-200 rounded px-2 py-1 font-mono focus:ring-1 focus:ring-brand-primary"
                                        value={stats[row.key]?.ytd || 0}
                                        onChange={e => updateStat(row.key, 'ytd', Number(e.target.value) || 0)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Observations Log */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-800">Observations Log</h3>
                    <button 
                        onClick={addObservation}
                        className="flex items-center gap-1 text-xs font-bold bg-white border border-zinc-300 px-3 py-1.5 rounded hover:bg-zinc-50 transition shadow-sm"
                    >
                        <Plus size={14} /> Add Observation
                    </button>
                </div>
                
                {observations.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-sm">
                        No observations logged this week. Click "Add Observation" to record safety observations.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 w-28">Date</th>
                                <th className="px-4 py-3 w-28">Type</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 w-48">Action Taken</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {observations.map(obs => (
                                <tr key={obs.id} className="hover:bg-zinc-50/50 group">
                                    <td className="px-4 py-2">
                                        <input 
                                            type="date"
                                            className="bg-transparent border-none p-0 text-xs focus:ring-0"
                                            value={obs.date}
                                            onChange={e => updateObservation(obs.id, 'date', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select 
                                            className={`text-xs font-bold rounded px-2 py-1 border-none ${
                                                obs.type === 'Positive' ? 'bg-green-100 text-green-700' :
                                                obs.type === 'Corrective' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}
                                            value={obs.type}
                                            onChange={e => updateObservation(obs.id, 'type', e.target.value)}
                                        >
                                            <option value="Positive">Positive</option>
                                            <option value="Corrective">Corrective</option>
                                            <option value="Near Miss">Near Miss</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder-zinc-300"
                                            placeholder="Describe the observation..."
                                            value={obs.description}
                                            onChange={e => updateObservation(obs.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 placeholder-zinc-300 text-zinc-600"
                                            placeholder="Action taken..."
                                            value={obs.actionTaken || ''}
                                            onChange={e => updateObservation(obs.id, 'actionTaken', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <button 
                                            onClick={() => removeObservation(obs.id)}
                                            className="text-zinc-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Safety Narrative */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                    <h3 className="font-bold text-zinc-800">Safety Action Items & Narrative</h3>
                </div>
                <div className="p-6">
                    <textarea 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        rows={4}
                        placeholder="Additional safety notes, upcoming focus areas, action items from safety meetings..."
                        value={safety.narrative || ''}
                        onChange={e => updateSafety('narrative', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
