import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15,
    paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#008B8B',
  },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, padding: 10, borderRadius: 4, borderWidth: 1,
    borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, color: '#111827' },
  statLabel: { fontSize: 7, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  statYtd: { fontSize: 6, color: '#9CA3AF', marginTop: 2 },
  table: { width: '100%', marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#F9FAFB',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: 8,
  },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', color: '#374151', flex: 1, textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: 8 },
  tableCell: { fontSize: 9, color: '#374151', flex: 1, textAlign: 'center' },
  footerInfo: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { fontSize: 8, color: '#6B7280', textAlign: 'center' },
  topicBox: { marginBottom: 15, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  topicTitle: { fontSize: 10, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  topicText: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  observationsTable: { width: '100%', marginTop: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  obsHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  obsHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#374151' },
  obsRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  obsCell: { fontSize: 8, color: '#374151' },
});

interface SafetySectionProps {
  reportData: WeeklyReport;
  sectionConfig?: any;
  documentSettings?: any;
  placement?: PagePlacement;
}

export const SafetySection: React.FC<SafetySectionProps> = ({ reportData, sectionConfig = {}, documentSettings, placement }) => {
  const { showTable = true, showCards = true } = sectionConfig;

  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const showFooterSection = placement?.renderConfig?.showFooter ?? true;

  const safety = reportData.safety;
  if (!safety) return null;

  const rawStats = safety.stats || {};
  const stats = [
    { label: 'Lost Time', val: { week: rawStats.lostTime?.week || 0, ytd: rawStats.lostTime?.ytd || 0 } },
    { label: 'Recordable', val: { week: rawStats.recordables?.week || 0, ytd: rawStats.recordables?.ytd || 0 } },
    { label: 'First Aid', val: { week: rawStats.firstAids?.week || 0, ytd: rawStats.firstAids?.ytd || 0 } },
    { label: 'Near Miss', val: { week: rawStats.nearMisses?.week || 0, ytd: rawStats.nearMisses?.ytd || 0 } },
    { label: 'Stop Work', val: { week: rawStats.stopWorks?.week || 0, ytd: rawStats.stopWorks?.ytd || 0 } },
  ];

  // Observations slicing
  const allObservations = safety.observations || [];
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allObservations.length;
  const visibleObservations = allObservations.slice(startIdx, endIdx);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? 'Safety Statistics & Performance (Continued)' : 'Safety Statistics & Performance'}
          </Text>
        </View>
      )}

      {/* Weekly Topic */}
      {showHeader && !isContinued && safety.weeklyTopic && (
        <View style={styles.topicBox}>
          <Text style={styles.topicTitle}>{safety.weeklyTopic}</Text>
          <Text style={styles.topicText}>{safety.weeklyTopicNotes || ''}</Text>
        </View>
      )}

      {/* KPI Cards */}
      {showCards && showHeader && !isContinued && (
        <View style={styles.statGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.val.week > 0 ? '#DC2626' : '#111827' }]}>{stat.val.week}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statYtd}>YTD: {stat.val.ytd}</Text>
            </View>
          ))}
        </View>
      )}

      {/* KPI Table */}
      {showCards && (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Indicator</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>This Week</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Year to Date</Text>
          </View>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'left', fontWeight: 'medium' }]}>{stat.label}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: stat.val.week > 0 ? 'bold' : 'normal', color: stat.val.week > 0 ? '#DC2626' : '#374151' }]}>
                {stat.val.week}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{stat.val.ytd}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Observations Table */}
      {showTable && visibleObservations.length > 0 && (
        <View style={styles.observationsTable}>
          <View style={styles.obsHeader}>
            <Text style={[styles.obsHeaderCell, { flex: 1 }]}>Date</Text>
            <Text style={[styles.obsHeaderCell, { flex: 1 }]}>Type</Text>
            <Text style={[styles.obsHeaderCell, { flex: 3 }]}>Description</Text>
            <Text style={[styles.obsHeaderCell, { flex: 1 }]}>Status</Text>
          </View>
          {visibleObservations.map((obs: any, i: number) => (
            <View key={i} style={[styles.obsRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.obsCell, { flex: 1 }]}>{obs.date || ''}</Text>
              <Text style={[styles.obsCell, { flex: 1 }]}>{obs.type || ''}</Text>
              <Text style={[styles.obsCell, { flex: 3 }]}>{obs.description || ''}</Text>
              <Text style={[styles.obsCell, { flex: 1 }]}>{obs.status || ''}</Text>
            </View>
          ))}
        </View>
      )}

      {showFooterSection && (
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Reported safety data is subject to verification upon project completion.</Text>
        </View>
      )}
    </View>
  );
};
