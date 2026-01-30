import React from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { DraggableImage } from '../components/DraggableImage';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement: PagePlacement;
  sectionConfig?: any;
  onEditPhoto?: (photoId: string, url: string) => void;
}

export function PhotosSection({ config, reportData, placement, sectionConfig, onEditPhoto }: Props) {
  const sc = sectionConfig || {};
  const allPhotos = reportData.photos || [];
  if (allPhotos.length === 0) return null;

  // Logic to determine WHICH photos to show on THIS page instance
  // The layout engine assigns IDs like 'photos' (page 1), 'photos_continued_1' (page 2), etc.
  const startIndex = placement.dataRange?.start ?? 0;
  const endIndex = placement.dataRange?.end ?? allPhotos.length;
  // const pagePhotos = allPhotos.slice(startIndex, endIndex); // Handled below by slice(startIndex, startIndex + PHOTOS_PER_PAGE)? 
  // Wait, existing logic slices by PHOTOS_PER_PAGE.
  // The DataRange passed from calculatePageMap IS ALREADY 6 photos max.
  // So I can just use start/end from dataRange.
  const pagePhotos = allPhotos.slice(startIndex, endIndex);

  if (pagePhotos.length === 0) return null;

  return (
    // We force min-height to ensure grid looks good even with fewer photos
    <SectionWrapper
      config={config}
      title={placement.continuesFromPrevious ? 'Site Photos (Continued)' : 'Site Photos'}
      className="h-full flex flex-col"
    >
      <div
        className="gap-x-6 gap-y-8 flex-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${sc.columns || 2}, 1fr)`,
        }}
      >
        {pagePhotos.map((photo: any, i: number) => {
          const photoIndex = startIndex + i;
          const photoId = `photo-${photoIndex}`;
          const showCaptions = sc.showCaptions ?? true;
          const showDates = sc.showDates ?? true;

          return (
            <div key={i} className="flex flex-col gap-2 break-inside-avoid">
              <DraggableImage
                id={photoId}
                src={photo.url}
                alt={photo.caption || `Photo ${photoIndex + 1}`}
                containerClassName="aspect-[4/3] bg-zinc-100 rounded-lg border border-zinc-200 shadow-sm"
                onEdit={() => onEditPhoto?.(photoId, photo.url)}
              />
              <div className="px-1">
                {showCaptions && (
                  <p className="font-bold text-zinc-900 text-sm mb-0.5">
                    {photo.caption || 'Untitled Photo'}
                  </p>
                )}
                {showDates && photo.date && (
                  <p className="text-xs text-zinc-400 font-mono">Taken: {photo.date}</p>
                )}
                {showCaptions && photo.description && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{photo.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
