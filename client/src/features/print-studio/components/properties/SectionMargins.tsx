import React from 'react';
import { Layout, MoveVertical } from 'lucide-react';

interface SectionMarginsProps {
  config: any;
  onUpdateConfig: (updates: any) => void;
  documentSettings: any;
  selectedSection?: string;
}

export function SectionMargins({ config, onUpdateConfig, documentSettings, selectedSection }: SectionMarginsProps) {
  // Get current padding values for the selected section
  const sectionPadding = config?.sectionPadding?.[selectedSection || ''] || { top: 0, bottom: 0 };

  const handlePaddingChange = (field: 'top' | 'bottom', value: number) => {
    if (!selectedSection) return;
    const existing = config?.sectionPadding || {};
    onUpdateConfig({
      sectionPadding: {
        ...existing,
        [selectedSection]: {
          ...existing[selectedSection],
          [field]: value,
        },
      },
    });
  };

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

      {/* Section Padding — Word-style spacing controls */}
      {selectedSection && selectedSection !== 'cover' && (
        <>
          <div className="flex items-center gap-2 text-gray-400 mt-4 mb-1">
            <MoveVertical size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Spacing</span>
          </div>
          <p className="text-[9px] text-gray-400 italic -mt-1">
            Adjust space before/after this section to fine-tune page layout.
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Space Before</span>
              <span>{sectionPadding.top}px</span>
            </div>
            <input
              type="range" min="0" max="120" step="4"
              value={sectionPadding.top}
              onChange={(e) => handlePaddingChange('top', parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>Space After</span>
              <span>{sectionPadding.bottom}px</span>
            </div>
            <input
              type="range" min="0" max="120" step="4"
              value={sectionPadding.bottom}
              onChange={(e) => handlePaddingChange('bottom', parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {(sectionPadding.top > 0 || sectionPadding.bottom > 0) && (
            <button
              onClick={() => {
                if (!selectedSection) return;
                const existing = config?.sectionPadding || {};
                onUpdateConfig({
                  sectionPadding: {
                    ...existing,
                    [selectedSection]: { top: 0, bottom: 0 },
                  },
                });
              }}
              className="text-[9px] text-amber-600 hover:text-amber-800 font-medium"
            >
              Reset spacing
            </button>
          )}
        </>
      )}
    </div>
  );
}
