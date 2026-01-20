import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { FIRST_PAGE } from '../layout-engine/pageConstants';
import { COLORS } from '../config/styleTokens';

interface CoverSectionProps {
  config: PrintConfig;
  reportData: ReportData;
}

export function CoverSection({ config, reportData }: CoverSectionProps) {
  // Photos logic
  const heroIndex = config.heroPhotoIndex ?? 0;
  const heroPhoto = reportData.photos?.[heroIndex];
  
  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const stripPhotos = reportData.photos?.filter((_: any, i: number) => stripIndexes.includes(i)).slice(0, 3) || [];
  const showStrip = config.showCoverPhotos && stripPhotos.length > 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* 1. HEADER SECTION (Hero + Logo) */}
      <div 
        className="relative w-full"
        style={{ height: FIRST_PAGE.HEADER_IMAGE_HEIGHT }}
      >
        {/* Hero Image */}
        {heroPhoto ? (
          <div className="absolute inset-0">
            <img 
              src={heroPhoto.url} 
              alt="Cover Hero" 
              className="w-full h-full object-cover"
            />
            {/* Teal Overlay */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(to bottom, ${COLORS.primary}CC, ${COLORS.primary}99, ${COLORS.primary}E6)` 
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-600 to-cyan-800" />
        )}

        {/* Logo Overlay */}
        <div className="absolute top-8 left-8 z-10 drop-shadow-lg">
           {/* Placeholder for project logo logic - sticking to text for robustness if no URL */}
           <div className="text-3xl font-extrabold text-white tracking-tight">RECON</div>
           <div className="text-[10px] text-white/80 tracking-widest">A KELLER COMPANY</div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 px-10 py-6 flex flex-col">
        {/* Title Block */}
        <div style={{ minHeight: FIRST_PAGE.TITLE_BLOCK_HEIGHT - 20 }}>
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-1 tracking-tight leading-tight">
            {reportData.projectName || 'Project Name'}
          </h1>
          <div className="text-lg font-medium text-cyan-600 mb-4">
            {reportData.projectAddress || reportData.projectLocation || 'Location, State'}
          </div>
          <div className="w-32 h-1 bg-[#D4A84B] mb-4" />
          
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide mb-1">
            Weekly Progress Report
          </h2>
          <div className="text-cyan-600 font-bold">
             Week Ending: {reportData.weekEnding || 'YYYY-MM-DD'}
          </div>
        </div>

        {/* Photo Strip */}
        {showStrip && (
          <div 
            className="grid grid-cols-3 gap-3 my-6"
            style={{ height: 100 }} // Fixed visual height for strip images
          >
            {stripPhotos.map((photo: any, i: number) => (
              <div key={i} className="aspect-[4/3] rounded overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm relative">
                <img src={photo.url} className="w-full h-full object-cover" alt="Strip" />
              </div>
            ))}
          </div>
        )}

        {/* Client Info Grid */}
        <div className="mt-auto mb-8 grid grid-cols-[80px_1fr] gap-y-2 text-sm">
          <div className="font-bold text-zinc-400">Client:</div>
          <div className="font-bold text-zinc-900">{reportData.client || 'Client Name'}</div>
          
          <div className="font-bold text-zinc-400">Address:</div>
          <div className="text-zinc-600">{reportData.clientAddress || 'Client Address'}</div>
          
          <div className="font-bold text-zinc-400">Job #:</div>
          <div className="text-zinc-600">{reportData.jobNumber || '00-00000'}</div>
        </div>
      </div>

      {/* 3. SAFETY BOTTOM BANNER */}
      <div 
        className="w-full bg-cyan-600 flex items-center justify-center text-white italic font-medium"
        style={{ 
          height: FIRST_PAGE.SAFETY_BANNER_HEIGHT,
          marginBottom: 0 // Flush to bottom of content area
        }}
      >
        Safety is a core value
      </div>
    </div>
  );
}
