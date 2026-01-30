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
  table: { width: '100%', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#008B8B', padding: 6 },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableCell: { fontSize: 8, color: '#374151' },
  emptyText: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', padding: 10 },
});

interface ProgressSectionProps {
  reportData: WeeklyReport;
  sectionConfig?: any;
  documentSettings?: any;
  placement?: PagePlacement;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ reportData, sectionConfig = {}, documentSettings, placement }) => {
  const { showPercent = true, showNotes = true } = sectionConfig;

  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;

  // Use bid items from progress (same as HTML preview)
  const allItems = reportData.progress?.bidItems || [];
  const visibleItems = placement?.dataRange
    ? allItems.slice(placement.dataRange.start, placement.dataRange.end)
    : allItems;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? 'Progress Update (Continued)' : 'Progress Update'}
          </Text>
        </View>
      )}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Activity</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          {showPercent && <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>% Complete</Text>}
          {showNotes && <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Notes</Text>}
        </View>
        {visibleItems.length > 0 ? (
          visibleItems.map((item: any, i: number) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.description || item.activity || ''}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.status || ''}</Text>
              {showPercent && <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.percentComplete ?? ''}</Text>}
              {showNotes && <Text style={[styles.tableCell, { flex: 2 }]}>{item.notes || item.weeklyNotes || ''}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No activities recorded for this week.</Text>
        )}
      </View>
    </View>
  );
};
