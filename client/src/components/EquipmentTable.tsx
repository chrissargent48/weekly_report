import React from 'react';
import { EquipmentEntry } from '../types';
import { Trash2, GripVertical, Calendar, Truck } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props { 
    entries: EquipmentEntry[];
    onAdd: () => void;
    onUpdateEntries: (e: EquipmentEntry[]) => void;
}

export function EquipmentTable({ entries, onAdd, onUpdateEntries }: Props) {
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
    
    // Calculate row total
    const getRowTotal = (entry: EquipmentEntry) => 
        days.reduce((sum, d) => sum + (entry.dailyHours?.[d] || 0), 0);
    
    // Calculate day total
    const getDayTotal = (day: typeof days[number]) => 
        entries.reduce((sum, e) => sum + (e.dailyHours?.[day] || 0), 0);

    const updateEntry = (index: number, field: keyof EquipmentEntry, value: any) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        onUpdateEntries(updated);
    };

    const updateDates = (index: number, field: 'delivery' | 'pickup', value: string) => {
        const updated = [...entries];
        updated[index] = { 
            ...updated[index], 
            dates: { ...updated[index].dates, [field]: value } as any
        };
        onUpdateEntries(updated);
    };
    
    const updateDayHours = (index: number, day: typeof days[number], hours: number) => {
        const updated = [...entries];
        updated[index] = { 
            ...updated[index], 
            dailyHours: { ...updated[index].dailyHours || {}, [day]: hours } as any
        };
        onUpdateEntries(updated);
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="font-bold text-zinc-800">Equipment On-Site</h3>
                </div>
                <button onClick={onAdd} className="text-xs font-bold bg-white border border-zinc-300 px-3 py-1.5 rounded hover:bg-zinc-50 transition shadow-sm">+ Add Equipment</button>
            </div>
            <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <tr>
                                <th className="w-8 sticky left-0 bg-zinc-50 z-10"></th>
                                <th className="px-2 py-2 text-left w-32">Type / Description</th>
                                <th className="px-2 py-2 text-center w-24">Status</th>
                                {dayLabels.map(d => (
                                    <th key={d} className="px-1 py-2 text-center w-12">{d}</th>
                                ))}
                                <th className="px-2 py-2 text-center w-14 bg-zinc-100">Tot</th>
                                <th className="px-2 py-2 text-left w-24">Delivered</th>
                                <th className="px-2 py-2 text-left w-24">Pickup</th>
                                <th className="px-2 py-2 text-left w-32">Notes</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                {entries.map((e, i) => (
                                    <SortableRow 
                                        key={e.id}
                                        entry={e}
                                        index={i}
                                        days={days}
                                        rowTotal={getRowTotal(e)}
                                        onUpdateEntry={(field, val) => updateEntry(i, field, val)}
                                        onUpdateDates={(field, val) => updateDates(i, field, val)}
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
                        <tfoot className="bg-zinc-50 border-t border-zinc-200 text-xs font-bold text-zinc-600">
                             <tr>
                                 <td colSpan={3} className="px-3 py-2 text-right uppercase tracking-wider text-[10px] text-zinc-400">
                                     Week Totals
                                 </td>
                                 {dayLabels.map((l, idx) => (
                                     <td key={l} className="px-1 py-2 text-center text-zinc-800 font-mono">
                                         {getDayTotal(days[idx]) || '-'}
                                     </td>
                                 ))}
                                 <td className="px-1 py-2 text-center text-amber-600 bg-zinc-100 border-l border-zinc-200 font-mono">
                                     {entries.reduce((sum, e) => sum + getRowTotal(e), 0)}
                                 </td>
                                 <td colSpan={4}></td>
                             </tr>
                        </tfoot>
                    </table>
                </DndContext>
            </div>
        </div>
    );
}

// Sub-component for Sortable Row
interface SortableRowProps {
    entry: EquipmentEntry;
    index: number;
    days: readonly ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    rowTotal: number;
    onUpdateEntry: (field: keyof EquipmentEntry, value: any) => void;
    onUpdateDates: (field: 'delivery' | 'pickup', value: string) => void;
    onUpdateDay: (day: any, hours: number) => void;
    onDelete: () => void;
}

function SortableRow({ entry, index, days, rowTotal, onUpdateEntry, onUpdateDates, onUpdateDay, onDelete }: SortableRowProps) {
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
            
            <td className="px-1 py-1">
                <input 
                    value={entry.type} 
                    onChange={e => onUpdateEntry('type', e.target.value)}
                    placeholder="E.g. Excavator 330"
                    className="form-input h-7 text-xs px-2 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white font-medium"
                />
            </td>
            <td className="px-1 py-1">
                <select 
                    value={entry.status} 
                    onChange={e => onUpdateEntry('status', e.target.value)}
                     className={`form-input h-7 text-[10px] px-1 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-center w-full font-bold
                        ${entry.status === 'Active' ? 'text-green-600' : 
                          entry.status === 'Standby' ? 'text-amber-600' : 
                          entry.status === 'Down' ? 'text-red-600' : 'text-zinc-400'}`}
                >
                    <option value="Active">Active</option>
                    <option value="Standby">Standby</option>
                    <option value="Down">Down</option>
                    <option value="Demobilized">Demob</option>
                </select>
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
                <input 
                    type="date"
                    value={entry.dates?.delivery || ''}
                    onChange={e => onUpdateDates('delivery', e.target.value)}
                    className="form-input h-7 text-[10px] px-1 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-700 font-medium w-full"
                    title="Delivery Date"
                />
            </td>
             <td className="px-1 py-1">
                <input 
                    type="date"
                    value={entry.dates?.pickup || ''}
                    onChange={e => onUpdateDates('pickup', e.target.value)}
                    className="form-input h-7 text-[10px] px-1 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-700 font-medium w-full"
                    title="Pickup Date"
                />
            </td>

            <td className="px-1 py-1">
                <input 
                    value={entry.notes} 
                    onChange={e => onUpdateEntry('notes', e.target.value)}
                    placeholder="Notes..."
                    className="form-input h-7 text-xs px-2 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-500 italic"
                />
            </td>

            <td className="px-1 py-1">
                <button onClick={onDelete} className="p-1 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded transition"><Trash2 size={14}/></button>
            </td>
        </tr>
    );
}
