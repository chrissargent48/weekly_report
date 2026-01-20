import React from 'react';

interface BadgeProps {
    /** Status text to display */
    status: string;
}

/**
 * Reusable Badge component for status indicators.
 * Automatically colors based on common status values.
 */
export function Badge({ status }: BadgeProps) {
    const colorClass = 
        status === 'Active' ? 'bg-green-100 text-green-800' : 
        status === 'Down' ? 'bg-red-100 text-red-800' : 
        status === 'Open' ? 'bg-yellow-100 text-yellow-700' :
        status === 'Closed' ? 'bg-green-100 text-green-700' :
        status === 'Blocked' ? 'bg-red-100 text-red-700' :
        'bg-zinc-100 text-zinc-800';

    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${colorClass}`}>
            {status}
        </span>
    );
}
