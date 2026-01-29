import React from 'react';
import { Palette } from 'lucide-react';

interface PhotosPropertiesProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
}

export function PhotosProperties({ config, onUpdateConfig }: PhotosPropertiesProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Palette size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Photo Grid</span>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 block">Grid Columns</label>
        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          {[2, 3, 4].map(cols => (
            <button
              key={cols}
              onClick={() => onUpdateConfig({ columns: cols })}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${config?.columns === cols ? 'bg-white shadow text-teal-600' : 'text-gray-400'}`}
            >
              {cols} col
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Show Captions</span>
          <input
            type="checkbox"
            checked={config?.showCaptions}
            onChange={(e) => onUpdateConfig({ showCaptions: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Show Dates</span>
          <input
            type="checkbox"
            checked={config?.showDates}
            onChange={(e) => onUpdateConfig({ showDates: e.target.checked })}
            className="accent-teal-600 w-3.5 h-3.5"
          />
        </div>
      </div>
    </>
  );
}
