/**
 * Universal Widget Adapter Types
 * ------------------------------
 * Defines the contract for widgets that can render in both
 * standard DOM (Editor) and PDF environments.
 */

// The render target environment
export type RenderMode = 'editor' | 'pdf';

// Supported widget types
export type WidgetType = 
  | 'table' 
  | 'chart' 
  | 'summary' 
  | 'list' 
  | 'grid'
  | 'text';

// Configuration specific to the widget instance
export interface WidgetConfig {
  title?: string;
  showTitle?: boolean;
  className?: string; // DOM-only class overrides
  style?: any; // React.CSSProperties or React-PDF Style
}

// The Universal Props Interface
export interface WidgetProps<T> {
  type: WidgetType;
  mode: RenderMode;
  data: T;
  config?: WidgetConfig;
}
