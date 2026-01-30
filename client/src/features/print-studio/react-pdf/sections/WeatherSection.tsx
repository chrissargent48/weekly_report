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
  table: { width: '100%', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#008B8B', padding: 6 },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tableCell: { fontSize: 8, color: '#374151' },
  summaryGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  summaryCard: { flex: 1, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 4, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginBottom: 2 },
  summaryLabel: { fontSize: 8, color: '#6B7280' },
});

interface WeatherSectionProps {
  reportData: WeeklyReport;
  sectionConfig?: any;
  documentSettings?: any;
  placement?: PagePlacement;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ reportData, sectionConfig = {}, documentSettings, placement }) => {
  const { showSummary = true, showWorkImpact = true, tempUnit = 'F' } = sectionConfig;

  const rawWeather = reportData.overview?.weather || [];
  if (rawWeather.length === 0) return null;

  let startDate: Date;
  if (reportData.periodStart) {
    const [y, m, d] = reportData.periodStart.split('-').map(Number);
    startDate = new Date(y, m - 1, d);
  } else if (reportData.weekEnding) {
    const [y, m, d] = reportData.weekEnding.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    startDate = new Date(end);
    startDate.setDate(end.getDate() - 6);
  } else {
    startDate = new Date();
  }

  const weatherDays = Array.from({ length: 7 }).map((_, index) => {
    const dt = new Date(startDate);
    dt.setDate(startDate.getDate() + index);
    const dayData = rawWeather[index] || {} as any;
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    return {
      displayDate: `${dayName} ${monthDay}`,
      condition: dayData.condition || 'Sunny',
      tempHigh: dayData.tempHigh || '-',
      tempLow: dayData.tempLow || '-',
      hoursLost: Number(dayData.hoursLost) || 0,
    };
  });

  const formatTemp = (val: number | string) => {
    if (typeof val !== 'number') return '-';
    if (tempUnit === 'C') return `${Math.round((val - 32) * 5 / 9)}°C`;
    return `${val}°F`;
  };

  const validHighs = weatherDays.filter(d => typeof d.tempHigh === 'number').map(d => d.tempHigh as number);
  const validLows = weatherDays.filter(d => typeof d.tempLow === 'number').map(d => d.tempLow as number);
  const avgHigh = validHighs.length ? Math.round(validHighs.reduce((a, b) => a + b, 0) / validHighs.length) : 0;
  const avgLow = validLows.length ? Math.round(validLows.reduce((a, b) => a + b, 0) / validLows.length) : 0;
  const totalHoursLost = weatherDays.reduce((acc, d) => acc + d.hoursLost, 0);
  const daysWorked = weatherDays.filter(d => d.hoursLost === 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Conditions</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Conditions</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>High</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Low</Text>
          {showWorkImpact && <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Impact</Text>}
        </View>
        {weatherDays.map((day, i) => (
          <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'medium' }]}>{day.displayDate}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{day.condition}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{formatTemp(day.tempHigh)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{formatTemp(day.tempLow)}</Text>
            {showWorkImpact && (
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right', color: day.hoursLost > 0 ? '#DC2626' : '#059669' }]}>
                {day.hoursLost > 0 ? `${day.hoursLost} hrs lost` : 'None'}
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
            <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{totalHoursLost}</Text>
            <Text style={styles.summaryLabel}>Hours Lost</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>{daysWorked}</Text>
            <Text style={styles.summaryLabel}>Days Worked</Text>
          </View>
        </View>
      )}
    </View>
  );
};
