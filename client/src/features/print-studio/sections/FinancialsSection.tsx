import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { DollarSign, FileText } from 'lucide-react';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}

export function FinancialsSection({ config, reportData }: Props) {
  const data = reportData.financials;
  if (!data) return null;

  const summary = data.summary || {};
  const invoices = data.invoices || [];
  
  // If no financials data at all, skip
  if ((!invoices || invoices.length === 0) && !summary.remainingContractValue) return null;

  return (
    <SectionWrapper config={config} title="Financial Overview">
       <div className="flex flex-col gap-6">
          {/* Top Cards */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-zinc-50 p-4 rounded border border-zinc-100 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Earned To Date</div>
                <div className="text-xl font-bold text-zinc-900 flex items-center gap-1">
                   <DollarSign size={16} className="text-zinc-400" />
                   {summary.earnedToDate?.toLocaleString() || '0.00'}
                </div>
             </div>
             <div className="bg-zinc-50 p-4 rounded border border-zinc-100 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Billed to Date</div>
                <div className="text-xl font-bold text-cyan-700 flex items-center gap-1">
                   <DollarSign size={16} className="text-cyan-400" />
                   {summary.totalBilled?.toLocaleString() || '0.00'}
                </div>
             </div>
             <div className="bg-zinc-50 p-4 rounded border border-zinc-100 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Remaining</div>
                <div className="text-xl font-bold text-zinc-900 flex items-center gap-1">
                   <DollarSign size={16} className="text-zinc-400" />
                   {summary.remainingContractValue?.toLocaleString() || '0.00'}
                </div>
             </div>
          </div>

          {/* Invoices Table */}
          {invoices.length > 0 && (
             <div className="overflow-hidden rounded border border-zinc-200">
                <table className="w-full text-sm">
                   <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                         <th className="px-4 py-2 text-left font-bold text-zinc-500 w-32">Date</th>
                         <th className="px-4 py-2 text-left font-bold text-zinc-500">Invoice #</th>
                         <th className="px-4 py-2 text-left font-bold text-zinc-500">Period</th>
                         <th className="px-4 py-2 text-right font-bold text-zinc-500 w-32">Amount</th>
                         <th className="px-4 py-2 text-center font-bold text-zinc-500 w-24">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100">
                      {data.invoices.map((inv: any, i: number) => (
                         <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                            <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{inv.date}</td>
                            <td className="px-4 py-2 font-medium text-zinc-900 flex items-center gap-2">
                               <FileText size={14} className="text-zinc-400" />
                               {inv.number}
                            </td>
                            <td className="px-4 py-2 text-zinc-600 text-xs">{inv.period}</td>
                            <td className="px-4 py-2 text-right font-bold text-zinc-900">${inv.amount}</td>
                            <td className="px-4 py-2 text-center">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                  ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                               `}>
                                  {inv.status}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}
       </div>
    </SectionWrapper>
  );
}
