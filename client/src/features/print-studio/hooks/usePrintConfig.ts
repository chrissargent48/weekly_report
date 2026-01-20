import { useState, useCallback } from 'react';
import { PrintConfig } from '../config/printConfig.types';
import { SPACING_PRESETS } from '../config/styleTokens';
import { DEFAULT_SECTIONS } from '../config/defaultSections';

interface UsePrintConfigReturn {
  config: PrintConfig;
  // Section management
  toggleSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  resetSections: () => void;
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
}

export function usePrintConfig(initialConfig?: Partial<PrintConfig>): UsePrintConfigReturn {
  const [config, setConfig] = useState<PrintConfig>(() => ({
    sections: DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i })),
    spacing: SPACING_PRESETS.standard,
    logoScale: 100,
    logoAlign: 'left',
    heroPhotoIndex: 0,
    heroPhotoPosition: { x: 50, y: 50 }, // Default: center
    stripPhotoIndexes: [1, 2, 3],
    stripPhotoPositions: {}, // Default: empty (will use center)
    photoPositions: {}, // Default: empty (will use center)
    showPageNumbers: true,
    showFooter: true,
    showCoverPhotos: true,
    ...initialConfig,
  }));
  
  const toggleSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, included: !s.included } : s
      ),
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

  return {
    config,
    toggleSection,
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
  };
}
