import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ReportHistoryTableProps {
    reports: string[]; // List of Week Ending dates (IDs)
    onOpen: (date: string) => void;
}

const ITEMS_PER_PAGE = 8;

export function ReportHistoryTable({ reports, onOpen }: ReportHistoryTableProps) {
    const [page, setPage] = useState(1);

    // Sort reports descending by date (newest first)
    const sortedReports = [...reports].sort().reverse();
    const totalPages = Math.ceil(sortedReports.length / ITEMS_PER_PAGE);
    
    // Pagination Logic
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedReports = sortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Helper to calculate Period Start
    const getPeriodStart = (weekEnding: string) => {
        const end = new Date(weekEnding);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return start.toISOString().split('T')[0];
    };

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-zinc-400">
                No reports found. Create your first report above.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="font-bold text-zinc-900">Report History</h3>
                <span className="text-xs font-medium text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded-full shadow-sm">
                    {reports.length} Records
                </span>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-3 w-1/4">Period</th>
                            <th className="px-6 py-3 w-1/4">Week Ending</th>
                            <th className="px-6 py-3 w-1/4">Status</th>
                            <th className="px-6 py-3 w-1/4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {paginatedReports.map((date) => (
                            <tr 
                                key={date} 
                                className="group hover:bg-brand-surface-light/30 transition cursor-pointer"
                                onClick={() => onOpen(date)}
                            >
                                <td className="px-6 py-4 text-zinc-500 text-xs font-medium">
                                    {getPeriodStart(date)} — {date}
                                </td>
                                <td className="px-6 py-4 font-bold text-zinc-900 group-hover:text-brand-primary transition">
                                    {date}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wide">
                                        Draft
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-zinc-400 hover:text-brand-primary p-1 rounded-full hover:bg-brand-primary/10 transition opacity-0 group-hover:opacity-100">
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                    <span className="text-xs text-zinc-400 font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-zinc-600"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-zinc-600"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
