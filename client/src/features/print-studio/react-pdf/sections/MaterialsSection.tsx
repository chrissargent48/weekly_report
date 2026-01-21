/**
 * Materials Deliveries Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, MaterialDelivery } from '../../../../types';

interface MaterialsSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const materialsStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export function MaterialsSection({ config, reportData, placement }: MaterialsSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const materials = reportData.resources?.materials || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? materials.length;
  const visibleMaterials = materials.slice(startIdx, endIdx);

  if (visibleMaterials.length === 0) {
    return (
      <View style={materialsStyles.container}>
        <SectionHeader title="Material Deliveries" isContinued={isContinued} />
        <Text style={materialsStyles.emptyText}>No material deliveries recorded for this week.</Text>
      </View>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'date',
      header: 'Date',
      width: '12%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value}</Text>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      width: '30%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      width: '14%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      width: '10%',
      align: 'right',
      render: (value) => (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.text }}>
          {value?.toLocaleString() ?? '-'}
        </Text>
      ),
    },
    {
      key: 'uom',
      header: 'Unit',
      width: '10%',
      align: 'center',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, textTransform: 'uppercase' }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '24%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, fontStyle: 'italic' }}>{value || '-'}</Text>
      ),
    },
  ];

  return (
    <View style={materialsStyles.container}>
      <SectionHeader title="Material Deliveries" isContinued={isContinued} />
      <Table
        columns={columns}
        data={visibleMaterials}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
      />
    </View>
  );
}
