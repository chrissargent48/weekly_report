import React, { useRef, useCallback, ReactNode } from 'react';
import { useSelection, SelectableElementType } from '../context/SelectionContext';

interface SelectableElementProps {
  id: string;
  type: SelectableElementType;
  dataId: string | number;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Wrapper that makes any element selectable with click-to-select.
 * Shows a visual indicator when selected.
 */
export function SelectableElement({
  id,
  type,
  dataId,
  children,
  className = '',
  disabled = false,
}: SelectableElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedElement, selectElement, isSelected } = useSelection();
  const selected = isSelected(id);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      selectElement({
        id,
        type,
        dataId,
        rect,
      });
    }
  }, [id, type, dataId, selectElement, disabled]);

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`selectable-element relative ${className} ${
        !disabled ? 'cursor-pointer' : ''
      } ${selected ? 'ring-2 ring-cyan-500 ring-offset-1' : ''}`}
      data-selectable-id={id}
      data-selectable-type={type}
    >
      {children}

      {/* Selection indicator overlay */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500 z-10">
          {/* Corner handles for visual feedback */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500 rounded-sm" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-500 rounded-sm" />

          {/* Type badge */}
          <div className="absolute -top-5 left-0 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium capitalize">
            {type}
          </div>
        </div>
      )}
    </div>
  );
}
