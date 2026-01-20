import React from 'react';
import { PrintConfig, ReportData, PagePlacement } from '../config/printConfig.types';
import { SectionWrapper } from './SectionWrapper';
import { DraggableImage } from '../components/DraggableImage';

interface Props {
  config: PrintConfig;
  reportData: ReportData;
  placement: PagePlacement;
}

export function PhotosSection({ config, reportData, placement }: Props) {
  const allPhotos = reportData.photos || [];
  if (allPhotos.length === 0) return null;

  // Logic to determine WHICH photos to show on THIS page instance
  // The layout engine assigns IDs like 'photos' (page 1), 'photos_continued_1' (page 2), etc.
  const PHOTOS_PER_PAGE = 6;

  let pageIndex = 0;
  if (placement.sectionId.includes('_continued_')) {
    const parts = placement.sectionId.split('_continued_');
    pageIndex = parseInt(parts[1], 10);
  }

  const startIndex = pageIndex * PHOTOS_PER_PAGE;
  const pagePhotos = allPhotos.slice(startIndex, startIndex + PHOTOS_PER_PAGE);

  if (pagePhotos.length === 0) return null;

  return (
    // We force min-height to ensure grid looks good even with fewer photos
    <SectionWrapper
      config={config}
      title={pageIndex === 0 ? 'Site Photos' : 'Site Photos (Continued)'}
      className="h-full flex flex-col"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 flex-1">
        {pagePhotos.map((photo: any, i: number) => {
          const photoIndex = startIndex + i;
          return (
            <div key={i} className="flex flex-col gap-2 break-inside-avoid">
              <DraggableImage
                id={`photo-${photoIndex}`}
                src={photo.url}
                alt={photo.caption || `Photo ${photoIndex + 1}`}
                containerClassName="aspect-[4/3] bg-zinc-100 rounded-lg border border-zinc-200 shadow-sm"
              />
              <div className="px-1">
                <p className="font-bold text-zinc-900 text-sm mb-0.5">
                  {photo.caption || 'Untitled Photo'}
                </p>
                {photo.date && (
                  <p className="text-xs text-zinc-400 font-mono">Taken: {photo.date}</p>
                )}
                {photo.description && (
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
