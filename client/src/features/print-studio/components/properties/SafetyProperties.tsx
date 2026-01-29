import React from 'react';
import { Settings } from 'lucide-react';

interface SafetyPropertiesProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
}

export function SafetyProperties({ config, onUpdateConfig }: SafetyPropertiesProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Settings size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Safety Options</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Stat Summary Cards</span>
          <input
            type="checkbox"
            checked={config?.showCards}
            onChange={(e) => onUpdateConfig({ showCards: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Detailed Incident Table</span>
          <input
            type="checkbox"
            checked={config?.showTable}
            onChange={(e) => onUpdateConfig({ showTable: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
      </div>
    </>
  );
}
