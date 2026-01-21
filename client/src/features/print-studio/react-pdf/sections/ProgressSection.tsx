/**
 * Progress Section for @react-pdf/renderer
 *
 * Shows activities this week and progress narrative
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';

interface ProgressSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const progressStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  activitiesCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  activityText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export function ProgressSection({ config, reportData, placement }: ProgressSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const activities = reportData.progress?.activitiesThisWeek || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? activities.length;
  const visibleActivities = activities.slice(startIdx, endIdx);

  return (
    <View style={progressStyles.container}>
      <SectionHeader title="Progress This Week" isContinued={isContinued} />

      {visibleActivities.length > 0 ? (
        <View style={progressStyles.activitiesCard}>
          {visibleActivities.map((activity, i) => (
            <View key={i} style={progressStyles.activityItem} wrap={false}>
              <Text style={progressStyles.bullet}>•</Text>
              <Text style={progressStyles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={progressStyles.activitiesCard}>
          <Text style={progressStyles.emptyText}>No activities recorded for this week.</Text>
        </View>
      )}
    </View>
  );
}
