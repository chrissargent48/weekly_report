import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface CreateReportCardProps {
    onCreate: (date: string) => void;
}

export function CreateReportCard({ onCreate }: CreateReportCardProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Auto-calculate End Date (Start + 6 days) when Start Date changes
    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [startDate]);

    return (
        <div className="bg-white text-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 relative overflow-hidden group h-full flex flex-col justify-between">
            {/* Background Pattern/Gradient */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <CalendarDaysIcon className="w-32 h-32 -mr-8 -mt-8 rotate-12 text-brand-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                        <CalendarDaysIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight text-zinc-900">New Weekly Report</h3>
                        <p className="text-xs text-zinc-500">Select week start date to begin</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Date</label>
                            <input 
                                type="date"
                                className="form-input text-zinc-700 font-medium"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">End Date</label>
                            <input 
                                type="date"
                                className="form-input text-zinc-500 bg-zinc-50"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => onCreate(endDate)}
                        disabled={!startDate || !endDate}
                        className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-lg shadow-sm hover:brightness-95 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <span>Initialize Report</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                    
                    {startDate && endDate && (
                        <div className="text-center">
                            <span className="text-[10px] font-mono text-zinc-400">
                                Period: {startDate} — {endDate}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
