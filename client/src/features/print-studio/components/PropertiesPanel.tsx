import React from 'react';
import { WeeklyReport, ProjectConfig } from '../../../types';
import { Settings, Palette, HelpCircle, ChevronRight } from 'lucide-react';
import { GlobalMargins } from './properties/GlobalMargins';
import { GlobalBranding } from './properties/GlobalBranding';
import { SectionMargins } from './properties/SectionMargins';
import { CoverProperties } from './properties/CoverProperties';
import { WeatherProperties } from './properties/WeatherProperties';
import { ExecutiveProperties } from './properties/ExecutiveProperties';
import { ProgressProperties } from './properties/ProgressProperties';
import { PhotosProperties } from './properties/PhotosProperties';
import { SafetyProperties } from './properties/SafetyProperties';

interface PropertiesPanelProps {
  selectedSection: string;
  selectedElementId?: string | null;
  report?: WeeklyReport;
  projectConfig?: ProjectConfig;
  onUpdateReport?: (updatedReport: WeeklyReport) => void;
  enabledSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  config: any;
  onUpdateConfig: (updates: any) => void;
  documentSettings: any;
  onUpdateDocumentSettings: (updates: any) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedSection,
  selectedElementId,
  report,
  projectConfig,
  onUpdateReport,
  enabledSections,
  onToggleSection,
  config,
  onUpdateConfig,
  documentSettings,
  onUpdateDocumentSettings
}) => {

  const isIncluded = enabledSections[selectedSection] || false;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-11 border-b border-gray-200 flex items-center px-4 bg-gray-50/50 cursor-pointer" onClick={() => onToggleSection('document')}>
        <Settings size={14} className="text-gray-400 mr-2" />
        <h3 className="font-bold text-[11px] text-gray-700 uppercase tracking-wider">Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Section General Info */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-[10px] font-bold text-gray-400">
               <span 
                 className="cursor-pointer hover:text-teal-600 transition-colors" 
                 onClick={() => onToggleSection('document')}
               >
                 Document
               </span>
               {selectedSection !== 'document' && (
                 <>
                   <ChevronRight size={10} className="mx-1" />
                   <span className="text-teal-700 capitalize">{selectedSection}</span>
                 </>
               )}
               {selectedElementId && (
                 <>
                   <ChevronRight size={10} className="mx-1" />
                   <span className="text-gray-900 truncate max-w-[80px]">{selectedElementId}</span>
                 </>
               )}
            </div>
            
            <span className="text-sm font-bold text-gray-800 capitalize">
                {selectedElementId ? 'Element Settings' : (selectedSection === 'document' ? 'Global Settings' : selectedSection)}
            </span>
          </div>
          {selectedSection !== 'document' && (
            <button
              onClick={() => onToggleSection(selectedSection)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                isIncluded
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              {isIncluded ? 'Included' : 'Hidden'}
            </button>
          )}
        </div>

        {/* Global Controls (Settings) */}
        {selectedSection === 'document' && (
          <>
            <GlobalBranding config={config} onUpdateConfig={onUpdateConfig} />
            <div className="border-t border-gray-100 my-4" />
            <GlobalMargins documentSettings={documentSettings} onUpdateDocumentSettings={onUpdateDocumentSettings} />
          </>
        )}

        {/* Section Margins (if not document) */}
        {selectedSection !== 'document' && (
          <SectionMargins config={config} onUpdateConfig={onUpdateConfig} documentSettings={documentSettings} />
        )}

        {/* Section Specific Controls */}
        <div className="space-y-4 pt-4 border-t border-gray-100">

          {selectedSection === 'cover' && (
            <CoverProperties report={report} projectConfig={projectConfig} config={config} onUpdateConfig={onUpdateConfig} />
          )}

          {selectedSection === 'weather' && (
            <WeatherProperties config={config} onUpdateConfig={onUpdateConfig} reportData={report} />
          )}

          {selectedSection === 'executive' && (
            <ExecutiveProperties report={report} onUpdateReport={onUpdateReport} />
          )}

          {selectedSection === 'progress' && (
            <ProgressProperties config={config} onUpdateConfig={onUpdateConfig} />
          )}

          {selectedSection === 'photos' && (
            <PhotosProperties config={config} onUpdateConfig={onUpdateConfig} />
          )}

          {selectedSection === 'safety' && (
            <SafetyProperties config={config} onUpdateConfig={onUpdateConfig} />
          )}

          {/* Placeholder for other sections */}
          {!['cover', 'executive', 'weather', 'progress', 'photos', 'safety'].includes(selectedSection) && (
             <div className="py-8 flex flex-col items-center text-center gap-3">
               <HelpCircle size={24} className="text-gray-200" />
               <p className="text-[10px] text-gray-400 italic px-4">
                 Extended controls for this section coming in Phase 3.
               </p>
             </div>
          )}

        </div>

      </div>

      {/* Footer / Status */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 font-mono tracking-tighter">CONFIG_ID_{selectedSection.toUpperCase()}</span>
        <Palette size={12} className="text-teal-500" />
      </div>

    </div>
  );
};
