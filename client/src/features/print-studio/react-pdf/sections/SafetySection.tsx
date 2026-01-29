import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';

const styles = StyleSheet.create({
  container: {
    padding: 30,
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
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#111827',
  },
  statLabel: {
    fontSize: 7,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statYtd: {
    fontSize: 6,
    color: '#9CA3AF',
    marginTop: 2,
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  rowLabel: {
    textAlign: 'left',
    fontWeight: 'medium',
    flex: 2,
  },
  footerInfo: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
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
}

export const SafetySection: React.FC<SafetySectionProps> = ({ data, config = {}, documentSettings }) => {
  const {
      showTable = true,
      showCards = true,
      marginTop: configMarginTop,
      marginBottom: configMarginBottom
  } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  const stats = [
    { label: 'Lost Time', val: data.safetyStats.lostTime },
    { label: 'Recordable', val: data.safetyStats.recordables },
    { label: 'First Aid', val: data.safetyStats.firstAids },
    { label: 'Near Miss', val: data.safetyStats.nearMisses },
    { label: 'Stop Work', val: data.safetyStats.stopWorks },
  ];

  return (
    <View style={[styles.container, { marginTop, marginBottom, paddingLeft, paddingRight }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Statistics & Performance</Text>
      </View>

      {showCards && (
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

      {showTable && (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Indicator</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>This Week</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Year to Date</Text>
          </View>

          {stats.map((stat, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'left', fontWeight: 'medium' }]}>{stat.label}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: stat.val.week > 0 ? 'bold' : 'normal', color: stat.val.week > 0 ? '#DC2626' : '#374151' }]}>
                {stat.val.week}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{stat.val.ytd}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>Reported safety data is subject to verification upon project completion.</Text>
      </View>
    </View>
  );
};
