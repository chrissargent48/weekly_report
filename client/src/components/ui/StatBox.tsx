import React from 'react';

interface StatBoxProps {
    /** Stat label (e.g., "% Complete") */
    label: string;
    /** Stat value to display */
    value: string | number;
    /** If true, uses highlight/warning styling */
    highlight?: boolean;
}

/**
 * Reusable StatBox for displaying KPI metrics.
 * Used primarily in PrintView and Dashboard.
 */
export function StatBox({ label, value, highlight = false }: StatBoxProps) {
    return (
        <div className={`p-2 border rounded flex flex-col items-center justify-center ${highlight ? 'bg-brand-accent/10 border-brand-accent' : 'bg-white border-zinc-200'}`}>
            <div className="text-[10px] uppercase font-bold text-zinc-500">{label}</div>
            <div className={`text-lg font-bold ${highlight ? 'text-brand-surface-dark' : 'text-brand-primary'}`}>{value}</div>
        </div>
    );
}
