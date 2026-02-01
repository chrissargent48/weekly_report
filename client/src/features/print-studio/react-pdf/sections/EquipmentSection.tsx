/**
 * Equipment Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, EquipmentEntry } from '../../../../types';
import { ReportData } from '../../utils/dataMapper';

interface EquipmentSectionProps {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

const equipmentStyles = StyleSheet.create({
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
  statusActive: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  statusStandby: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  statusDown: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },
  statusDemob: {
    backgroundColor: COLORS.backgroundAlt,
    color: COLORS.textMuted,
  },
  hoursCell: {
    fontSize: 8,
    color: COLORS.text,
    textAlign: 'center',
  },
  hoursZero: {
    color: COLORS.textLight,
  },
  totalHours: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Helper to calculate total hours
function getTotal(item: EquipmentEntry): number {
  const dh = item.dailyHours || {};
  return Object.values(dh).reduce((sum: number, h: any) => sum + (Number(h) || 0), 0);
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let style;
  switch (status?.toLowerCase()) {
    case 'active':
      style = equipmentStyles.statusActive;
      break;
    case 'standby':
      style = equipmentStyles.statusStandby;
      break;
    case 'down':
      style = equipmentStyles.statusDown;
      break;
    default:
      style = equipmentStyles.statusDemob;
  }
  return <Text style={[equipmentStyles.statusBadge, style]}>{status || '-'}</Text>;
}

export function EquipmentSection({ config, reportData, placement }: EquipmentSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const equipment = reportData.resources?.equipment?.onSite || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? equipment.length;
  const visibleEquipment = equipment.slice(startIdx, endIdx);

  if (visibleEquipment.length === 0) {
    return (
      <View style={equipmentStyles.container}>
        <SectionHeader title="Equipment Usage" isContinued={isContinued} />
        <Text style={equipmentStyles.emptyText}>No equipment recorded for this week.</Text>
      </View>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'type',
      header: 'Equipment Type',
      width: 3,
      render: (value) => (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 1.5,
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'mon',
      header: 'M',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.mon || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'tue',
      header: 'T',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.tue || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'wed',
      header: 'W',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.wed || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'thu',
      header: 'T',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.thu || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'fri',
      header: 'F',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.fri || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'sat',
      header: 'S',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.sat || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'sun',
      header: 'S',
      width: 0.7,
      align: 'center',
      render: (_, row: EquipmentEntry) => {
        const hours = row.dailyHours?.sun || 0;
        return (
          <Text style={[equipmentStyles.hoursCell, hours === 0 ? equipmentStyles.hoursZero : {}]}>
            {hours || '-'}
          </Text>
        );
      },
    },
    {
      key: 'total',
      header: 'Tot',
      width: 0.8,
      align: 'center',
      render: (_, row) => (
        <Text style={equipmentStyles.totalHours}>{getTotal(row as EquipmentEntry)}</Text>
      ),
    },
  ];

  return (
    <View style={equipmentStyles.container}>
      <SectionHeader title="Equipment Usage" isContinued={isContinued} />
      <Table
        columns={columns}
        data={visibleEquipment}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
        manualBreaks={config.manualBreaks
          ?.filter(b => b.sectionId === 'equipment')
          .map(b => b.afterRowIndex)}
      />
    </View>
  );
}
