/**
 * Procurement Section for @react-pdf/renderer
 *
 * Long lead items and procurement tracking
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ProcurementEntry } from '../../../../types';
import { ReportData } from '../../utils/dataMapper';

interface ProcurementSectionProps {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

const procurementStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusDelivered: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  statusShipped: {
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
  },
  statusOrdered: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  statusDelayed: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },
  statusPending: {
    backgroundColor: COLORS.backgroundAlt,
    color: COLORS.textMuted,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let style;
  switch (status?.toLowerCase()) {
    case 'delivered':
      style = procurementStyles.statusDelivered;
      break;
    case 'shipped':
      style = procurementStyles.statusShipped;
      break;
    case 'ordered':
      style = procurementStyles.statusOrdered;
      break;
    case 'delayed':
      style = procurementStyles.statusDelayed;
      break;
    default:
      style = procurementStyles.statusPending;
  }
  return <Text style={[procurementStyles.statusBadge, style]}>{status || 'Pending'}</Text>;
}

export function ProcurementSection({ config, reportData, placement }: ProcurementSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const procurement = reportData.resources?.procurement || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? procurement.length;
  const visibleItems = procurement.slice(startIdx, endIdx);

  if (visibleItems.length === 0) {
    return (
      <View style={procurementStyles.container}>
        <SectionHeader title="Procurement Log" isContinued={isContinued} />
        <Text style={procurementStyles.emptyText}>No procurement items tracked.</Text>
      </View>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'item',
      header: 'Item',
      width: '28%',
      render: (value) => (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      width: '18%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'eta',
      header: 'ETA',
      width: '12%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'deliveryDate',
      header: 'Delivered',
      width: '12%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: value ? COLORS.green : COLORS.textLight }}>
          {value || '-'}
        </Text>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '16%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, fontStyle: 'italic' }}>{value || '-'}</Text>
      ),
    },
  ];

  return (
    <View style={procurementStyles.container}>
      <SectionHeader title="Procurement Log" isContinued={isContinued} />
      <Table
        columns={columns}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
      />
    </View>
  );
}
