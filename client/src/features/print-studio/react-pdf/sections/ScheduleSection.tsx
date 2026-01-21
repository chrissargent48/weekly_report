/**
 * Schedule Section for @react-pdf/renderer
 *
 * Schedule milestones and analysis
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ScheduleMilestone } from '../../../../types';

interface ScheduleSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const scheduleStyles = StyleSheet.create({
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
  statusComplete: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  statusInProgress: {
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
  },
  statusNotStarted: {
    backgroundColor: COLORS.backgroundAlt,
    color: COLORS.textMuted,
  },
  analysisCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  analysisHeader: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  analysisHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  analysisBody: {
    padding: 10,
  },
  analysisText: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.4,
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
    case 'complete':
      style = scheduleStyles.statusComplete;
      break;
    case 'in progress':
      style = scheduleStyles.statusInProgress;
      break;
    default:
      style = scheduleStyles.statusNotStarted;
  }
  return <Text style={[scheduleStyles.statusBadge, style]}>{status || 'Not Started'}</Text>;
}

export function ScheduleSection({ config, reportData, placement }: ScheduleSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const milestones = reportData.schedule?.milestones || [];
  const analysis = reportData.schedule?.analysis || '';

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? milestones.length;
  const visibleMilestones = milestones.slice(startIdx, endIdx);

  const columns: TableColumn[] = [
    {
      key: 'milestone',
      header: 'Milestone',
      width: '40%',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'startDate',
      header: 'Start',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'finishDate',
      header: 'Finish',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '20%',
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <View style={scheduleStyles.container}>
      <SectionHeader title="Schedule Status" isContinued={isContinued} />

      {visibleMilestones.length > 0 ? (
        <Table
          columns={columns}
          data={visibleMilestones}
          keyExtractor={(item) => item.id}
          alternateRowColor={true}
        />
      ) : (
        <Text style={scheduleStyles.emptyText}>No milestones defined.</Text>
      )}

      {/* Schedule Analysis */}
      {analysis && (
        <View style={scheduleStyles.analysisCard} wrap={false}>
          <View style={scheduleStyles.analysisHeader}>
            <Text style={scheduleStyles.analysisHeaderText}>Schedule Analysis</Text>
          </View>
          <View style={scheduleStyles.analysisBody}>
            <Text style={scheduleStyles.analysisText}>{analysis}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
