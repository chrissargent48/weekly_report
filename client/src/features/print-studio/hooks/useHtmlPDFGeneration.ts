import { useState, useCallback, RefObject } from 'react';
import html2pdf from 'html2pdf.js';

interface UseHtmlPDFGenerationReturn {
  generatePDF: (
    previewRef: RefObject<HTMLDivElement>,
    filename: string
  ) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook that captures HTML preview and converts to PDF using html2pdf.js
 * This ensures WYSIWYG - What You See Is What You Get
 */
export function useHtmlPDFGeneration(): UseHtmlPDFGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    previewRef: RefObject<HTMLDivElement>,
    filename: string
  ) => {
    if (!previewRef.current) {
      setError('Preview element not found');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const element = previewRef.current;

      // Configure html2pdf options for high-quality A4 output
      const options = {
        margin: 0, // We handle margins in the HTML
        filename: `${filename}.pdf`,
        image: {
          type: 'jpeg' as const,
          quality: 0.98
        },
        html2canvas: {
          scale: 2, // Higher scale = better quality
          useCORS: true, // Allow cross-origin images
          logging: false,
          letterRendering: true,
          allowTaint: true,
        },
        jsPDF: {
          unit: 'px' as const,
          format: [794, 1123] as [number, number], // A4 at 96 DPI
          orientation: 'portrait' as const,
          hotfixes: ['px_scaling'],
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.page-break-avoid',
        },
      };

      await html2pdf().set(options).from(element).save();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePDF: generate,
    isGenerating,
    error,
  };
}
