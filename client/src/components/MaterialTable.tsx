import React from 'react';
import { MaterialDelivery } from '../types';
import { Trash2, Box, Calendar, Hash, Scale, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    entries: MaterialDelivery[];
    onUpdate: (entries: MaterialDelivery[]) => void;
}

export function MaterialTable({ entries, onUpdate }: Props) {
    
    // Sort by date (descending) by default
    const sortedEntries = [...entries].sort((a,b) => b.date.localeCompare(a.date));

    const handleAdd = () => {
        const newEntry: MaterialDelivery = {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            description: '',
            quantity: 0,
            uom: 'TN' // Default to Tons (common)
        };
        onUpdate([...entries, newEntry]);
    };

    const handleDelete = (id: string) => {
        onUpdate(entries.filter(e => e.id !== id));
    };

    const handleUpdate = (id: string, field: keyof MaterialDelivery, value: any) => {
        onUpdate(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Box size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">Material Deliveries</h3>
                        <p className="text-xs text-zinc-500">Track incoming materials, aggregates, and site supplies.</p>
                    </div>
                </div>
                <button 
                    onClick={handleAdd}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                    + Add Delivery
                </button>
            </div>

            {/* Table */}
            <div className="min-w-full overflow-x-auto">
                {entries.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-sm italic">
                        No deliveries recorded this week.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-32 border-b">Date</th>
                                <th className="px-4 py-3 w-[280px] border-b">Description / Material</th>
                                <th className="px-4 py-3 w-32 border-b">Ticket #</th>
                                <th className="px-4 py-3 w-32 text-right border-b">Quantity</th>
                                <th className="px-4 py-3 w-28 border-b">Unit</th>
                                <th className="px-4 py-3 border-b">Notes</th>
                                <th className="px-4 py-3 w-10 border-b"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sortedEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-zinc-50/50 transition group">
                                    <td className="px-4 py-2">
                                        <div className="relative">
                                            <input 
                                                type="date"
                                                value={entry.date}
                                                onChange={e => handleUpdate(entry.id, 'date', e.target.value)}
                                                className="form-input text-xs h-8 border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 w-full"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            value={entry.description}
                                            onChange={e => handleUpdate(entry.id, 'description', e.target.value)}
                                            placeholder="e.g. 1-1/2 inch Rock"
                                            className="form-input text-xs h-8 border-transparent hover:border-zinc-300 focus:bg-white bg-transparent w-full font-medium"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            value={entry.ticketNumber || ''}
                                            onChange={e => handleUpdate(entry.id, 'ticketNumber', e.target.value)}
                                            placeholder="#123456"
                                            className="form-input text-xs h-8 border-transparent hover:border-zinc-300 focus:bg-white bg-transparent w-full font-mono text-zinc-600"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={entry.quantity}
                                            onChange={e => handleUpdate(entry.id, 'quantity', Number(e.target.value))}
                                            className="form-input text-xs h-8 border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 w-full text-right font-bold"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={entry.uom}
                                            onChange={e => handleUpdate(entry.id, 'uom', e.target.value)}
                                            className="form-input text-xs h-8 border-transparent hover:border-zinc-300 focus:bg-white bg-transparent w-full uppercase cursor-pointer"
                                        >
                                            <option value="TN">TN</option>
                                            <option value="CY">CY</option>
                                            <option value="EA">EA</option>
                                            <option value="LS">LS</option>
                                            <option value="LF">LF</option>
                                            <option value="GAL">GAL</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text"
                                            value={entry.notes || ''}
                                            onChange={e => handleUpdate(entry.id, 'notes', e.target.value)}
                                            placeholder="..."
                                            className="form-input text-xs h-8 border-transparent hover:border-zinc-300 focus:bg-white bg-transparent w-full italic"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button 
                                            onClick={() => handleDelete(entry.id)}
                                            className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-zinc-50 border-t border-zinc-200">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Total Quantities</td>
                                <td colSpan={4} className="px-4 py-3">
                                    <div className="flex gap-4 text-xs font-bold text-zinc-700">
                                        {Object.entries(entries.reduce((acc, curr) => {
                                            acc[curr.uom] = (acc[curr.uom] || 0) + (curr.quantity || 0);
                                            return acc;
                                        }, {} as Record<string, number>)).map(([uom, total]) => (
                                            total > 0 && (
                                                <span key={uom} className="bg-white border border-zinc-200 px-2 py-1 rounded shadow-sm">
                                                    {total.toLocaleString()} <span className="text-zinc-400">{uom}</span>
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>
    );
}
