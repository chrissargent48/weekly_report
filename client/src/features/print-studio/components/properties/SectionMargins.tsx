import React from 'react';
import { Layout } from 'lucide-react';

interface SectionMarginsProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
  documentSettings: any;
}

export function SectionMargins({ config, onUpdateConfig, documentSettings }: SectionMarginsProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Layout size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Layout</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Margin Top</span>
          <span>{config?.marginTop || 0}pt</span>
        </div>
        <input
          type="range" min="0" max="100"
          value={config?.marginTop || 0}
          onChange={(e) => onUpdateConfig({ marginTop: parseInt(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
          disabled={documentSettings.applyToAll}
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Margin Bottom</span>
          <span>{config?.marginBottom || 0}pt</span>
        </div>
        <input
          type="range" min="0" max="100"
          value={config?.marginBottom || 0}
          onChange={(e) => onUpdateConfig({ marginBottom: parseInt(e.target.value) })}
          className="w-full accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
          disabled={documentSettings.applyToAll}
        />
      </div>
      {documentSettings.applyToAll && (
        <p className="text-[9px] text-gray-400 italic">Global margins are active.</p>
      )}
    </div>
  );
}
