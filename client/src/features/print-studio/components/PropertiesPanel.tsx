import React from 'react';
import { WeeklyReport, ProjectConfig } from '../../../types';
import { Settings, Layout, Type, Palette, Sun, HelpCircle, X, RotateCcw, Camera, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { PhotoPickerModal } from './PhotoPickerModal';

interface PropertiesPanelProps {
  selectedSection: string;
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
  
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [activeSlot, setActiveSlot] = React.useState<number>(0);

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
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-tight">Active Section</span>
            <span className="text-sm font-bold text-gray-800 capitalize">{selectedSection === 'document' ? 'Global Settings' : selectedSection}</span>
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
        )}

        {/* Section Margins (if not document) */}
        {selectedSection !== 'document' && (
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
        )}

        {/* Section Specific Controls */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          
          {selectedSection === 'cover' && (
            <>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Type size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cover Options</span>
              </div>

              {/* Logo Controls */}
              <div className="space-y-3 pb-3 border-b border-gray-50">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-bold text-gray-500">Project Logo</label>
                   {!projectConfig || !projectConfig.identity?.logoUrl ? (
                     <span className="text-[9px] text-red-400 italic">No logo in project settings</span>
                   ) : (
                     <span className="text-[9px] text-green-600">Available</span>
                   )}
                </div>

                {projectConfig && projectConfig.identity?.logoUrl && (
                  <>
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400">Position</span>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['top-left', 'top-center', 'top-right'].map((pos) => (
                          <button
                            key={pos}
                            onClick={() => onUpdateConfig({ logoPosition: pos })}
                            className={`flex-1 py-1 rounded-md text-[10px] flex justify-center transition-all ${
                              (config?.logoPosition || 'top-left') === pos 
                                ? 'bg-white shadow text-teal-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={pos}
                          >
                            {pos === 'top-left' && <AlignLeft size={12} />}
                            {pos === 'top-center' && <AlignCenter size={12} />}
                            {pos === 'top-right' && <AlignRight size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400">Size</span>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => onUpdateConfig({ logoSize: size })}
                            className={`flex-1 py-1 rounded-md text-[9px] font-bold capitalize transition-all ${
                              (config?.logoSize || 'medium') === size 
                                ? 'bg-white shadow text-teal-600' 
                                : 'text-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-500 block">Custom Subtitle</label>
                <input 
                  type="text" 
                  value={config?.subtitle || ''}
                  onChange={(e) => onUpdateConfig({ subtitle: e.target.value })}
                  placeholder="e.g. 2024 Site Improvements"
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Show Photo Grid</span>
                  <input 
                    type="checkbox" 
                    checked={config?.showPhotoGrid}
                    onChange={(e) => onUpdateConfig({ showPhotoGrid: e.target.checked })}
                    className="accent-teal-600 w-3.5 h-3.5"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-gray-500 block">Hero Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={config?.heroOverlayColor || '#008B8B'}
                    onChange={(e) => onUpdateConfig({ heroOverlayColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs font-mono text-gray-400">{config?.heroOverlayColor}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-500 block">Hero Background Image</label>
                
                {/* Hero Photo Picker */}
                <div 
                  onClick={() => {
                    setActiveSlot(-1);
                    setPickerOpen(true);
                  }}
                  className="w-full h-24 bg-gray-100 rounded border-2 border-dashed border-gray-200 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all overflow-hidden relative group"
                >
                  {config?.heroPhotoId ? (
                    <>
                      <img 
                        src={report?.photos?.find(p => p.id === config.heroPhotoId)?.url} 
                        className="w-full h-full object-cover opacity-50" 
                        alt="Hero"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                      <Camera size={16} />
                      <span className="text-[10px]">Select Hero Photo</span>
                    </div>
                  )}
                  {config?.heroPhotoId && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateConfig({ heroPhotoId: null });
                      }}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Opacity Control */}
                <div className="space-y-1 pt-1">
                   <div className="flex justify-between text-[10px] text-gray-500">
                     <span>Overlay Opacity</span>
                     <span>{config?.heroOverlayOpacity ?? 85}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="100" 
                     value={config?.heroOverlayOpacity ?? 85}
                     onChange={(e) => onUpdateConfig({ heroOverlayOpacity: parseInt(e.target.value) })}
                     className="w-full accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                   />
                </div>
              </div>

              {/* Divider Line Controls */}
              <div className="space-y-3 pt-3 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">── DIVIDER LINE ──</span>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Show Divider</span>
                  <input 
                    type="checkbox" 
                    checked={config?.dividerLine?.show ?? true}
                    onChange={(e) => onUpdateConfig({ 
                      dividerLine: { ...(config?.dividerLine || {}), show: e.target.checked }
                    })}
                    className="accent-teal-600 w-3.5 h-3.5"
                  />
                </div>

                { (config?.dividerLine?.show ?? true) && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={config?.dividerLine?.color || '#008B8B'}
                          onChange={(e) => onUpdateConfig({ 
                            dividerLine: { ...(config?.dividerLine || {}), color: e.target.value }
                          })}
                          className="w-6 h-6 rounded border border-gray-100 cursor-pointer overflow-hidden p-0"
                        />
                        <span className="text-[10px] font-mono text-gray-400">{config?.dividerLine?.color || '#008B8B'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Width</span>
                        <span>{config?.dividerLine?.width ?? 100}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" 
                        value={config?.dividerLine?.width ?? 100}
                        onChange={(e) => onUpdateConfig({ 
                          dividerLine: { ...(config?.dividerLine || {}), width: parseInt(e.target.value) }
                        })}
                        className="w-full accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">Thickness</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {[1, 2, 4].map(weight => (
                          <button 
                            key={weight}
                            onClick={() => onUpdateConfig({ 
                              dividerLine: { ...(config?.dividerLine || {}), thickness: weight }
                            })}
                            className={`flex-1 py-1 rounded-md text-[9px] font-bold transition-all ${config?.dividerLine?.thickness === weight ? 'bg-white shadow text-teal-600' : 'text-gray-400'}`}
                          >
                            {weight}pt
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">Alignment</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => onUpdateConfig({ 
                              dividerLine: { ...(config?.dividerLine || {}), alignment: align }
                            })}
                            className={`flex-1 py-1 rounded-md text-[10px] flex justify-center transition-all ${
                              (config?.dividerLine?.alignment || 'left') === align 
                                ? 'bg-white shadow text-teal-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {align === 'left' && <AlignLeft size={12} />}
                            {align === 'center' && <AlignCenter size={12} />}
                            {align === 'right' && <AlignRight size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Safety Banner Controls */}
              <div className="space-y-3 pt-3 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">── SAFETY BANNER ──</span>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Show Safety Quote</span>
                  <input 
                    type="checkbox" 
                    checked={config?.showSafetyQuote}
                    onChange={(e) => onUpdateConfig({ showSafetyQuote: e.target.checked })}
                    className="accent-teal-600 w-3.5 h-3.5"
                  />
                </div>

                {config?.showSafetyQuote && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 block">Slogan Text</label>
                    <div className="flex gap-2">
                      <div 
                         className="w-6 h-auto rounded border border-gray-200 flex-none"
                         style={{ backgroundColor: config?.heroOverlayColor || '#008B8B' }}
                         title="Matches Hero Color"
                      />
                      <input 
                        type="text" 
                        value={config?.safetySlogan || 'Safety is a core value'}
                        onChange={(e) => onUpdateConfig({ safetySlogan: e.target.value })}
                        placeholder="Safety is a core value"
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Grid Controls */}
              {config?.showPhotoGrid && (
                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">── COVER PHOTOS ──</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map(idx => {
                      const photoId = config?.coverPhotos?.[idx];
                      const photo = report?.photos?.find(p => p.id === photoId);
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            setActiveSlot(idx);
                            setPickerOpen(true);
                          }}
                          className="aspect-[4/3] bg-gray-100 rounded border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all overflow-hidden relative group"
                        >
                          {photo ? (
                            <img src={photo.url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-lg text-gray-300 group-hover:text-teal-400">+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pickerOpen && (
                <PhotoPickerModal
                  isOpen={pickerOpen}
                  onClose={() => setPickerOpen(false)}
                  onSelect={(photoId) => {
                    if (activeSlot === -1) {
                      // Hero Photo
                      onUpdateConfig({ heroPhotoId: photoId });
                    } else {
                      // Grid Photos
                      const newPhotos = [...(config?.coverPhotos || [null, null, null])];
                      newPhotos[activeSlot] = photoId;
                      onUpdateConfig({ coverPhotos: newPhotos });
                    }
                  }}
                  availablePhotos={report?.photos?.map(p => ({ id: p.id, url: p.url, caption: p.caption || '' })) || []}
                  selectedPhotoId={config?.coverPhotos?.[activeSlot]}
                  slotIndex={activeSlot}
                />
              )}
            </>
          )}

          {selectedSection === 'weather' && (
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
          )}

          {selectedSection === 'executive' && (
            <>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Type size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 block">Edit Summary</label>
                <textarea 
                  value={report?.overview?.executiveSummary || ''}
                  onChange={(e) => {
                    if (report && onUpdateReport) {
                      onUpdateReport({
                        ...report,
                        overview: {
                          ...report.overview,
                          executiveSummary: e.target.value
                        }
                      });
                    }
                  }}
                  rows={8}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 outline-none resize-none leading-relaxed"
                  placeholder="Summarize this week's key activities and milestones..."
                />
              </div>
            </>
          )}

          {selectedSection === 'progress' && (
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
          )}

          {selectedSection === 'photos' && (
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
          )}

          {selectedSection === 'safety' && (
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
