import React from 'react';

interface InputProps {
    /** Field label (displayed above the input) */
    label: string;
    /** Current value */
    value: string | number;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** HTML input type (text, number, date, etc.) */
    type?: string;
    /** If true, renders a minimal input without label/wrapper */
    bare?: boolean;
    /** Placeholder text */
    placeholder?: string;
}

/**
 * Reusable Input component with label styling.
 * Use `bare` prop for inline/minimal inputs without labels.
 */
export function Input({ label, value, onChange, type = 'text', bare = false, placeholder }: InputProps) {
    if (bare) {
        return (
            <input 
                type={type} 
                className="w-full bg-transparent border-none p-0 text-2xl font-bold text-zinc-900 focus:ring-0" 
                value={value} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        );
    }

    return (
        <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">{label}</label>
            <input 
                type={type} 
                className="w-full p-2 border border-zinc-300 rounded font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" 
                value={value} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
