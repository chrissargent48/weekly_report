import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';
import { PagePlacement } from '../../config/printConfig.types';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 2,
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
    marginBottom: 12,
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
  placement?: PagePlacement;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ data, config = {}, documentSettings, placement }) => {
  const {
    showPercent = true,
    showNotes = true,
  } = config;

  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;

  // Pagination logic: Decide what to show based on placement
  // Ideally, layout engine would split 'activities' and 'bidItems' into separate placement blocks
  // For now, we'll just render both if they exist, or let the engine clip it
  // TODO: Advanced pagination for multi-table sections
  
  const activities = data.activitiesThisWeek || [];
  const bidItems = data.bidItems || [];

  const bidItemColumns: TableColumn[] = [
    { key: 'itemNumber', header: 'Item #', width: '10%', render: (val) => <Text style={{fontSize: 8, color: COLORS.text, fontWeight: 'bold'}}>{val}</Text> },
    { key: 'description', header: 'Description', width: '50%', render: (val) => <Text style={{fontSize: 8, color: COLORS.text}}>{val}</Text> },
    { key: 'thisWeekQty', header: 'This Week', width: '15%', align: 'right', render: (val) => <Text style={{fontSize: 8, color: COLORS.text}}>{val}</Text> },
    { key: 'toDateQty', header: 'To Date', width: '15%', align: 'right', render: (val) => <Text style={{fontSize: 8, color: COLORS.text}}>{val}</Text> },
    { key: 'unit', header: 'Unit', width: '10%', align: 'center', render: (val) => <Text style={{fontSize: 8, color: COLORS.textMuted}}>{val}</Text> },
  ];

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isContinued ? 'Progress Update (Continued)' : 'Progress Update'}
          </Text>
        </View>
      )}

      {/* Activities Table */}
      {(activities.length > 0) && (
        <>
          <Text style={styles.subHeader}>Activities This Week</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Activity</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
              {showPercent && <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>% Complete</Text>}
              {showNotes && <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Notes</Text>}
            </View>
            {activities.map((item, i) => (
              <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.activity}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.status}</Text>
                {showPercent && <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.percentComplete}</Text>}
                {showNotes && <Text style={[styles.tableCell, { flex: 2 }]}>{item.notes}</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Bid Items Table */}
      {(bidItems.length > 0 && !isContinued) && (
        <>
          <Text style={styles.subHeader}>Bid Item Progress</Text>
          <Table 
            columns={bidItemColumns}
            data={bidItems}
            keyExtractor={(item) => item.itemNumber}
            alternateRowColor={true}
          />
        </>
      )}

      {activities.length === 0 && bidItems.length === 0 && (
         <Text style={styles.emptyText}>No progress recorded for this week.</Text>
      )}
    </View>
  );
};

