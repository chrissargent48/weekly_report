import React from 'react';
import { useSelection } from '../context/SelectionContext';
import { ImagePosition, PrintConfig } from '../config/printConfig.types';
import { X, Move, RotateCcw } from 'lucide-react';

interface PropertiesPanelProps {
  config: PrintConfig;
  onSetHeroPhotoPosition: (x: number, y: number) => void;
  onSetStripPhotoPosition: (index: number, x: number, y: number) => void;
  onSetPhotoPosition: (index: number, x: number, y: number) => void;
}

/**
 * Context-sensitive properties panel that shows controls
 * for the currently selected element.
 */
export function PropertiesPanel({
  config,
  onSetHeroPhotoPosition,
  onSetStripPhotoPosition,
  onSetPhotoPosition,
}: PropertiesPanelProps) {
  const { selectedElement, clearSelection } = useSelection();

  if (!selectedElement) {
    return (
      <div className="properties-panel border-t border-zinc-100 pt-4">
        <div className="text-center py-8 text-zinc-400">
          <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Click an element to edit</p>
          <p className="text-[10px] mt-1">Select images to adjust position</p>
        </div>
      </div>
    );
  }

  // Get position based on element type and id
  const getPosition = (): ImagePosition => {
    if (selectedElement.type === 'image') {
      const id = selectedElement.id;

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
    }

    return { x: 50, y: 50 };
  };

  const handlePositionChange = (x: number, y: number) => {
    const id = selectedElement.id;

    if (id === 'hero-image') {
      onSetHeroPhotoPosition(x, y);
    } else if (id.startsWith('strip-photo-')) {
      const idx = parseInt(id.replace('strip-photo-', ''), 10);
      onSetStripPhotoPosition(idx, x, y);
    } else if (id.startsWith('photo-')) {
      const idx = parseInt(id.replace('photo-', ''), 10);
      onSetPhotoPosition(idx, x, y);
    }
  };

  const handleReset = () => {
    handlePositionChange(50, 50);
  };

  const position = getPosition();

  return (
    <div className="properties-panel border-t border-zinc-100 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center">
            <Move className="w-3 h-3 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 capitalize">
              {selectedElement.type} Properties
            </p>
            <p className="text-[10px] text-zinc-400">{selectedElement.id}</p>
          </div>
        </div>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-zinc-100 rounded transition text-zinc-400 hover:text-zinc-600"
          title="Deselect"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {selectedElement.type === 'image' && (
        <div className="space-y-4">
          {/* Position Controls */}
          <div>
            <p className="text-xs font-medium text-zinc-700 mb-2">Image Position</p>
            <p className="text-[10px] text-zinc-400 mb-3">
              Drag the image in the preview, or use these controls
            </p>

            {/* Visual position grid */}
            <div className="relative w-full aspect-video bg-zinc-100 rounded border border-zinc-200 mb-3">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => {
                    const x = col * 50;
                    const y = row * 50;
                    const isActive = Math.abs(position.x - x) < 20 && Math.abs(position.y - y) < 20;
                    return (
                      <button
                        key={`${row}-${col}`}
                        onClick={() => handlePositionChange(x, y)}
                        className={`border border-zinc-200/50 hover:bg-cyan-500/10 transition flex items-center justify-center ${
                          isActive ? 'bg-cyan-500/20' : ''
                        }`}
                        title={`Position: ${x}%, ${y}%`}
                      >
                        {isActive && (
                          <div className="w-2 h-2 bg-cyan-500 rounded-full shadow" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Current position indicator */}
              <div
                className="absolute w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              />
            </div>

            {/* Numeric inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">X Position</label>
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.x}
                    onChange={(e) => handlePositionChange(parseInt(e.target.value), position.y)}
                    className="flex-1 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">
                    {Math.round(position.x)}%
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Y Position</label>
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.y}
                    onChange={(e) => handlePositionChange(position.x, parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">
                    {Math.round(position.y)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick positions */}
          <div>
            <p className="text-xs font-medium text-zinc-700 mb-2">Quick Positions</p>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Center', x: 50, y: 50 },
                { label: 'Top', x: 50, y: 0 },
                { label: 'Bottom', x: 50, y: 100 },
                { label: 'Left', x: 0, y: 50 },
                { label: 'Right', x: 100, y: 50 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePositionChange(preset.x, preset.y)}
                  className={`px-2 py-1 text-[10px] rounded border transition ${
                    position.x === preset.x && position.y === preset.y
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to Center
          </button>
        </div>
      )}
    </div>
  );
}
