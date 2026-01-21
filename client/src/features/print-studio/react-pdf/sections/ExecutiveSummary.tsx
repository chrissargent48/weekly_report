/**
 * Executive Summary Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, styles as globalStyles } from '../styles';
import { SectionHeader } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';

interface ExecutiveSummaryProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const summaryStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.backgroundAlt,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 3,
    textAlign: 'center',
  },
  narrative: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.5,
  },
});

export function ExecutiveSummary({ config, reportData, placement }: ExecutiveSummaryProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const kpis = reportData.overview?.kpis;
  const narrative = reportData.overview?.executiveSummary || '';

  // Stats to display
  const stats = [
    {
      value: kpis?.percentComplete ?? 0,
      label: '% Complete',
      format: (v: number) => `${v}%`,
    },
    {
      value: kpis?.manHoursWeek ?? 0,
      label: 'Man Hours (Wk)',
      format: (v: number) => v.toLocaleString(),
    },
    {
      value: kpis?.weatherDaysLost ?? 0,
      label: 'Weather Lost',
      format: (v: number) => v.toString(),
    },
    {
      value: kpis?.safetyIncidents ?? 0,
      label: 'Safety Incidents',
      format: (v: number) => v.toString(),
    },
  ];

  return (
    <View style={summaryStyles.container} wrap={false}>
      <SectionHeader title="Executive Summary" isContinued={isContinued} />

      {/* Stats Row */}
      <View style={summaryStyles.statsRow}>
        {stats.map((stat, i) => (
          <View key={i} style={summaryStyles.statBox}>
            <Text style={summaryStyles.statValue}>
              {stat.format(stat.value)}
            </Text>
            <Text style={summaryStyles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Narrative */}
      {narrative && (
        <Text style={summaryStyles.narrative}>{narrative}</Text>
      )}
    </View>
  );
}
