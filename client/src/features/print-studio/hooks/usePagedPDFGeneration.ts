import { useState, useCallback, RefObject } from 'react';
import { Previewer } from 'pagedjs';

interface UsePagedPDFGenerationReturn {
  generatePDF: (previewRef: RefObject<HTMLDivElement>, filename: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * PDF generation hook using Paged.js for accurate CSS Paged Media rendering.
 * This provides true WYSIWYG PDF output by using the browser's print functionality
 * with Paged.js polyfilling CSS Paged Media features.
 */
export function usePagedPDFGeneration(): UsePagedPDFGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(async (
    previewRef: RefObject<HTMLDivElement>,
    filename: string
  ) => {
    const element = previewRef.current;
    if (!element) {
      setError('Preview element not found');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a hidden iframe for isolated print rendering
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position: absolute; left: -9999px; width: 794px; height: 1123px;';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      // Copy the preview HTML
      const previewClone = element.cloneNode(true) as HTMLElement;

      // Remove selection indicators and interactive elements
      previewClone.querySelectorAll('.ring-2, .ring-cyan-500').forEach((el) => {
        el.classList.remove('ring-2', 'ring-cyan-500', 'ring-offset-1');
      });
      previewClone.querySelectorAll('[data-selectable-id]').forEach((el) => {
        el.removeAttribute('data-selectable-id');
        el.removeAttribute('data-selectable-type');
      });

      // Build the print document HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            /* Reset */
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            /* Paged.js CSS Page Rules */
            @page {
              size: A4 portrait;
              margin: 0;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .preview-page {
                page-break-after: always;
                page-break-inside: avoid;
                break-after: page;
                break-inside: avoid;
                margin: 0 !important;
                box-shadow: none !important;
              }
              .preview-page:last-child {
                page-break-after: auto;
                break-after: auto;
              }
              .print-preview-container {
                padding: 0 !important;
                background: white !important;
              }
            }

            /* Base styles */
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              color: #18181b;
              background: white;
            }

            /* Copy Tailwind utility classes we use */
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-6 { gap: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .font-bold { font-weight: 700; }
            .font-medium { font-weight: 500; }
            .font-mono { font-family: ui-monospace, monospace; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .text-white { color: white; }
            .text-zinc-400 { color: #a1a1aa; }
            .text-zinc-500 { color: #71717a; }
            .text-zinc-600 { color: #52525b; }
            .text-zinc-700 { color: #3f3f46; }
            .text-zinc-900 { color: #18181b; }
            .text-cyan-600 { color: #0891b2; }
            .text-teal-600 { color: #0d9488; }
            .bg-white { background-color: white; }
            .bg-zinc-50 { background-color: #fafafa; }
            .bg-zinc-100 { background-color: #f4f4f5; }
            .bg-zinc-200 { background-color: #e4e4e7; }
            .bg-teal-600 { background-color: #0d9488; }
            .bg-cyan-600 { background-color: #0891b2; }
            .border { border-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-b { border-bottom-width: 1px; }
            .border-zinc-100 { border-color: #f4f4f5; }
            .border-zinc-200 { border-color: #e4e4e7; }
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .overflow-hidden { overflow: hidden; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .w-full { width: 100%; }
            .h-full { height: 100%; }
            .object-cover { object-fit: cover; }
            .p-1 { padding: 0.25rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mt-1 { margin-top: 0.25rem; }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .aspect-\\[4\\/3\\] { aspect-ratio: 4 / 3; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }

            /* Hide non-print elements */
            .page-break-guide,
            [data-debug] {
              display: none !important;
            }

            /* Ensure images load */
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${previewClone.outerHTML}
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(printHTML);
      iframeDoc.close();

      // Wait for images to load
      await new Promise<void>((resolve) => {
        const images = iframeDoc.querySelectorAll('img');
        let loaded = 0;
        const total = images.length;

        if (total === 0) {
          resolve();
          return;
        }

        images.forEach((img) => {
          if (img.complete) {
            loaded++;
            if (loaded === total) resolve();
          } else {
            img.onload = () => {
              loaded++;
              if (loaded === total) resolve();
            };
            img.onerror = () => {
              loaded++;
              if (loaded === total) resolve();
            };
          }
        });

        // Fallback timeout
        setTimeout(resolve, 3000);
      });

      // Use Paged.js to paginate
      const previewer = new Previewer();
      await previewer.preview(
        iframeDoc.body.innerHTML,
        [],
        iframeDoc.body
      );

      // Trigger print dialog
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePDF, isGenerating, error };
}
