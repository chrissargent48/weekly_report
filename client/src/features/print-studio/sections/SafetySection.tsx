import React from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { SafetyObservation } from '../../../types';
import { SectionWrapper } from './SectionWrapper';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { RowBreakDivider, useHasBreakAtRow } from '../components/RowBreakDivider';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
  sectionConfig?: any;
  onUpdateReport?: (data: ReportData) => void;
  onToggleRowBreak?: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
}

// Auto-resize textarea helper
const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  placeholder: string,
  className: string 
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // Reset to shrink if needed
      el.style.height = el.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
    />
  );
};

export function SafetySection({ config, reportData, placement, sectionConfig, onUpdateReport, onToggleRowBreak }: Props) {
  const sc = sectionConfig || {};
  const safety = reportData.safety;
  if (!safety) return null;

  // Render Control Flags
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const showFooter = placement?.renderConfig?.showFooter ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  
  // Data Slicing for Observations
  const allObservations = reportData.safety.observations || [];
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allObservations.length;
  const visibleObservations = allObservations.slice(startIdx, endIdx);

  const stats = safety.stats || {
    nearMisses: { week: 0, ytd: 0 },
    firstAids: { week: 0, ytd: 0 },
    recordables: { week: 0, ytd: 0 },
    lostTime: { week: 0, ytd: 0 },
    stopWorks: { week: 0, ytd: 0 },
    hofs: { week: 0, ytd: 0 },
    safetyAudits: { week: 0, ytd: 0 }
  };

  const statRows: { key: keyof typeof stats; label: string }[] = [
    { key: 'nearMisses', label: 'Near Misses' },
    { key: 'firstAids', label: 'First Aids' },
    { key: 'recordables', label: 'Recordable Incidents' },
    { key: 'lostTime', label: 'Lost Time / Restricted Duty' },
    { key: 'stopWorks', label: 'Stop Works' },
    { key: 'hofs', label: "HOF's" },
    { key: 'safetyAudits', label: 'Safety Audits' }
  ];

  const handleUpdate = (field: keyof typeof safety, value: any) => {
    if (!onUpdateReport) return;
    onUpdateReport({
      ...reportData,
      safety: {
        ...safety,
        [field]: value
      }
    });
  };

  return (
    <SectionWrapper config={config} title={isContinued ? "Safety Management (Continued)" : "Safety Management"}>
       <div className="space-y-6">
          
          {/* 1. Top: Weekly Safety Topic (HEADER) */}
          {showHeader && (
              <>
                  <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm flex flex-col group/topic">
                      <div className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center gap-2">
                           <Shield className="w-4 h-4 text-green-700" />
                           <span className="text-xs font-bold uppercase text-green-800 tracking-wider">Weekly Safety Topic</span>
                      </div>
                      <div className="p-4 flex flex-col min-h-[80px]">
                          {onUpdateReport ? (
                              <input 
                                className="font-bold text-zinc-900 mb-2 w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                                value={safety.weeklyTopic || ''}
                                onChange={e => handleUpdate('weeklyTopic', e.target.value)}
                                placeholder="Enter Topic Title..."
                              />
                          ) : (
                              <div className="font-bold text-zinc-900 mb-2">{safety.weeklyTopic || 'No Topic Selected'}</div>
                          )}
                          
                          {onUpdateReport ? (
                              <AutoResizeTextarea
                                className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap w-full bg-transparent border-none p-0 focus:ring-0 resize-none placeholder:text-zinc-300 overflow-hidden"
                                value={safety.weeklyTopicNotes || ''}
                                onChange={e => handleUpdate('weeklyTopicNotes', e.target.value)}
                                placeholder="Enter detailed notes about the weekly safety topic..."
                              />
                          ) : (
                              <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                  {safety.weeklyTopicNotes || 'No notes available.'}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* 2. Middle: Safety Stats Table (HEADER) - conditional on showCards */}
                  {(sc.showCards ?? true) && <div className="border border-zinc-200 rounded-lg overflow-hidden">
                     <table className="w-full text-sm">
                        <thead className="bg-brand-primary text-white">
                           <tr>
                              <th className="py-2 pl-4 text-left font-bold text-[10px] uppercase tracking-wider">Key Performance Indicator</th>
                              <th className="py-2 px-4 text-center font-bold text-[10px] uppercase tracking-wider w-32 border-l border-white/20">Current Week</th>
                              <th className="py-2 px-4 text-center font-bold text-[10px] uppercase tracking-wider w-32 border-l border-white/20">Year to Date</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                           {statRows.map((row, i) => (
                              <tr key={row.key as string} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                                 <td className="py-2 pl-4 text-zinc-700 font-medium">{row.label}</td>
                                 <td className="py-2 px-4 text-center font-bold text-zinc-900 border-l border-zinc-100">
                                    {stats[row.key]?.week || 0}
                                 </td>
                                 <td className="py-2 px-4 text-center text-zinc-600 border-l border-zinc-100">
                                    {stats[row.key]?.ytd || 0}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>}
              </>
          )}

          {/* 3. Observations Log (Conditional Slicing) */}
          {(sc.showTable ?? true) && visibleObservations.length > 0 && (
             <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2">
                   <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                       Safety Observations
                       {visibleObservations.length !== allObservations.length && 
                          ` (${startIdx + 1}-${endIdx} of ${allObservations.length})`
                       }
                   </span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-white border-b border-zinc-200">
                       <tr className="text-xs text-zinc-500">
                          <th className="py-2 pl-4 text-left font-bold w-24">Date</th>
                          <th className="py-2 px-2 text-left font-bold w-24">Type</th>
                          <th className="py-2 px-2 text-left font-bold">Description</th>
                          <th className="py-2 px-2 text-left font-bold w-1/3">Action Taken</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                       {visibleObservations.map((obs: SafetyObservation, i: number) => {
                          const actualRowIndex = startIdx + i;
                          const isLastRow = i === visibleObservations.length - 1;
                          const hasBreak = useHasBreakAtRow(config.manualBreaks, 'safety', actualRowIndex);

                          return (
                            <React.Fragment key={obs.id}>
                              <tr className="hover:bg-zinc-50">
                                 <td className="py-2 pl-4 text-xs font-mono text-zinc-500">{obs.date}</td>
                                 <td className="py-2 px-2">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                       obs.type === 'Positive' ? 'bg-green-100 text-green-700' :
                                       obs.type === 'Corrective' ? 'bg-amber-100 text-amber-700' :
                                       'bg-red-100 text-red-700'
                                    }`}>
                                       {obs.type}
                                    </span>
                                 </td>
                                 <td className="py-2 px-2 text-xs text-zinc-800">{obs.description}</td>
                                 <td className="py-2 px-2 text-xs text-zinc-600 italic">{obs.actionTaken}</td>
                              </tr>
                              {/* Row break divider */}
                              {!isLastRow && onToggleRowBreak && (
                                <RowBreakDivider
                                  hasBreak={hasBreak}
                                  onToggleBreak={() => onToggleRowBreak('safety', actualRowIndex, obs.id)}
                                  compact
                                />
                              )}
                            </React.Fragment>
                          );
                       })}
                    </tbody>
                </table>
             </div>
          )}

          {/* 4. Bottom: Narrative (FOOTER) */}
          {showFooter && (
              <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm flex flex-col group/narrative">
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
                       <Info className="w-4 h-4 text-blue-700" />
                       <span className="text-xs font-bold uppercase text-blue-800 tracking-wider">Safety Narrative</span>
                  </div>
                  <div className="p-4 flex flex-col min-h-[80px]">
                      {onUpdateReport ? (
                          <AutoResizeTextarea
                            className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap w-full bg-transparent border-none p-0 focus:ring-0 resize-none placeholder:text-zinc-300 overflow-hidden"
                            value={safety.narrative || ''}
                            onChange={e => handleUpdate('narrative', e.target.value)}
                            placeholder="Enter safety narrative..."
                          />
                      ) : (
                          <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                              {safety.narrative || 'No additional commentary.'}
                          </div>
                      )}
                  </div>
              </div>
          )}

       </div>
    </SectionWrapper>
  );
}
