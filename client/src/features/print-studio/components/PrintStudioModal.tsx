import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PDFViewer } from '@react-pdf/renderer';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReportData } from '../config/printConfig.types';
import { ProjectConfig, ProjectBaselines } from '../../../types';
import { ReportDocument } from '../react-pdf/ReportDocument';

interface Props {
  open: boolean;
  onClose: () => void;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines | null;
  onUpdateReport: (data: ReportData) => void;
}

export function PrintStudioModal({ open, onClose, reportData, projectConfig, baselines }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-zinc-900/95" aria-hidden="true" />

        <div className="fixed inset-0 overflow-hidden flex flex-col">
          {/* Minimal Header */}
          <div className="bg-zinc-900 text-white h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-800">
            <h1 className="text-lg font-bold">Print Studio (Rebuild Mode)</h1>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Minimal Workspace */}
          <div className="flex-1 bg-zinc-800 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-5xl bg-zinc-900 rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10">
              <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
                <ReportDocument 
                    projectConfig={projectConfig}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
