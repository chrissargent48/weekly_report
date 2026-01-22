/**
 * Section Wrapper component for @react-pdf/renderer
 *
 * Provides consistent styling for all content sections:
 * - Section header with title and optional "Continued" suffix
 * - Configurable spacing (compact/standard/relaxed)
 * - Automatic page break detection via minPresenceAhead
 * - Break-inside: avoid for section headers
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, DENSITY_MULTIPLIERS, DensityMode } from '../styles';
import { SectionHeader } from '../primitives/SectionHeader';

interface SectionWrapperProps {
  /** Section title displayed in the header */
  title: string;
  /** Whether this is a continuation from a previous page */
  isContinued?: boolean;
  /** Spacing density mode */
  density?: DensityMode;
  /** Custom color for the section header */
  headerColor?: string;
  /** Minimum space required ahead before breaking to new page (default: 60pt) */
  minPresenceAhead?: number;
  /** Whether to force a page break before this section */
  breakBefore?: boolean;
  /** Whether to avoid breaking inside this section */
  avoidBreakInside?: boolean;
  /** Children content */
  children: React.ReactNode;
}

const baseStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerCompact: {
    marginBottom: 12,
  },
  containerRelaxed: {
    marginBottom: 24,
  },
});

/**
 * SectionWrapper provides consistent layout for all report sections
 *
 * Features:
 * - Renders a styled section header with the title
 * - Adds "(Continued)" suffix when section spans multiple pages
 * - Applies density-based spacing
 * - Uses minPresenceAhead to prevent orphaned headers
 *
 * @example
 * ```tsx
 * <SectionWrapper title="Weather" density="standard">
 *   <WeatherContent data={weatherData} />
 * </SectionWrapper>
 * ```
 */
export function SectionWrapper({
  title,
  isContinued = false,
  density = 'standard',
  headerColor = COLORS.primary,
  minPresenceAhead = 60,
  breakBefore = false,
  avoidBreakInside = false,
  children,
}: SectionWrapperProps) {
  // Get container style based on density
  const getContainerStyle = () => {
    switch (density) {
      case 'compact':
        return baseStyles.containerCompact;
      case 'relaxed':
        return baseStyles.containerRelaxed;
      default:
        return baseStyles.container;
    }
  };

  return (
    <View
      style={getContainerStyle()}
      break={breakBefore}
      wrap={!avoidBreakInside}
    >
      {/* Section Header */}
      <SectionHeader
        title={title}
        isContinued={isContinued}
        color={headerColor}
        minPresenceAhead={minPresenceAhead}
      />

      {/* Section Content */}
      {children}
    </View>
  );
}

/**
 * SectionContent - Optional wrapper for section body content
 * Applies consistent padding and background
 */
interface SectionContentProps {
  children: React.ReactNode;
  /** Add light background color */
  background?: boolean;
  /** Add padding */
  padded?: boolean;
}

const contentStyles = StyleSheet.create({
  content: {
    // Default: no special styling
  },
  contentPadded: {
    padding: 12,
  },
  contentBackground: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 4,
  },
});

export function SectionContent({
  children,
  background = false,
  padded = false,
}: SectionContentProps) {
  return (
    <View
      style={[
        contentStyles.content,
        padded && contentStyles.contentPadded,
        background && contentStyles.contentBackground,
      ]}
    >
      {children}
    </View>
  );
}

export default SectionWrapper;
