import React from 'react';
import { ProjectConfig, WeeklyReport } from '../../../types';

interface CanvasProps {
  zoom: number;
  showGrid: boolean;
  enabledSections: Record<string, boolean>;
  onSelectSection: (sectionId: string) => void;
  report?: WeeklyReport;
  projectConfig?: ProjectConfig;
  sectionConfigs?: Record<string, any>;
  sectionOrder?: string[];
  documentSettings?: any;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  zoom, 
  showGrid, 
  enabledSections,
  onSelectSection,
  report, 
  projectConfig,
  sectionConfigs = {},
  sectionOrder = ['cover', 'executive', 'weather', 'progress', 'lookahead', 'photos', 'safety'],
  documentSettings = {}
}) => {
  
  // Apply standard letter size
  const BASE_WIDTH = 612;
  const BASE_HEIGHT = 792;

  // Calculate pixel dimensions based on zoom percentage
  const width = (BASE_WIDTH * zoom) / 100;
  const height = (BASE_HEIGHT * zoom) / 100;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-gray-300 flex flex-col items-center py-8 space-y-8 scroll-smooth custom-scrollbar">
      {sectionOrder.map(sectionId => {
        // Only render enabled sections
        if (!enabledSections[sectionId]) return null;

        return (
          <div
            key={sectionId}
            onClick={() => onSelectSection(sectionId)}
            className="bg-white shadow-2xl relative cursor-pointer transition-all duration-200 hover:ring-4 hover:ring-teal-400/50 shrink-0 overflow-hidden"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              paddingTop: `${(documentSettings?.defaultMargins?.top || 24) * zoom / 100}px`,
              paddingBottom: `${(documentSettings?.defaultMargins?.bottom || 24) * zoom / 100}px`,
              paddingLeft: `${(documentSettings?.defaultMargins?.left || 24) * zoom / 100}px`,
              paddingRight: `${(documentSettings?.defaultMargins?.right || 24) * zoom / 100}px`,
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-20 opacity-20 mix-blend-multiply"
                style={{ 
                  backgroundImage: `linear-gradient(to right, #008B8B 1px, transparent 1px), 
                                    linear-gradient(to bottom, #008B8B 1px, transparent 1px)`,
                  backgroundSize: `${20 * (zoom/100)}px ${20 * (zoom/100)}px` 
                }} 
              />
            )}

            {/* Placeholder Content */}
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-gray-300 pointer-events-none select-none">
                <span className="text-5xl font-bold opacity-10 uppercase tracking-widest">{sectionId}</span>
                <span className="mt-2 text-[10px] font-mono opacity-30">
                    {BASE_WIDTH} x {BASE_HEIGHT} pt
                </span>

                {/* Section Summary Content */}
                <div className="mt-10 w-full max-w-[80%] text-center border-t border-gray-100 pt-8 animate-in fade-in duration-700">
                    {sectionId === 'cover' && projectConfig && (
                      <div className="w-full h-full flex flex-col bg-white relative text-left">
                        {/* Hero Section */}
                        <div 
                          className="h-[38%] relative w-full overflow-hidden shrink-0"
                          style={{ backgroundColor: sectionConfigs?.cover?.heroOverlayColor || '#008B8B' }}
                        >
                          {/* Hero Image */}
                          {sectionConfigs?.cover?.heroPhotoId && (
                            <img 
                              src={report?.photos?.find(p => p.id === sectionConfigs?.cover?.heroPhotoId)?.url}
                              className="absolute inset-0 w-full h-full object-cover"
                              alt="Hero"
                            />
                          )}
                          
                          {/* Overlay */}
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              backgroundColor: sectionConfigs?.cover?.heroOverlayColor || '#008B8B',
                              opacity: (sectionConfigs?.cover?.heroOverlayOpacity ?? 70) / 100
                            }}
                          />

                          {/* Logo */}
                          <div 
                            className={`absolute z-10 flex ${
                              (sectionConfigs?.cover?.logoPosition || 'top-left') === 'top-center' ? 'inset-x-0 justify-center' : ''
                            }`}
                            style={{
                              top: '24px',
                              left: (sectionConfigs?.cover?.logoPosition || 'top-left') === 'top-left' ? '30px' : undefined,
                              right: (sectionConfigs?.cover?.logoPosition || 'top-left') === 'top-right' ? '30px' : undefined,
                            }}
                          >
                            {projectConfig.identity?.logoUrl ? (
                              <img 
                                src={projectConfig.identity.logoUrl}
                                style={{ 
                                  height: `${{small: 40, medium: 60, large: 90}[sectionConfigs?.cover?.logoSize as string] || 60}px` 
                                }}
                                className="object-contain"
                              />
                            ) : (
                              <span className="text-white font-bold tracking-widest text-lg">RECON</span>
                            )}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 flex flex-col relative">
                           {/* Title Block */}
                           <div className="mb-6">
                             <h1 className="text-3xl font-bold text-gray-900 mb-1">{projectConfig.identity?.projectName || 'Project Name'}</h1>
                             <h2 className="text-xl font-bold text-gray-700 mb-2">{sectionConfigs?.cover?.subtitle || '2024 Site Improvements'}</h2>
                             <div className="text-sm font-medium text-teal-600 mb-2">
                               {projectConfig.identity?.location || ''}
                             </div>
                             
                             {/* Divider */}
                             {(sectionConfigs?.cover?.dividerLine?.show !== false) && (
                               <div 
                                 className="my-3"
                                 style={{
                                   backgroundColor: sectionConfigs?.cover?.dividerLine?.color || '#008B8B',
                                   width: `${sectionConfigs?.cover?.dividerLine?.width || 100}%`,
                                   height: `${sectionConfigs?.cover?.dividerLine?.thickness || 2}px`,
                                   alignSelf: ({
                                     'left': 'flex-start',
                                     'center': 'center',
                                     'right': 'flex-end'
                                   } as any)[sectionConfigs?.cover?.dividerLine?.alignment || 'center'] || 'center'
                                 }}
                               />
                             )}
                             
                             <div className="text-sm font-bold uppercase tracking-wider text-gray-800">Weekly Progress Report</div>
                             <div className="text-xs font-bold text-teal-600 mt-1">Week Ending: {report?.weekEnding}</div>
                           </div>

                           {/* Photo Grid */}
                           {sectionConfigs?.cover?.showPhotoGrid !== false && (
                             <div className="flex gap-2 h-24 mb-6">
                               {[0, 1, 2].map(i => {
                                 const photoId = sectionConfigs?.cover?.coverPhotos?.[i];
                                 const photo = report?.photos?.find(p => p.id === photoId);
                                 return (
                                   <div key={i} className="flex-1 bg-gray-100 border border-gray-200 overflow-hidden relative">
                                     {photo ? (
                                       <img src={photo.url} className="w-full h-full object-cover" />
                                     ) : (
                                       <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Photo {i+1}</div>
                                     )}
                                   </div>
                                 );
                               })}
                             </div>
                           )}

                           {/* Details */}
                           <div className="mt-auto space-y-1">
                             <div className="flex text-xs">
                               <span className="w-16 font-bold text-gray-600">Client:</span>
                               <span className="text-gray-800 font-medium">
                                 {typeof projectConfig.personnel?.client === 'string' 
                                  ? projectConfig.personnel.client 
                                  : projectConfig.personnel?.client?.company || 'Client'}
                               </span>
                             </div>
                             <div className="flex text-xs">
                               <span className="w-16 font-bold text-gray-600">Job #:</span>
                               <span className="text-gray-500">{projectConfig.identity?.jobNumber || '00-00000'}</span>
                             </div>
                           </div>

                           {/* Safety Banner */}
                           {sectionConfigs?.cover?.showSafetyQuote !== false && (
                             <div 
                               className="absolute bottom-8 left-0 right-0 py-2 bg-teal-600 text-center"
                               style={{ backgroundColor: sectionConfigs?.cover?.heroOverlayColor || '#008B8B' }}
                             >
                                <span className="text-white text-xs italic font-medium">
                                  "{sectionConfigs?.cover?.safetySlogan || 'Safety is a core value'}"
                                </span>
                             </div>
                           )}
                        </div>
                      </div>
                    )}

                    {sectionId === 'executive' && (
                      <div className="space-y-2">
                         <div className="text-xs font-bold text-teal-600/60 uppercase tracking-tighter">Executive Summary</div>
                         <div className="text-sm text-gray-400 italic px-4 line-clamp-3">
                           {report?.overview?.executiveSummary || 'No summary written yet...'}
                         </div>
                      </div>
                    )}

                    {sectionId === 'weather' && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-teal-600/60 uppercase tracking-tighter">Weather Log</div>
                        <div className="text-3xl font-bold text-gray-800 italic">
                          {report?.overview?.weather?.[0]?.tempHigh || '--'}°F
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          {report?.overview?.weather?.length || 0} days recorded
                        </div>
                      </div>
                    )}

                    {sectionId === 'progress' && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-teal-600/60 uppercase tracking-tighter">Progress Update</div>
                        <div className="text-3xl font-bold text-gray-800">
                          {report?.progress?.activitiesThisWeek?.length || 0}
                        </div>
                        <div className="text-xs font-medium text-gray-500">Activities Recorded</div>
                      </div>
                    )}

                    {sectionId === 'photos' && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-teal-600/60 uppercase tracking-tighter">Site Photos</div>
                        <div className="text-3xl font-bold text-gray-800">
                          {report?.photos?.length || 0}
                        </div>
                        <div className="text-xs font-medium text-gray-500">Images Uploaded</div>
                      </div>
                    )}

                    {sectionId === 'safety' && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-teal-600/60 uppercase tracking-tighter">Safety Status</div>
                        <div className={`text-3xl font-bold ${report?.safety?.stats?.recordables?.week ? 'text-red-500' : 'text-green-600'}`}>
                          {report?.safety?.stats?.recordables?.week || 0}
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incidents This Week
                        </div>
                      </div>
                    )}

                    {!['cover', 'executive', 'weather', 'progress', 'photos', 'safety'].includes(sectionId) && (
                      <div className="text-xs text-gray-400 italic">
                        Real data mapping coming soon...
                      </div>
                    )}
                </div>
            </div>

            {/* Selection/Hover Indicator */}
            <div className="absolute -left-24 top-0 w-20 text-right pr-4 pt-2 hidden group-hover:block">
                <span className="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded">
                    {sectionId}
                </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
