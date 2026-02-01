/**
 * Manpower Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ManpowerEntry } from '../../../../types';
import { ReportData } from '../../utils/dataMapper';

interface ManpowerSectionProps {
  config: PrintConfig;
  reportData: ReportData;
  placement?: PagePlacement;
}

const manpowerStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  subSection: {
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nameText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  roleText: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  companyText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  dayIndicatorRow: {
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
  dayIndicator: {
    width: 11,
    height: 11,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  dayIndicatorInactive: {
    backgroundColor: COLORS.backgroundAlt,
  },
  dayText: {
    fontSize: 5,
    fontWeight: 'bold',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dayTextInactive: {
    color: COLORS.textLight,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeOnsite: {
    backgroundColor: COLORS.tealLight,
    color: COLORS.teal,
  },
  badgeRemote: {
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
  },
  totalText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'Courier',
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
function getTotal(item: ManpowerEntry): number {
  const dh = item.dailyHours || {};
  return Object.values(dh).reduce((sum: number, h: any) => sum + (Number(h) || 0), 0);
}

// Helper to get active days
function getActiveDays(item: ManpowerEntry) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dh = item.dailyHours || {};
  return days.map((day, idx) => ({
    label: dayLabels[idx],
    hasHours: (Number(dh[day]) || 0) > 0,
  }));
}

// Day indicators component
function DayIndicators({ item }: { item: ManpowerEntry }) {
  const days = getActiveDays(item);
  return (
    <View style={manpowerStyles.dayIndicatorRow}>
      {days.map((d, idx) => (
        <View
          key={idx}
          style={[
            manpowerStyles.dayIndicator,
            d.hasHours ? manpowerStyles.dayIndicatorActive : manpowerStyles.dayIndicatorInactive,
          ]}
        >
          <Text
            style={[
              manpowerStyles.dayText,
              d.hasHours ? manpowerStyles.dayTextActive : manpowerStyles.dayTextInactive,
            ]}
          >
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Sub-table component for each category
function ManpowerTable({
  data,
  title,
  isSubcontractor = false,
}: {
  data: ManpowerEntry[];
  title: string;
  isSubcontractor?: boolean;
}) {
  if (data.length === 0) return null;

  const columns: TableColumn[] = isSubcontractor
    ? [
        {
          key: 'company',
          header: 'Company',
          width: 2,
          render: (value) => <Text style={manpowerStyles.companyText}>{value || '-'}</Text>,
        },
        {
          key: 'name',
          header: 'Name',
          width: 2,
          render: (value) => <Text style={manpowerStyles.nameText}>{value || '-'}</Text>,
        },
        {
          key: 'role',
          header: 'Role',
          width: 2,
          render: (value) => <Text style={manpowerStyles.roleText}>{value || '-'}</Text>,
        },
        {
          key: 'days',
          header: 'Days',
          width: 2,
          align: 'center',
          render: (_, row) => <DayIndicators item={row as ManpowerEntry} />,
        },
        {
          key: 'location',
          header: 'Status',
          width: 1,
          align: 'center',
          render: (value) => (
            <Text
              style={[
                manpowerStyles.badge,
                value === 'remote' ? manpowerStyles.badgeRemote : manpowerStyles.badgeOnsite,
              ]}
            >
              {value === 'remote' ? 'RMT' : 'ONS'}
            </Text>
          ),
        },
        {
          key: 'total',
          header: 'Total',
          width: 1,
          align: 'right',
          render: (_, row) => (
            <Text style={manpowerStyles.totalText}>{getTotal(row as ManpowerEntry)}</Text>
          ),
        },
      ]
    : [
        {
          key: 'name',
          header: 'Name',
          width: 3,
          render: (value) => <Text style={manpowerStyles.nameText}>{value || '-'}</Text>,
        },
        {
          key: 'role',
          header: 'Role',
          width: 2,
          render: (value) => <Text style={manpowerStyles.roleText}>{value || '-'}</Text>,
        },
        {
          key: 'days',
          header: 'Days Worked',
          width: 2,
          align: 'center',
          render: (_, row) => <DayIndicators item={row as ManpowerEntry} />,
        },
        {
          key: 'location',
          header: 'Status',
          width: 1,
          align: 'center',
          render: (value) => (
            <Text
              style={[
                manpowerStyles.badge,
                value === 'remote' ? manpowerStyles.badgeRemote : manpowerStyles.badgeOnsite,
              ]}
            >
              {value === 'remote' ? 'RMT' : 'ONS'}
            </Text>
          ),
        },
        {
          key: 'total',
          header: 'Total',
          width: 1,
          align: 'right',
          render: (_, row) => (
            <Text style={manpowerStyles.totalText}>{getTotal(row as ManpowerEntry)}</Text>
          ),
        },
      ];

  return (
    <View style={manpowerStyles.subSection}>
      <Text style={manpowerStyles.subTitle}>{title}</Text>
      <Table
        columns={columns}
        data={data}
        showHeader={true}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
      />
    </View>
  );
}

export function ManpowerSection({ config, reportData, placement }: ManpowerSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const allItems = reportData.resources?.manpower || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allItems.length;
  const items = allItems.slice(startIdx, endIdx);

  if (items.length === 0) {
    return (
      <View style={manpowerStyles.container}>
        <SectionHeader title="Manpower Log" isContinued={isContinued} />
        <Text style={manpowerStyles.emptyText}>No manpower recorded for this week.</Text>
      </View>
    );
  }

  // Categorize personnel
  const management = items.filter((m) => {
    const type = (m.type || '').toLowerCase();
    const category = (m.category || '').toLowerCase();
    return (type === 'mgmt' || category === 'management') && getTotal(m) > 0;
  });

  const fieldStaff = items.filter((m) => {
    const type = (m.type || '').toLowerCase();
    const category = (m.category || '').toLowerCase();
    const company = (m.company || '').toLowerCase();
    const isMgmt = type === 'mgmt' || category === 'management';
    const isSub = type === 'subcontractor' || category === 'subcontractor';
    const isExplicitField = type === 'field' || category === 'field';
    const isReconField = (type === 'recon' || company === 'recon') && !isMgmt && !isSub;
    return (isExplicitField || isReconField) && getTotal(m) > 0;
  });

  const subcontractors = items.filter((m) => {
    const type = (m.type || '').toLowerCase();
    const category = (m.category || '').toLowerCase();
    return (type === 'subcontractor' || category === 'subcontractor') && getTotal(m) > 0;
  });

  return (
    <View style={manpowerStyles.container}>
      <SectionHeader title="Manpower Log" isContinued={isContinued} />
      <ManpowerTable data={management} title="Management Personnel" />
      <ManpowerTable data={fieldStaff} title="Field Operations" />
      <ManpowerTable data={subcontractors} title="Subcontractors" isSubcontractor />
    </View>
  );
}
