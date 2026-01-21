/**
 * Safety Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, SafetyObservation } from '../../../../types';

interface SafetySectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const safetyStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // Weekly Topic Card
  topicCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.greenLight,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  topicHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.green,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  topicBody: {
    padding: 10,
  },
  topicTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  topicNotes: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  // Stats Table
  statsContainer: {
    marginBottom: 10,
  },
  // Observations
  observationsContainer: {
    marginBottom: 10,
  },
  obsSubtitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  obsTypeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 8,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  obsTypePositive: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
  },
  obsTypeCorrective: {
    backgroundColor: COLORS.amberLight,
    color: COLORS.amber,
  },
  obsTypeNearMiss: {
    backgroundColor: COLORS.redLight,
    color: COLORS.red,
  },
  // Narrative Card
  narrativeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  narrativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.blueLight,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  narrativeHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  narrativeBody: {
    padding: 10,
  },
  narrativeText: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
});

export function SafetySection({ config, reportData, placement }: SafetySectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const showFooter = placement?.renderConfig?.showFooter ?? true;

  const safety = reportData.safety;
  if (!safety) return null;

  const stats = safety.stats || {
    nearMisses: { week: 0, ytd: 0 },
    firstAids: { week: 0, ytd: 0 },
    recordables: { week: 0, ytd: 0 },
    lostTime: { week: 0, ytd: 0 },
    stopWorks: { week: 0, ytd: 0 },
    hofs: { week: 0, ytd: 0 },
    safetyAudits: { week: 0, ytd: 0 },
  };

  // Handle observations slicing
  const allObservations = safety.observations || [];
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allObservations.length;
  const visibleObservations = allObservations.slice(startIdx, endIdx);

  // Stats table data
  const statRows = [
    { label: 'Near Misses', week: stats.nearMisses?.week || 0, ytd: stats.nearMisses?.ytd || 0 },
    { label: 'First Aids', week: stats.firstAids?.week || 0, ytd: stats.firstAids?.ytd || 0 },
    { label: 'Recordable Incidents', week: stats.recordables?.week || 0, ytd: stats.recordables?.ytd || 0 },
    { label: 'Lost Time / Restricted', week: stats.lostTime?.week || 0, ytd: stats.lostTime?.ytd || 0 },
    { label: 'Stop Works', week: stats.stopWorks?.week || 0, ytd: stats.stopWorks?.ytd || 0 },
    { label: "HOF's", week: stats.hofs?.week || 0, ytd: stats.hofs?.ytd || 0 },
    { label: 'Safety Audits', week: stats.safetyAudits?.week || 0, ytd: stats.safetyAudits?.ytd || 0 },
  ];

  const statsColumns: TableColumn[] = [
    { key: 'label', header: 'Key Performance Indicator', width: 4 },
    {
      key: 'week',
      header: 'Current Week',
      width: 2,
      align: 'center',
      render: (value) => (
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: COLORS.text }}>{value}</Text>
      ),
    },
    {
      key: 'ytd',
      header: 'Year to Date',
      width: 2,
      align: 'center',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.textMuted }}>{value}</Text>
      ),
    },
  ];

  // Observations columns
  const obsColumns: TableColumn[] = [
    {
      key: 'date',
      header: 'Date',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 7, fontFamily: 'Courier', color: COLORS.textMuted }}>{value}</Text>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '15%',
      render: (value: string) => {
        const style = value === 'Positive'
          ? safetyStyles.obsTypePositive
          : value === 'Corrective'
          ? safetyStyles.obsTypeCorrective
          : safetyStyles.obsTypeNearMiss;
        return <Text style={[safetyStyles.obsTypeBadge, style]}>{value}</Text>;
      },
    },
    {
      key: 'description',
      header: 'Description',
      width: '35%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.text }}>{value || '-'}</Text>
      ),
    },
    {
      key: 'actionTaken',
      header: 'Action Taken',
      width: '35%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted, fontStyle: 'italic' }}>{value || '-'}</Text>
      ),
    },
  ];

  return (
    <View style={safetyStyles.container}>
      <SectionHeader title="Safety Management" isContinued={isContinued} />

      {/* Weekly Safety Topic */}
      {showHeader && (
        <View style={safetyStyles.topicCard} wrap={false}>
          <View style={safetyStyles.topicHeader}>
            <Text style={safetyStyles.topicHeaderText}>Weekly Safety Topic</Text>
          </View>
          <View style={safetyStyles.topicBody}>
            <Text style={safetyStyles.topicTitle}>
              {safety.weeklyTopic || 'No Topic Selected'}
            </Text>
            <Text style={safetyStyles.topicNotes}>
              {safety.weeklyTopicNotes || 'No notes available.'}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Table */}
      {showHeader && (
        <View style={safetyStyles.statsContainer}>
          <Table
            columns={statsColumns}
            data={statRows}
            keyExtractor={(item) => item.label}
            alternateRowColor={true}
          />
        </View>
      )}

      {/* Observations */}
      {visibleObservations.length > 0 && (
        <View style={safetyStyles.observationsContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: COLORS.textMuted, textTransform: 'uppercase' }}>
              Safety Observations
            </Text>
            {visibleObservations.length !== allObservations.length && (
              <Text style={safetyStyles.obsSubtitle}>
                ({startIdx + 1}-{endIdx} of {allObservations.length})
              </Text>
            )}
          </View>
          <Table
            columns={obsColumns}
            data={visibleObservations}
            keyExtractor={(item) => item.id}
            headerBgColor={COLORS.backgroundAlt}
            headerTextColor={COLORS.textMuted}
            alternateRowColor={false}
          />
        </View>
      )}

      {/* Narrative */}
      {showFooter && safety.narrative && (
        <View style={safetyStyles.narrativeCard} wrap={false}>
          <View style={safetyStyles.narrativeHeader}>
            <Text style={safetyStyles.narrativeHeaderText}>Safety Narrative</Text>
          </View>
          <View style={safetyStyles.narrativeBody}>
            <Text style={safetyStyles.narrativeText}>{safety.narrative}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
