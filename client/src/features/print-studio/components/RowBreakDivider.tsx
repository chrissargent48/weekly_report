import React from 'react';
import { Scissors } from 'lucide-react';

interface RowBreakDividerProps {
  /** Whether a page break exists at this location */
  hasBreak: boolean;
  /** Callback when user clicks to toggle the break */
  onToggleBreak: () => void;
  /** Optional: Show in compact mode (less padding) */
  compact?: boolean;
}

/**
 * A clickable divider that appears between table rows.
 * Shows a subtle hover state, and when clicked, toggles a page break.
 * When a break exists, shows a visible "PAGE BREAK" indicator.
 */
export function RowBreakDivider({ hasBreak, onToggleBreak, compact = false }: RowBreakDividerProps) {
  if (hasBreak) {
    // Active break - show visible indicator
    return (
      <tr className="break-divider-active">
        <td colSpan={100} className="p-0">
          <div
            className="flex items-center gap-2 py-1 px-4 bg-cyan-50 border-y-2 border-dashed border-cyan-400 cursor-pointer hover:bg-cyan-100 transition-colors"
            onClick={onToggleBreak}
            title="Click to remove page break"
          >
            <div className="flex-1 border-t border-cyan-300" />
            <div className="flex items-center gap-1.5 text-cyan-700">
              <Scissors size={12} className="rotate-90" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Page Break</span>
            </div>
            <div className="flex-1 border-t border-cyan-300" />
          </div>
        </td>
      </tr>
    );
  }

  // No break - show hover-triggered insert option
  return (
    <tr className="break-divider-hover group">
      <td colSpan={100} className="p-0">
        <div
          className={`relative ${compact ? 'h-1' : 'h-2'} cursor-pointer`}
          onClick={onToggleBreak}
          title="Click to insert page break"
        >
          {/* Invisible hit area */}
          <div className="absolute inset-x-0 -top-2 -bottom-2" />

          {/* Hover indicator */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex-1 border-t border-dashed border-zinc-300" />
            <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 rounded text-zinc-500 text-[9px] font-medium uppercase tracking-wider">
              <Scissors size={10} className="rotate-90" />
              <span>Insert Break</span>
            </div>
            <div className="flex-1 border-t border-dashed border-zinc-300" />
          </div>
        </div>
      </td>
    </tr>
  );
}

/**
 * Helper hook to check if a break exists at a given row index
 */
export function useHasBreakAtRow(
  manualBreaks: Array<{ sectionId: string; afterRowIndex: number }> | undefined,
  sectionId: string,
  rowIndex: number
): boolean {
  if (!manualBreaks) return false;
  return manualBreaks.some(
    b => b.sectionId === sectionId && b.afterRowIndex === rowIndex
  );
}
