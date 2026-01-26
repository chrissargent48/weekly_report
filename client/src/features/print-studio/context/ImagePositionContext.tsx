import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { ImagePosition, PrintConfig } from '../config/printConfig.types';

interface ImagePositionContextType {
  config: PrintConfig;
  setHeroPhotoPosition: (x: number, y: number) => void;
  setStripPhotoPosition: (index: number, x: number, y: number) => void;
  setPhotoPosition: (index: number, x: number, y: number) => void;
  setPhotoZoom: (id: string, zoom: number) => void;
  setPhotoCrop: (id: string, crop: { x: number; y: number; width: number; height: number }) => void;
  getPosition: (id: string) => ImagePosition;
}

const ImagePositionContext = createContext<ImagePositionContextType | null>(null);

interface ImagePositionProviderProps {
  children: ReactNode;
  config: PrintConfig;
  setHeroPhotoPosition: (x: number, y: number) => void;
  setStripPhotoPosition: (index: number, x: number, y: number) => void;
  setPhotoPosition: (index: number, x: number, y: number) => void;
  setPhotoZoom: (id: string, zoom: number) => void;
  setPhotoCrop: (id: string, crop: { x: number; y: number; width: number; height: number }) => void;
}

export function ImagePositionProvider({
  children,
  config,
  setHeroPhotoPosition,
  setStripPhotoPosition,
  setPhotoPosition,
  setPhotoZoom,
  setPhotoCrop,
}: ImagePositionProviderProps) {
  const getPosition = useCallback((id: string): ImagePosition => {
    if (id === 'hero-image') {
      return config.heroPhotoPosition ?? { x: 50, y: 50 };
    }

    if (id.startsWith('strip-photo-')) {
      const idx = parseInt(id.replace('strip-photo-', ''), 10);
      return config.stripPhotoPositions?.[idx] ?? { x: 50, y: 50 };
    }

    if (id.startsWith('photo-')) {
      const idx = parseInt(id.replace('photo-', ''), 10);
      return config.photoPositions?.[idx] ?? { x: 50, y: 50 };
    }

    return { x: 50, y: 50 };
  }, [config.heroPhotoPosition, config.stripPhotoPositions, config.photoPositions]);

  return (
    <ImagePositionContext.Provider
      value={{
        config,
        setHeroPhotoPosition,
        setStripPhotoPosition,
        setPhotoPosition,
        setPhotoZoom,
        setPhotoCrop,
        getPosition,
      }}
    >
      {children}
    </ImagePositionContext.Provider>
  );
}

export function useImagePosition() {
  const context = useContext(ImagePositionContext);
  if (!context) {
    throw new Error('useImagePosition must be used within an ImagePositionProvider');
  }
  return context;
}

/**
 * Hook to get position and setter for a specific image ID.
 */
export function useImagePositionById(id: string) {
  const { 
    getPosition, 
    setHeroPhotoPosition, 
    setStripPhotoPosition, 
    setPhotoPosition,
    setPhotoZoom,
    setPhotoCrop
  } = useImagePosition();

  const position = getPosition(id);

  const setPosition = useCallback((x: number, y: number) => {
    if (id === 'hero-image') {
      setHeroPhotoPosition(x, y);
    } else if (id.startsWith('strip-photo-')) {
      const idx = parseInt(id.replace('strip-photo-', ''), 10);
      setStripPhotoPosition(idx, x, y);
    } else if (id.startsWith('photo-')) {
      const idx = parseInt(id.replace('photo-', ''), 10);
      setPhotoPosition(idx, x, y);
    }
  }, [id, setHeroPhotoPosition, setStripPhotoPosition, setPhotoPosition]);

  const setZoom = useCallback((zoom: number) => {
    setPhotoZoom(id, zoom);
  }, [id, setPhotoZoom]);

  const setCrop = useCallback((crop: { x: number; y: number; width: number; height: number }) => {
    setPhotoCrop(id, crop);
  }, [id, setPhotoCrop]);

  return { position, setPosition, setZoom, setCrop };
}
