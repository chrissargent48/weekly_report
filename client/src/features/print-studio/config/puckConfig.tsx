import React, { useState, useRef, useEffect } from "react";
import { Config } from "@puckeditor/core";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, MapPin, Calendar, LayoutTemplate } from 'lucide-react';

export type PuckData = {
  content: any[];
  root: any;
};

// --- HELPER COMPONENTS ---

const getWeatherIcon = (condition: string = "") => {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return <CloudRain size={20} className="text-blue-500" />;
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) return <CloudSnow size={20} className="text-cyan-400" />;
  if (c.includes('cloud') || c.includes('overcast')) return <Cloud size={20} className="text-gray-400" />;
  if (c.includes('wind') || c.includes('breeze')) return <Wind size={20} className="text-gray-500" />;
  if (c.includes('sun') || c.includes('clear') || c.includes('fair')) return <Sun size={20} className="text-amber-500" />;
  return <Sun size={20} className="text-amber-500" />; // Default
};

const InteractivePhoto = ({ photo, onChange }: { photo: any, onChange: (props: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const x = photo.x || 0;
  const y = photo.y || 0;
  const zoom = photo.zoom || 1;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    
    onChange({
      ...photo,
      x: x + dx,
      y: y + dy
    });
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 5);
    
    onChange({
      ...photo,
      zoom: newZoom
    });
  };

  return (
    <div 
      ref={containerRef}
      className="group relative rounded-sm overflow-hidden border border-zinc-200 bg-zinc-100 cursor-move h-56 transition-all hover:border-blue-400 hover:shadow-sm"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="w-full h-full p-0 flex items-center justify-center select-none"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          backgroundImage: `url(${photo.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Overlay - Only visible on hover/active */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between pointer-events-none">
          <p className="text-white text-xs font-medium truncate max-w-[70%]">{photo.caption}</p>
           <span className="text-[10px] text-white/80 font-mono">
               {Math.round(zoom * 100)}%
           </span>
      </div>
      
      {/* Hint */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ctrl+Scroll to Zoom
      </div>
    </div>
  );
};

// --- PUCK CONFIG ---

export const puckConfig: Config = {
  components: {
    CoverPage: {
      fields: {
        id: { type: "text" },
        title: { type: "text" },
        subtitle: { type: "text" },
        weekEnding: { type: "text" },
        location: { type: "text" },
        logoUrl: { type: "text" }, // Placeholder for future usage
      },
      render: ({ title, subtitle, weekEnding, location }) => (
        <div className="min-h-[1000px] flex flex-col bg-white relative">
          {/* Hero Header Area */}
          <div className="h-64 bg-slate-900 w-full flex items-center justify-center relative overflow-hidden">
             
             {/* Abstract Background Elements */}
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
             <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
             <div className="absolute left-0 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl -ml-20 -mb-20" />

             {/* Content */}
             <div className="relative z-10 text-center px-12">
                 <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 uppercase drop-shadow-sm">{title || "PROJECT NAME"}</h1>
             </div>
          </div>

          <div className="flex-1 p-16 flex flex-col pt-12">
              <div className="border-b border-zinc-200 pb-8 mb-8">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-2">{subtitle || "Weekly Progress Report"}</h2>
                  <div className="flex items-center gap-6 text-slate-500 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span>Week Ending: {weekEnding}</span>
                      </div>
                      <div className="h-4 w-px bg-zinc-300" />
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        <span>{location}</span>
                      </div>
                  </div>
              </div>

              {/* Cover Details Grid */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-auto mb-20">
                  <div>
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Prepared For</h3>
                      <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                          <p className="font-bold text-slate-900">PPG Industries, Inc</p>
                          <p className="text-sm text-slate-600">One PPG Place, Pittsburgh, PA</p>
                      </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Prepared By</h3>
                     <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                          <p className="font-bold text-slate-900">RECON</p>
                          <p className="text-sm text-slate-600">Site Team</p>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Footer Strip */}
          <div className="bg-slate-50 h-16 border-t border-zinc-100 flex items-center justify-between px-16 text-xs text-zinc-400 font-medium uppercase tracking-wider">
              <span>Confidential Document</span>
              <span> &copy; {new Date().getFullYear()} RECON</span>
          </div>
        </div>
      ),
    },
    RichText: {
      fields: {
        id: { type: "text" },
        title: { type: "text" },
        content: { type: "textarea" },
      },
      render: ({ title, content }) => (
        <div className="px-8 py-6 bg-white">
          {title && (
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
              </div>
          )}
          <div className="text-slate-600 text-sm leading-7 whitespace-pre-wrap font-regular">
            {content}
          </div>
        </div>
      ),
    },
    WeatherTable: {
      fields: {
        id: { type: "text" },
        days: {
          type: "array",
          arrayFields: {
            date: { type: "text" },
            condition: { type: "text" },
            hoursLost: { type: "number" },
            tempHigh: { type: "number" },
            tempLow: { type: "number" },
          }
        }
      },
      render: ({ days = [] }) => (
        <div className="px-8 py-6 bg-white">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-100">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Weather Log</h3>
          </div>
          
          <div className="flex gap-2 overflow-hidden">
             {days.map((day: any, i: number) => (
                 <div key={i} className="flex-1 bg-zinc-50 border border-zinc-100 rounded-md p-3 flex flex-col items-center justify-center min-w-[80px]">
                     <span className="text-[10px] uppercase font-bold text-zinc-400 mb-2">
                         {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                     </span>
                     <div className="mb-2 p-2 bg-white rounded-full shadow-sm border border-zinc-100/50">
                        {getWeatherIcon(day.condition)}
                     </div>
                     <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                         <span>{day.tempHigh}°</span>
                         <span className="text-zinc-300 font-light">/</span>
                         <span className="text-slate-400">{day.tempLow}°</span>
                     </div>
                     {day.hoursLost > 0 && (
                         <div className="mt-2 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                             -{day.hoursLost}h
                         </div>
                     )}
                 </div>
             ))}
          </div>
        </div>
      ),
    },
    PhotoGrid: {
      fields: {
        id: { type: "text" },
        title: { type: "text" },
        photos: {
          type: "array",
          arrayFields: {
            url: { type: "text" },
            caption: { type: "text" },
            x: { type: "number" },
            y: { type: "number" },
            zoom: { type: "number" },
          }
        }
      },
      render: ({ title, photos = [], onChange }) => (
        <div className="px-8 py-6 bg-white">
          {title && (
             <div className="flex items-center gap-3 mb-6 pb-2 border-b border-zinc-100">
                  <LayoutTemplate size={14} className="text-slate-400"/>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
              </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo: any, i: number) => (
              <InteractivePhoto 
                key={i} 
                photo={photo} 
                onChange={(updatedPhoto) => {
                  const newPhotos = [...photos];
                  newPhotos[i] = updatedPhoto;
                  // @ts-ignore - Puck's internal state mechanism
                  onChange({ photos: newPhotos });
                }} 
              />
            ))}
          </div>
        </div>
      ),
    },
    TableSection: {
      fields: {
        id: { type: "text" },
        title: { type: "text" },
        headers: { 
          type: "array", 
          arrayFields: { 
            label: { type: "text" }, 
            width: { type: "text" } // e.g., "150px" or "25%"
          } 
        },
        rows: { 
          type: "array", 
          arrayFields: { 
            cells: { 
              type: "array", 
              arrayFields: { 
                value: { type: "text" }, 
                align: { type: "text" } 
              } 
            },
            minHeight: { type: "number" } // Excel-style height control
          } 
        },
      },
      render: ({ title, headers = [], rows = [], onChange }: any) => {
        return (
          <div className="px-8 py-6 bg-white group">
            {title && (
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
                </div>
            )}
            <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    {headers.map((h: any, i: number) => (
                      <th 
                        key={i} 
                        className="relative px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-left border-r border-zinc-200 last:border-r-0" 
                        style={{ width: h.width || 'auto' }}
                      >
                        {h.label}
                        {/* Column Resize Grip Placeholder */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 hover:bg-blue-400 cursor-col-resize z-10" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((row: any, i: number) => (
                    <tr 
                      key={i} 
                      className={`relative hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}
                      style={{ height: row.minHeight ? `${row.minHeight}px` : 'auto' }}
                    >
                      {row.cells?.map((cell: any, j: number) => (
                        <td 
                          key={j} 
                          className={`px-4 py-3 text-slate-700 border-r border-zinc-100 last:border-r-0 align-top break-words ${cell.align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                          {cell.value}
                        </td>
                      ))}
                      {/* Row Height Grip Placeholder */}
                      <td className="w-0 p-0 border-none relative">
                          <div 
                            className="absolute bottom-0 right-0 left-0 h-1 bg-transparent hover:bg-blue-400 cursor-row-resize opacity-0 group-hover:opacity-100 z-10" 
                            title="Drag in sidebar to adjust exact height"
                          />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Quick Tips for Excel-style feeling */}
            <div className="mt-2 flex gap-4 text-[10px] text-zinc-400 font-medium">
               <span>💡 Tip: Adjust "Min Height" in sidebar for long text.</span>
               <span>💡 Columns use % or pixels (e.g. 20% or 150px).</span>
            </div>
          </div>
        );
      },
    },
  },
};
