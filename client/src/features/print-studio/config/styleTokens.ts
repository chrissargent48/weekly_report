export const SPACING_PRESETS = {
  compact: {
    type: 'compact' as const,
    sectionGap: 16,
    elementGap: 8,
    tablePadding: 4,
  },
  standard: {
    type: 'standard' as const,
    sectionGap: 24,
    elementGap: 12,
    tablePadding: 8,
  },
  relaxed: {
    type: 'relaxed' as const,
    sectionGap: 32,
    elementGap: 16,
    tablePadding: 12,
  },
} as const;

export const COLORS = {
  primary: '#0891B2',        // Teal/cyan brand color
  primaryDark: '#0E7490',
  accent: '#F59E0B',         // Yellow accent
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  background: '#FFFFFF',
  safetyBanner: '#0891B2',
  golden: '#D4A84B',
} as const;

export const FONTS = {
  heading: "'Inter', 'Helvetica Neue', sans-serif",
  body: "'Inter', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
} as const;
