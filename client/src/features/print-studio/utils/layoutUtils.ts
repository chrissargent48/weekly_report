/**
 * layoutUtils – Shared conversion between CSS pixels (96 DPI) and PDF points (72 DPI).
 *
 * The HTML Canvas renders at 96 DPI (browser standard).
 * react-pdf renders at 72 DPI (PDF standard: 1 pt = 1/72 inch).
 *
 * Ratio: 72 / 96 = 0.75
 */

const PX_PER_INCH = 96;
const PT_PER_INCH = 72;
const RATIO = PT_PER_INCH / PX_PER_INCH; // 0.75

/** Convert CSS pixels to PDF points. */
export function pxToPt(px: number): number {
  return px * RATIO;
}

/** Convert PDF points to CSS pixels. */
export function ptToPx(pt: number): number {
  return pt / RATIO;
}

/**
 * Convert a margins object from px (Canvas) to pt (PDF).
 * Convenience wrapper used by ReportDocument and its child sections.
 */
export function marginsPxToPt(margins: {
  top: number;
  bottom: number;
  left: number;
  right: number;
}): { top: number; bottom: number; left: number; right: number } {
  return {
    top: pxToPt(margins.top),
    bottom: pxToPt(margins.bottom),
    left: pxToPt(margins.left),
    right: pxToPt(margins.right),
  };
}
