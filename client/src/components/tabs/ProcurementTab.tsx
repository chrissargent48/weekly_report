import React from 'react';
import { WeeklyReport, ProcurementEntry } from '../../types';
import { Plus, Trash2, Box, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
}

export function ProcurementTab({ report, onUpdate }: Props) {
    // Ensure array exists
    const entries = report.resources.procurement || [];

    const updateEntries = (newEntries: ProcurementEntry[]) => {
        onUpdate({
            ...report,
            resources: {
                ...report.resources,
                procurement: newEntries
            }
        });
    };

    const addEntry = () => {
        const newEntry: ProcurementEntry = {
            id: uuidv4(),
            item: '',
            status: 'Ordered',
            notes: ''
        };
        updateEntries([...entries, newEntry]);
    };

    const removeEntry = (id: string) => {
        updateEntries(entries.filter(e => e.id !== id));
    };

    const updateEntry = (id: string, field: keyof ProcurementEntry, value: any) => {
        updateEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Delayed': return 'bg-red-100 text-red-800 border-red-200';
            case 'Pending': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200'; // Ordered
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Shipped': return <Box size={14} />;
            case 'Delayed': return <AlertCircle size={14} />;
            case 'Pending': return <Clock size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-zinc-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                            <Box className="text-zinc-400" size={20} />
                            Procurement Log
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Track long-lead items, orders, and delivery ETAs.</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primary/90 transition shadow-sm"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                {entries.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-400">
                        <Box size={48} className="mb-4 text-zinc-300"/>
                        <p className="font-medium text-zinc-600">No procurement items tracked.</p>
                        <p className="text-xs mt-1">Click "Add Item" to track deliveries.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 w-1/4">Item Description</th>
                                    <th className="px-4 py-3 w-1/6">Vendor</th>
                                    <th className="px-4 py-3 w-1/6">Status</th>
                                    <th className="px-4 py-3 w-1/6">ETA</th>
                                    <th className="px-4 py-3 w-1/6">Delivery Date</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="group hover:bg-zinc-50 transition">
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-zinc-800 placeholder-zinc-300 focus:ring-0"
                                                placeholder="Item Name (e.g. Steel Beams)"
                                                value={entry.item}
                                                onChange={e => updateEntry(entry.id, 'item', e.target.value)}
                                            />
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-none p-0 text-xs text-zinc-500 placeholder-zinc-300 focus:ring-0 mt-1"
                                                placeholder="Notes / Tracking #"
                                                value={entry.notes || ''}
                                                onChange={e => updateEntry(entry.id, 'notes', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border border-transparent hover:border-zinc-200 rounded p-1 text-sm text-zinc-600 placeholder-zinc-300 focus:bg-white focus:border-brand-primary focus:ring-0 transition"
                                                placeholder="Vendor Name"
                                                value={entry.vendor || ''}
                                                onChange={e => updateEntry(entry.id, 'vendor', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select 
                                                className={`w-full text-xs font-bold rounded-lg border-none py-1.5 pl-2 pr-6 cursor-pointer focus:ring-0 ${getStatusColor(entry.status)}`}
                                                value={entry.status}
                                                onChange={e => updateEntry(entry.id, 'status', e.target.value)}
                                            >
                                                <option value="Ordered">Ordered</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Delayed">Delayed</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Calendar size={14} className="text-zinc-400" />
                                                <input 
                                                    type="date" 
                                                    className="bg-transparent border-none p-0 text-xs font-medium text-zinc-700 focus:ring-0 cursor-pointer"
                                                    value={entry.eta || ''}
                                                    onChange={e => updateEntry(entry.id, 'eta', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <CheckCircle size={14} className={entry.deliveryDate ? "text-emerald-500" : "text-zinc-200"} />
                                                <input 
                                                    type="date" 
                                                    className="bg-transparent border-none p-0 text-xs font-medium text-zinc-700 focus:ring-0 cursor-pointer"
                                                    value={entry.deliveryDate || ''}
                                                    onChange={e => updateEntry(entry.id, 'deliveryDate', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button 
                                                onClick={() => removeEntry(entry.id)}
                                                className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
