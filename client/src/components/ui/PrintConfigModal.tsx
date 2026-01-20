import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Printer, Check, FileDown, Loader2 } from 'lucide-react';
import { PrintOptions, PrintSectionConfig } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    onExport: (options: PrintOptions) => Promise<void>;
}

// Initial Default Sections
const DEFAULT_SECTIONS: PrintSectionConfig[] = [
    { id: 'overview', label: 'Executive Summary & KPIs', included: true },
    { id: 'weather', label: 'Weather Impact Log', included: true },
    { id: 'progress', label: 'Progress Tracking (Bid Items)', included: true },
    { id: 'lookahead', label: '3-Week Look Ahead', included: true },
    { id: 'manpower', label: 'Manpower & Equipment', included: true },
    { id: 'safety', label: 'Safety Stats & Narrative', included: true },
    { id: 'financials', label: 'Financial Summary', included: true },
    { id: 'photos', label: 'Photographic Documentation', included: true }
];

function SortableSectionRow({ 
    section, 
    onToggle 
}: { 
    section: PrintSectionConfig, 
    onToggle: (id: string) => void 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg group select-none ${isDragging ? 'shadow-lg bg-zinc-100' : 'hover:bg-white'}`}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing p-1">
                <GripVertical size={16} />
            </div>

            {/* Checkbox/Toggle */}
            <div 
                onClick={() => onToggle(section.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition cursor-pointer ${section.included ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-zinc-300'}`}
            >
                {section.included && <Check size={14} strokeWidth={3} />}
            </div>

            {/* Label */}
            <span 
                onClick={() => onToggle(section.id)}
                className={`flex-1 text-sm font-medium cursor-pointer ${section.included ? 'text-zinc-900' : 'text-zinc-500'}`}
            >
                {section.label}
            </span>
        </div>
    );
}

export function PrintConfigModal({ open, onClose, onExport }: Props) {
    const [loading, setLoading] = useState(false);
    const [sections, setSections] = useState<PrintSectionConfig[]>(DEFAULT_SECTIONS);
    
    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleSection = (id: string) => {
        setSections(prev => prev.map(s => 
            s.id === id ? { ...s, included: !s.included } : s
        ));
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            // Send the ordered sections configuration
            await onExport({ sections });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={() => !loading && onClose()} title="Export Report PDF">
            <div className="space-y-6">
                <div className="bg-brand-surface-light/30 border border-brand-primary/10 rounded-lg p-4 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm text-brand-primary">
                        <Printer size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-surface-dark mb-1">Configure Layout</h3>
                        <p className="text-xs text-zinc-500">Drag to reorder sections. Check to include in the generated PDF.</p>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2">
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={sections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid grid-cols-1 gap-2">
                                {sections.map(section => (
                                    <SortableSectionRow 
                                        key={section.id} 
                                        section={section} 
                                        onToggle={toggleSection} 
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={loading}
                        className="flex-[2] btn-primary py-2.5 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Generating PDF...
                            </>
                        ) : (
                            <>
                                <FileDown size={16} /> Generate & Download
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
