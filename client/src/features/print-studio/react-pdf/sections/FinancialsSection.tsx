/**
 * Financials Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ProjectConfig, ProjectBaselines, Invoice } from '../../../../types';
import { ReportData } from '../../utils/dataMapper';

interface FinancialsSectionProps {
  config: PrintConfig;
  reportData: ReportData;
  projectConfig: ProjectConfig;
  baselines?: ProjectBaselines;
  placement?: PagePlacement;
}

const financialsStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  invoicesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  paidBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  unpaidBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Format currency
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialsSection({
  config,
  reportData,
  projectConfig,
  baselines,
  placement,
}: FinancialsSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const financials = reportData.financials;

  // Summary values
  const contractValue = projectConfig.contract?.originalValue || 0;
  const earnedToDate = financials?.summary?.earnedToDate || 0;
  const remaining = financials?.summary?.remainingContractValue || (contractValue - earnedToDate);
  const totalBilled = financials?.summary?.totalBilled || 0;

  // Invoice data
  const invoices = financials?.invoices || [];
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? invoices.length;
  const visibleInvoices = invoices.slice(startIdx, endIdx);

  const columns: TableColumn[] = [
    {
      key: 'period',
      header: 'Period',
      width: '20%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '20%',
      align: 'right',
      render: (value) => (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.text }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      key: 'retainage',
      header: 'Retainage',
      width: '15%',
      align: 'right',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.textMuted }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      key: 'datePaid',
      header: 'Status',
      width: '15%',
      align: 'center',
      render: (value) => (
        <Text style={value ? financialsStyles.paidBadge : financialsStyles.unpaidBadge}>
          {value ? 'Paid' : 'Pending'}
        </Text>
      ),
    },
    {
      key: 'datePaid',
      header: 'Date Paid',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>
          {value || '-'}
        </Text>
      ),
    },
  ];

  return (
    <View style={financialsStyles.container}>
      <SectionHeader title="Financial Summary" isContinued={isContinued} />

      {/* Summary Cards */}
      {showHeader && (
        <View style={financialsStyles.summaryGrid}>
          <View style={financialsStyles.summaryCard}>
            <Text style={financialsStyles.summaryValue}>{formatCurrency(contractValue)}</Text>
            <Text style={financialsStyles.summaryLabel}>Contract Value</Text>
          </View>
          <View style={financialsStyles.summaryCard}>
            <Text style={financialsStyles.summaryValue}>{formatCurrency(earnedToDate)}</Text>
            <Text style={financialsStyles.summaryLabel}>Earned to Date</Text>
          </View>
          <View style={financialsStyles.summaryCard}>
            <Text style={financialsStyles.summaryValue}>{formatCurrency(remaining)}</Text>
            <Text style={financialsStyles.summaryLabel}>Remaining</Text>
          </View>
          <View style={financialsStyles.summaryCard}>
            <Text style={financialsStyles.summaryValue}>{formatCurrency(totalBilled)}</Text>
            <Text style={financialsStyles.summaryLabel}>Total Billed</Text>
          </View>
        </View>
      )}

      {/* Invoices Table */}
      {visibleInvoices.length > 0 ? (
        <View>
          <Text style={financialsStyles.invoicesTitle}>Invoice History</Text>
          <Table
            columns={columns}
            data={visibleInvoices}
            keyExtractor={(item) => item.id}
            alternateRowColor={true}
            manualBreaks={config.manualBreaks
              ?.filter(b => b.sectionId === 'financials')
              .map(b => b.afterRowIndex)}
          />
        </View>
      ) : (
        <Text style={financialsStyles.emptyText}>No invoices recorded.</Text>
      )}
    </View>
  );
}
