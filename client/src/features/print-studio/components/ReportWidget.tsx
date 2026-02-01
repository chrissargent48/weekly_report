import React from 'react';
import { WidgetProps } from '../types/widgetTypes';
import { DomBridge } from '../bridges/DomBridge';
import { PdfBridge } from '../bridges/PdfBridge';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';

/**
 * Universal Widget Adapter
 * ------------------------
 * Acts as the "Traffic Controller" for rendering.
 * Selects the appropriate Visual Bridge based on the 'mode' prop.
 * 
 * - mode="editor": Renders interactive HTML/Tailwind components
 * - mode="pdf": Renders static @react-pdf/renderer primitives
 */
export const ReportWidget = <T extends any>(props: WidgetProps<T>) => {
  const { mode, type } = props;

  // Wrap in ErrorBoundary to prevent one bad widget from crashing the whole studio
  return (
    <ErrorBoundary name={`Widget-${type}-${mode}`}>
      {mode === 'editor' ? (
        <DomBridge {...props} />
      ) : (
        <PdfBridge {...props} />
      )}
    </ErrorBoundary>
  );
};
