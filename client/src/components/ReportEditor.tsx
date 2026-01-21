import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { WeeklyReport, ProjectConfig, ManpowerEntry, EquipmentEntry, ProjectBaselines, WeeklyBidEntry, PrintOptions, MaterialDelivery } from '../types';
import { Save, ArrowLeft, Plus, Trash2, Camera, AlertTriangle, CloudRain, Clock, HardHat, RefreshCw, Layers, Truck, Box, DollarSign, Printer } from 'lucide-react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { api } from '../api';
// import { PrintPreviewModal } from './PrintPreviewModal'; 
import { PrintStudioModal } from '../features/print-studio/components/PrintStudioModal';
import { ManpowerTable } from './ManpowerTable';
import { EquipmentTable } from './EquipmentTable';
import { MaterialTable } from './MaterialTable';
import { WeatherTab } from './tabs/WeatherTab';
import { IssuesTab } from './tabs/IssuesTab';
import { LookAheadTab } from './tabs/LookAheadTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { PhotosTab } from './tabs/PhotosTab';
import { SafetyTab } from './tabs/SafetyTab';
import { FinancialsTab } from './tabs/FinancialsTab';
import { ProcurementTab } from './tabs/ProcurementTab';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  report: WeeklyReport;
  projectConfig: ProjectConfig;
  onUpdate: (r: WeeklyReport) => void;
  onSave: () => void;
  onClose: () => void;
  projectId: string;
}

