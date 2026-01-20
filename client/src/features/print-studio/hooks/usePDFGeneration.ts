import { useState, useCallback } from 'react';
import { PrintConfig, PageMap } from '../config/printConfig.types';
import { ProjectConfig, WeeklyReport } from '../../../types';
import { generateReportPDF } from '../renderers/pdf-generator/generatePDF';

interface UsePDFGenerationReturn {
  generatePDF: (
    reportData: WeeklyReport,
    projectConfig: ProjectConfig,
    printConfig: PrintConfig,
    pageMap: PageMap
  ) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook that handles async PDF generation with loading states
 */
export function usePDFGeneration(): UsePDFGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generate = useCallback(async (
    reportData: WeeklyReport,
    projectConfig: ProjectConfig,
    printConfig: PrintConfig,
    pageMap: PageMap
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await generateReportPDF(reportData, projectConfig, printConfig, pageMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
      // Optional: Log to error logging service here
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
