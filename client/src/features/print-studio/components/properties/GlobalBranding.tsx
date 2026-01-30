import React from 'react';
import { Palette, Type, Check } from 'lucide-react';
import { PrintConfig } from '../../config/printConfig.types';

interface GlobalBrandingProps {
  config: PrintConfig;
  onUpdateConfig: (updates: Partial<PrintConfig>) => void;
}

export function GlobalBranding({ config, onUpdateConfig }: GlobalBrandingProps) {
  // Default values if branding is undefined
  const primaryColor = config.branding?.primaryColor || '#008B8B'; // Teal
  const headingFont = config.branding?.headingFont || 'Inter';

  const updateBranding = (updates: any) => {
    onUpdateConfig({
      branding: {
        primaryColor,
        headingFont,
        useSecondaryColor: false,
        ...config.branding, // Keep existing
        ...updates
      }
    });
  };

  const fonts = ['Inter', 'Roboto', 'Outfit', 'Times New Roman'];
  const colors = [
    '#008B8B', // Teal (Default)
    '#2563EB', // Blue
    '#DC2626', // Red
    '#D97706', // Amber
    '#059669', // Emerald
    '#7C3AED', // Violet
    '#111827', // Gray-900
  ];

  return (
    <>
      <div className="flex items-center gap-2 text-gray-400 mb-2 mt-4">
        <Palette size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Global Branding</span>
      </div>

      <div className="space-y-4">
        
        {/* Primary Color Control */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 block">Primary Brand Color</label>
          
          {/* Color Swatches */}
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => updateBranding({ primaryColor: color })}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  primaryColor === color ? 'border-gray-400 ring-2 ring-gray-100 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {primaryColor === color && <Check size={12} className="text-white drop-shadow-sm" />}
              </button>
            ))}
            
            {/* Custom Color Input */}
             <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 group">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                  className="absolute inset-0 w-12 h-12 -top-3 -left-3 cursor-pointer p-0 border-0"
                />
                {!colors.includes(primaryColor) && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Check size={12} className="text-white drop-shadow-sm" />
                   </div>
                )}
             </div>
          </div>
          <p className="text-[9px] text-gray-400">
            Used for headers, dividers, and accents unless overridden.
          </p>
        </div>

        {/* Font Control */}
        <div className="space-y-2 pt-2 border-t border-gray-50">
          <label className="text-[10px] font-bold text-gray-500 block">Heading Font</label>
          <div className="grid grid-cols-2 gap-2">
            {fonts.map(font => (
               <button
                 key={font}
                 onClick={() => updateBranding({ headingFont: font })}
                 className={`py-2 px-3 rounded text-xs border text-left transition-all ${
                    headingFont === font 
                       ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' 
                       : 'border-gray-200 text-gray-600 hover:border-gray-300'
                 }`}
                 style={{ fontFamily: font }}
               >
                 {font}
               </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
