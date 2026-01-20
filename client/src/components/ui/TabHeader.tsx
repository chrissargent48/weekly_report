import React from 'react';
import { Plus } from 'lucide-react';

interface TabHeaderProps {
    /** Icon component to display */
    icon: React.ReactNode;
    /** Tab title */
    title: string;
    /** Optional "Add" button callback */
    onAdd?: () => void;
    /** Label for the add button */
    addLabel?: string;
}

/**
 * Reusable header for tab content sections.
 * Displays an icon, title, and optional "Add" button.
 */
export function TabHeader({ icon, title, onAdd, addLabel = 'Add' }: TabHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                <span className="text-brand-primary">{icon}</span>
                {title}
            </h2>
            {onAdd && (
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white text-sm font-bold rounded hover:bg-brand-primary/90 transition"
                >
                    <Plus size={16} /> {addLabel}
                </button>
            )}
        </div>
    );
}
