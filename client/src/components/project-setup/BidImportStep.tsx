import React from 'react';
import { Upload } from 'lucide-react';
import { ProjectBaselines, MasterBidItem } from '../../types';

interface BidImportStepProps {
    baselines: ProjectBaselines;
    bidText: string;
    setBidText: React.Dispatch<React.SetStateAction<string>>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'schedule' | 'bid') => void;
    handleBidPaste: (text: string) => void;
    updateBidItem: (itemId: string, field: keyof MasterBidItem, value: string | number) => void;
}

export function BidImportStep({ baselines, bidText, setBidText, handleFileUpload, handleBidPaste, updateBidItem }: BidImportStepProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold mb-2">Import Bid Schedule</h3>
            <p className="text-sm text-zinc-500 mb-4">Upload Excel/CSV or Paste Data. Columns: <strong>[Item#] [Desc] [Unit] [Qty] [Price]</strong></p>
            <div className="flex flex-col gap-4 mb-4">
                 <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-300 rounded cursor-pointer hover:bg-zinc-200 transition text-sm font-bold text-zinc-700">
                        <Upload size={16}/> Upload Excel/CSV
                        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => handleFileUpload(e, 'bid')} />
                    </label>
                    <span className="text-xs text-zinc-400 uppercase font-bold">OR</span>
                </div>
                <div className="flex gap-4">
                    <textarea
                        className="flex-1 h-32 border p-2 rounded text-xs font-mono"
                        placeholder="Paste rows here..."
                        value={bidText}
                        onChange={e => setBidText(e.target.value)}
                    />
                    <button onClick={() => handleBidPaste(bidText)} className="btn-primary text-sm h-fit self-end flex items-center gap-2">
                        Process Paste
                    </button>
                </div>
            </div>
            <div className="border rounded bg-zinc-50 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-100 border-b">
                        <tr>
                            <th className="text-left p-2">Item</th>
                            <th className="text-left p-2">Description</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Unit</th>
                            <th className="text-right p-2">Unit Price</th>
                            <th className="text-right p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {baselines.bidItems.map(item => (
                            <tr key={item.id} className="border-b bg-white hover:bg-zinc-50">
                                <td className="p-1">
                                    <input
                                        className="w-full border rounded p-1 text-sm font-mono"
                                        value={item.itemNumber}
                                        onChange={e => updateBidItem(item.id, 'itemNumber', e.target.value)}
                                    />
                                </td>
                                <td className="p-1">
                                    <input
                                        className="w-full border rounded p-1 text-sm"
                                        value={item.description}
                                        onChange={e => updateBidItem(item.id, 'description', e.target.value)}
                                    />
                                </td>
                                <td className="p-1">
                                    <input
                                        type="number"
                                        className="w-full border rounded p-1 text-sm text-right"
                                        value={item.contractQty}
                                        onChange={e => {
                                            const qty = parseFloat(e.target.value) || 0;
                                            updateBidItem(item.id, 'contractQty', qty);
                                            updateBidItem(item.id, 'totalValue', qty * item.unitPrice);
                                        }}
                                    />
                                </td>
                                <td className="p-1">
                                    <input
                                        className="w-full border rounded p-1 text-sm text-right"
                                        value={item.unit}
                                        onChange={e => updateBidItem(item.id, 'unit', e.target.value)}
                                    />
                                </td>
                                <td className="p-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full border rounded p-1 text-sm text-right"
                                        value={item.unitPrice}
                                        onChange={e => {
                                            const price = parseFloat(e.target.value) || 0;
                                            updateBidItem(item.id, 'unitPrice', price);
                                            updateBidItem(item.id, 'totalValue', item.contractQty * price);
                                        }}
                                    />
                                </td>
                                <td className="p-2 text-right font-bold">${item.totalValue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {baselines.bidItems.length === 0 && <div className="p-4 text-center text-zinc-400">No bid items imported</div>}
            </div>
        </div>
    );
}
