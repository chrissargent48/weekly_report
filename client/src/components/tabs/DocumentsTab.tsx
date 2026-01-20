import React, { useState } from 'react';
import { WeeklyReport, RfiEntry, SubmittalEntry } from '../../types';
import { FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
}

export function DocumentsTab({ report, onUpdate }: Props) {
    const rfis = report.rfis || [];
    const submittals = report.submittals || [];
    const [view, setView] = useState<'rfi' | 'submittal'>('rfi');

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- DRAG HANDLERS ---
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        if (view === 'rfi') {
            const oldIndex = rfis.findIndex(i => i.id === active.id);
            const newIndex = rfis.findIndex(i => i.id === over.id);
            onUpdate({ ...report, rfis: arrayMove(rfis, oldIndex, newIndex) });
        } else {
            const oldIndex = submittals.findIndex(i => i.id === active.id);
            const newIndex = submittals.findIndex(i => i.id === over.id);
            onUpdate({ ...report, submittals: arrayMove(submittals, oldIndex, newIndex) });
        }
    };

    // --- RFI HELPERS ---
    const addRfi = () => {
        const newRfi: RfiEntry = { id: crypto.randomUUID(), rfiNumber: '', subject: '', dateSent: '', dateDue: '', status: 'Draft' };
        onUpdate({ ...report, rfis: [...rfis, newRfi] });
    };
    const updateRfi = (id: string, field: keyof RfiEntry, value: any) => {
        const updated = rfis.map(i => i.id === id ? { ...i, [field]: value } : i);
        onUpdate({ ...report, rfis: updated });
    };
    const removeRfi = (id: string) => onUpdate({ ...report, rfis: rfis.filter(i => i.id !== id) });

    // --- SUBMITTAL HELPERS ---
    const addSubmittal = () => {
        const newSub: SubmittalEntry = { id: crypto.randomUUID(), submittalNumber: '', description: '', dateSent: '', dateNeededBy: '', status: 'New' };
        onUpdate({ ...report, submittals: [...submittals, newSub] });
    };
    const updateSubmittal = (id: string, field: keyof SubmittalEntry, value: any) => {
        const updated = submittals.map(i => i.id === id ? { ...i, [field]: value } : i);
        onUpdate({ ...report, submittals: updated });
    };
    const removeSubmittal = (id: string) => onUpdate({ ...report, submittals: submittals.filter(i => i.id !== id) });

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2">
                <FileText className="text-brand-primary" />
                Project Documents
            </h2>

            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setView('rfi')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${view === 'rfi' ? 'bg-brand-primary text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                >
                    RFIs
                </button>
                <button 
                    onClick={() => setView('submittal')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${view === 'submittal' ? 'bg-brand-primary text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                >
                    Submittals
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden min-h-[400px]">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    {view === 'rfi' ? (
                        <div className="p-4">
                            <div className="flex justify-end mb-4">
                                <button onClick={addRfi} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-bold rounded transition">
                                    <Plus size={14}/> Add RFI
                                </button>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase">
                                    <tr>
                                        <th className="w-8 sticky left-0 bg-zinc-50 z-10"></th>
                                        <th className="px-4 py-3 w-20">#</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3 w-32">Date Sent</th>
                                        <th className="px-4 py-3 w-32">Date Due</th>
                                        <th className="px-4 py-3 w-24">Status</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SortableContext items={rfis.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                        {rfis.map(rfi => (
                                            <SortableRfiRow 
                                                key={rfi.id} 
                                                rfi={rfi} 
                                                onUpdate={updateRfi} 
                                                onRemove={() => removeRfi(rfi.id)} 
                                            />
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="p-4">
                            <div className="flex justify-end mb-4">
                                <button onClick={addSubmittal} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-bold rounded transition">
                                    <Plus size={14}/> Add Submittal
                                </button>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase">
                                    <tr>
                                        <th className="w-8 sticky left-0 bg-zinc-50 z-10"></th>
                                        <th className="px-4 py-3 w-20">#</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 w-32">Date Sent</th>
                                        <th className="px-4 py-3 w-32">Needed By</th>
                                        <th className="px-4 py-3 w-32">Status</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SortableContext items={submittals.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                        {submittals.map(sub => (
                                            <SortableSubmittalRow 
                                                key={sub.id} 
                                                sub={sub} 
                                                onUpdate={updateSubmittal} 
                                                onRemove={() => removeSubmittal(sub.id)} 
                                            />
                                        ))}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </div>
                    )}
                </DndContext>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function SortableRfiRow({ rfi, onUpdate, onRemove }: { rfi: RfiEntry, onUpdate: (id: string, field: keyof RfiEntry, val: any) => void, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rfi.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative' as const, zIndex: isDragging ? 20 : 'auto' };

    return (
        <tr ref={setNodeRef} style={style} className={`border-b border-zinc-50 hover:bg-zinc-50/50 group ${isDragging ? 'bg-zinc-50 shadow-lg' : 'bg-white'}`}>
            <td className="px-1 py-1 text-center">
                <button {...attributes} {...listeners} className="p-1 hover:bg-zinc-100 rounded text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} />
                </button>
            </td>
            <td className="px-4 py-3"><input value={rfi.rfiNumber} onChange={e => onUpdate(rfi.id, 'rfiNumber', e.target.value)} className="w-full bg-transparent font-mono" placeholder="001" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input value={rfi.subject} onChange={e => onUpdate(rfi.id, 'subject', e.target.value)} className="w-full bg-transparent font-medium" placeholder="Subject..." onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input type="date" value={rfi.dateSent} onChange={e => onUpdate(rfi.id, 'dateSent', e.target.value)} className="bg-transparent text-xs" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input type="date" value={rfi.dateDue} onChange={e => onUpdate(rfi.id, 'dateDue', e.target.value)} className="bg-transparent text-xs" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3">
            <select value={rfi.status} onChange={e => onUpdate(rfi.id, 'status', e.target.value as any)} className="bg-transparent border-none text-xs font-bold focus:ring-0" onPointerDown={e => e.stopPropagation()}>
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
            </select>
            </td>
            <td className="px-4 py-3"><button onClick={onRemove} className="text-zinc-300 hover:text-red-500"><Trash2 size={14}/></button></td>
        </tr>
    );
}

function SortableSubmittalRow({ sub, onUpdate, onRemove }: { sub: SubmittalEntry, onUpdate: (id: string, field: keyof SubmittalEntry, val: any) => void, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative' as const, zIndex: isDragging ? 20 : 'auto' };

    return (
        <tr ref={setNodeRef} style={style} className={`border-b border-zinc-50 hover:bg-zinc-50/50 group ${isDragging ? 'bg-zinc-50 shadow-lg' : 'bg-white'}`}>
             <td className="px-1 py-1 text-center">
                <button {...attributes} {...listeners} className="p-1 hover:bg-zinc-100 rounded text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} />
                </button>
            </td>
            <td className="px-4 py-3"><input value={sub.submittalNumber} onChange={e => onUpdate(sub.id, 'submittalNumber', e.target.value)} className="w-full bg-transparent font-mono" placeholder="001" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input value={sub.description} onChange={e => onUpdate(sub.id, 'description', e.target.value)} className="w-full bg-transparent font-medium" placeholder="Description..." onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input type="date" value={sub.dateSent} onChange={e => onUpdate(sub.id, 'dateSent', e.target.value)} className="bg-transparent text-xs" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3"><input type="date" value={sub.dateNeededBy} onChange={e => onUpdate(sub.id, 'dateNeededBy', e.target.value)} className="bg-transparent text-xs" onPointerDown={e => e.stopPropagation()}/></td>
            <td className="px-4 py-3">
            <select value={sub.status} onChange={e => onUpdate(sub.id, 'status', e.target.value as any)} className="bg-transparent border-none text-xs font-bold focus:ring-0" onPointerDown={e => e.stopPropagation()}>
                <option value="New">New</option>
                <option value="Revision">Revision</option>
            </select>
            </td>
            <td className="px-4 py-3"><button onClick={onRemove} className="text-zinc-300 hover:text-red-500"><Trash2 size={14}/></button></td>
        </tr>
    );
}
