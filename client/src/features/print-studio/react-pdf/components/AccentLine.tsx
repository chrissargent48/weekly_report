/**
 * Accent Line component for @react-pdf/renderer
 *
 * A decorative horizontal line used as a visual separator,
 * typically appearing below titles on the cover page.
 */

import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';

interface AccentLineProps {
  /** Width of the line (default: 100) */
  width?: number;
  /** Height/thickness of the line (default: 4) */
  height?: number;
  /** Color of the line (default: golden accent) */
  color?: string;
  /** Bottom margin (default: 16) */
  marginBottom?: number;
}

const defaultStyles = StyleSheet.create({
  line: {
    borderRadius: 2,
  },
});

export function AccentLine({
  width = 100,
  height = 4,
  color = COLORS.accent,
  marginBottom = 16,
}: AccentLineProps) {
  return (
    <View
      style={[
        defaultStyles.line,
        {
          width,
          height,
          backgroundColor: color,
          marginBottom,
        },
      ]}
    />
  );
}

export default AccentLine;
