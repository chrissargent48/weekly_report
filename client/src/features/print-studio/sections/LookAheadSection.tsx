import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { Target, CornerDownRight } from 'lucide-react';
import { LookAheadEntry } from '../../../types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement?: any;
  onUpdateReport?: (data: ReportData) => void;
}

export function LookAheadSection({ config, reportData }: Props) {
  const items = reportData.progress?.lookAheadItems || [];
  if (items.length === 0) return null;

  // Split items into 3 columns based on relative order
  const distributeItems = (items: LookAheadEntry[]) => {
    const total = items.length;
    const itemsPerCol = Math.ceil(total / 3);
    
    // We want to fill Week 1, then Week 2, then Week 3
    // But if total < 3, we fill columns sequentially
    
    const week1 = items.slice(0, itemsPerCol);
    const week2 = items.slice(itemsPerCol, itemsPerCol * 2);
    const week3 = items.slice(itemsPerCol * 2);
    
    return [week1, week2, week3];
  };

  const [week1Items, week2Items, week3Items] = distributeItems(items);
  const weeks = [
      { title: 'WEEK 1 HORIZON', items: week1Items, subtitle: 'Current Week' },
      { title: 'WEEK 2 HORIZON', items: week2Items, subtitle: 'Next Week' },
      { title: 'WEEK 3 HORIZON', items: week3Items, subtitle: 'Future Outlook' }
  ];

  return (
    <SectionWrapper config={config} title="Three Week Look Ahead">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weeks.map((week, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                  {/* Column Header */}
                  <div className="pb-2 border-b-2 border-brand-primary">
                      <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest leading-none">
                          {week.title}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-1 block">
                          {week.subtitle}
                      </span>
                  </div>

                  {/* Activity Cards */}
                  <div className="space-y-3">
                      {week.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-white rounded border border-zinc-200 border-l-4 border-l-brand-primary p-3 flex flex-col shadow-sm"
                          >
                              <div className="flex items-start gap-2">
                                  {/* Icon: Heuristic - if description implies subtask (e.g. starts with " -"), use CornerDownRight */}
                                  <div className="mt-0.5 shrink-0 text-brand-primary">
                                      {item.description.trim().startsWith('-') ? (
                                           <CornerDownRight size={14} className="ml-1" />
                                      ) : (
                                           <Target size={14} />
                                      )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-bold text-zinc-800 leading-tight">
                                          {item.description.replace(/^- /, '')}
                                      </div>
                                      
                                      {/* Phase / WBS Badge if present */}
                                      {item.wbs && (
                                          <div className="inline-block mt-1 px-1.5 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-mono rounded">
                                              {item.wbs}
                                          </div>
                                      )}

                                      {/* Notes Notes Field */}
                                      {item.notes && (
                                          <div className="mt-1 text-[9px] text-zinc-500 italic leading-relaxed border-t border-zinc-100 pt-1">
                                              {item.notes}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                      
                      {/* Empty State for Column */}
                      {week.items.length === 0 && (
                          <div className="p-4 rounded border border-dashed border-zinc-200 text-center">
                              <span className="text-[10px] text-zinc-400 italic">No activities scheduled</span>
                          </div>
                      )}
                  </div>
              </div>
          ))}
       </div>
    </SectionWrapper>
  );
}
