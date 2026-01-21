import { useState, useCallback, useEffect } from 'react';
import { PrintConfig } from '../config/printConfig.types';
import { SPACING_PRESETS } from '../config/styleTokens';
import { DEFAULT_SECTIONS } from '../config/defaultSections';

interface UsePrintConfigReturn {
  config: PrintConfig;
  // Section management
  toggleSection: (sectionId: string) => void;
  togglePageBreak: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  resetSections: () => void;
  // Manual row-level breaks
  toggleRowBreak: (sectionId: string, afterRowIndex: number, afterRowId?: string) => void;
  clearRowBreaks: (sectionId?: string) => void;
  // Spacing
  setSpacing: (type: 'compact' | 'standard' | 'relaxed') => void;
  // Logo
  setLogoScale: (scale: number) => void;
  setLogoAlign: (align: 'left' | 'center' | 'right') => void;
  // Photos
  setHeroPhoto: (index: number | null) => void;
  setStripPhotos: (indexes: number[]) => void;
  toggleCoverPhotos: (show: boolean) => void;
  // Image positions
  setHeroPhotoPosition: (x: number, y: number) => void;
  setStripPhotoPosition: (index: number, x: number, y: number) => void;
  setPhotoPosition: (index: number, x: number, y: number) => void;
  // Misc
  togglePageNumbers: (show: boolean) => void;
  toggleFooter: (show: boolean) => void;
  clearConfig: () => void;
}

const getDefaultConfig = (): PrintConfig => ({
  sections: DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i })),
  spacing: SPACING_PRESETS.standard,
  logoScale: 100,
  logoAlign: 'left',
  heroPhotoIndex: 0,
  heroPhotoPosition: { x: 50, y: 50 },
  stripPhotoIndexes: [1, 2, 3],
  stripPhotoPositions: {},
  photoPositions: {},
  showPageNumbers: true,
  showFooter: true,
  showCoverPhotos: true,
  manualBreaks: [],
});

export function usePrintConfig(projectId: string, initialConfig?: Partial<PrintConfig>): UsePrintConfigReturn {
  const [config, setConfig] = useState<PrintConfig>(() => {
    const storageKey = `print-studio-config-${projectId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Merge saved sections with defaults to ensure new sections appear
        // 1. Get all saved section IDs
        const savedSectionIds = new Set(parsed.sections?.map((s: any) => s.id));
        
        // 2. Find any new default sections that aren't in saved config
        const newSections = DEFAULT_SECTIONS.filter(ds => !savedSectionIds.has(ds.id));
        
        // 3. Combine saved sections + new sections
        // (We put new sections at the start or end based on their 'order' but for simplicity here appended)
        const combinedSections = [
          ...(parsed.sections || []),
          ...newSections
        ].sort((a, b) => a.order - b.order);

        return { 
            ...getDefaultConfig(), 
            ...parsed, 
            sections: combinedSections,
            ...initialConfig 
        };
      } catch (error) {
        console.warn('Failed to parse saved Print Studio config:', error);
        return { ...getDefaultConfig(), ...initialConfig };
      }
    }
    
    return { ...getDefaultConfig(), ...initialConfig };
  });
  
  // Auto-save to localStorage whenever config changes
  useEffect(() => {
    const storageKey = `print-studio-config-${projectId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save Print Studio config:', error);
    }
  }, [config, projectId]);
  
  const toggleSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, included: !s.included } : s
      ),
    }));
  }, []);

  const togglePageBreak = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, forcePageBreakBefore: !s.forcePageBreakBefore } : s
      ),
    }));
  }, []);

  const toggleRowBreak = useCallback((sectionId: string, afterRowIndex: number, afterRowId?: string) => {
    setConfig(prev => {
      const existingBreaks = prev.manualBreaks || [];
      const breakExists = existingBreaks.some(
        b => b.sectionId === sectionId && b.afterRowIndex === afterRowIndex
      );

      if (breakExists) {
        // Remove the break
        return {
          ...prev,
          manualBreaks: existingBreaks.filter(
            b => !(b.sectionId === sectionId && b.afterRowIndex === afterRowIndex)
          ),
        };
      } else {
        // Add the break
        return {
          ...prev,
          manualBreaks: [...existingBreaks, { sectionId, afterRowIndex, afterRowId }],
        };
      }
    });
  }, []);

  const clearRowBreaks = useCallback((sectionId?: string) => {
    setConfig(prev => ({
      ...prev,
      manualBreaks: sectionId
        ? (prev.manualBreaks || []).filter(b => b.sectionId !== sectionId)
        : [],
    }));
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setConfig(prev => {
      const newSections = [...prev.sections];
      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, moved);
      // Update order property to match new array position
      return {
        ...prev,
        sections: newSections.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);
  
  const resetSections = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      sections: DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i })),
    }));
  }, []);
  
  const setSpacing = useCallback((type: 'compact' | 'standard' | 'relaxed') => {
    setConfig(prev => ({
      ...prev,
      spacing: SPACING_PRESETS[type],
    }));
  }, []);
  
  const setLogoScale = useCallback((scale: number) => {
    setConfig(prev => ({
      ...prev,
      logoScale: Math.min(200, Math.max(20, scale)),
    }));
  }, []);

  const setLogoAlign = useCallback((align: 'left' | 'center' | 'right') => {
    setConfig(prev => ({
      ...prev,
      logoAlign: align,
    }));
  }, []);
  
  const setHeroPhoto = useCallback((index: number | null) => {
    setConfig(prev => ({ ...prev, heroPhotoIndex: index }));
  }, []);
  
  const setStripPhotos = useCallback((indexes: number[]) => {
    setConfig(prev => ({ ...prev, stripPhotoIndexes: indexes.slice(0, 3) }));
  }, []);
  
  const toggleCoverPhotos = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showCoverPhotos: show }));
  }, []);
  
  const togglePageNumbers = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showPageNumbers: show }));
  }, []);
  
  const toggleFooter = useCallback((show: boolean) => {
    setConfig(prev => ({ ...prev, showFooter: show }));
  }, []);

  const setHeroPhotoPosition = useCallback((x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      heroPhotoPosition: { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) },
    }));
  }, []);

  const setStripPhotoPosition = useCallback((index: number, x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      stripPhotoPositions: {
        ...prev.stripPhotoPositions,
        [index]: { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) },
      },
    }));
  }, []);

  const setPhotoPosition = useCallback((index: number, x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      photoPositions: {
        ...prev.photoPositions,
        [index]: { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) },
      },
    }));
  }, []);

  const clearConfig = useCallback(() => {
    const storageKey = `print-studio-config-${projectId}`;
    localStorage.removeItem(storageKey);
    setConfig(getDefaultConfig());
  }, [projectId]);

  return {
    config,
    toggleSection,
    togglePageBreak,
    toggleRowBreak,
    clearRowBreaks,
    reorderSections,
    resetSections,
    setSpacing,
    setLogoScale,
    setLogoAlign,
    setHeroPhoto,
    setStripPhotos,
    toggleCoverPhotos,
    setHeroPhotoPosition,
    setStripPhotoPosition,
    setPhotoPosition,
    togglePageNumbers,
    toggleFooter,
    clearConfig,
  };
}
