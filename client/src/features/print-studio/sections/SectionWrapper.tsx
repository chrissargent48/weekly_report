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
  const paddingY = config.spacing.type === 'compact' ? 'py-4' : config.spacing.type === 'relaxed' ? 'py-8' : 'py-6';
  const paddingX = 'px-10'; // Standard horizontal padding for print
  
  return (
    <div className={`section-wrapper ${!noPadding ? `${paddingY} ${paddingX}` : ''} ${className}`}>
      {title && (
        <h3 className="section-title text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
