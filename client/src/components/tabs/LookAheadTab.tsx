import React, { useMemo, useState } from 'react';
import { WeeklyReport, LookAheadEntry, MasterTask, ProjectBaselines } from '../../types';
import { Calendar, Trash2, Check, AlertTriangle, CheckCircle, Clock, Plus, Search } from 'lucide-react';
import { TabHeader, Modal } from '../ui';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
    baselines?: ProjectBaselines | null;
}

export function LookAheadTab({ report, onUpdate, baselines }: Props) {
    const lookAheadItems = report.progress.lookAheadItems || [];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Parse various date formats helper
    function parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return new Date(dateStr + 'T00:00:00');
        }
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
        if (match) {
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            const year = 2000 + parseInt(match[3]);
            return new Date(year, month, day);
        }
        return null;
    }

    // Determine tasks to show: (InRange + Manually Included)
    const visibleScheduleTasks = useMemo(() => {
        if (!baselines?.schedule) return [];
        
        const today = new Date();
        const threeWeeksOut = new Date(today);
        threeWeeksOut.setDate(threeWeeksOut.getDate() + 21);
        
        // 1. Identify tasks natively in range
        const inRangeTasks = baselines.schedule.filter(task => {
            if (!task.baselineStart) return false;
            const startDate = parseDate(task.baselineStart);
            if (!startDate) return false;
            return startDate >= today && startDate <= threeWeeksOut;
        });

        // 2. Identify tasks manually forced into view
        const forcedTaskIds = lookAheadItems
            .filter(item => item.type === 'schedule' && item.included)
            .map(item => item.taskId);

        const forcedTasks = baselines.schedule.filter(task => 
            forcedTaskIds.includes(task.id) && 
            !inRangeTasks.find(t => t.id === task.id)
        );

        // Merge and Sort by start date
        return [...inRangeTasks, ...forcedTasks].sort((a, b) => {
            const dateA = parseDate(a.baselineStart || '')?.getTime() || 0;
            const dateB = parseDate(b.baselineStart || '')?.getTime() || 0;
            return dateA - dateB;
        });

    }, [baselines?.schedule, lookAheadItems]);
    
    // Remaining tasks for the Picker (All - Visible)
    const availableTasks = useMemo(() => {
        if (!baselines?.schedule) return [];
        const visibleIds = visibleScheduleTasks.map(t => t.id);
        return baselines.schedule.filter(t => !visibleIds.includes(t.id));
    }, [baselines?.schedule, visibleScheduleTasks]);

    // Filtered tasks for search
    const filteredPickerTasks = useMemo(() => {
        if (!searchTerm) return availableTasks;
        const lower = searchTerm.toLowerCase();
        return availableTasks.filter(t => 
            t.name.toLowerCase().includes(lower) || 
            t.wbs?.toLowerCase().includes(lower)
        );
    }, [availableTasks, searchTerm]);
    
    function formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '--';
        const d = parseDate(dateStr);
        if (!d) return dateStr;
        return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
    }
    
    function getVariance(baseline: string | undefined, forecast: string | undefined): { days: number; status: 'ahead' | 'on-time' | 'behind' } | null {
        if (!baseline || !forecast) return null;
        const baseDate = parseDate(baseline);
        const foreDate = parseDate(forecast);
        if (!baseDate || !foreDate) return null;
        
        const diffMs = foreDate.getTime() - baseDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { days: Math.abs(diffDays), status: 'ahead' };
        if (diffDays > 0) return { days: diffDays, status: 'behind' };
        return { days: 0, status: 'on-time' };
    }
    
    function toggleTaskInclusion(taskId: string, task: MasterTask) {
        const existing = lookAheadItems.find(i => i.taskId === taskId);
        
        if (existing) {
            const updated = lookAheadItems.map(i => 
                i.taskId === taskId ? { ...i, included: !i.included } : i
            );
            updateLookAhead(updated);
        } else {
            const newEntry: LookAheadEntry = {
                id: `la-${Date.now()}`,
                type: 'schedule',
                taskId: task.id,
                wbs: task.wbs,
                description: task.name,
                baselineStart: task.baselineStart,
                baselineFinish: task.baselineFinish,
                forecastStart: task.baselineStart,
                forecastFinish: task.baselineFinish,
                included: true
            };
            updateLookAhead([...lookAheadItems, newEntry]);
        }
    }
    
    function updateForecastDate(taskId: string, field: 'forecastStart' | 'forecastFinish', value: string) {
        const updated = lookAheadItems.map(i => 
            i.taskId === taskId ? { ...i, [field]: value } : i
        );
        updateLookAhead(updated);
    }
    
    function updateLookAhead(items: LookAheadEntry[]) {
        onUpdate({
            ...report,
            progress: { ...report.progress, lookAheadItems: items }
        });
    }
    
    function addCustomItem() {
        const newEntry: LookAheadEntry = {
            id: `la-custom-${Date.now()}`,
            type: 'custom',
            description: '',
            included: true
        };
        updateLookAhead([...lookAheadItems, newEntry]);
    }
    
    function updateCustomItem(id: string, description: string) {
        const updated = lookAheadItems.map(i => 
            i.id === id ? { ...i, description } : i
        );
        updateLookAhead(updated);
    }
    
    function removeItem(id: string) {
        updateLookAhead(lookAheadItems.filter(i => i.id !== id));
    }
    
    const varianceSummary = useMemo(() => {
        const includedItems = lookAheadItems.filter(i => i.included && i.type === 'schedule');
        let ahead = 0, onTime = 0, behind = 0;
        
        includedItems.forEach(item => {
            const v = getVariance(item.baselineFinish, item.forecastFinish);
            if (v?.status === 'ahead') ahead++;
            else if (v?.status === 'behind') behind++;
            else onTime++;
        });
        
        return { ahead, onTime, behind, total: includedItems.length };
    }, [lookAheadItems]);
    
    const customLookAheadItems = lookAheadItems.filter(i => i.type === 'custom');

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <TabHeader 
                icon={<Calendar />} 
                title="3-Week Look Ahead" 
                onAdd={() => setIsAddModalOpen(true)}
                addLabel="Add Activity" 
            />

            {/* Schedule-Based Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-zinc-800">Scheduled Activities</h3>
                        <span className="text-xs text-zinc-500">Auto-filters next 21 days + Manually added items</span>
                    </div>
                </div>
                
                {!baselines?.schedule || visibleScheduleTasks.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-zinc-400 mb-4">
                            {!baselines?.schedule 
                                ? "No schedule imported yet."
                                : "No tasks in the next 3 weeks. Use 'Add Activity' to pull in future tasks."
                            }
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {visibleScheduleTasks.map(task => {
                            const lookAheadItem = lookAheadItems.find(i => i.taskId === task.id);
                            const isIncluded = lookAheadItem?.included ?? false;
                            const variance = lookAheadItem 
                                ? getVariance(lookAheadItem.baselineFinish, lookAheadItem.forecastFinish)
                                : null;
                            
                            return (
                                <div key={task.id} className={`p-4 ${isIncluded ? 'bg-white' : 'bg-zinc-50/50'}`}>
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button 
                                            onClick={() => toggleTaskInclusion(task.id, task)}
                                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                                isIncluded 
                                                    ? 'bg-brand-primary border-brand-primary text-white' 
                                                    : 'border-zinc-300 hover:border-zinc-400'
                                            }`}
                                        >
                                            {isIncluded && <Check size={14} />}
                                        </button>
                                        
                                        {/* Task Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-zinc-400">{task.wbs}</span>
                                                <span className="font-medium text-zinc-800">{task.name}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                                <span>Baseline: {formatDate(task.baselineStart)} → {formatDate(task.baselineFinish)}</span>
                                                {task.baselineDuration && (
                                                    <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded">{task.baselineDuration} days</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Forecast Dates (only if included) */}
                                        {isIncluded && lookAheadItem && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-zinc-400 uppercase mb-1">Start</div>
                                                    <input 
                                                        type="date"
                                                        className="text-xs border border-zinc-200 rounded px-2 py-1 w-28 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                                        value={lookAheadItem.forecastStart || ''}
                                                        onChange={e => updateForecastDate(task.id, 'forecastStart', e.target.value)}
                                                    />
                                                </div>
                                                <span className="text-zinc-300">→</span>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-zinc-400 uppercase mb-1">Finish</div>
                                                    <input 
                                                        type="date"
                                                        className="text-xs border border-zinc-200 rounded px-2 py-1 w-28 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                                        value={lookAheadItem.forecastFinish || ''}
                                                        onChange={e => updateForecastDate(task.id, 'forecastFinish', e.target.value)}
                                                    />
                                                </div>
                                                
                                                {/* Variance Badge */}
                                                {variance && (
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                                                        variance.status === 'ahead' ? 'bg-green-100 text-green-700' :
                                                        variance.status === 'behind' ? 'bg-red-100 text-red-700' :
                                                        'bg-zinc-100 text-zinc-600'
                                                    }`}>
                                                        {variance.status === 'ahead' && <span>↑ {variance.days}d ahead</span>}
                                                        {variance.status === 'behind' && <span>↓ {variance.days}d behind</span>}
                                                        {variance.status === 'on-time' && <span>✓ On time</span>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Custom Items */}
            {customLookAheadItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                        <h3 className="font-bold text-zinc-800">Custom Items</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {customLookAheadItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 group">
                                <input 
                                    type="text"
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                    placeholder="Describe upcoming activity..."
                                    value={item.description}
                                    onChange={e => updateCustomItem(item.id, e.target.value)}
                                />
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="text-zinc-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Variance Summary */}
            {varianceSummary.total > 0 && (
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white rounded-xl p-5 shadow-lg">
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-3">Variance Summary</h4>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                <AlertTriangle size={16} className="text-red-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{varianceSummary.behind}</div>
                                <div className="text-xs opacity-60">Behind</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-zinc-500/20 rounded-full flex items-center justify-center">
                                <Clock size={16} className="text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{varianceSummary.onTime}</div>
                                <div className="text-xs opacity-60">On Time</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle size={16} className="text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{varianceSummary.ahead}</div>
                                <div className="text-xs opacity-60">Ahead</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            <Modal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Activity"
            >
                <div className="space-y-6">
                    {/* Option 1: Custom */}
                    <button 
                        onClick={() => { addCustomItem(); setIsAddModalOpen(false); }}
                        className="w-full p-4 border-2 border-dashed border-zinc-300 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition flex items-center justify-center gap-2 font-bold text-zinc-500 bg-zinc-50"
                    >
                        <Plus size={20} /> Create Custom Item
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                            <span className="bg-white px-2 text-zinc-400">Or Select from Schedule</span>
                        </div>
                    </div>

                    {/* Option 2: Schedule Picker */}
                    <div>
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-2.5 text-zinc-400" size={16}/>
                            <input 
                               type="text"
                               placeholder="Search remaining tasks..." 
                               className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                               value={searchTerm}
                               onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="h-64 overflow-y-auto border border-zinc-200 rounded-lg p-1 space-y-1 bg-zinc-50/50">
                             {filteredPickerTasks.length === 0 ? (
                                <div className="p-4 text-center text-zinc-400 text-sm">
                                    {searchTerm ? 'No matching tasks found.' : 'No other tasks available.'}
                                </div>
                             ) : (
                                 filteredPickerTasks.map(task => (
                                     <button 
                                        key={task.id}
                                        onClick={() => { toggleTaskInclusion(task.id, task); setIsAddModalOpen(false); }}
                                        className="w-full text-left p-2 hover:bg-white hover:shadow-sm rounded transition flex items-center gap-2 group border border-transparent hover:border-zinc-200"
                                     >
                                        <div className="w-6 h-6 rounded bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition">
                                            <Plus size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-zinc-700 truncate">{task.name}</div>
                                            <div className="text-xs text-zinc-400 font-mono">{task.wbs} • {formatDate(task.baselineStart)}</div>
                                        </div>
                                     </button>
                                 ))
                             )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
