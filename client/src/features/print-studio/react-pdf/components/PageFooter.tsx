/**
 * Page Footer component for @react-pdf/renderer
 *
 * Renders a consistent footer across all pages with:
 * - Project name / Report type on the left
 * - Page X of Y on the right
 * - Thin border line at top
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PAGE } from '../styles';

interface PageFooterProps {
  projectName: string;
  showPageNumbers?: boolean;
}

const footerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: PAGE.MARGIN_LEFT,
    right: PAGE.MARGIN_RIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  text: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
});

/**
 * Fixed page footer for content pages
 * Use with `fixed` prop on the View to repeat on every page
 */
export function PageFooter({ projectName, showPageNumbers = true }: PageFooterProps) {
  return (
    <View style={footerStyles.container} fixed>
      <Text style={footerStyles.text}>
        {projectName} - Weekly Report
      </Text>
      {showPageNumbers && (
        <Text
          style={footerStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      )}
    </View>
  );
}

/**
 * Inline footer for cover page (not fixed, part of the page content)
 * Positioned absolutely at bottom of cover
 */
export function CoverFooter({ projectName, showPageNumbers = true }: PageFooterProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 10,
        left: PAGE.MARGIN_LEFT,
        right: PAGE.MARGIN_RIGHT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}
    >
      <Text style={footerStyles.text}>
        {projectName} - Weekly Report
      </Text>
      {showPageNumbers && (
        <Text
          style={footerStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      )}
    </View>
  );
}

export default PageFooter;
