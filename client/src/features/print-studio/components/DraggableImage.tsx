import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSelection } from '../context/SelectionContext';
import { useImagePositionById } from '../context/ImagePositionContext';
import { ImagePosition } from '../config/printConfig.types';

interface DraggableImageProps {
  /** Unique ID like 'hero-image', 'strip-photo-0', 'photo-5' */
  id: string;
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Image component that supports drag-to-pan positioning.
 * The image uses object-fit: cover and the user can drag to change
 * which part of the image is visible (object-position).
 *
 * Uses ImagePositionContext to automatically get/set position based on ID.
 */
export function DraggableImage({
  id,
  src,
  alt,
  className = '',
  containerClassName = '',
}: DraggableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState<ImagePosition>({ x: 50, y: 50 });

  // Get position and setter from context
  const { position, setPosition } = useImagePositionById(id);

  const { selectElement, isSelected } = useSelection();
  const selected = isSelected(id);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Select this element
    if (containerRef.current) {
      selectElement({
        id,
        type: 'image',
        dataId: id,
        rect: containerRef.current.getBoundingClientRect(),
      });
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
  }, [id, position, selectElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate delta as percentage of container size
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    // Invert the delta (dragging right moves viewport left, showing more of right side)
    const newX = Math.min(100, Math.max(0, startPosition.x - deltaX));
    const newY = Math.min(100, Math.max(0, startPosition.y - deltaY));

    setPosition(newX, newY);
  }, [isDragging, dragStart, startPosition, setPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`draggable-image-container relative overflow-hidden ${containerClassName} ${
        selected ? 'ring-2 ring-cyan-500 ring-offset-1' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      data-selectable-id={id}
      data-selectable-type="image"
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover select-none pointer-events-none ${className}`}
        style={{
          objectPosition: `${position.x}% ${position.y}%`,
        }}
        draggable={false}
      />

      {/* Selection overlay with drag hint */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-500 rounded-sm" />

          {/* Type badge */}
          <div className="absolute -top-5 left-0 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
            Image
          </div>

          {/* Drag hint overlay */}
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Drag to pan
            </div>
          </div>
        </div>
      )}

      {/* Dragging indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-500/10 pointer-events-none z-20" />
      )}
    </div>
  );
}
