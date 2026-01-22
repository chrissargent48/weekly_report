/**
 * Issues Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, IssueEntry } from '../../../../types';

interface IssuesSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const issuesStyles = StyleSheet.create({
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
  statusOpen: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },
  statusBlocked: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  statusClosed: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  priorityHigh: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },
  priorityMedium: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  priorityLow: {
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

// Status badge
function StatusBadge({ status }: { status: string }) {
  let style;
  switch (status?.toLowerCase()) {
    case 'open':
      style = issuesStyles.statusOpen;
      break;
    case 'blocked':
      style = issuesStyles.statusBlocked;
      break;
    case 'closed':
      style = issuesStyles.statusClosed;
      break;
    default:
      style = issuesStyles.statusOpen;
  }
  return <Text style={[issuesStyles.statusBadge, style]}>{status || 'Open'}</Text>;
}

// Priority badge
function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  let style;
  switch (priority?.toLowerCase()) {
    case 'high':
      style = issuesStyles.priorityHigh;
      break;
    case 'medium':
      style = issuesStyles.priorityMedium;
      break;
    default:
      style = issuesStyles.priorityLow;
  }
  return <Text style={[issuesStyles.priorityBadge, style]}>{priority}</Text>;
}

export function IssuesSection({ config, reportData, placement }: IssuesSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const issues = reportData.issues || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? issues.length;
  const visibleIssues = issues.slice(startIdx, endIdx);

  if (visibleIssues.length === 0) {
    return (
      <View style={issuesStyles.container}>
        <SectionHeader title="Issues Log" isContinued={isContinued} />
        <Text style={issuesStyles.emptyText}>No open issues.</Text>
      </View>
    );
  }

  const columns: TableColumn[] = [
    {
      key: 'description',
      header: 'Issue',
      width: '35%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '12%',
      align: 'center',
      render: (value) => <PriorityBadge priority={value} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due',
      width: '12%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'impact',
      header: 'Impact',
      width: '14%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, fontStyle: 'italic' }}>{value || '-'}</Text>
      ),
    },
  ];

  return (
    <View style={issuesStyles.container}>
      <SectionHeader title="Issues Log" isContinued={isContinued} />
      <Table
        columns={columns}
        data={visibleIssues}
        keyExtractor={(item) => item.id}
        alternateRowColor={true}
        manualBreaks={config.manualBreaks
          ?.filter(b => b.sectionId === 'issues')
          .map(b => b.afterRowIndex)}
      />
    </View>
  );
}
