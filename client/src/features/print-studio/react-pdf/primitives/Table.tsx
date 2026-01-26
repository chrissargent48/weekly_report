/**
 * Generic Table primitive for @react-pdf/renderer
 *
 * Handles:
 * - Header repetition on page breaks (via fixed prop)
 * - "Continued" header for split tables
 * - Consistent styling
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';

// Column definition
export interface TableColumn {
  key: string;
  header: string;
  width: number | string; // percentage like '20%' or flex like 1
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  title?: string;
  isContinued?: boolean;
  showHeader?: boolean;
  keyExtractor: (item: any, index: number) => string;
  headerBgColor?: string;
  headerTextColor?: string;
  alternateRowColor?: boolean;
  manualBreaks?: number[]; // Array of row indices to break after
  // Visual hints for split tables
  isSplitTop?: boolean;    // This is the top chunk of a split table (flatten bottom)
  isSplitBottom?: boolean; // This is the bottom chunk of a split table (flatten top)
}

const tableStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
  },
  // Split styles: remove borders/radius where the cut happens
  tableSplitTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  tableSplitBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  headerCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  rowAlt: {
    backgroundColor: COLORS.backgroundAlt,
  },
  cell: {
    fontSize: 8,
    color: COLORS.text,
  },
  cellLeft: {
    textAlign: 'left',
  },
  cellCenter: {
    textAlign: 'center',
  },
  cellRight: {
    textAlign: 'right',
  },
  emptyRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

export function Table({
  columns,
  data,
  title,
  isContinued = false,
  showHeader = true,
  keyExtractor,
  headerBgColor,
  headerTextColor,
  alternateRowColor = true,
  manualBreaks,
  isSplitTop = false,
  isSplitBottom = false,
}: TableProps) {
    const displayTitle = title
        ? (isContinued ? `${title} (Continued)` : title)
        : undefined;
    
    // Apply split visual styles
    const tableStyle = [
        tableStyles.table,
        isSplitTop ? tableStyles.tableSplitTop : {},
        isSplitBottom ? tableStyles.tableSplitBottom : {}
    ];

  const getColumnStyle = (col: TableColumn) => {
    const baseStyle: any = {};
    if (typeof col.width === 'number') {
      baseStyle.flex = col.width;
    } else {
      baseStyle.width = col.width;
    }
    return baseStyle;
  };

  const getCellAlignStyle = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return tableStyles.cellCenter;
      case 'right': return tableStyles.cellRight;
      default: return tableStyles.cellLeft;
    }
  };

  return (
    <View style={tableStyles.container}>
      {displayTitle && (
        <Text style={tableStyles.title}>{displayTitle}</Text>
      )}
      <View style={tableStyle}>
        {/* Header Row - uses fixed to repeat on page breaks */}
        {showHeader && (
          <View
            style={[
              tableStyles.headerRow,
              headerBgColor ? { backgroundColor: headerBgColor } : {}
            ]}
            fixed
          >
            {columns.map((col) => (
              <View key={col.key} style={getColumnStyle(col)}>
                <Text
                  style={[
                    tableStyles.headerCell,
                    getCellAlignStyle(col.align),
                    headerTextColor ? { color: headerTextColor } : {}
                  ]}
                >
                  {col.header}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Data Rows */}
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <React.Fragment key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}>
              <View
                style={[
                  tableStyles.row,
                  alternateRowColor && rowIndex % 2 === 1 ? tableStyles.rowAlt : {},
                ]}
                wrap={false}
              >
                {columns.map((col) => (
                  <View key={col.key} style={getColumnStyle(col)}>
                    {col.render ? (
                      col.render(row[col.key], row, rowIndex)
                    ) : (
                      <Text style={[tableStyles.cell, getCellAlignStyle(col.align)]}>
                        {row[col.key]?.toString() ?? '-'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              {manualBreaks?.includes(rowIndex) && <View break />}
            </React.Fragment>
          ))
        ) : (
          <View style={[tableStyles.row, tableStyles.emptyRow]}>
            <Text style={tableStyles.emptyText}>No data available</Text>
          </View>
        )}
      </View>
    </View>
  );
}
