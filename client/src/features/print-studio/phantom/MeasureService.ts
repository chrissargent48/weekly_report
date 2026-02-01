import { WidgetType } from '../types/widgetTypes';

/**
 * Measurement Result
 * Returns height in POINTS (72 dpi)
 */
interface MeasureResult {
  height: number;
}

// Debounce map to prevent redundant measurements
const measureCache = new Map<string, MeasureResult>();
const pendingMeasurements = new Map<string, number>(); // ID -> TimeoutID

/**
 * MEASURE SERVICE
 * ---------------
 * Handles the "Double-Pass" layout strategy.
 * 1. Renders content into the Phantom DOM.
 * 2. extracted computed geometry.
 * 3. Caches results to avoid frequent thrashing.
 */
export const MeasureService = {
  
  /**
   * Measure a widget's height given specific data and width constraints.
   * @param id Unique cache key for this data/config combo
   * @param renderFn Function that returns the React Node to render
   * @param force Recalculate even if cached
   */
  measureWidget: async (
    id: string, 
    renderFn: () => React.ReactNode, 
    force = false
  ): Promise<number> => {
    if (!force && measureCache.has(id)) {
      return measureCache.get(id)!.height;
    }

    // In a real implementation with a Web Worker or detached DOM, 
    // we would inject the node, wait for layout, measure, and cleanup.
    // For this implementation, we will assume a "Synchronous" approach 
    // where the PhantomPage component (rendered by the main app)
    // reports back dimensions via a callback.
    
    // For now, we simulate a basic estimation as a fallback 
    // until the full render loop is wired up.
    
    return new Promise((resolve) => {
       // Placeholder: "Ask" the Phantom DOM to render this
       // In reality, this might dispatch an event or update a context 
       // that the PhantomContainer listens to.
       
       console.warn('MeasureService.measureWidget: Real DOM measurement not yet wired. Returning estimate.');
       resolve(100); // Default fallback
    });
  },

  /**
   * Debounced Measure Helper
   * Wraps the measure call to prevent UI freezing during typing.
   */
  measureWithDebounce: (
    id: string, 
    measureFn: () => Promise<number>, 
    delay = 300,
    callback: (height: number) => void
  ) => {
    if (pendingMeasurements.has(id)) {
      window.clearTimeout(pendingMeasurements.get(id));
    }

    const timeoutId = window.setTimeout(async () => {
      const height = await measureFn();
      callback(height);
      pendingMeasurements.delete(id);
    }, delay);

    pendingMeasurements.set(id, timeoutId);
  },

  /**
   * Binary Search Splitter
   * Finds the exact row index where a table overflows the available height.
   */
  findSplitPoint: (
    totalRows: number, 
    availableHeight: number, 
    measureRowFn: (index: number) => number // Returns height of row N
  ): number => {
    let currentHeight = 0;
    for (let i = 0; i < totalRows; i++) {
      const rowH = measureRowFn(i);
      if (currentHeight + rowH > availableHeight) {
        return i; // Split BEFORE this row
      }
      currentHeight += rowH;
    }
    return totalRows; // All fit
  }
};
