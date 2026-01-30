import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#008B8B',
  },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  summaryBox: { marginTop: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 },
  summaryText: { fontSize: 10, lineHeight: 1.5, color: '#374151' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  statCard: {
    flex: 1, padding: 10, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 4, alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 7, color: '#6B7280', textTransform: 'uppercase', textAlign: 'center' },
});

interface ExecutiveSectionProps {
  reportData: WeeklyReport;
  sectionConfig?: any;
  documentSettings?: any;
  placement?: PagePlacement;
}

export const ExecutiveSection: React.FC<ExecutiveSectionProps> = ({ reportData, sectionConfig = {}, documentSettings, placement }) => {
  const overview = reportData.overview;
  if (!overview) return null;

  const manpower = reportData.resources?.manpower || [];
  const sumDailyHours = (sum: number, m: any) => {
    const dh = m.dailyHours || {};
    return sum + Number(dh.mon || 0) + Number(dh.tue || 0) + Number(dh.wed || 0) +
      Number(dh.thu || 0) + Number(dh.fri || 0) + Number(dh.sat || 0) + Number(dh.sun || 0);
  };
  const reconOnsite = manpower.filter((m: any) => m.type === 'recon' && (m.location === 'onsite' || !m.location)).reduce(sumDailyHours, 0);
  const reconRemote = manpower.filter((m: any) => m.type === 'recon' && m.location === 'remote').reduce(sumDailyHours, 0);
  const subcontractors = manpower.filter((m: any) => m.type === 'subcontractor').reduce(sumDailyHours, 0);
  const weekTotal = reconOnsite + reconRemote + subcontractors;

  const weather = reportData.overview?.weather || [];
  const totalHoursLost = weather.reduce((sum: number, day: any) => sum + (day.hoursLost || 0), 0);
  const daysLost = totalHoursLost / 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Executive Summary Project Status</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{overview.executiveSummary || 'No summary provided.'}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weekTotal}</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{overview.kpis?.percentComplete || 0}%</Text>
          <Text style={styles.statLabel}>% Complete</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: daysLost > 0 ? '#DC2626' : '#059669' }]}>
            {daysLost > 0 ? `${daysLost.toFixed(1)}` : '0'}
          </Text>
          <Text style={styles.statLabel}>Weather Days Lost</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: (reportData.safety?.stats?.recordables?.week || 0) > 0 ? '#DC2626' : '#059669' }]}>
            {reportData.safety?.stats?.recordables?.week || 0}
          </Text>
          <Text style={styles.statLabel}>Safety Incidents</Text>
        </View>
      </View>
    </View>
  );
};
