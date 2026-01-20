import React from 'react';

interface ModalProps {
    /** Controls visibility of the modal */
    open: boolean;
    /** Callback when modal should close (backdrop click, X button) */
    onClose: () => void;
    /** Modal title displayed in the header */
    title: string;
    /** Modal content */
    children: React.ReactNode;
}

/**
 * Reusable Modal component with backdrop, title, and close button.
 * Uses the standard brand styling.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-brand-surface-dark mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}
