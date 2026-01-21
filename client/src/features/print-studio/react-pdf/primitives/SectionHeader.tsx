/**
 * Section Header primitive for @react-pdf/renderer
 *
 * Consistent styling for section headers with "Continued" support
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';

interface SectionHeaderProps {
  title: string;
  isContinued?: boolean;
  color?: string;
  minPresenceAhead?: number;
}

const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
});

export function SectionHeader({
  title,
  isContinued = false,
  color = COLORS.primary,
  minPresenceAhead = 50,
}: SectionHeaderProps) {
  const displayTitle = isContinued ? `${title} (Continued)` : title;

  return (
    <View
      style={headerStyles.container}
      minPresenceAhead={minPresenceAhead}
    >
      <Text style={[headerStyles.title, { color, borderBottomColor: color }]}>
        {displayTitle}
      </Text>
    </View>
  );
}
