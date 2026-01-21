import React from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { ProjectConfig } from '../../../types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  projectConfig?: ProjectConfig;
  placement?: PagePlacement;
}

export function KeyPersonnelSection({ config, reportData, projectConfig, placement }: Props) {
  if (!projectConfig?.personnel) return null;

  const { client, engineer, recon } = projectConfig.personnel;
  
  // Slice logic
  // We apply the same slice range to all 3 columns to keep them aligned across pages
  const startIdx = placement?.dataRange?.start ?? 0;
  // If end is undefined, we assume full length. But each list has different length.
  // We can just slice(start, end). If end > length, it stops at length.
  const endIdx = placement?.dataRange?.end; 
  
  const clientReps = client.representatives.slice(startIdx, endIdx);
  const engineerReps = engineer.representatives.slice(startIdx, endIdx);
  const reconReps = recon.slice(startIdx, endIdx);

  // If page is empty (rare case if calc works), skip
  if (clientReps.length === 0 && engineerReps.length === 0 && reconReps.length === 0) return null;

  // Header Logic
  const showMainHeader = placement?.renderConfig?.showHeader ?? true;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const sectionTitle = showMainHeader ? (isContinued ? "Key Personnel (Continued)" : "Key Personnel") : undefined;

  // Helper to render a person row
  const PersonRow = ({ name, role }: { name: string, role: string }) => (
    <div className="mb-2 last:mb-0">
      <div className="font-bold text-zinc-900 text-sm leading-tight">{name}</div>
      <div className="text-xs text-zinc-600 font-medium">{role}</div>
    </div>
  );

  return (
    <SectionWrapper config={config} title={sectionTitle}>
      <div className="grid grid-cols-3 gap-6">
        
        {/* Client Column */}
        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 border-b border-zinc-200 pb-1">
            Client
          </h3>
          <div className="mb-3">
            <div className="font-bold text-base text-zinc-800">{client.company || 'Client Company'}</div>
            {client.address && <div className="text-xs text-zinc-500">{client.address}</div>}
          </div>
          {clientReps.map((rep: any, i: number) => (
            <PersonRow key={i} {...rep} />
          ))}
        </div>

        {/* Engineer Column */}
        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 border-b border-zinc-200 pb-1">
            Engineer of Record
          </h3>
          <div className="mb-3">
            <div className="font-bold text-base text-zinc-800">{engineer.company || 'Engineer Company'}</div>
            {engineer.address && <div className="text-xs text-zinc-500">{engineer.address}</div>}
          </div>
          {engineerReps.map((rep: any, i: number) => (
            <PersonRow key={i} {...rep} />
          ))}
        </div>

        {/* RECON Column */}
        <div className="bg-white rounded-lg p-3 border-2 border-zinc-200">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 border-b border-zinc-200 pb-1">
            Recon Key Personnel - Contractor
          </h3>
          {/* Redundant text removed as per request */}
          {reconReps.map((p: any, i: number) => (
            <PersonRow key={i} {...p} />
          ))}
        </div>

      </div>
    </SectionWrapper>
  );
}
