/**
 * Look Ahead Section for @react-pdf/renderer
 *
 * 3-week look ahead schedule items
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, LookAheadEntry } from '../../../../types';

interface LookAheadSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const lookAheadStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  typeSchedule: {
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
  },
  typeCustom: {
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

export function LookAheadSection({ config, reportData, placement }: LookAheadSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const lookAheadItems = reportData.progress?.lookAheadItems?.filter(item => item.included) || [];

  // Fallback to legacy string array if no structured items
  const legacyItems = reportData.progress?.lookAheadThreeWeek || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? lookAheadItems.length;
  const visibleItems = lookAheadItems.slice(startIdx, endIdx);

  // If using legacy format
  if (lookAheadItems.length === 0 && legacyItems.length > 0) {
    const legacySlice = legacyItems.slice(startIdx, endIdx);
    return (
      <View style={lookAheadStyles.container}>
        <SectionHeader title="3-Week Look Ahead" isContinued={isContinued} />
        <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 10 }}>
          {legacySlice.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 3 }}>
              <Text style={{ fontSize: 8, color: COLORS.primary, fontWeight: 'bold' }}>•</Text>
              <Text style={{ flex: 1, fontSize: 9, color: COLORS.text }}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <View style={lookAheadStyles.container}>
        <SectionHeader title="3-Week Look Ahead" isContinued={isContinued} />
        <Text style={lookAheadStyles.emptyText}>No look ahead items scheduled.</Text>
      </View>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'wbs',
      header: 'WBS',
      width: '10%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'description',
      header: 'Activity',
      width: '35%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '12%',
      align: 'center',
      render: (value) => (
        <Text
          style={[
            lookAheadStyles.typeBadge,
            value === 'schedule' ? lookAheadStyles.typeSchedule : lookAheadStyles.typeCustom,
          ]}
        >
          {value || 'Custom'}
        </Text>
      ),
    },
    {
      key: 'forecastStart',
      header: 'Start',
      width: '14%',
      render: (value, row: LookAheadEntry) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>
          {value || row.baselineStart || '-'}
        </Text>
      ),
    },
    {
      key: 'forecastFinish',
      header: 'Finish',
      width: '14%',
      render: (value, row: LookAheadEntry) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>
          {value || row.baselineFinish || '-'}
        </Text>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, fontStyle: 'italic' }}>{value || '-'}</Text>
      ),
    },
  ];

  return (
    <View style={lookAheadStyles.container}>
      <SectionHeader title="3-Week Look Ahead" isContinued={isContinued} />
      <Table
        columns={columns}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
      />
    </View>
  );
}
