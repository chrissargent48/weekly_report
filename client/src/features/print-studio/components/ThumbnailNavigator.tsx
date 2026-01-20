import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageMap, PageContent } from '../config/printConfig.types';

interface ThumbnailNavigatorProps {
  pageMap: PageMap;
  currentPage: number;
  onPageSelect: (pageNumber: number) => void;
  previewRef: React.RefObject<HTMLDivElement>;
}

/**
 * Thumbnail navigator showing miniature page previews.
 * Clicking a thumbnail scrolls to that page in the main preview.
 */
export function ThumbnailNavigator({
  pageMap,
  currentPage,
  onPageSelect,
  previewRef,
}: ThumbnailNavigatorProps) {
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Generate thumbnail snapshots from the preview pages
  const generateThumbnails = useCallback(async () => {
    if (!previewRef.current) return;

    const pages = previewRef.current.querySelectorAll('.preview-page');
    const newThumbnails: Record<number, string> = {};

    pages.forEach((page, index) => {
      // Use a simple approach: just reference the page number
      // Real thumbnails would use html2canvas but that's expensive
      newThumbnails[index + 1] = '';
    });

    setThumbnails(newThumbnails);
  }, [previewRef]);

  useEffect(() => {
    generateThumbnails();
  }, [pageMap, generateThumbnails]);

  // Auto-scroll the thumbnail container to show current page
  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumb = thumbnailsRef.current.querySelector(`[data-page="${currentPage}"]`);
      if (thumb) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentPage]);

  const handleThumbnailClick = (pageNumber: number) => {
    onPageSelect(pageNumber);

    // Scroll the main preview to the selected page
    if (previewRef.current) {
      const page = previewRef.current.querySelector(`[data-page-number="${pageNumber}"]`);
      if (page) {
        page.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="thumbnail-navigator w-20 bg-zinc-800 border-r border-zinc-700 flex flex-col h-full shrink-0">
      <div className="p-2 border-b border-zinc-700">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider text-center">
          Pages
        </p>
      </div>

      <div
        ref={thumbnailsRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {pageMap.pages.map((page) => (
          <ThumbnailItem
            key={page.pageNumber}
            page={page}
            isActive={currentPage === page.pageNumber}
            onClick={() => handleThumbnailClick(page.pageNumber)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThumbnailItemProps {
  page: PageContent;
  isActive: boolean;
  onClick: () => void;
}

function ThumbnailItem({ page, isActive, onClick }: ThumbnailItemProps) {
  return (
    <button
      onClick={onClick}
      data-page={page.pageNumber}
      className={`w-full aspect-[794/1123] rounded border-2 transition-all overflow-hidden ${
        isActive
          ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20'
          : 'border-zinc-600 hover:border-zinc-500'
      }`}
    >
      {/* Mini page representation */}
      <div className="w-full h-full bg-white flex flex-col p-0.5">
        {page.isFirstPage ? (
          // Cover page thumbnail
          <div className="flex-1 flex flex-col">
            <div className="h-1/3 bg-teal-600/30 rounded-sm" />
            <div className="flex-1 flex items-center justify-center">
              <div className="w-2/3 h-1 bg-zinc-200 rounded" />
            </div>
            <div className="h-1/4 bg-zinc-100 flex gap-0.5 p-0.5">
              <div className="flex-1 bg-zinc-200 rounded-sm" />
              <div className="flex-1 bg-zinc-200 rounded-sm" />
              <div className="flex-1 bg-zinc-200 rounded-sm" />
            </div>
          </div>
        ) : (
          // Content page thumbnail
          <div className="flex-1 flex flex-col gap-0.5 p-0.5">
            <div className="h-1 bg-zinc-200 rounded w-1/2" />
            {page.sections.map((section, i) => (
              <div key={i} className="h-2 bg-zinc-100 rounded" />
            ))}
          </div>
        )}
      </div>

      {/* Page number badge */}
      <div
        className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 text-center ${
          isActive ? 'bg-cyan-500 text-white' : 'bg-zinc-700 text-zinc-300'
        }`}
      >
        {page.pageNumber}
      </div>
    </button>
  );
}
