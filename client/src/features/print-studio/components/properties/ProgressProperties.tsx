import React from 'react';
import { Layout } from 'lucide-react';

interface ProgressPropertiesProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
}

export function ProgressProperties({ config, onUpdateConfig }: ProgressPropertiesProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Layout size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Progress Options</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Show % Complete</span>
          <input
            type="checkbox"
            checked={config?.showPercent}
            onChange={(e) => onUpdateConfig({ showPercent: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Show Notes Column</span>
          <input
            type="checkbox"
            checked={config?.showNotes}
            onChange={(e) => onUpdateConfig({ showNotes: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
      </div>
    </>
  );
}
