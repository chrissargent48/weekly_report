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
  listContainer: { marginTop: 10 },
  listItem: {
    flexDirection: 'row', marginBottom: 8, paddingVertical: 4,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  bullet: { width: 20, alignItems: 'center', justifyContent: 'flex-start' },
  bulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#008B8B', marginTop: 4 },
  itemContent: { flex: 1 },
  activityText: { fontSize: 10, color: '#374151', fontWeight: 'medium' },
  notesText: { fontSize: 8, color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
  emptyText: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', padding: 10 },
});

interface LookAheadSectionProps {
  reportData: WeeklyReport;
  sectionConfig?: any;
  documentSettings?: any;
  placement?: PagePlacement;
}

export const LookAheadSection: React.FC<LookAheadSectionProps> = ({ reportData, sectionConfig = {}, documentSettings, placement }) => {
  const allItems = reportData.progress?.lookAheadItems || [];

  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allItems.length;
  const items = allItems.slice(startIdx, endIdx);

  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? '3-Week Look Ahead (Continued)' : '3-Week Look Ahead Schedule'}
          </Text>
        </View>
      )}
      <View style={styles.listContainer}>
        {items.length > 0 ? (
          items.map((item: any, i: number) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bullet}>
                <View style={styles.bulletDot} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.activityText}>{item.description || item.activity || ''}</Text>
                {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No look ahead items scheduled.</Text>
        )}
      </View>
    </View>
  );
};
