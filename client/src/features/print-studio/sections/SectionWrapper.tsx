import React, { ReactNode } from 'react';
import { PrintConfig } from '../config/printConfig.types';

interface SectionWrapperProps {
  children: ReactNode;
  config: PrintConfig;
  title?: string;
  className?: string;
  noPadding?: boolean;
}

export function SectionWrapper({
  children,
  config,
  title,
  className = '',
  noPadding = false
}: SectionWrapperProps) {
  // Determine padding based on spacing setting
  // Reduced horizontal padding from px-10 (40px) to px-2 (8px) - page margins already provide spacing
  const paddingY = config.spacing.type === 'compact' ? 'py-3' : config.spacing.type === 'relaxed' ? 'py-6' : 'py-4';
  const paddingX = 'px-2';

  return (
    <div className={`section-wrapper ${!noPadding ? `${paddingY} ${paddingX}` : ''} ${className}`}>
      {title && (
        <h3 className="section-title text-xs font-bold text-cyan-600 uppercase tracking-wider mb-3 border-b border-zinc-100 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
