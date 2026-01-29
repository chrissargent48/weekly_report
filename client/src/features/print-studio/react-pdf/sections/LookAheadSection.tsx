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
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bullet: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#008B8B',
    marginTop: 4,
  },
  itemContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'medium',
  },
  emptyText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    padding: 10,
  }
});

interface LookAheadSectionProps {
  data: ReportData;
  config?: {
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
}

export const LookAheadSection: React.FC<LookAheadSectionProps> = ({ data, config = {}, documentSettings }) => {
  const { marginTop: configMarginTop, marginBottom: configMarginBottom } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  return (
    <View style={[styles.container, { marginTop, marginBottom, paddingLeft, paddingRight }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>3-Week Look Ahead Schedule</Text>
      </View>

      <View style={styles.listContainer}>
        {data.lookAhead.length > 0 ? (
          data.lookAhead.map((item, i) => (
            <View key={i} style={styles.listItem}>
               <View style={styles.bullet}>
                 <View style={styles.bulletDot} />
               </View>
               <View style={styles.itemContent}>
                 <Text style={styles.activityText}>{item.activity}</Text>
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
