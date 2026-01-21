import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { ProjectConfig } from '../../../types';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  projectConfig?: ProjectConfig;
}

export function KeyPersonnelSection({ config, reportData, projectConfig }: Props) {
  if (!projectConfig?.personnel) return null;

  const { client, engineer, recon } = projectConfig.personnel;

  // Helper to render a person row
  const PersonRow = ({ name, role }: { name: string, role: string }) => (
    <div className="mb-2 last:mb-0">
      <div className="font-bold text-zinc-900 text-sm leading-tight">{name}</div>
      <div className="text-xs text-zinc-600 font-medium">{role}</div>
    </div>
  );

  return (
    <SectionWrapper config={config} title="Key Personnel">
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
          {client.representatives.map((rep: any, i: number) => (
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
          {engineer.representatives.map((rep: any, i: number) => (
            <PersonRow key={i} {...rep} />
          ))}
        </div>

        {/* RECON Column */}
        <div className="bg-white rounded-lg p-3 border-2 border-zinc-200">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 border-b border-zinc-200 pb-1">
            Recon Key Personnel - Contractor
          </h3>
          {/* Redundant text removed as per request */}
          {recon.map((p: any, i: number) => (
            <PersonRow key={i} {...p} />
          ))}
        </div>

      </div>
    </SectionWrapper>
  );
}
