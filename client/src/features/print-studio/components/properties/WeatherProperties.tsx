import React from 'react';
import { Sun } from 'lucide-react';

interface WeatherPropertiesProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
}

export function WeatherProperties({ config, onUpdateConfig }: WeatherPropertiesProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Sun size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Weather Options</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Summary Cards</span>
          <input
            type="checkbox"
            checked={config?.showSummary}
            onChange={(e) => onUpdateConfig({ showSummary: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Work Impact Column</span>
          <input
            type="checkbox"
            checked={config?.showWorkImpact}
            onChange={(e) => onUpdateConfig({ showWorkImpact: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-[10px] font-bold text-gray-500 block">Temp Unit</label>
        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => onUpdateConfig({ tempUnit: 'F' })}
            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${config?.tempUnit === 'F' ? 'bg-white shadow text-teal-600' : 'text-gray-400'}`}
          >
            °F
          </button>
          <button
            onClick={() => onUpdateConfig({ tempUnit: 'C' })}
            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${config?.tempUnit === 'C' ? 'bg-white shadow text-teal-600' : 'text-gray-400'}`}
          >
            °C
          </button>
        </div>
      </div>
    </>
  );
}
