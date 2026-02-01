/**
 * Progress Section for @react-pdf/renderer
 * Computes from baselines + weekly bid items for parity with HTML preview.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';
import { PagePlacement } from '../../config/printConfig.types';
import { ProjectConfig, ProjectBaselines, MasterBidItem, WeeklyBidEntry } from '../../../../types';
import { COLORS } from '../styles';
import { Table, TableColumn } from '../primitives';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#008B8B',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Summary cards
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#008B8B',
  },
  summaryCardBlue: {
    borderLeftColor: '#3B82F6',
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#71717A',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181B',
  },
  summarySubtext: {
    fontSize: 7,
    color: '#A1A1AA',
    marginTop: 2,
  },
  // Progress bar
  progressBarBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#F4F4F5',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 5,
    backgroundColor: '#008B8B',
    borderRadius: 3,
  },
  // Footer totals
  footerRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#52525B',
  },
  footerValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#18181B',
  },
  emptyText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    padding: 10,
  },
});

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

interface ProgressSectionProps {
  data: ReportData;
  config?: {
    showPercent?: boolean;
    showNotes?: boolean;
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
  placement?: PagePlacement;
  projectConfig?: ProjectConfig;
  baselines?: ProjectBaselines;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  data,
  config = {},
  documentSettings,
  placement,
  projectConfig,
  baselines,
}) => {
  const { showPercent = true } = config;
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;

  // Compute from baselines (matching HTML preview logic)
  const masterItems: MasterBidItem[] = baselines?.bidItems || [];
  const weeklyProgress: WeeklyBidEntry[] = data.originalReport?.progress?.bidItems || [];

  let totalContractValue = 0;
  let totalEarnedToDate = 0;

  const tableData = masterItems.map(item => {
    const weeklyEntry = weeklyProgress.find((w: any) => w.itemId === item.id) || {
      thisWeekQty: 0,
      toDateQty: 0,
      itemId: item.id,
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

  // If no baselines, fall back to simple bid items from dataMapper
  const hasMasterItems = masterItems.length > 0;
  const simpleBidItems = !hasMasterItems ? (data.bidItems || []) : [];

  // Pagination slicing
  const allItems = hasMasterItems ? tableData : simpleBidItems;
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allItems.length;
  const visibleItems = allItems.slice(startIdx, endIdx);

  if (allItems.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Progress Report</Text>
          </View>
        )}
        <Text style={styles.emptyText}>No progress recorded for this week.</Text>
      </View>
    );
  }

  // Columns for baseline-computed data
  const baselineColumns: TableColumn[] = [
    {
      key: 'itemNumber',
      header: 'Item',
      width: '8%',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', color: '#71717A' }}>{val}</Text>,
    },
    {
      key: 'description',
      header: 'Description',
      width: '22%',
      render: (val) => <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#27272A' }}>{val}</Text>,
    },
    {
      key: 'unit',
      header: 'Unit',
      width: '7%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, color: '#71717A', textTransform: 'uppercase' }}>{val}</Text>,
    },
    {
      key: 'contractQty',
      header: 'Qty',
      width: '9%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', color: '#52525B' }}>{formatNumber(val)}</Text>,
    },
    {
      key: 'prevQty',
      header: 'Prev',
      width: '9%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', color: '#A1A1AA' }}>{formatNumber(val)}</Text>,
    },
    {
      key: 'thisWeekQty',
      header: 'This Prd',
      width: '9%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', fontWeight: 'bold', color: '#008B8B' }}>{formatNumber(val)}</Text>,
    },
    {
      key: 'toDateQty',
      header: 'To Date',
      width: '9%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', fontWeight: 'bold', color: '#18181B' }}>{formatNumber(val)}</Text>,
    },
    {
      key: 'remainingQty',
      header: 'Remain',
      width: '9%',
      align: 'center',
      render: (val) => <Text style={{ fontSize: 7, fontFamily: 'Courier', color: '#71717A' }}>{formatNumber(val)}</Text>,
    },
  ];

  if (showPercent) {
    baselineColumns.push({
      key: 'percentComplete',
      header: '%',
      width: '8%',
      align: 'center',
      render: (val) => (
        <Text style={{
          fontSize: 7,
          fontWeight: 'bold',
          color: val >= 100 ? '#16A34A' : val === 0 ? '#D4D4D8' : '#008B8B',
        }}>
          {Math.round(val)}%
        </Text>
      ),
    });
  }

  // Simple columns for fallback (no baselines)
  const simpleColumns: TableColumn[] = [
    { key: 'itemNumber', header: 'Item #', width: '10%', render: (val) => <Text style={{ fontSize: 8, color: COLORS.text, fontWeight: 'bold' }}>{val}</Text> },
    { key: 'description', header: 'Description', width: '40%', render: (val) => <Text style={{ fontSize: 8, color: COLORS.text }}>{val}</Text> },
    { key: 'thisWeekQty', header: 'This Week', width: '15%', align: 'right', render: (val) => <Text style={{ fontSize: 8, color: COLORS.text }}>{val}</Text> },
    { key: 'toDateQty', header: 'To Date', width: '15%', align: 'right', render: (val) => <Text style={{ fontSize: 8, color: COLORS.text }}>{val}</Text> },
    { key: 'unit', header: 'Unit', width: '10%', align: 'center', render: (val) => <Text style={{ fontSize: 8, color: COLORS.textMuted }}>{val}</Text> },
  ];

  const isLastSlice = !placement?.dataRange?.end || (placement?.dataRange?.end ?? 0) >= allItems.length;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? 'Progress Report (Continued)' : 'Progress Report'}
          </Text>
        </View>
      )}

      {/* Summary Cards - only on first page when baselines available */}
      {!isContinued && hasMasterItems && (
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Contract Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalContractValue)}</Text>
            <Text style={styles.summarySubtext}>Original Contract Sum</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Earned to Date</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalEarnedToDate)}</Text>
            <Text style={styles.summarySubtext}>Completed Work Value</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryLabel}>Project Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 2 }}>
              <Text style={[styles.summaryValue, { color: '#008B8B' }]}>{overallPercent.toFixed(1)}%</Text>
              <Text style={{ fontSize: 7, color: '#A1A1AA', marginBottom: 2 }}>Complete</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(overallPercent, 100)}%` }]} />
            </View>
          </View>
        </View>
      )}

      {/* Progress Table */}
      <Table
        columns={hasMasterItems ? baselineColumns : simpleColumns}
        data={visibleItems}
        keyExtractor={(item) => item.id || item.itemNumber}
        alternateRowColor={true}
      />

      {/* Footer Totals - only on last slice when baselines available */}
      {hasMasterItems && isLastSlice && (
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { flex: 2 }]}>Total Earned Value</Text>
          <View style={{ flex: 5 }} />
          <Text style={[styles.footerValue, { textAlign: 'right' }]}>{formatCurrency(totalEarnedToDate)}</Text>
        </View>
      )}
    </View>
  );
};
