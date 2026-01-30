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
  sectionConfig?: any;
}

export function CoverSection({ config, reportData, projectConfig, sectionConfig }: CoverSectionProps) {
  const sc = sectionConfig || {};

  // --- Hero photo ---
  // If user selected a specific heroPhotoId, use that; otherwise fall back to index
  const heroPhoto = sc.heroPhotoId
    ? reportData.photos?.find((p: any) => p.id === sc.heroPhotoId)
    : reportData.photos?.[config.heroPhotoIndex ?? 0];

  // --- Strip photos ---
  // If user selected specific coverPhotos, use those; otherwise use index-based
  const stripPhotos: any[] = [];
  if (sc.coverPhotos && sc.coverPhotos.some((id: any) => id != null)) {
    for (const photoId of sc.coverPhotos) {
      if (photoId) {
        const found = reportData.photos?.find((p: any) => p.id === photoId);
        if (found) stripPhotos.push(found);
      }
    }
  } else {
    const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
    for (const idx of stripIndexes) {
      const p = reportData.photos?.[idx];
      if (p) stripPhotos.push(p);
    }
  }
  const showStrip = (sc.showPhotoGrid ?? config.showCoverPhotos) && stripPhotos.length > 0;

  // --- Logo ---
  const logoUrl = projectConfig.identity.logoUrl;
  const hasLogo = logoUrl && logoUrl.length > 0;

  // Logo size from sectionConfig (small/medium/large) or from config.logoScale
  const logoSizeMap: Record<string, number> = { small: 0.7, medium: 1.0, large: 1.3 };
  const logoScale = logoSizeMap[sc.logoSize || 'medium'] ?? (config.logoScale / 100);

  // Logo alignment from sectionConfig (top-left/top-center/top-right) or config.logoAlign
  const logoAlignMap: Record<string, string> = { 'top-left': 'left', 'top-center': 'center', 'top-right': 'right' };
  const logoAlign = logoAlignMap[sc.logoPosition] || config.logoAlign || 'left';

  // --- Hero overlay color and opacity ---
  const heroOverlayColor = sc.heroOverlayColor || COLORS.primary;
  const heroOverlayOpacity = (sc.heroOverlayOpacity ?? 85) / 100;

  // Convert hex to rgba for proper opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // --- Divider line ---
  const divider = sc.dividerLine || { show: true, color: COLORS.golden, width: 100, thickness: 2, alignment: 'left' };

  // --- Safety banner ---
  const showSafetyQuote = sc.showSafetyQuote ?? true;
  const safetySlogan = sc.safetySlogan || 'Safety is a core value';

  // --- Subtitle ---
  const subtitle = sc.subtitle || '';

  return (
    <div className="flex flex-col h-full relative">
      {/* 1. HEADER SECTION (Hero + Logo) */}
      <div
        className="relative w-full overflow-hidden"
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
            {/* Color Overlay - uses user-configured color and opacity */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, ${hexToRgba(heroOverlayColor, heroOverlayOpacity)}, ${hexToRgba(heroOverlayColor, heroOverlayOpacity * 0.75)}, ${hexToRgba(heroOverlayColor, heroOverlayOpacity * 1.1 > 1 ? 1 : heroOverlayOpacity * 1.1)})`
              }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${heroOverlayColor} 0%, ${heroOverlayColor}DD 100%)`
            }}
          />
        )}

        {/* Logo Overlay */}
        <div
          className="absolute top-8 z-10 drop-shadow-lg transition-all duration-300"
          style={{
            transform: `scale(${logoScale})`,
            transformOrigin: `top ${logoAlign}`,
            left: logoAlign === 'center' ? '50%' : (logoAlign === 'right' ? 'auto' : '2rem'),
            right: logoAlign === 'right' ? '2rem' : 'auto',
            marginLeft: logoAlign === 'center' ? -100 : 0,
            textAlign: logoAlign as any
          }}
        >
          {hasLogo ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-16 w-auto object-contain"
              style={{ maxWidth: '200px' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col">
              <div className="text-3xl font-extrabold text-white tracking-tight">RECON</div>
              <div className="text-[10px] text-white/80 tracking-widest">A KELLER COMPANY</div>
            </div>
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
          {subtitle && (
            <div className="text-sm font-medium text-zinc-500 mb-2">{subtitle}</div>
          )}
          <div className="text-lg font-medium text-cyan-600 mb-4">
            {projectConfig.identity.location || projectConfig.identity.companyAddress}
          </div>

          {/* Divider Line - configurable */}
          {divider.show && (
            <div
              className="mb-4"
              style={{
                width: `${divider.width}%`,
                height: `${divider.thickness || 2}px`,
                backgroundColor: divider.color || COLORS.golden,
                marginLeft: divider.alignment === 'center' ? 'auto' : (divider.alignment === 'right' ? 'auto' : 0),
                marginRight: divider.alignment === 'center' ? 'auto' : (divider.alignment === 'right' ? 0 : 'auto'),
              }}
            />
          )}

          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide mb-1">
            Weekly Progress Report
          </h2>
          <div className="font-bold" style={{ color: heroOverlayColor }}>
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
                id={`strip-photo-${i}`}
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
      {showSafetyQuote && (
        <div
          className="w-full flex items-center justify-center text-white italic font-medium"
          style={{
            height: FIRST_PAGE.SAFETY_BANNER_HEIGHT,
            backgroundColor: heroOverlayColor,
          }}
        >
          {safetySlogan}
        </div>
      )}
    </div>
  );
}
