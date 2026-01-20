import React from 'react';
import { PAGE, FOOTER } from '../../layout-engine/pageConstants';
import { PageContent } from '../../config/printConfig.types';

interface PreviewPageProps {
  page: PageContent;
  children: React.ReactNode;
  showPageBreakGuide?: boolean;
  footerText?: string;
}

/**
 * Renders a single page with enforced dimensions.
 * This ensures the preview accurately represents print output.
 */
export function PreviewPage({ page, children, showPageBreakGuide = false, footerText }: PreviewPageProps) {
  return (
    <div
      className="preview-page bg-white shadow-lg mx-auto relative overflow-hidden print:shadow-none print:m-0"
      style={{
        width: PAGE.WIDTH,
        minHeight: PAGE.HEIGHT,
        maxHeight: PAGE.HEIGHT,
        marginBottom: 24,
        // Padding simulates the print margins
        padding: `${PAGE.MARGIN_TOP}px ${PAGE.MARGIN_RIGHT}px ${PAGE.MARGIN_BOTTOM}px ${PAGE.MARGIN_LEFT}px`,
      }}
    >
      {/* Page content area - strictly limited height */}
      <div
        className="preview-page-content"
        style={{
          height: PAGE.USABLE_HEIGHT - FOOTER.HEIGHT,
          overflow: 'hidden', // CRITICAL: This is what catches overflow issues visually
        }}
      >
        {children}
      </div>
      
      {/* Footer */}
      <div
        className="preview-page-footer absolute flex justify-between items-end border-t border-zinc-200 text-[10px] text-zinc-500"
        style={{
          bottom: PAGE.MARGIN_BOTTOM,
          left: PAGE.MARGIN_LEFT,
          right: PAGE.MARGIN_RIGHT,
          height: FOOTER.HEIGHT,
          paddingTop: FOOTER.MARGIN_TOP,
        }}
      >
        <span>{footerText || 'Weekly Report'}</span>
        <span>Page {page.pageNumber}</span>
      </div>
      
      {/* Visual Debug Guide for Page Breaks */}
      {showPageBreakGuide && (
        <div
          className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 pointer-events-none z-50 opacity-50"
          style={{
             bottom: PAGE.MARGIN_BOTTOM + FOOTER.HEIGHT + 5, // Just above footer area
             height: 1
          }}
        >
           <span className="absolute right-0 bottom-1 bg-red-100 text-red-600 text-[9px] px-1">Limit</span>
        </div>
      )}
    </div>
  );
}