export function ReportEditor({ report, projectConfig, onUpdate, onSave, onClose, projectId }: Props) {
  const [tab, setTab] = useState<'overview' | 'safety' | 'manpower' | 'equipment' | 'materials' | 'procurement' | 'progress' | 'financials' | 'schedule' | 'photos' | 'weather' | 'issues' | 'lookahead' | 'documents'>('overview');
  const [baselines, setBaselines] = useState<ProjectBaselines | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
      api.getBaselines(projectId).then(setBaselines);
  }, [projectId]);

  // Ensure arrays exist (migration safety)
  useEffect(() => {
    if (!report.resources.materials) {
        onUpdate({ ...report, resources: { ...report.resources, materials: [] } });
    }
    if (!report.resources.procurement) {
        onUpdate({ ...report, resources: { ...report.resources, procurement: [] } });
    }
  }, [report.resources.materials, report.resources.procurement]);

  const updateOverview = (key: string, val: any) => onUpdate({ ...report, overview: { ...report.overview, [key]: val } });
  
  // Validation Logic
  const weatherDaysLost = report.overview.kpis.weatherDaysLost || 0;
  const scheduleAnalysis = report.schedule.analysis || "";
  const photoCount = report.photos.length;
  
  const scheduleWarning = weatherDaysLost > 0 && !scheduleAnalysis.trim() ? "Weather days reported: Critical Path Analysis required." : "";
  const photoWarning = photoCount < 6 ? `Need ${6 - photoCount} more photos (Minimum 6).` : "";

  // Memoized heavy calculations for manpower breakdown
  const manpowerStats = useMemo(() => {
    // Sum all daily hours for each person
    const getPersonTotal = (m: ManpowerEntry) => {
      const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
      return dh.mon + dh.tue + dh.wed + dh.thu + dh.fri + dh.sat + dh.sun;
    };
    
    const manpower = report.resources.manpower;
    
    // RECON breakdown
    const reconEntries = manpower.filter(m => m.type === 'recon');
    const reconOnsite = reconEntries.filter(m => m.location !== 'remote').reduce((sum, m) => sum + getPersonTotal(m), 0);
    const reconRemote = reconEntries.filter(m => m.location === 'remote').reduce((sum, m) => sum + getPersonTotal(m), 0);
    const reconTotal = reconOnsite + reconRemote;
    
    // Subcontractor breakdown
    const subEntries = manpower.filter(m => m.type === 'subcontractor');
    const subOnsite = subEntries.filter(m => m.location !== 'remote').reduce((sum, m) => sum + getPersonTotal(m), 0);
    const subRemote = subEntries.filter(m => m.location === 'remote').reduce((sum, m) => sum + getPersonTotal(m), 0);
    const subTotal = subOnsite + subRemote;
    
    // Combined totals
    const totalOnsite = reconOnsite + subOnsite;
    const totalRemote = reconRemote + subRemote;
    const totalHours = reconTotal + subTotal;
    
    return {
      reconOnsite, reconRemote, reconTotal,
      subOnsite, subRemote, subTotal,
      totalOnsite, totalRemote, totalHours
    };
  }, [report.resources.manpower]);
  
  // Calculate project completion from Progress bid items
  const calculatedCompletion = useMemo(() => {
    const baselineItems = baselines?.bidItems || [];
    if (baselineItems.length > 0) {
      const totalContractValue = baselineItems.reduce((acc, b) => acc + b.totalValue, 0);
      if (totalContractValue === 0) return 0;
      
      const earnedValue = baselineItems.reduce((acc, b) => {
        const item = report.progress?.bidItems.find(p => p.itemId === b.id);
        if (!item) return acc;
        return acc + (item.toDateQty * b.unitPrice); 
      }, 0);

      return Math.round((earnedValue / totalContractValue) * 100);
    }
    return 0;
  }, [report.progress?.bidItems, baselines?.bidItems]);
  
  // RESOURCE UPDATERS //
  const updateManpower = (entries: ManpowerEntry[]) => 
      onUpdate({ ...report, resources: { ...report.resources, manpower: entries } });

  const updateEquipment = (entries: EquipmentEntry[]) => 
      onUpdate({ ...report, resources: { ...report.resources, equipment: { ...report.resources.equipment, onSite: entries } } });

  const updateMaterials = (entries: MaterialDelivery[]) => 
      onUpdate({ ...report, resources: { ...report.resources, materials: entries } });
      
  const addEquipment = () => {
       const newEq: EquipmentEntry = {
           id: uuidv4(),
           type: '',
           status: 'Active',
           notes: '',
           dailyHours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
           dates: { delivery: '', pickup: '' }
       };
       updateEquipment([...report.resources.equipment.onSite, newEq]);
  };

  // --- RENDER HELPERS ---
  const TabsData = [
      { id: 'overview', icon: Layers, label: 'Overview' },
      { id: 'weather', icon: CloudRain, label: 'Weather' },
      { id: 'safety', icon: HardHat, label: 'Safety' },
      { id: 'progress', icon: RefreshCw, label: 'Progress' },
      { id: 'lookahead', icon: Clock, label: 'Look Ahead', badge: report.progress.lookAheadItems?.length || 0 },
      { id: 'manpower', icon: HardHat, label: 'Manpower' },
      { id: 'equipment', icon: Truck, label: 'Equipment' },
      { id: 'materials', icon: Box, label: 'Materials' },
      { id: 'procurement', icon: Box, label: 'Procurement' },
      { id: 'financials', icon: DollarSign, label: 'Financials' },
      { id: 'photos', icon: Camera, label: 'Photos', warning: photoCount < 6 },
      { id: 'issues', icon: AlertTriangle, label: 'Issues' },
      { id: 'documents', icon: DocumentArrowDownIcon, label: 'Documents' },
  ];
  
  // Shorthand for backward compatibility
  const { totalHours: totalManHours, reconTotal: reconHours, subTotal: subHours } = manpowerStats;

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-sans">
      {/* Header */}
      <div className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
         <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition"><ArrowLeft className="text-zinc-500" /></button>
             <div>
                 <h2 className="text-lg font-bold text-zinc-900">{projectConfig.identity.projectName}</h2>
                 <p className="text-xs text-zinc-500 font-medium">Period: {report.periodStart} — {report.weekEnding}</p>
             </div>
         </div>
         <div className="flex items-center gap-3">
             {(scheduleWarning || photoWarning) && (
                <div className="animate-pulse px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 border border-amber-200">
                    <AlertTriangle size={12}/> Incomplete Report
                </div>
             )}
             <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
                <div className="flex flex-col px-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 leading-none mb-1">Period Start</span>
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-xs font-bold text-zinc-700 focus:ring-0 leading-none h-4 w-24"
                        value={report.periodStart || ""}
                        onChange={e => onUpdate({...report, periodStart: e.target.value})}
                    />
                </div>
                <div className="h-6 w-px bg-zinc-300"></div>
                <div className="flex flex-col px-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 leading-none mb-1">Week Ending</span>
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-xs font-bold text-zinc-700 focus:ring-0 leading-none h-4 w-24"
                        value={report.weekEnding || ""}
                        onChange={e => onUpdate({...report, weekEnding: e.target.value})}
                    />
                </div>
             </div>
             <button onClick={() => setShowPrintModal(true)} className="bg-white text-brand-surface-dark border border-zinc-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-50 hover:border-brand-primary/30 transition shadow-sm text-sm">
                 <Printer className="w-4 h-4" /> Print Studio
             </button>
             <button onClick={onSave} className="btn-primary flex items-center gap-2"><Save size={16} /> Save Changes</button>
         </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 px-6 bg-white flex gap-6 overflow-x-auto shadow-sm z-0">
          {[
              { id: 'overview', label: 'Overview' },
              { id: 'weather', label: 'Weather' },
              { id: 'progress', label: 'Progress' },
              { id: 'lookahead', label: 'Look Ahead' },
              { id: 'issues', label: 'Issues' },
              { id: 'manpower', label: 'Manpower' },
              { id: 'equipment', label: 'Equipment' },
              { id: 'materials', label: 'Materials' },
              { id: 'procurement', label: 'Procurement' },
              { id: 'documents', label: 'Docs' },
              { id: 'safety', label: 'Safety' },
              { id: 'financials', label: 'Financials' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'photos', label: 'Photos' }
          ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={`py-4 text-xs font-bold uppercase tracking-wider border-b-[3px] transition whitespace-nowrap ${tab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                  {t.label}
              </button>
          ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
              
              {tab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Bento Grid Item: Executive Summary (2x2) */}
                      <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                             <label className="text-sm font-bold text-zinc-700">Weekly Recap</label>
                             <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Primary Narrative</span>
                          </div>
                          <textarea 
                              className="flex-1 w-full p-6 text-zinc-700 text-base leading-relaxed resize-none outline-none focus:bg-zinc-50/50 transition" 
                              placeholder="Provide a high-level narrative of the week's activities, major accomplishments, and any blockers..."
                              value={report.overview.executiveSummary}
                              onChange={e => updateOverview('executiveSummary', e.target.value)}
                          />
                      </div>

                      {/* Bento Grid Item: % Complete */}
                      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/5 rounded-bl-full -mr-8 -mt-8" />
                           <div className="flex flex-col items-center gap-2 mb-4">
                               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Project Completion</h3>
                               {calculatedCompletion > 0 && report.overview.kpis.percentComplete !== calculatedCompletion && (
                                   <button
                                       onClick={() => updateOverview('kpis', {...report.overview.kpis, percentComplete: calculatedCompletion})}
                                       className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 hover:bg-amber-100 transition shadow-sm animate-pulse"
                                       title="Click to sync with calculated progress"
                                   >
                                       <RefreshCw size={10} />
                                       Sync Calc: {calculatedCompletion}%
                                   </button>
                               )}
                           </div>
                           <div className="relative w-32 h-32 flex items-center justify-center">
                               {/* CSS Conic Gradient for Progress */}
                               <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#009fb7 ${report.overview.kpis.percentComplete}%, #eff1f3 0)` }} />
                               <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                                   <div className="flex items-baseline justify-center">
                                       {/* Ghost element for perfect centering */}
                                       <span className="text-lg font-bold text-transparent mr-0.5 select-none">%</span>
                                       <input 
                                           type="number"
                                           min="0"
                                           max="100"
                                           className="text-3xl font-extrabold text-zinc-800 w-16 text-center bg-transparent outline-none p-0"
                                           value={report.overview.kpis.percentComplete}
                                           onChange={e => updateOverview('kpis', {...report.overview.kpis, percentComplete: Math.min(100, Math.max(0, Number(e.target.value)))})}
                                       />
                                       <span className="text-lg font-bold text-zinc-400 ml-0.5">%</span>
                                   </div>
                                   <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                                       {calculatedCompletion > 0 && report.overview.kpis.percentComplete !== calculatedCompletion ? 'Manual' : 'Total'}
                                   </span>
                               </div>
                           </div>
                           <input 
                              type="range" min="0" max="100" 
                              className="w-full mt-6 accent-brand-primary cursor-pointer"
                              value={report.overview.kpis.percentComplete} 
                              onChange={e => updateOverview('kpis', {...report.overview.kpis, percentComplete: Number(e.target.value)})}
                           />
                      </div>

                      {/* Bento Grid Item: Weather */}
                      <div className={`rounded-xl border shadow-sm p-6 flex flex-col justify-between ${weatherDaysLost > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-200'}`}>
                          <div className="flex justify-between items-start">
                              <h3 className={`text-xs font-bold uppercase tracking-widest ${weatherDaysLost > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>Weather Impact</h3>
                              {weatherDaysLost > 0 && <CloudRain className="text-amber-500" />}
                          </div>
                          <div>
                              <div className="flex items-baseline gap-2">
                                  <input 
                                    type="number" 
                                    className={`text-4xl font-extrabold w-20 bg-transparent outline-none ${weatherDaysLost > 0 ? 'text-amber-800' : 'text-zinc-800'}`}
                                    value={report.overview.kpis.weatherDaysLost}
                                    onChange={e => updateOverview('kpis', {...report.overview.kpis, weatherDaysLost: Number(e.target.value)})}
                                  />
                                  <span className="text-sm font-bold text-zinc-500">Days Lost</span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-2">Enter '0' if no delays.</p>
                          </div>
                      </div>

                      {/* Bento Grid Item: Man Hours Breakdown */}
                       <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                           <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Weekly Manpower Breakdown</h3>
                           
                           <div className="grid grid-cols-5 gap-3">
                               {/* RECON Onsite */}
                               <div className="bg-green-50 rounded-lg p-3 text-center">
                                   <div className="text-2xl font-bold text-green-700">{manpowerStats.reconOnsite}</div>
                                   <div className="text-[10px] font-bold text-green-600 uppercase">RECON Onsite</div>
                               </div>
                               {/* RECON Remote */}
                               <div className="bg-purple-50 rounded-lg p-3 text-center">
                                   <div className="text-2xl font-bold text-purple-700">{manpowerStats.reconRemote}</div>
                                   <div className="text-[10px] font-bold text-purple-600 uppercase">RECON Remote</div>
                               </div>
                               {/* Subcontractor */}
                               <div className="bg-zinc-100 rounded-lg p-3 text-center">
                                   <div className="text-2xl font-bold text-zinc-700">{manpowerStats.subTotal}</div>
                                   <div className="text-[10px] font-bold text-zinc-500 uppercase">Subcontractor</div>
                               </div>
                               {/* Weekly Total */}
                               <div className="bg-brand-primary rounded-lg p-3 text-center text-white">
                                   <div className="text-2xl font-bold">{manpowerStats.totalHours}</div>
                                   <div className="text-[10px] font-bold uppercase opacity-80">Weekly Total</div>
                               </div>
                               {/* Job to Date */}
                               <div className="bg-blue-50 rounded-lg p-3 text-center">
                                   <input 
                                       type="number" 
                                       className="w-full text-2xl font-bold text-blue-700 bg-transparent text-center outline-none"
                                       value={report.overview.kpis.manHoursTotal || 0}
                                       onChange={e => updateOverview('kpis', {...report.overview.kpis, manHoursTotal: Number(e.target.value)})}
                                   />
                                   <div className="text-[10px] font-bold text-blue-600 uppercase">Job to Date</div>
                               </div>
                           </div>
                       </div>
                  </div>
              )}

              {tab === 'weather' && <WeatherTab report={report} onUpdate={onUpdate} projectConfig={projectConfig} />}
              {tab === 'issues' && <IssuesTab report={report} onUpdate={onUpdate} />}
              {tab === 'lookahead' && <LookAheadTab report={report} onUpdate={onUpdate} baselines={baselines} />}
              {tab === 'documents' && <DocumentsTab report={report} onUpdate={onUpdate} />}
              {tab === 'safety' && <SafetyTab report={report} onUpdate={onUpdate} />}
              {tab === 'financials' && <FinancialsTab report={report} onUpdate={onUpdate} projectConfig={projectConfig} />}

              {tab === 'manpower' && (
                  <div className="space-y-6 p-6">
                      {/* Top Summary Bento Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Total Card */}
                          <div className="bg-brand-primary text-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                               <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full group-hover:bg-white/20 transition" />
                               <div className="text-3xl font-extrabold relative z-10">{manpowerStats.totalHours}</div>
                               <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 relative z-10">Total Weekly Hours</div>
                          </div>
                          
                          {/* RECON Onsite */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-brand-primary/30 transition group">
                               <div className="text-2xl font-bold text-zinc-700 group-hover:text-brand-primary transition">{manpowerStats.reconOnsite}</div>
                               <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RECON Onsite</div>
                          </div>

                          {/* RECON Remote */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-brand-primary/30 transition group">
                               <div className="text-2xl font-bold text-zinc-700 group-hover:text-brand-primary transition">{manpowerStats.reconRemote}</div>
                               <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RECON Remote</div>
                          </div>

                          {/* Subcontractor */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-brand-primary/30 transition group">
                               <div className="text-2xl font-bold text-zinc-700 group-hover:text-brand-primary transition">{manpowerStats.subTotal}</div>
                               <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subcontractor</div>
                          </div>
                      </div>
                      {/* Split View: RECON vs Subcontractors */}
                      <ManpowerTable 
                        title="Self-Perform (RECON)" 
                        tableType="recon"
                        entries={report.resources.manpower.filter(m => m.type === 'recon')} 
                        onAdd={() => onUpdate({ 
                            ...report, 
                            resources: { 
                                ...report.resources, 
                                manpower: [...report.resources.manpower, { 
                                    id: Math.random().toString(), 
                                    type: 'recon' as const, 
                                    category: 'field' as const,
                                    location: 'onsite' as const,
                                    name: '', 
                                    role: '', 
                                    dailyHours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 } 
                                }] 
                            } 
                        })}
                        onUpdateEntries={(updated) => {
                            const others = report.resources.manpower.filter(m => m.type !== 'recon');
                            onUpdate({ ...report, resources: { ...report.resources, manpower: [...others, ...updated] } });
                        }}
                      />

                      <ManpowerTable 
                        title="Subcontractors" 
                        tableType="subcontractor"
                        entries={report.resources.manpower.filter(m => m.type === 'subcontractor')} 
                        onAdd={() => onUpdate({ 
                            ...report, 
                            resources: { 
                                ...report.resources, 
                                manpower: [...report.resources.manpower, { 
                                    id: Math.random().toString(), 
                                    type: 'subcontractor' as const, 
                                    location: 'onsite' as const,
                                    name: '', 
                                    company: '', 
                                    role: '', 
                                    dailyHours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 } 
                                }] 
                            } 
                        })}
                        onUpdateEntries={(updated) => {
                            const recon = report.resources.manpower.filter(m => m.type === 'recon');
                            onUpdate({ ...report, resources: { ...report.resources, manpower: [...recon, ...updated] } });
                        }}
                      />


                  </div>
              )}

            {tab === 'equipment' && (
                 <EquipmentTable 
                    entries={report.resources.equipment.onSite}
                    onAdd={addEquipment}
                    onUpdateEntries={updateEquipment} 
                />
            )}

             {tab === 'materials' && (
                <MaterialTable 
                     entries={report.resources.materials || []}
                     onUpdate={updateMaterials}
                />
            )}

            {tab === 'procurement' && <ProcurementTab report={report} onUpdate={onUpdate} />}

              {tab === 'progress' && (
                  <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b bg-zinc-50 flex justify-between items-center">
                          <h3 className="font-bold text-zinc-800">Bid Item Progress</h3>
                          <div className="text-xs text-zinc-500">
                             Values entered here automatically update % Complete and Schedule Status.
                          </div>
                      </div>
                      
                      {!baselines ? (
                          <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                              <Layers size={48} className="mb-4 text-zinc-300"/>
                              <p className="font-medium text-zinc-600">No Baselines Loaded</p>
                              <p className="text-xs mt-1">Please ensure Project Setup | Contract is complete.</p>
                          </div>
                      ) : (
                          <div className="space-y-6 p-6">
                              {/* Progress Performance Summary Card */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-brand-primary to-cyan-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Project Completion</h4>
                                      <div className="flex items-baseline gap-4">
                                          <span className="text-5xl font-extrabold tracking-tight">
                                              {(() => {
                                                  const totalVal = baselines.bidItems.reduce((sum, item) => sum + item.totalValue, 0);
                                                  const earnedVal = baselines.bidItems.reduce((sum, item) => {
                                                      const entry = report.progress.bidItems.find(b => b.itemId === item.id);
                                                      return sum + (entry ? (entry.toDateQty * item.unitPrice) : 0);
                                                  }, 0);
                                                  return totalVal > 0 ? Math.round((earnedVal / totalVal) * 100) : 0;
                                              })()}%
                                          </span>
                                          <div className="text-xs opacity-70 max-w-[150px] leading-tight">
                                              Weighted Average based on Earned Value
                                          </div>
                                      </div>
                                      <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-90 font-mono">
                                          <span>Formula: Σ(Qty × Price) / Contract Total</span>
                                      </div>
                                  </div>

                                  <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-center shadow-sm">
                                      <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Earned Value</h5>
                                      <div className="text-2xl font-bold text-brand-primary">
                                          ${(() => {
                                              const earnedVal = baselines.bidItems.reduce((sum, item) => {
                                                  const entry = report.progress.bidItems.find(b => b.itemId === item.id);
                                                  return sum + (entry ? (entry.toDateQty * item.unitPrice) : 0);
                                              }, 0);
                                              return earnedVal.toLocaleString(undefined, {maximumFractionDigits: 0});
                                          })()}
                                      </div>
                                      <div className="text-xs text-zinc-400 mt-1">To Date Revenue</div>
                                  </div>

                                  <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-center shadow-sm">
                                      <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Remaining</h5>
                                      <div className="text-2xl font-bold text-zinc-700">
                                          ${(() => {
                                              const totalVal = baselines.bidItems.reduce((sum, item) => sum + item.totalValue, 0);
                                              const earnedVal = baselines.bidItems.reduce((sum, item) => {
                                                  const entry = report.progress.bidItems.find(b => b.itemId === item.id);
                                                  return sum + (entry ? (entry.toDateQty * item.unitPrice) : 0);
                                              }, 0);
                                              return (totalVal - earnedVal).toLocaleString(undefined, {maximumFractionDigits: 0});
                                          })()}
                                      </div>
                                      <div className="text-xs text-zinc-400 mt-1">Contract Balance</div>
                                  </div>
                              </div>

                              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3 py-3 sticky left-0 bg-zinc-50 z-20 w-16 border-r border-zinc-100">Item</th>
                                            <th className="px-3 py-3 sticky left-16 bg-zinc-50 z-20 border-r border-zinc-100">Description</th>
                                            <th className="px-3 py-3 text-right">Qty</th>
                                            <th className="px-3 py-3 text-right">Unit</th>
                                            <th className="px-3 py-3 text-right">Price</th>
                                            <th className="px-3 py-3 text-right">Total</th>
                                            <th className="px-3 py-3 text-right w-32 bg-brand-primary/5 text-brand-primary border-l border-brand-primary/10">This Wk</th>
                                            <th className="px-3 py-3 text-right w-32">To Date</th>
                                            <th className="px-3 py-3 text-right">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {baselines.bidItems.map(masterItem => {
                                            const entry = report.progress.bidItems.find(b => b.itemId === masterItem.id) || {
                                                itemId: masterItem.id,
                                                itemNumber: masterItem.itemNumber,
                                                description: masterItem.description,
                                                thisWeekQty: 0,
                                                toDateQty: 0
                                            };
                                            
                                            const percent = masterItem.contractQty > 0 ? (entry.toDateQty / masterItem.contractQty) * 100 : 0;
                                            
                                            return (
                                                <tr key={masterItem.id} className="hover:bg-zinc-50 transition group">
                                                    <td className="px-3 py-2 font-mono text-xs sticky left-0 bg-white z-10 group-hover:bg-zinc-50 border-r border-zinc-100">{masterItem.itemNumber}</td>
                                                    <td 
                                                        className={`px-3 py-2 font-medium text-zinc-700 cursor-pointer sticky left-16 bg-white z-10 group-hover:bg-zinc-50 border-r border-zinc-100 ${expandedRows.has(masterItem.id) ? '' : 'max-w-xs truncate'}`} 
                                                        title={masterItem.description}
                                                        onClick={() => {
                                                            const newSet = new Set(expandedRows);
                                                            if (newSet.has(masterItem.id)) newSet.delete(masterItem.id);
                                                            else newSet.add(masterItem.id);
                                                            setExpandedRows(newSet);
                                                        }}
                                                    >
                                                        {masterItem.description}
                                                        <span className="ml-2 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition">
                                                            {expandedRows.has(masterItem.id) ? '(collapse)' : '...'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-zinc-500 text-xs">{masterItem.contractQty.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right text-zinc-500 text-xs">{masterItem.unit}</td>
                                                    <td className="px-3 py-2 text-right text-zinc-500 text-xs">${masterItem.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-zinc-700 text-xs">${masterItem.totalValue.toLocaleString()}</td>
                                                    
                                                    {/* THIS WEEK QTY INPUT */}
                                                    <td className="px-2 py-1 bg-brand-primary/5 border-l border-brand-primary/10">
                                                        <input 
                                                            type="number" 
                                                            className="form-input text-right font-bold text-brand-primary border-brand-primary/20 bg-white h-7 shadow-none w-full"
                                                            value={entry.thisWeekQty || 0}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const oldThisWeek = entry.thisWeekQty || 0;
                                                                const delta = val - oldThisWeek;

                                                                const newEntries = [...report.progress.bidItems];
                                                                const idx = newEntries.findIndex(b => b.itemId === masterItem.id);
                                                                
                                                                const newEntry = { 
                                                                    ...entry, 
                                                                    thisWeekQty: val,
                                                                    toDateQty: entry.toDateQty + delta
                                                                };
                                                                
                                                                if (idx >= 0) newEntries[idx] = newEntry;
                                                                else newEntries.push(newEntry);
                                                                
                                                                onUpdate({ ...report, progress: { ...report.progress, bidItems: newEntries } });
                                                            }}
                                                        />
                                                    </td>
                                                    
                                                    {/* TO DATE QTY (Editable Override) */}
                                                    <td className="px-2 py-1 text-right">
                                                         <input 
                                                            type="number" 
                                                            className="form-input text-right font-bold text-zinc-800 bg-transparent border-transparent hover:border-zinc-300 focus:bg-white h-7 shadow-none w-full"
                                                            value={entry.toDateQty}
                                                            onChange={e => {
                                                                 const val = parseFloat(e.target.value) || 0;
                                                                 const newEntries = [...report.progress.bidItems];
                                                                 const idx = newEntries.findIndex(b => b.itemId === masterItem.id);
                                                                 
                                                                 const newEntry = { ...entry, toDateQty: val }; 
                                                                 
                                                                 if (idx >= 0) newEntries[idx] = newEntry;
                                                                 else newEntries.push(newEntry);
                                                                 onUpdate({ ...report, progress: { ...report.progress, bidItems: newEntries } });
                                                            }}
                                                        />
                                                    </td>
                                                    
                                                    <td className="px-3 py-2 text-right font-mono text-xs">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-8 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                                <div className={`h-full ${percent > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, percent)}%` }} />
                                                            </div>
                                                            <span className={percent > 100 ? 'text-amber-600 font-bold' : ''}>{percent.toFixed(0)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                          </table>
                        </div></div>
                      )}
                  </div>
              )}

              {tab === 'photos' && <PhotosTab report={report} onUpdate={onUpdate} onSave={onSave} projectId={projectId} />}

              {/* Other Tabs */}
              {(tab === 'schedule') && (
                  <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
                       <h3 className="text-xl font-bold text-brand-primary mb-6 capitalize">{tab} Management</h3>
                       {tab === 'schedule' && (
                            <div className="space-y-6">
                                <section className={`p-6 border rounded-xl ${scheduleWarning ? 'bg-amber-50 border-amber-300' : 'bg-zinc-50 border-zinc-200'}`}>
                                    <label className="block text-sm font-bold mb-3 flex justify-between">
                                        <span>Schedule Implications & Critical Path Analysis</span>
                                        {scheduleWarning && <span className="text-amber-700 text-xs flex items-center gap-1"><AlertTriangle size={12}/> Required</span>}
                                    </label>
                                    <textarea 
                                        className="w-full h-32 p-3 bg-white border border-zinc-300 rounded focus:border-brand-primary outline-none" 
                                        placeholder="Did weather or delays impact the critical path? Are we ahead/behind?"
                                        value={report.schedule.analysis}
                                        onChange={e => onUpdate({...report, schedule: {...report.schedule, analysis: e.target.value}})}
                                    />
                                </section>
                            </div>
                       )}
                  </div>
              )}
          </div>
      </div>
      {/* Print Preview Modal */}
      {/* Print Studio Modal (New Layered Architecture) */}
      <PrintStudioModal 
          open={showPrintModal} 
          onClose={() => setShowPrintModal(false)}
          reportData={report}
          projectConfig={projectConfig}
          baselines={baselines}
          onUpdateReport={onUpdate}
      />
    </div>
  );
}

// --- SUB COMPONENTS ---

// Helper for Inputs
function Input({ label, type="text", val, onChange, bare }: { label: string, val: string | number, onChange: (value: string) => void, type?: string, bare?: boolean }) {
    if (bare) return <input type={type} className="w-full bg-transparent border-none p-0 text-2xl font-bold text-zinc-900 focus:ring-0" value={val} onChange={e => onChange(e.target.value)} />;
    return (
        <div>
             <label className="text-xs font-bold text-zinc-500 uppercase">{label}</label>
             <input type={type} className="w-full p-2 border border-zinc-300 rounded font-bold" value={val} onChange={e => onChange(e.target.value)} />
        </div>
    )
}

// End of Sub Components

