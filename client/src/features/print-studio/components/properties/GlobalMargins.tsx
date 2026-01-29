import React from 'react';
import { Layout, RotateCcw } from 'lucide-react';

interface GlobalMarginsProps {
  documentSettings: any;
  onUpdateDocumentSettings: (updates: any) => void;
}

export function GlobalMargins({ documentSettings, onUpdateDocumentSettings }: GlobalMarginsProps) {
  return (
    <div className="space-y-4 pt-0">
      <div className="flex items-center justify-between text-gray-400 mb-1">
        <div className="flex items-center gap-2">
          <Layout size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Global Margins</span>
        </div>
        <button
          onClick={() => onUpdateDocumentSettings({
            defaultMargins: { top: 24, bottom: 24, left: 24, right: 24 }
          })}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-teal-600 transition-colors"
          title="Reset to 24pt"
        >
          <RotateCcw size={10} />
        </button>
      </div>

      {(['top', 'bottom', 'left', 'right'] as const).map(side => (
        <div key={side} className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span className="capitalize">Margin {side}</span>
            <span>{documentSettings.defaultMargins[side]}pt</span>
          </div>
          <input
            type="range" min="0" max="100"
            value={documentSettings.defaultMargins[side]}
            onChange={(e) => onUpdateDocumentSettings({
              defaultMargins: { ...documentSettings.defaultMargins, [side]: parseInt(e.target.value) }
            })}
            className="w-full accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-gray-600">Apply to all sections</span>
        <input
          type="checkbox"
          checked={documentSettings.applyToAll}
          onChange={(e) => onUpdateDocumentSettings({ applyToAll: e.target.checked })}
          className="accent-teal-600 w-3.5 h-3.5"
        />
      </div>
    </div>
  );
}
