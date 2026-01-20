import React, { useState } from 'react';
import { ManpowerEntry } from '../types';
import { Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props { 
    title: string;
    tableType: 'recon' | 'subcontractor';
    entries: ManpowerEntry[];
    onAdd: () => void;
    onUpdateEntries: (e: ManpowerEntry[]) => void;
}

export function ManpowerTable({ title, tableType, entries, onAdd, onUpdateEntries }: Props) {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = entries.findIndex((item) => item.id === active.id);
            const newIndex = entries.findIndex((item) => item.id === over.id);
            onUpdateEntries(arrayMove(entries, oldIndex, newIndex));
        }
    };
    
    // Calculate row total for a person
    const getRowTotal = (entry: ManpowerEntry) => 
        days.reduce((sum, d) => sum + (entry.dailyHours?.[d] || 0), 0);
    
    const updateEntry = (index: number, field: keyof ManpowerEntry, value: any) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        onUpdateEntries(updated);
    };
    
    const updateDayHours = (index: number, day: typeof days[number], hours: number) => {
        const updated = [...entries];
        updated[index] = { 
            ...updated[index], 
            dailyHours: { ...updated[index].dailyHours, [day]: hours } 
        };
        onUpdateEntries(updated);
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${tableType === 'recon' ? 'bg-brand-primary' : 'bg-zinc-400'}`} />
                    <h3 className="font-bold text-zinc-800">{title}</h3>
                </div>
                <button onClick={onAdd} className="text-xs font-bold bg-white border border-zinc-300 px-3 py-1.5 rounded hover:bg-zinc-50 transition shadow-sm">+ Add Row</button>
            </div>
            <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <tr>
                                <th className="w-8 sticky left-0 bg-zinc-50 z-10"></th>
                                {tableType === 'recon' && <th className="px-1 py-2 text-center w-16">Type</th>}
                                <th className="px-1 py-2 text-center w-14">Loc</th>
                                {tableType === 'subcontractor' && <th className="px-2 py-2 text-left w-32">Company</th>}
                                <th className="px-2 py-2 text-left w-32">{tableType === 'recon' ? 'Name' : 'Name'}</th>
                                <th className="px-2 py-2 text-left w-24">Role</th>
                                {dayLabels.map(d => (
                                    <th key={d} className="px-1 py-2 text-center w-12">{d}</th>
                                ))}
                                <th className="px-2 py-2 text-center w-14 bg-zinc-100">Tot</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                {entries.map((m, i) => (
                                    <SortableRow 
                                        key={m.id}
                                        entry={m}
                                        index={i}
                                        tableType={tableType}
                                        days={days}
                                        rowTotal={getRowTotal(m)}
                                        onUpdateEntry={(field, val) => updateEntry(i, field, val)}
                                        onUpdateDay={(day, hrs) => updateDayHours(i, day, hrs)}
                                        onDelete={() => {
                                            const updated = [...entries];
                                            updated.splice(i, 1);
                                            onUpdateEntries(updated);
                                        }}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>
        </div>
    );
}

// Sub-component for Sortable Row
interface SortableRowProps {
    entry: ManpowerEntry;
    index: number;
    tableType: 'recon' | 'subcontractor';
    days: readonly ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    rowTotal: number;
    onUpdateEntry: (field: keyof ManpowerEntry, value: any) => void;
    onUpdateDay: (day: any, hours: number) => void;
    onDelete: () => void;
}

function SortableRow({ entry, index, tableType, days, rowTotal, onUpdateEntry, onUpdateDay, onDelete }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: entry.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 20 : 'auto',
    };

    return (
        <tr 
            ref={setNodeRef} 
            style={style} 
            className={`hover:bg-zinc-50/50 transition group ${isDragging ? 'bg-zinc-50 shadow-lg' : 'bg-white'}`}
        >
            <td className="px-1 py-1 text-center sticky left-0 bg-white z-10 group-hover:bg-zinc-50/50 border-r border-transparent group-hover:border-zinc-100">
                <button 
                    {...attributes} 
                    {...listeners} 
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    <GripVertical size={14} />
                </button>
            </td>
            
            {tableType === 'recon' && (
                <td className="px-1 py-1">
                        <select 
                        value={entry.category || 'field'} 
                        onChange={e => onUpdateEntry('category', e.target.value)}
                        className="form-input h-7 text-[10px] px-1 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-center"
                    >
                        <option value="field">Field</option>
                        <option value="management">Mgmt</option>
                    </select>
                </td>
            )}

            <td className="px-1 py-1 text-center">
                <button 
                    onClick={() => onUpdateEntry('location', entry.location === 'remote' ? 'onsite' : 'remote')}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${entry.location === 'remote' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-green-50 text-green-600 border-green-200'} w-full transition`}
                >
                    {entry.location === 'remote' ? 'RMT' : 'ONS'}
                </button>
            </td>

            {tableType === 'subcontractor' && (
                <td className="px-1 py-1">
                    <input 
                        value={entry.company || ''} 
                        onChange={e => onUpdateEntry('company', e.target.value)}
                        placeholder="Company"
                        className="form-input h-7 text-xs px-2 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white"
                    />
                </td>
            )}

            <td className="px-1 py-1">
                <input 
                    value={entry.name} 
                    onChange={e => onUpdateEntry('name', e.target.value)}
                    placeholder="Name"
                    className="form-input h-7 text-xs px-2 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white font-medium"
                />
            </td>
            <td className="px-1 py-1">
                <input 
                    value={entry.role} 
                    onChange={e => onUpdateEntry('role', e.target.value)}
                    placeholder="Role"
                    className="form-input h-7 text-xs px-2 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-500"
                />
            </td>

            {days.map(d => (
                <td key={d} className="px-1 py-1">
                    <input 
                        type="number" 
                        min="0"
                        step="0.5"
                        className={`form-input h-7 text-xs px-1 text-center ${entry.dailyHours?.[d] ? 'font-bold text-zinc-900 bg-white shadow-sm border-zinc-200' : 'text-zinc-400 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white hover:bg-zinc-50'}`}
                        value={entry.dailyHours?.[d] || ''}
                        onChange={e => onUpdateDay(d, Number(e.target.value))}
                        placeholder="-"
                        // Prevent dragging input interactions
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                </td>
            ))}
            <td className="px-2 py-1 text-center font-bold text-zinc-700 bg-zinc-50 border-l border-zinc-100">{rowTotal}</td>
            <td className="px-1 py-1">
                <button onClick={onDelete} className="p-1 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded transition"><Trash2 size={14}/></button>
            </td>
        </tr>
    );
}
