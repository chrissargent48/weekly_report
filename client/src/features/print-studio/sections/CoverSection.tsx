import React from 'react';
import { PrintConfig, ReportData } from '../config/printConfig.types';
import { FIRST_PAGE } from '../layout-engine/pageConstants';
import { COLORS } from '../config/styleTokens';
import { DraggableImage } from '../components/DraggableImage';

import { ProjectConfig } from '../../../types';

interface CoverSectionProps {
  config: PrintConfig;
  reportData: ReportData;
  projectConfig: ProjectConfig;
}

export function CoverSection({ config, reportData, projectConfig }: CoverSectionProps) {
  // Photos logic
  const heroIndex = config.heroPhotoIndex ?? 0;
  const heroPhoto = reportData.photos?.[heroIndex];

  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const stripPhotos = stripIndexes
    .map(idx => reportData.photos?.[idx])
    .filter(Boolean)
    .slice(0, 3);
  const showStrip = config.showCoverPhotos && stripPhotos.length > 0;

  // Logo - NOW DYNAMIC!
  const logoUrl = projectConfig.identity.logoUrl;
  const hasLogo = logoUrl && logoUrl.length > 0;
  const logoScale = config.logoScale / 100; // Convert percentage to decimal

  return (
    <div className="flex flex-col h-full relative">
      {/* 1. HEADER SECTION (Hero + Logo) */}
      <div
        className="relative w-full"
        style={{ height: FIRST_PAGE.HEADER_IMAGE_HEIGHT }}
      >
        {/* Hero Image - Now Draggable */}
        {heroPhoto?.url ? (
          <div className="absolute inset-0">
            <DraggableImage
              id="hero-image"
              src={heroPhoto.url}
              alt="Cover Hero"
              containerClassName="w-full h-full"
            />
            {/* Teal Overlay - sits on top of the image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, ${COLORS.primary}CC, ${COLORS.primary}99, ${COLORS.primary}E6)`
              }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark || '#0d7377'} 100%)`
            }}
          />
        )}

        {/* Logo Overlay - NOW USES ACTUAL LOGO! */}
        <div
          className="absolute top-8 left-8 z-10 drop-shadow-lg"
          style={{
            transform: `scale(${logoScale})`,
            transformOrigin: 'top left'
          }}
        >
          {hasLogo ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-16 w-auto object-contain"
              style={{ maxWidth: '200px' }}
              onError={(e) => {
                // Fallback if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            // Fallback to RECON branding if no logo URL configured
            <>
              <div className="text-3xl font-extrabold text-white tracking-tight">RECON</div>
              <div className="text-[10px] text-white/80 tracking-widest">A KELLER COMPANY</div>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 px-10 py-6 flex flex-col">
        {/* Title Block */}
        <div style={{ minHeight: FIRST_PAGE.TITLE_BLOCK_HEIGHT - 20 }}>
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-1 tracking-tight leading-tight">
            {projectConfig.identity.projectName}
          </h1>
          <div className="text-lg font-medium text-cyan-600 mb-4">
            {projectConfig.identity.location || projectConfig.identity.companyAddress}
          </div>
          <div className="w-32 h-1 bg-[#D4A84B] mb-4" />

          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide mb-1">
            Weekly Progress Report
          </h2>
          <div className="text-cyan-600 font-bold">
            Week Ending: {reportData.weekEnding || 'YYYY-MM-DD'}
          </div>
        </div>

        {/* Photo Strip - Now with Draggable Images */}
        {showStrip && (
          <div
            className="grid gap-3 my-6"
            style={{
              gridTemplateColumns: `repeat(${stripPhotos.length}, 1fr)`,
              height: FIRST_PAGE.PHOTO_STRIP_HEIGHT - 24
            }}
          >
            {stripPhotos.map((photo: any, i: number) => (
              <DraggableImage
                key={i}
                id={`strip-photo-${stripIndexes[i]}`}
                src={photo.url}
                alt={`Strip photo ${i + 1}`}
                containerClassName="rounded bg-zinc-100 border border-zinc-200 shadow-sm h-full"
              />
            ))}
          </div>
        )}

        {/* Client Info Grid */}
        <div className="mt-auto mb-2 grid grid-cols-[80px_1fr] gap-y-2 text-sm">
          <div className="font-bold text-zinc-400">Client:</div>
          <div className="font-bold text-zinc-900">
            {projectConfig.personnel?.client?.company || 'Client Name'}
          </div>

          <div className="font-bold text-zinc-400">Job #:</div>
          <div className="text-zinc-600">
            {projectConfig.identity.jobNumber || '00-00000'}
          </div>
        </div>
      </div>

      {/* 3. SAFETY BOTTOM BANNER */}
      <div
        className="w-full flex items-center justify-center text-white italic font-medium"
        style={{
          height: FIRST_PAGE.SAFETY_BANNER_HEIGHT,
          backgroundColor: COLORS.primary,
        }}
      >
        Safety is a core value
      </div>
    </div>
  );
}
