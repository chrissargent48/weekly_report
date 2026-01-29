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
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#008B8B',
    padding: 6,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
  },
  emptyText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    padding: 10,
  }
});

interface ProgressSectionProps {
  data: ReportData;
  config?: {
    showPercent?: boolean;
    showNotes?: boolean;
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ data, config = {}, documentSettings }) => {
  const {
    showPercent = true,
    showNotes = true,
    marginTop: configMarginTop,
    marginBottom: configMarginBottom
  } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  return (
    <View style={[styles.container, { marginTop, marginBottom, paddingLeft, paddingRight }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Update</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Activity</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          {showPercent && <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>% Complete</Text>}
          {showNotes && <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Notes</Text>}
        </View>

        {data.activitiesThisWeek.length > 0 ? (
          data.activitiesThisWeek.map((item, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.activity}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.status}</Text>
              {showPercent && <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.percentComplete}</Text>}
              {showNotes && <Text style={[styles.tableCell, { flex: 2 }]}>{item.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No activities recorded for this week.</Text>
        )}
      </View>
    </View>
  );
};
