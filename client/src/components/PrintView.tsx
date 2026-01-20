import React, { useEffect, useState } from 'react';
import { ProjectConfig, WeeklyReport, PrintOptions, LookAheadEntry, Invoice } from '../types';
import { api } from '../api';
import { MapPinIcon, CalendarIcon, CloudIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StatBox, Badge } from './ui';

interface Props {
  date: string;
  projectId: string;
  options?: PrintOptions;
  initialData?: { report: WeeklyReport, config: ProjectConfig };
  showPageBreaks?: boolean; // New prop for visual guides
}

export function PrintView({ date, projectId, options, initialData, showPageBreaks = false }: Props) {
  const [report, setReport] = useState<WeeklyReport | null>(initialData?.report || null);
  const [config, setConfig] = useState<ProjectConfig | null>(initialData?.config || null);
  const [loading, setLoading] = useState(!initialData);

  // Default options if not provided
  const printOptions: PrintOptions = options || {
      sections: [
          { id: 'overview', label: 'Executive Summary', included: true },
          { id: 'weather', label: 'Weather', included: true },
          { id: 'progress', label: 'Progress', included: true },
          { id: 'lookahead', label: 'Look Ahead', included: true },
          { id: 'manpower', label: 'Manpower', included: true },
          { id: 'equipment', label: 'Equipment', included: true },
          { id: 'materials', label: 'Materials', included: true },
          { id: 'safety', label: 'Safety', included: true },
          { id: 'financials', label: 'Financials', included: true },
          { id: 'photos', label: 'Photos', included: true }
      ]
  };

  const renderSection = (id: string) => {
    if (!report) return null;
    
    switch (id) {
        case 'overview': return (
            <>
               {/* OVERVIEW */}
               <section className="mb-6">
                   <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Executive Summary</h2>
                   <div className="p-3 bg-zinc-50 border border-zinc-100 rounded text-justify whitespace-pre-wrap">
                       {report.overview.executiveSummary || "No summary provided."}
                   </div>
               </section>
               {/* KPI GRID */}
               <section className="mb-6 grid grid-cols-4 gap-4">
                   <StatBox label="% Complete" value={`${report.overview.kpis.percentComplete}%`} />
                   <StatBox label="Man Hours (Wk)" value={report.resources.manpower.reduce((s,m)=> {
                       const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
                       return s + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
                   }, 0)} />
                   <StatBox label="Weather Lost" value={report.overview.kpis.weatherDaysLost} highlight={report.overview.kpis.weatherDaysLost > 0} />
                   <StatBox label="Safety Incidents" value={report.safety.stats.recordables.week} highlight={report.safety.stats.recordables.week > 0} />
               </section>
               {/* SCHEDULE ANALYSIS */}
                {report.schedule.analysis && (
                   <section className="mb-6 break-inside-avoid">
                       <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1 flex gap-2">
                           Schedule Analysis
                           {report.overview.kpis.weatherDaysLost > 0 && <span className="flex items-center gap-1 text-[10px] bg-brand-accent/20 text-brand-surface-dark px-2 rounded"><ExclamationTriangleIcon className="w-3 h-3"/> Weather Impact</span>}
                       </h2>
                       <div className="p-3 bg-brand-surface-light/30 border-l-4 border-brand-primary text-sm italic">
                           "{report.schedule.analysis}"
                       </div>
                   </section>
               )}
            </>
        );
        case 'weather': return (
           report.overview.weather && report.overview.weather.length > 0 ? (
               <section className="mb-6">
                  <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Weather Log</h2>
                  <table className="w-full text-[10px] border-collapse">
                       <thead className="bg-brand-surface-light text-zinc-600">
                           <tr>
                               <th className="p-1 text-left">Date</th>
                               <th className="p-1 text-left">Condition</th>
                               <th className="p-1 text-right">High/Low</th>
                               <th className="p-1 text-right">Wind</th>
                               <th className="p-1 text-right">Lost</th>
                               <th className="p-1 text-left">Notes</th>
                           </tr>
                       </thead>
                       <tbody>
                           {report.overview.weather.map((w,i) => (
                               <tr key={i} className={`border-b border-zinc-100 ${w.hoursLost > 0 ? 'bg-red-50' : ''}`}>
                                   <td className="p-1">{w.date}</td>
                                   <td className="p-1">{w.condition}</td>
                                   <td className="p-1 text-right">{w.tempHigh}°/{w.tempLow}°</td>
                                   <td className="p-1 text-right">{w.wind} mph</td>
                                   <td className="p-1 text-right font-bold">{w.hoursLost > 0 ? `${w.hoursLost} hrs` : '-'}</td>
                                   <td className="p-1 italic text-zinc-500">{w.notes}</td>
                               </tr>
                           ))}
                       </tbody>
                  </table>
               </section>
           ) : null
        );
        case 'manpower': return (
           <div className="mb-6">
                   <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Manpower Log</h2>
                   <table className="w-full text-[10px] border-collapse">
                       <thead className="bg-brand-surface-light text-zinc-600">
                           <tr><th className="p-1 text-left">Name/Co</th><th className="p-1 text-left">Role</th><th className="p-1 text-right">Total Hrs</th></tr>
                       </thead>
                       <tbody>
                           {report.resources.manpower.map((m,i)=> {
                               const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
                               const total = dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
                               const displayName = m.type === 'subcontractor' ? (m.company || m.name || 'Subcontractor') : (m.name || 'RECON');
                               return (
                                   <tr key={i} className="border-b border-zinc-100">
                                       <td className="p-1">{displayName}</td><td className="p-1">{m.role}</td><td className="p-1 text-right">{total}</td>
                                   </tr>
                               );
                           })}
                           <tr className="font-bold bg-zinc-50">
                               <td colSpan={2} className="p-1 text-right">Total:</td>
                               <td className="p-1 text-right">{report.resources.manpower.reduce((s,m)=> {
                                   const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
                                   return s + dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
                               }, 0)}</td>
                           </tr>
                       </tbody>
                   </table>
               </div>
        );
                case 'equipment': return (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Equipment Usage</h2>
                <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-brand-surface-light text-zinc-600">
                        <tr>
                            <th className="p-1 text-left">Type</th>
                            <th className="p-1 text-center">Status</th>
                            <th className="p-1 text-center w-8">M</th>
                            <th className="p-1 text-center w-8">T</th>
                            <th className="p-1 text-center w-8">W</th>
                            <th className="p-1 text-center w-8">T</th>
                            <th className="p-1 text-center w-8">F</th>
                            <th className="p-1 text-center w-8">S</th>
                            <th className="p-1 text-center w-8">S</th>
                            <th className="p-1 text-center w-10">Tot</th>
                            <th className="p-1 text-left">Dates (Del/Pick)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.resources.equipment.onSite.map((e,i) => {
                             const dh = e.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
                             const total = dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
                             // Helper for empty strings
                             const delivery = e.dates?.delivery ? `Del: ${e.dates.delivery}` : '';
                             const pickup = e.dates?.pickup ? `Pick: ${e.dates.pickup}` : '';
                             const dates = [delivery, pickup].filter(Boolean).join(' | ');

                             return (
                                <tr key={i} className="border-b border-zinc-100">
                                    <td className="p-1 font-medium">{e.type}</td>
                                    <td className={`p-1 text-center font-bold ${e.status === 'Active' ? 'text-green-600' : 'text-zinc-400'}`}>{e.status}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.mon || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.tue || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.wed || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.thu || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.fri || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.sat || '-'}</td>
                                    <td className="p-1 text-center text-zinc-500">{dh.sun || '-'}</td>
                                    <td className="p-1 text-center font-bold bg-zinc-50">{total || '-'}</td>
                                    <td className="p-1 text-zinc-500 text-[9px]">{dates}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        );
        case 'materials': return (
            report.resources.materials && report.resources.materials.length > 0 ? (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Material Deliveries</h2>
                    <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-brand-surface-light text-zinc-600">
                            <tr>
                                <th className="p-1 text-left w-20">Date</th>
                                <th className="p-1 text-left">Description / Material</th>
                                <th className="p-1 text-left w-20">Ticket #</th>
                                <th className="p-1 text-right w-16">Qty</th>
                                <th className="p-1 text-left w-10">Unit</th>
                                <th className="p-1 text-left">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.resources.materials.sort((a,b) => b.date.localeCompare(a.date)).map((m,i) => (
                                <tr key={i} className="border-b border-zinc-100">
                                    <td className="p-1">{m.date}</td>
                                    <td className="p-1 font-bold text-zinc-700">{m.description}</td>
                                    <td className="p-1 font-mono text-zinc-500">{m.ticketNumber || '-'}</td>
                                    <td className="p-1 text-right font-bold">{m.quantity}</td>
                                    <td className="p-1 text-zinc-500">{m.uom}</td>
                                    <td className="p-1 italic text-zinc-400">{m.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null
        );
        case 'lookahead': return (
           <section className="mb-6 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">3-Week Look Ahead</h2>
              <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-brand-surface-light text-zinc-600">
                      <tr>
                          <th className="p-1 text-left">Activity</th>
                          <th className="p-1 text-left w-24">Starts</th>
                          <th className="p-1 text-left w-24">Finishes</th>
                          <th className="p-1 text-center w-20">Status</th>
                          <th className="p-1 text-left">Notes</th>
                      </tr>
                  </thead>
                  <tbody>
                      {report.progress.lookAheadItems ? (
                         report.progress.lookAheadItems.filter(i => i.included).map((item, i) => {
                              return (
                                  <tr key={i} className="border-b border-zinc-100">
                                      <td className="p-1 font-medium">{item.description}</td>
                                      <td className="p-1">{item.forecastStart || item.baselineStart || '-'}</td>
                                      <td className="p-1">{item.forecastFinish || item.baselineFinish || '-'}</td>
                                      <td className="p-1 text-center">
                                          {item.type === 'schedule' ? (
                                              <span className="text-xs bg-zinc-100 px-1 rounded">Schedule</span>
                                          ): (
                                              <span className="text-xs bg-blue-50 text-blue-700 px-1 rounded">Custom</span>
                                          )}
                                      </td>
                                      <td className="p-1 italic text-zinc-500">{item.notes}</td>
                                  </tr>
                              );
                         })
                      ) : (
                          (report.progress.lookAheadThreeWeek || []).map((item, i) => (
                              <tr key={i} className="border-b border-zinc-100">
                                  <td className="p-1 font-medium" colSpan={5}>{item}</td>
                              </tr>
                          ))
                      )}
                      {(!report.progress.lookAheadItems && (!report.progress.lookAheadThreeWeek || report.progress.lookAheadThreeWeek.length === 0)) && (
                          <tr><td colSpan={5} className="p-2 text-center text-zinc-400 italic">No look ahead items.</td></tr>
                      )}
                  </tbody>
              </table>
           </section>
        );
        case 'financials': return (
            <section className="mb-6 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1 flex justify-between">
                    <span>Financial Summary</span>
                    <span className="text-xs normal-case text-zinc-500">Earned: <span className="text-zinc-900 font-bold">${report.financials.summary.earnedToDate.toLocaleString()}</span></span>
                </h2>
                {/* Financials Table */}
                <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-brand-surface-light text-zinc-600">
                        <tr>
                            <th className="p-1 text-left">Invoice #</th>
                            <th className="p-1 text-left">Period</th>
                            <th className="p-1 text-right">Amount</th>
                            <th className="p-1 text-right">Retainage</th>
                            <th className="p-1 text-right">Net</th>
                            <th className="p-1 text-center">Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(report.financials.invoices || []).map((inv, i) => (
                            <tr key={i} className="border-b border-zinc-100">
                                <td className="p-1 font-bold">{inv.invoiceNumber}</td>
                                <td className="p-1">{inv.period}</td>
                                <td className="p-1 text-right">${inv.amount.toLocaleString()}</td>
                                <td className="p-1 text-right">${inv.retainage.toLocaleString()}</td>
                                <td className="p-1 text-right font-bold">${(inv.amount - inv.retainage).toLocaleString()}</td>
                                <td className="p-1 text-center">{inv.datePaid ? inv.datePaid : 'Pending'}</td>
                            </tr>
                        ))}
                        {(report.financials.invoices || []).length === 0 && (
                            <tr><td colSpan={6} className="p-2 text-center text-zinc-400 italic">No invoices generated.</td></tr>
                        )}
                    </tbody>
                </table>
            </section>
        );
        case 'photos': return (
            <section className="break-inside-avoid mb-6">
                 <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-4 pb-1">Photographic Documentation</h2>
                 <div className="grid grid-cols-2 gap-4">
                     {report.photos.map((p, i) => (
                         <div key={i} className="border border-zinc-200 rounded p-1">
                             <div className="aspect-video bg-zinc-100 flex items-center justify-center text-zinc-400 mb-1 rounded overflow-hidden">
                                 {/* Ideally image src would be p.url, using placeholder if empty */}
                                 {p.url ? <img src={p.url} className="w-full h-full object-cover" /> : <span className="text-[10px]">Image {i+1}</span>}
                             </div>
                             <div className="p-1">
                                 <div className="font-bold text-[10px]">{p.caption}</div>
                                 <div className="text-[9px] text-zinc-400">Looking: {p.directionLooking}</div>
                             </div>
                         </div>
                     ))}
                     {report.photos.length === 0 && <div className="col-span-2 text-center italic text-zinc-400 p-4">No photos attached.</div>}
                 </div>
            </section>
        );
        case 'safety': return (
            <section className="mb-6">
                <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Safety Stats & Narrative</h2>
                 <div className="p-3 bg-zinc-50 border border-zinc-100 rounded text-justify whitespace-pre-wrap mb-2">
                       {report.safety.narrative || "No safety narrative provided."}
                   </div>
                   {/* Mini Safety Table */}
                    <table className="w-full text-[10px] border-collapse bg-white">
                       <thead className="bg-brand-surface-light text-zinc-600">
                           <tr>
                               <th className="p-1 text-left">Metric</th>
                               <th className="p-1 text-center">Week</th>
                               <th className="p-1 text-center">YTD</th>
                           </tr>
                       </thead>
                       <tbody>
                        <tr className="border-b border-zinc-100">
                            <td className="p-1">Near Misses</td>
                            <td className="p-1 text-center">{report.safety.stats.nearMisses.week}</td>
                            <td className="p-1 text-center">{report.safety.stats.nearMisses.ytd}</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                             <td className="p-1">First Aids</td>
                            <td className="p-1 text-center">{report.safety.stats.firstAids.week}</td>
                            <td className="p-1 text-center">{report.safety.stats.firstAids.ytd}</td>
                        </tr>
                       </tbody>
                   </table>
            </section>
        );
        case 'procurement': return (
            (report.resources.procurement && report.resources.procurement.length > 0) ? (
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Procurement Log (Long Lead Items)</h2>
                    <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-brand-surface-light text-zinc-600">
                            <tr>
                                <th className="p-1 text-left">Item</th>
                                <th className="p-1 text-left">Vendor</th>
                                <th className="p-1 text-center">Status</th>
                                <th className="p-1 text-left">ETA</th>
                                <th className="p-1 text-left">Delivery</th>
                                <th className="p-1 text-left">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.resources.procurement.map((item, i) => (
                                <tr key={i} className="border-b border-zinc-100">
                                    <td className="p-1 font-bold">{item.item}</td>
                                    <td className="p-1">{item.vendor}</td>
                                    <td className="p-1 text-center">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            item.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                            item.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                            item.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-zinc-100 text-zinc-600'
                                        }`}>{item.status}</span>
                                    </td>
                                    <td className="p-1">{item.eta || '-'}</td>
                                    <td className="p-1">{item.deliveryDate || '-'}</td>
                                    <td className="p-1 italic text-zinc-500">{item.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ) : null
        );
        case 'issues': return (
            (report.issues && report.issues.length > 0) ? (
               <section className="mb-6">
                   <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Issues, Risks, & Layout Items</h2>
                   <table className="w-full text-[10px] border-collapse">
                       <thead className="bg-brand-surface-light text-zinc-600">
                           <tr>
                               <th className="p-1 text-left">Description</th>
                               <th className="p-1 text-left w-24">Assigned To</th>
                               <th className="p-1 text-left w-24">Due Date</th>
                               <th className="p-1 text-center w-20">Status</th>
                           </tr>
                       </thead>
                       <tbody>
                           {report.issues.map((issue, i) => (
                               <tr key={i} className="border-b border-zinc-100">
                                   <td className="p-1 font-medium">{issue.description}</td>
                                   <td className="p-1">{issue.assignedTo}</td>
                                   <td className="p-1">{issue.dueDate}</td>
                                   <td className="p-1 text-center font-bold text-xs">{issue.status}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </section>
            ) : null
        );
        case 'schedule': return (
             (report.schedule.milestones && report.schedule.milestones.length > 0) ? (
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Key Schedule Milestones</h2>
                    <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-brand-surface-light text-zinc-600">
                            <tr>
                                <th className="p-1 text-left">Milestone</th>
                                <th className="p-1 text-left w-24">Start</th>
                                <th className="p-1 text-left w-24">Finish</th>
                                <th className="p-1 text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.schedule.milestones.map((ms, i) => (
                                <tr key={i} className="border-b border-zinc-100">
                                    <td className="p-1 font-bold">{ms.milestone}</td>
                                    <td className="p-1">{ms.startDate}</td>
                                    <td className="p-1">{ms.finishDate}</td>
                                    <td className="p-1 text-center">
                                         <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            ms.status === 'Complete' ? 'bg-emerald-100 text-emerald-800' :
                                            ms.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-zinc-100 text-zinc-600'
                                        }`}>{ms.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ) : null
        );
        case 'documents': return (
            <section className="mb-6 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase text-brand-primary border-b border-zinc-200 mb-2 pb-1">Project Documents</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-1">RFIs</h3>
                        {(report.rfis && report.rfis.length > 0) ? (
                            <table className="w-full text-[9px] border-collapse">
                                <thead className="bg-brand-surface-light text-zinc-600">
                                    <tr>
                                        <th className="p-1 text-left">#</th>
                                        <th className="p-1 text-left">Subject</th>
                                        <th className="p-1 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.rfis.map((r, i) => (
                                        <tr key={i} className="border-b border-zinc-100">
                                            <td className="p-1 font-mono">{r.rfiNumber}</td>
                                            <td className="p-1 truncate max-w-[100px]">{r.subject}</td>
                                            <td className="p-1 text-center">{r.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <div className="text-[9px] italic text-zinc-400">No RFIs logged.</div>}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-1">Submittals</h3>
                        {(report.submittals && report.submittals.length > 0) ? (
                            <table className="w-full text-[9px] border-collapse">
                                <thead className="bg-brand-surface-light text-zinc-600">
                                    <tr>
                                        <th className="p-1 text-left">#</th>
                                        <th className="p-1 text-left">Description</th>
                                        <th className="p-1 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.submittals.map((s, i) => (
                                        <tr key={i} className="border-b border-zinc-100">
                                            <td className="p-1 font-mono">{s.submittalNumber}</td>
                                            <td className="p-1 truncate max-w-[100px]">{s.description}</td>
                                            <td className="p-1 text-center">{s.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <div className="text-[9px] italic text-zinc-400">No Submittals logged.</div>}
                    </div>
                </div>
            </section>
        );
        default: return null;
    }
  }

  useEffect(() => {
    // If we passed initial data (e.g. from Preview Modal), don't fetch.
    if (initialData) {
        setReport(initialData.report);
        setConfig(initialData.config);
        setLoading(false);
        return;
    }

    async function load() {
      const c = await api.getConfig(projectId);
      const r = await api.getReport(projectId, date);
      setConfig(c);
      setReport(r);
      setLoading(false);
    }
    load();
  }, [date, projectId, initialData]);

  if (loading || !report || !config) return <div className="text-center p-10">Preparing Report for Print...</div>;

  const spacingPadding = {
      compact: 'p-6',
      standard: 'p-8',
      relaxed: 'p-12'
  };
  const currentPadding = spacingPadding[printOptions.spacing || 'standard'];

  return (
    <div 
        className={`print-ready bg-white text-zinc-900 font-sans text-xs leading-tight w-[210mm] mx-auto min-h-[297mm] ${currentPadding} box-border relative ${showPageBreaks ? 'print-guides' : ''}`}
        style={showPageBreaks ? {
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent calc(297mm - 2px), rgba(255, 0, 0, 0.5) calc(297mm - 2px), rgba(255, 0, 0, 0.5) 297mm)'
        } : {}}
    >
      
      {/* COVER PAGE - Option 2: Teal Header + Photo Strip Design */}
      <div className="print-page flex flex-col h-[290mm] mb-0 relative overflow-hidden bg-white">
          
          {/* ===== TEAL HEADER SECTION WITH HERO IMAGE ===== */}
          <div className="relative h-[33%] min-h-[240px]">
              {/* Hero Image Background */}
              {(() => {
                  const heroIndex = printOptions.heroPhotoIndex ?? 0;
                  const heroPhoto = report.photos[heroIndex];
                  return heroPhoto ? (
                      <div className="absolute inset-0">
                          <img 
                              src={heroPhoto.url} 
                              alt="Site Photo" 
                              className="w-full h-full object-cover"
                          />
                          {/* Teal gradient overlay for brand consistency */}
                          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/80 via-brand-primary/60 to-brand-primary/90"></div>
                      </div>
                  ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-primary-dark"></div>
                  );
              })()}
              
              {/* Logo - Top Left, no background */}
              <div className="absolute top-8 left-8 z-10">
                  {config.identity.logoUrl ? (
                      <img 
                          src={config.identity.logoUrl} 
                          alt="Project Logo" 
                          className="object-contain drop-shadow-lg"
                          style={{ 
                              height: `${(printOptions.logoScale || 100) * 0.01 * 5}rem`,
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }}
                      />
                  ) : (
                      <div className="drop-shadow-lg">
                          <div className="text-3xl font-extrabold text-white tracking-tight">RECON</div>
                          <div className="text-[10px] text-white/80 tracking-widest">A KELLER COMPANY</div>
                      </div>
                  )}
              </div>
          </div>
          
          {/* ===== MAIN CONTENT SECTION ===== */}
          <div className="flex-1 px-10 py-6 flex flex-col">
              {/* Project Name */}
              <h1 className="text-3xl font-extrabold text-brand-dark mb-1 tracking-tight leading-tight">
                  {config.identity.projectName}
              </h1>
              
              {/* Subtitle/Location */}
              <div className="text-lg font-medium text-brand-primary mb-4">
                  {config.identity.subtitle || config.identity.location}
              </div>
              
              {/* Golden accent line */}
              <div className="w-32 h-1 bg-[#D4A84B] mb-4"></div>
              
              {/* Weekly Progress Report title */}
              <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wide mb-1">
                  Weekly Progress Report
              </h2>
              
              {/* Week Ending */}
              <div className="text-base font-semibold text-brand-primary mb-8">
                  Week Ending: {report.weekEnding}
              </div>
              
              {/* Photo Strip (up to 3 photos) */}
              {(() => {
                  const stripIndexes = printOptions.stripPhotoIndexes ?? [1, 2, 3];
                  const stripPhotos = stripIndexes
                      .map(idx => report.photos[idx])
                      .filter(Boolean);
                  
                  return stripPhotos.length > 0 ? (
                      <div className="flex gap-3 mb-8">
                          {stripPhotos.map((photo, i) => (
                              <div key={i} className="flex-1 h-28 rounded overflow-hidden shadow-sm border border-zinc-200">
                                  <img 
                                      src={photo.url} 
                                      alt={photo.caption || `Site photo ${i + 1}`}
                                      className="w-full h-full object-cover"
                                  />
                              </div>
                          ))}
                      </div>
                  ) : <div className="mb-8"></div>;
              })()}
              
              {/* Client Info - Compact */}
              <div className="mt-auto mb-16 space-y-2 text-sm border-t border-zinc-100 pt-5">
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="text-zinc-400 font-medium">Client:</span>
                      <span className="font-bold text-zinc-800">{config.personnel.client.company || 'Client'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="text-zinc-400 font-medium">Address:</span>
                      <span className="text-zinc-600">{config.identity.location || config.personnel.client.address}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="text-zinc-400 font-medium">Job #:</span>
                      <span className="text-zinc-600 font-mono">{config.identity.jobNumber}</span>
                  </div>
              </div>
          </div>
          
          {/* ===== FOOTER - Safety Tagline Bar (Absolute Bottom) ===== */}
          <div className="absolute bottom-0 left-0 w-full bg-brand-primary py-3 text-center">
              <span className="text-white italic text-sm font-medium tracking-wide">
                  Safety is a core value
              </span>
          </div>
      </div>


      {/* HEADER (CONTENT PAGES) */}
      <header className="border-b-2 border-brand-primary pb-4 mb-6 flex justify-between items-start print:mt-8">
        <div className="w-2/3">
           <h1 className="text-2xl font-bold text-brand-surface-dark mb-1">{config.identity.projectName}</h1>
           <div className="flex items-center gap-2 text-zinc-500 font-medium mb-2">
               <MapPinIcon className="w-4 h-4" /> {config.identity.location}
           </div>
           <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
               <div><span className="font-bold text-zinc-600">Job #:</span> {config.identity.jobNumber}</div>
               <div><span className="font-bold text-zinc-600">Contract:</span> ${config.contract.originalValue.toLocaleString()}</div>
               <div><span className="font-bold text-zinc-600">PM:</span> {config.personnel.recon.find(p => p.role === "Project Manager")?.name || ""}</div>
               <div><span className="font-bold text-zinc-600">Superintendent:</span> {config.personnel.recon.find(p => p.role === "Superintendent")?.name || ""}</div>
           </div>
        </div>
        <div className="text-right">
           <div className="text-brand-primary font-bold text-xl uppercase tracking-widest mb-1">Weekly Report</div>
           <div className="flex items-center justify-end gap-2 text-sm font-bold bg-brand-surface-light px-3 py-1 rounded">
               <CalendarIcon className="w-4 h-4"/> {report.weekEnding}
           </div>
        </div>
      </header>

      {printOptions.sections.filter(s => s.included).map(section => (
          <React.Fragment key={section.id}>
              {renderSection(section.id)}
          </React.Fragment>
      ))}

    </div>
  );
}
