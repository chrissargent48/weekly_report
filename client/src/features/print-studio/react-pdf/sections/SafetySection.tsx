import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';
import { PagePlacement } from '../../config/printConfig.types';
import { COLORS } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#008B8B',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Weekly Topic Card
  topicCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topicHeader: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#166534',
    letterSpacing: 0.5,
  },
  topicBody: {
    padding: 12,
  },
  topicTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  topicNotes: {
    fontSize: 8,
    color: '#525252',
    lineHeight: 1.5,
  },
  // KPI Stats Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#008B8B',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  tableCellMuted: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Observations
  observationsHeader: {
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  observationsHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  obsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  obsTableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#71717A',
  },
  obsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  obsDate: {
    fontSize: 7,
    fontFamily: 'Courier',
    color: '#71717A',
  },
  obsBadge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  obsBadgePositive: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  obsBadgeCorrective: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  obsBadgeUnsafe: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  obsDescription: {
    fontSize: 8,
    color: '#27272A',
  },
  obsAction: {
    fontSize: 8,
    color: '#525252',
    fontStyle: 'italic',
  },
  // Narrative Card
  narrativeCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  narrativeHeader: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  narrativeHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  narrativeBody: {
    padding: 12,
  },
  narrativeText: {
    fontSize: 8,
    color: '#525252',
    lineHeight: 1.5,
  },
});

interface SafetySectionProps {
  data: ReportData;
  config?: {
    showTable?: boolean;
    showCards?: boolean;
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
  placement?: PagePlacement;
}

function getObsBadgeStyle(type: string) {
  switch (type) {
    case 'Positive': return styles.obsBadgePositive;
    case 'Corrective': return styles.obsBadgeCorrective;
    default: return styles.obsBadgeUnsafe;
  }
}

export const SafetySection: React.FC<SafetySectionProps> = ({ data, config = {}, documentSettings, placement }) => {
  const {
    showTable = true,
    showCards = true,
  } = config;

  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const showFooterSection = placement?.renderConfig?.showFooter ?? true;

  // Full safety data for parity with HTML preview
  const safety = data.safety;

  // All 7 KPI stat rows matching the HTML preview
  const statRows: { key: string; label: string }[] = [
    { key: 'nearMisses', label: 'Near Misses' },
    { key: 'firstAids', label: 'First Aids' },
    { key: 'recordables', label: 'Recordable Incidents' },
    { key: 'lostTime', label: 'Lost Time / Restricted Duty' },
    { key: 'stopWorks', label: 'Stop Works' },
    { key: 'hofs', label: "HOF's" },
    { key: 'safetyAudits', label: 'Safety Audits' },
  ];

  const safetyStats = data.safetyStats || {};

  // Observations with data slicing for pagination
  const allObservations = safety?.observations || [];
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allObservations.length;
  const visibleObservations = allObservations.slice(startIdx, endIdx);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? 'Safety Management (Continued)' : 'Safety Management'}
          </Text>
        </View>
      )}

      {/* 1. Weekly Safety Topic */}
      {showHeader && !isContinued && (
        <View style={styles.topicCard}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicHeaderText}>Weekly Safety Topic</Text>
          </View>
          <View style={styles.topicBody}>
            <Text style={styles.topicTitle}>
              {safety?.weeklyTopic || 'No Topic Selected'}
            </Text>
            {safety?.weeklyTopicNotes ? (
              <Text style={styles.topicNotes}>{safety.weeklyTopicNotes}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* 2. KPI Stats Table - All 7 metrics */}
      {showCards && showHeader && (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>
              Key Performance Indicator
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>
              Current Week
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>
              Year to Date
            </Text>
          </View>
          {statRows.map((row, i) => {
            const stat = (safetyStats as any)[row.key] || { week: 0, ytd: 0 };
            return (
              <View key={row.key} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: 'medium' }]}>{row.label}</Text>
                <Text style={[styles.tableCellBold, { flex: 1, color: stat.week > 0 ? '#DC2626' : '#111827' }]}>
                  {stat.week}
                </Text>
                <Text style={[styles.tableCellMuted, { flex: 1 }]}>{stat.ytd}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 3. Observations Log */}
      {showTable && visibleObservations.length > 0 && (
        <View style={[styles.table, { marginBottom: 0 }]}>
          <View style={styles.observationsHeader}>
            <Text style={styles.observationsHeaderText}>
              Safety Observations
              {visibleObservations.length !== allObservations.length
                ? ` (${startIdx + 1}-${endIdx} of ${allObservations.length})`
                : ''}
            </Text>
          </View>
          {/* Observations table header */}
          <View style={styles.obsTableHeader}>
            <Text style={[styles.obsTableHeaderCell, { width: '15%' }]}>Date</Text>
            <Text style={[styles.obsTableHeaderCell, { width: '15%' }]}>Type</Text>
            <Text style={[styles.obsTableHeaderCell, { width: '35%' }]}>Description</Text>
            <Text style={[styles.obsTableHeaderCell, { width: '35%' }]}>Action Taken</Text>
          </View>
          {/* Observation rows */}
          {visibleObservations.map((obs: any, i: number) => (
            <View key={obs.id || i} style={[styles.obsRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.obsDate, { width: '15%' }]}>{obs.date}</Text>
              <View style={{ width: '15%' }}>
                <Text style={[styles.obsBadge, getObsBadgeStyle(obs.type)]}>{obs.type}</Text>
              </View>
              <Text style={[styles.obsDescription, { width: '35%' }]}>{obs.description}</Text>
              <Text style={[styles.obsAction, { width: '35%' }]}>{obs.actionTaken}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. Safety Narrative */}
      {showFooterSection && safety?.narrative && (
        <View style={styles.narrativeCard}>
          <View style={styles.narrativeHeader}>
            <Text style={styles.narrativeHeaderText}>Safety Narrative</Text>
          </View>
          <View style={styles.narrativeBody}>
            <Text style={styles.narrativeText}>{safety.narrative}</Text>
          </View>
        </View>
      )}
    </View>
  );
};
