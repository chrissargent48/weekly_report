import React from 'react';
import { WeeklyReport, Invoice, ProjectConfig } from '../../types';
import { DollarSign, Trash2, Plus, TrendingUp, FileText, Clock } from 'lucide-react';
import { TabHeader } from '../ui';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
    projectConfig?: ProjectConfig;
}

export function FinancialsTab({ report, onUpdate, projectConfig }: Props) {
    const financials = report.financials || { invoices: [], summary: { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 } };
    const invoices = financials.invoices || [];
    const summary = financials.summary || { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 };
    
    // Get contract value from project config if available
    const contractValue = projectConfig?.contract?.originalValue || 0;

    const updateFinancials = (field: string, value: any) => {
        onUpdate({
            ...report,
            financials: { ...financials, [field]: value }
        });
    };

    const updateSummary = (field: keyof typeof summary, value: number) => {
        updateFinancials('summary', { ...summary, [field]: value });
    };

    // Invoice CRUD
    const addInvoice = () => {
        const newInvoice: Invoice = {
            id: crypto.randomUUID(),
            period: new Date().toISOString().split('T')[0],
            invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
            amount: 0,
            retainage: 0,
            datePaid: ''
        };
        updateFinancials('invoices', [...invoices, newInvoice]);
    };

    const updateInvoice = (id: string, field: keyof Invoice, value: any) => {
        const updated = invoices.map(inv => inv.id === id ? { ...inv, [field]: value } : inv);
        updateFinancials('invoices', updated);
    };

    const removeInvoice = (id: string) => {
        updateFinancials('invoices', invoices.filter(inv => inv.id !== id));
    };

    // Calculate totals
    const totalBilledCalc = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalRetainage = invoices.reduce((sum, inv) => sum + (inv.retainage || 0), 0);
    const totalPaid = invoices.filter(inv => inv.datePaid).reduce((sum, inv) => sum + (inv.amount - inv.retainage), 0);
    const pendingPayment = totalBilledCalc - totalRetainage - totalPaid;

    // Percent complete based on earned vs contract
    const percentBilled = contractValue > 0 ? ((summary.earnedToDate / contractValue) * 100).toFixed(1) : '0.0';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <TabHeader 
                icon={<DollarSign />} 
                title="Financial Summary" 
                onAdd={addInvoice} 
                addLabel="Add Invoice" 
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold uppercase">Earned to Date</span>
                    </div>
                    <input 
                        type="number"
                        className="text-2xl font-bold bg-transparent border-none p-0 w-full focus:ring-0 placeholder-white/50"
                        placeholder="$0"
                        value={summary.earnedToDate || ''}
                        onChange={e => updateSummary('earnedToDate', Number(e.target.value) || 0)}
                    />
                    {contractValue > 0 && (
                        <div className="text-xs opacity-70 mt-1">{percentBilled}% of ${contractValue.toLocaleString()}</div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                        <FileText size={16} />
                        <span className="text-xs font-bold uppercase">Total Billed</span>
                    </div>
                    <div className="text-2xl font-bold">${totalBilledCalc.toLocaleString()}</div>
                    <div className="text-xs opacity-70 mt-1">{invoices.length} invoice(s)</div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase">Retainage Held</span>
                    </div>
                    <div className="text-2xl font-bold">${totalRetainage.toLocaleString()}</div>
                    <div className="text-xs opacity-70 mt-1">
                        {contractValue > 0 ? `${((totalRetainage / contractValue) * 100).toFixed(1)}% of contract` : 'Enter contract value'}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white rounded-xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-bold uppercase">Remaining Value</span>
                    </div>
                    <input 
                        type="number"
                        className="text-2xl font-bold bg-transparent border-none p-0 w-full focus:ring-0 placeholder-white/50"
                        placeholder="$0"
                        value={summary.remainingContractValue || ''}
                        onChange={e => updateSummary('remainingContractValue', Number(e.target.value) || 0)}
                    />
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-800">Pay Applications / Invoices</h3>
                    <span className="text-xs text-zinc-500">{invoices.length} records</span>
                </div>

                {invoices.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400">
                        <DollarSign className="mx-auto mb-2 text-zinc-300" size={32} />
                        No invoices logged yet. Click "Add Invoice" to create one.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-28">Invoice #</th>
                                <th className="px-4 py-3 w-28">Period</th>
                                <th className="px-4 py-3 text-right w-32">Amount</th>
                                <th className="px-4 py-3 text-right w-28">Retainage</th>
                                <th className="px-4 py-3 text-right w-28">Net</th>
                                <th className="px-4 py-3 w-28">Date Paid</th>
                                <th className="px-4 py-3 w-20">Status</th>
                                <th className="px-4 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {invoices.map(invoice => {
                                const net = invoice.amount - invoice.retainage;
                                const isPaid = !!invoice.datePaid;
                                
                                return (
                                    <tr key={invoice.id} className="hover:bg-zinc-50/50 group transition">
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text"
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white font-mono font-bold"
                                                value={invoice.invoiceNumber}
                                                onChange={e => updateInvoice(invoice.id, 'invoiceNumber', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="date"
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white"
                                                value={invoice.period}
                                                onChange={e => updateInvoice(invoice.id, 'period', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">$</span>
                                                <input 
                                                    type="number"
                                                    className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-right font-bold pl-5"
                                                    value={invoice.amount || ''}
                                                    onChange={e => updateInvoice(invoice.id, 'amount', Number(e.target.value) || 0)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">$</span>
                                                <input 
                                                    type="number"
                                                    className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-right pl-5 text-zinc-600"
                                                    value={invoice.retainage || ''}
                                                    onChange={e => updateInvoice(invoice.id, 'retainage', Number(e.target.value) || 0)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-bold text-zinc-700 text-xs">
                                            ${net.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="date"
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white"
                                                value={invoice.datePaid || ''}
                                                onChange={e => updateInvoice(invoice.id, 'datePaid', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                onClick={() => removeInvoice(invoice.id)}
                                                className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold text-xs text-zinc-600">
                            <tr>
                                <td colSpan={2} className="px-4 py-2 text-right text-zinc-400 uppercase tracking-wider text-[10px]">Totals</td>
                                <td className="px-4 py-2 text-right">${totalBilledCalc.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-zinc-500">${totalRetainage.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-zinc-800 border-t-2 border-brand-primary/20">${(totalBilledCalc - totalRetainage).toLocaleString()}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Financial Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
                    <h3 className="font-bold text-zinc-800">Financial Notes & Action Items</h3>
                </div>
                <div className="p-6">
                    <textarea 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        rows={3}
                        placeholder="Outstanding items, pending approvals, billing notes..."
                    />
                </div>
            </div>
        </div>
    );
}
