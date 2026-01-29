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
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: '#EFF6FF', // Blue-50
    borderRadius: 4,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6', // Blue-500
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6B7280',
  }
});

interface WeatherSectionProps {
  data: ReportData;
  config?: {
    showSummary?: boolean;
    showWorkImpact?: boolean;
    tempUnit?: 'F' | 'C';
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ data, config = {}, documentSettings }) => {
  const {
    showSummary = true,
    showWorkImpact = true,
    tempUnit = 'F',
    marginTop: configMarginTop,
    marginBottom: configMarginBottom
  } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  // Helper for temp conversion
  const formatTemp = (tempF: number) => {
    if (tempUnit === 'C') {
      return `${Math.round((tempF - 32) * 5/9)}°C`;
    }
    return `${tempF}°F`;
  };

  // Helpers for summary
  const avgHigh = Math.round(data.weatherDays.reduce((acc, d) => acc + d.tempHigh, 0) / data.weatherDays.length) || 0;
  const avgLow = Math.round(data.weatherDays.reduce((acc, d) => acc + d.tempLow, 0) / data.weatherDays.length) || 0;
  const totalPrecip = data.weatherDays.reduce((acc, d) => acc + d.precipitation, 0);

  return (
    <View style={[styles.container, { marginTop, marginBottom, paddingLeft, paddingRight }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Conditions</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Conditions</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>High</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Low</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Precip</Text>
          {showWorkImpact && <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Work Impact</Text>}
        </View>

        {data.weatherDays.map((day, i) => (
          <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'medium' }]}>{day.day} {new Date(day.date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{day.condition}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{formatTemp(day.tempHigh)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{formatTemp(day.tempLow)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{day.precipitation > 0 ? `${day.precipitation}"` : '0"'}</Text>
            {showWorkImpact && (
              <Text style={[styles.tableCell, { flex: 2, color: day.workImpact !== 'None' ? '#DC2626' : '#059669' }]}>
                {day.workImpact}
              </Text>
            )}
          </View>
        ))}
      </View>

      {showSummary && (
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatTemp(avgHigh)}</Text>
              <Text style={styles.summaryLabel}>Avg High</Text>
          </View>
          <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatTemp(avgLow)}</Text>
              <Text style={styles.summaryLabel}>Avg Low</Text>
          </View>
          <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>{totalPrecip.toFixed(1)}"</Text>
              <Text style={styles.summaryLabel}>Total Precip</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.summaryValue, { color: '#059669' }]}>{data.weatherDays.filter(d => d.workImpact === 'None').length}</Text>
              <Text style={styles.summaryLabel}>Days Worked</Text>
          </View>
        </View>
      )}
    </View>
  );
};
