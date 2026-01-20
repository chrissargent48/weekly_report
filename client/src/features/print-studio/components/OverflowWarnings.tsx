import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface OverflowWarning {
  id: string;
  type: 'overflow' | 'blank' | 'orphan' | 'cutoff';
  pageNumber: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface OverflowWarningsProps {
  previewRef: React.RefObject<HTMLDivElement>;
  totalPages: number;
}

/**
 * Analyzes the preview and displays warnings about pagination issues.
 */
export function OverflowWarnings({ previewRef, totalPages }: OverflowWarningsProps) {
  const [warnings, setWarnings] = useState<OverflowWarning[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePages = useCallback(() => {
    if (!previewRef.current) return;

    setIsAnalyzing(true);
    const newWarnings: OverflowWarning[] = [];

    const pages = previewRef.current.querySelectorAll('.preview-page');

    pages.forEach((page, index) => {
      const pageNumber = index + 1;
      const contentArea = page.querySelector('.preview-page-content');

      if (contentArea) {
        // Check for content overflow
        if (contentArea.scrollHeight > contentArea.clientHeight) {
          newWarnings.push({
            id: `overflow-${pageNumber}`,
            type: 'overflow',
            pageNumber,
            message: `Page ${pageNumber} has content overflow (${contentArea.scrollHeight - contentArea.clientHeight}px hidden)`,
            severity: 'error',
          });
        }

        // Check for nearly empty pages (potential blank page issue)
        const visibleContent = contentArea.textContent?.trim() || '';
        const hasImages = contentArea.querySelectorAll('img').length > 0;

        if (visibleContent.length < 50 && !hasImages && pageNumber > 1) {
          newWarnings.push({
            id: `blank-${pageNumber}`,
            type: 'blank',
            pageNumber,
            message: `Page ${pageNumber} appears to be nearly empty`,
            severity: 'warning',
          });
        }

        // Check for orphaned headers (header at bottom of page)
        const headers = contentArea.querySelectorAll('h1, h2, h3, .section-title');
        headers.forEach((header) => {
          const rect = header.getBoundingClientRect();
          const containerRect = contentArea.getBoundingClientRect();
          const bottomThreshold = containerRect.bottom - 50; // Within 50px of bottom

          if (rect.top > bottomThreshold) {
            newWarnings.push({
              id: `orphan-${pageNumber}-${header.textContent}`,
              type: 'orphan',
              pageNumber,
              message: `Header "${header.textContent?.substring(0, 20)}..." may be orphaned on page ${pageNumber}`,
              severity: 'warning',
            });
          }
        });
      }
    });

    // Check total page count for unusual numbers
    if (totalPages > 15) {
      newWarnings.push({
        id: 'high-page-count',
        type: 'cutoff',
        pageNumber: 0,
        message: `Report has ${totalPages} pages - consider condensing content`,
        severity: 'info',
      });
    }

    setWarnings(newWarnings);
    setIsAnalyzing(false);
  }, [previewRef, totalPages]);

  // Analyze on mount and when page count changes
  useEffect(() => {
    const timeoutId = setTimeout(analyzePages, 500);
    return () => clearTimeout(timeoutId);
  }, [analyzePages, totalPages]);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="overflow-warnings border-t border-zinc-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
          Page Analysis
        </p>
        <button
          onClick={analyzePages}
          disabled={isAnalyzing}
          className="text-[10px] text-cyan-600 hover:text-cyan-700 font-medium disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-700">No pagination issues detected</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {warnings.map((warning) => (
            <div
              key={warning.id}
              className={`flex items-start gap-2 p-2 border rounded-lg ${getBgColor(warning.severity)}`}
            >
              {getIcon(warning.severity)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-700 leading-tight">{warning.message}</p>
                {warning.pageNumber > 0 && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Page {warning.pageNumber}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-[10px] text-zinc-400">
        {totalPages} total pages • {warnings.filter((w) => w.severity === 'error').length} errors
      </div>
    </div>
  );
}
