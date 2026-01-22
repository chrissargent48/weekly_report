/**
 * Progress Section for @react-pdf/renderer
 *
 * Displays project progress with:
 * - Executive summary cards (Contract Value, Earned to Date, Project Progress)
 * - Detailed bid items table with circular progress indicators
 *
 * Matches the HTML preview's visual structure.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, CircularProgress } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ProjectBaselines, ProjectConfig } from '../../../../types';

interface ProgressSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig?: ProjectConfig;
  baselines?: ProjectBaselines | null;
  placement?: PagePlacement;
}

const progressStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // Executive Summary Cards Grid
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  // Individual summary card
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  summaryCardBlue: {
    borderLeftColor: COLORS.blue,
  },
  summaryLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryValuePrimary: {
    color: COLORS.primary,
  },
  summarySubtext: {
    fontSize: 6,
    color: COLORS.textLight,
  },
  // Progress bar for overall progress card
  progressBarContainer: {
    marginTop: 6,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  headerCell: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  headerCellLeft: {
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowAlt: {
    backgroundColor: COLORS.backgroundAlt,
  },
  cell: {
    fontSize: 7,
    color: COLORS.text,
    textAlign: 'center',
  },
  cellLeft: {
    textAlign: 'left',
  },
  cellMono: {
    fontFamily: 'Courier',
    color: COLORS.textMuted,
  },
  cellBold: {
    fontWeight: 'bold',
  },
  cellPrimary: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cellHighlight: {
    backgroundColor: COLORS.backgroundAlt,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  // Progress cell with CircularProgress
  progressCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Table footer
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  // Empty state
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Column widths
const COLUMNS = {
  item: '8%',
  description: '25%',
  unit: '7%',
  qty: '10%',
  prev: '10%',
  thisPrd: '10%',
  toDate: '10%',
  remain: '10%',
  percent: '10%',
};

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Executive Summary Cards (only shown on first page)
 */
