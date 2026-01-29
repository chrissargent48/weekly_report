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
  content: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    textAlign: 'justify',
  },
  summaryBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  }
});

interface ExecutiveSectionProps {
  data: ReportData;
  config?: {
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
}

export const ExecutiveSection: React.FC<ExecutiveSectionProps> = ({ data, config = {}, documentSettings }) => {
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
        <Text style={styles.headerTitle}>Executive Summary Project Status</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{data.executiveSummary}</Text>
      </View>
    </View>
  );
};
