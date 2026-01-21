import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
}


export function ManpowerSection({ config, reportData }: Props) {
  const items = reportData.resources?.manpower || [];
  if (items.length === 0) return null;

  // Helper to calculate total hours
  const getTotal = (item: any) => {
    const dh = item.dailyHours || {};
    return Object.values(dh).reduce((sum: number, h: any) => sum + (Number(h) || 0), 0);
  };

  // Helper to get active days
  const getActiveDays = (item: any) => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    // Map full day names to 1-letter codes if needed, or just use index
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dh = item.dailyHours || {};
    return days.map((day, idx) => ({
      label: dayLabels[idx],
      hasHours: (Number(dh[day]) || 0) > 0
    }));
  };

  // 1. Management: type 'Mgmt' or category 'management' (excluding 0 hours)
  const management = items.filter((m: any) => 
      (m.type === 'Mgmt' || m.category === 'management') && 
      getTotal(m) > 0
    );

  // 2. Field Staff: type 'Field' or category 'field' OR plain 'recon' without management category
  // Logic: Must be Field OR (Recon type/company AND NOT management AND NOT subcontractor)
  // We rely on type/category. If company is NOT 'RECON', check if it is 'subcontractor' (exclude those).
  const fieldStaff = items.filter((m: any) => {
      const type = (m.type || '').toLowerCase();
      const category = (m.category || '').toLowerCase();
      const company = (m.company || '').toLowerCase();
      
      const isMgmt = type === 'mgmt' || category === 'management';
      const isSub = type === 'subcontractor' || category === 'subcontractor';
      
      // Strict check: if type is 'recon', and not mgmt, and not sub, it's field.
      // Also catch explicit 'field' type/category.
      const isExplicitField = type === 'field' || category === 'field';
      const isReconField = (type === 'recon' || company === 'recon') && !isMgmt && !isSub;

      return (isExplicitField || isReconField) && getTotal(m) > 0;
  });

  // 3. Subcontractors: type 'subcontractor' or category 'subcontractor' (excluding 0 hours)
  const subcontractors = items.filter((m: any) => 
      (m.type === 'subcontractor' || m.category === 'subcontractor') && 
      getTotal(m) > 0
    );

  const renderTable = (data: any[], title: string, isSubcontractor: boolean = false) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-4 break-inside-avoid">
         <h3 className="text-[10px] font-bold uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-1">
          {title}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">
               {isSubcontractor && <th className="text-left py-1 pl-2 w-1/4">Company</th>}
               <th className="text-left py-1 pl-2">Name</th>
               <th className="text-left py-1 pl-2">Role</th>
               <th className="text-center py-1 w-24">Days Worked</th>
               <th className="text-right py-1 w-16">Status</th>
               <th className="text-right py-1 w-16 bg-zinc-50/50">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((item: any, i: number) => {
              const total = getTotal(item);
              const isRemote = item.location === 'remote';
              const activeDays = getActiveDays(item);
              
              const companyName = item.company || 'Unknown Company';
              const name = item.name || 'Unknown';
              const role = item.role || '-';

              return (
                <tr key={i} className="group">
                  {isSubcontractor && (
                      <td className="py-2 pl-2 pr-2 text-xs font-medium text-zinc-600 truncate max-w-[150px]" title={companyName}>
                          {companyName}
                      </td>
                  )}
                  <td className="py-2 pl-2 pr-2">
                     <span className="font-bold text-zinc-900 text-xs">{name}</span>
                  </td>
                  <td className="py-2 pl-2 pr-2">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{role}</span>
                  </td>
                  <td className="py-2 text-center align-middle">
                    <div className="flex justify-center gap-0.5">
                        {activeDays.map((d, idx) => (
                            <div 
                                key={idx} 
                                className={`w-3 h-3 flex items-center justify-center text-[7px] rounded-sm font-bold ${
                                    d.hasHours 
                                    ? 'bg-brand-primary text-white' 
                                    : 'text-zinc-300 bg-zinc-50'
                                }`}
                            >
                                {d.label}
                            </div>
                        ))}
                    </div>
                  </td>
                  <td className="py-2 text-right align-middle">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wide ${
                        isRemote 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-teal-50 text-teal-700 border-teal-100'
                    }`}>
                        {isRemote ? 'RMT' : 'ONS'}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-xs font-bold text-zinc-700 bg-zinc-50/30 align-middle">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SectionWrapper config={config} title="Manpower Log">
      <div className="flex flex-col gap-2">
        {/* Render Sections */}
        {renderTable(management, 'Management Personnel')}
        {renderTable(fieldStaff, 'Field Operations')}
        {renderTable(subcontractors, 'Subcontractors', true)}
        
        {/* Empty state if nothing to show */}
        {management.length === 0 && fieldStaff.length === 0 && subcontractors.length === 0 && (
            <div className="text-center py-4 text-zinc-400 text-xs italic">
                No active manpower recorded for this week.
            </div>
        )}
      </div>
    </SectionWrapper>
  );
}