function SummaryCards({
  contractValue,
  earnedToDate,
  percentComplete,
}: {
  contractValue: number;
  earnedToDate: number;
  percentComplete: number;
}) {
  return (
    <View style={progressStyles.summaryGrid}>
      {/* Contract Value Card */}
      <View style={progressStyles.summaryCard}>
        <Text style={progressStyles.summaryLabel}>Contract Value</Text>
        <Text style={progressStyles.summaryValue}>{formatCurrency(contractValue)}</Text>
        <Text style={progressStyles.summarySubtext}>Original Contract Sum</Text>
      </View>

      {/* Earned to Date Card */}
      <View style={progressStyles.summaryCard}>
        <Text style={progressStyles.summaryLabel}>Earned to Date</Text>
        <Text style={progressStyles.summaryValue}>{formatCurrency(earnedToDate)}</Text>
        <Text style={progressStyles.summarySubtext}>Completed Work Value</Text>
      </View>

      {/* Project Progress Card */}
      <View style={[progressStyles.summaryCard, progressStyles.summaryCardBlue]}>
        <Text style={progressStyles.summaryLabel}>Project Progress</Text>
        <Text style={[progressStyles.summaryValue, progressStyles.summaryValuePrimary]}>
          {percentComplete.toFixed(1)}%
        </Text>
        <Text style={progressStyles.summarySubtext}>Complete</Text>
        <View style={progressStyles.progressBarContainer}>
          <View
            style={[progressStyles.progressBarFill, { width: `${Math.min(percentComplete, 100)}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Table header row
 */
function TableHeader() {
  return (
    <View style={progressStyles.tableHeader}>
      <Text style={[progressStyles.headerCell, progressStyles.headerCellLeft, { width: COLUMNS.item }]}>
        Item
      </Text>
      <Text style={[progressStyles.headerCell, progressStyles.headerCellLeft, { width: COLUMNS.description }]}>
        Description
      </Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.unit }]}>Unit</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.qty }]}>Qty</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.prev }]}>Prev</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.thisPrd }]}>This Prd</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.toDate }]}>To Date</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.remain }]}>Remain</Text>
      <Text style={[progressStyles.headerCell, { width: COLUMNS.percent }]}>%</Text>
    </View>
  );
}

/**
 * Table data row
 */
function TableRow({
  item,
  isAlt,
}: {
  item: {
    itemNumber: string;
    description: string;
    unit: string;
    contractQty: number;
    prevQty: number;
    thisWeekQty: number;
    toDateQty: number;
    remainingQty: number;
    percentComplete: number;
  };
  isAlt: boolean;
}) {
  return (
    <View style={isAlt ? [progressStyles.tableRow, progressStyles.tableRowAlt] : progressStyles.tableRow} wrap={false}>
      <Text style={[progressStyles.cell, progressStyles.cellLeft, progressStyles.cellMono, { width: COLUMNS.item }]}>
        {item.itemNumber}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellLeft, progressStyles.cellBold, { width: COLUMNS.description }]}>
        {item.description}
      </Text>
      <Text style={[progressStyles.cell, { width: COLUMNS.unit, fontSize: 6, textTransform: 'uppercase' }]}>
        {item.unit}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellMono, { width: COLUMNS.qty }]}>
        {formatNumber(item.contractQty)}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellMono, { width: COLUMNS.prev, color: COLORS.textLight }]}>
        {formatNumber(item.prevQty)}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellPrimary, { width: COLUMNS.thisPrd }]}>
        {formatNumber(item.thisWeekQty)}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellHighlight, { width: COLUMNS.toDate }]}>
        {formatNumber(item.toDateQty)}
      </Text>
      <Text style={[progressStyles.cell, progressStyles.cellMono, { width: COLUMNS.remain }]}>
        {formatNumber(item.remainingQty)}
      </Text>
      <View style={[progressStyles.progressCell, { width: COLUMNS.percent }]}>
        <CircularProgress
          percent={item.percentComplete}
          size={18}
          strokeWidth={2}
        />
      </View>
    </View>
  );
}

export function ProgressSection({
  config,
  reportData,
  projectConfig,
  baselines,
  placement,
}: ProgressSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;

  // Get bid items from baselines and weekly progress
  const masterItems = baselines?.bidItems || [];
  const weeklyProgress = reportData.progress?.bidItems || [];

  // Calculate table data and totals
  let totalContractValue = 0;
  let totalEarnedToDate = 0;

  const tableData = masterItems.map((item) => {
    const weeklyEntry = weeklyProgress.find((w) => w.itemId === item.id) || {
      thisWeekQty: 0,
      toDateQty: 0,
    };

    const toDateQty = weeklyEntry.toDateQty || 0;
    const thisWeekQty = weeklyEntry.thisWeekQty || 0;
    const prevQty = toDateQty - thisWeekQty;
    const remainingQty = item.contractQty - toDateQty;
    const percentComplete = item.contractQty > 0 ? (toDateQty / item.contractQty) * 100 : 0;

    const earnedValue = toDateQty * item.unitPrice;
    const itemTotalValue = item.contractQty * item.unitPrice;

    totalContractValue += itemTotalValue;
    totalEarnedToDate += earnedValue;

    return {
      ...item,
      prevQty,
      thisWeekQty,
      toDateQty,
      remainingQty,
      percentComplete,
      earnedValue,
      itemTotalValue,
    };
  });

  const overallPercent = totalContractValue > 0 ? (totalEarnedToDate / totalContractValue) * 100 : 0;

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? tableData.length;
  const visibleItems = tableData.slice(startIdx, endIdx);

  const sectionTitle = isContinued ? 'Progress Report (Continued)' : 'Progress Report';

  // Empty state
  if (tableData.length === 0) {
    return (
      <View style={progressStyles.container}>
        {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}
        <Text style={progressStyles.emptyText}>No bid items to display.</Text>
      </View>
    );
  }

  return (
    <View style={progressStyles.container}>
      {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}

      {/* Executive Summary Cards - Only on first page */}
      {!isContinued && (
        <SummaryCards
          contractValue={totalContractValue}
          earnedToDate={totalEarnedToDate}
          percentComplete={overallPercent}
        />
      )}

      {/* Detailed Progress Table */}
      <View style={progressStyles.table}>
        <TableHeader />

        {visibleItems.map((item, idx) => (
          <TableRow key={item.id || idx} item={item} isAlt={idx % 2 === 1} />
        ))}

        {/* Table Footer with totals */}
        <View style={progressStyles.tableFooter}>
          <Text style={[progressStyles.footerLabel, { width: '33%' }]}>Total Earned Value</Text>
          <View style={{ width: '33%' }} />
          <Text style={[progressStyles.footerValue, { width: '34%' }]}>
            {formatCurrency(totalEarnedToDate)}
          </Text>
        </View>
      </View>
    </View>
  );
}
