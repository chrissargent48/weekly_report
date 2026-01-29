import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';
import { WeatherDay } from '../../../../../../shared/schemas';

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

  // Use originalReport data source if available
  const report = data.originalReport;
  const rawWeather = report?.overview?.weather || [];
  
  if (rawWeather.length === 0) return null;

  // Date Calculation Logic (Replicated from HTML Preview)
  let startDate: Date;
  if (report.periodStart) {
    const [y, m, d] = report.periodStart.split('-').map(Number);
    startDate = new Date(y, m - 1, d);
  } else if (report.weekEnding) {
    const [y, m, d] = report.weekEnding.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    startDate = new Date(end);
    startDate.setDate(end.getDate() - 6);
  } else {
    startDate = new Date();
  }

  // Generate 7-day array
  const weatherDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + index);

    // Find matching data from rawWeather (index based)
    const dayData = rawWeather[index] || {};
    
    // Day Name
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    return {
      dateObj: d,
      displayDate: `${dayName} ${monthDay}`,
      condition: dayData.condition || 'Sunny',
      tempHigh: dayData.tempHigh || '-',
      tempLow: dayData.tempLow || '-',
      precipitation: Number(dayData.hoursLost) || 0, // In schema "precipitation" isn't explicitly hoursLost but we map it here? 
      // Wait, in schema WeatherDaySchema: { hoursLost: number, precipitation: ??? }
      // Dashboard uses hoursLost. Let's assume precipitation field is just visual here or we map hoursLost?
      // HTML preview shows "hoursLost" as impact.
      // We'll stick to displaying hoursLost as "Hours Lost" column if showWorkImpact is true.
      hoursLost: Number(dayData.hoursLost) || 0,
      notes: dayData.notes
    };
  });

  // Helper for temp conversion
  const formatTemp = (val: number | string) => {
    if (typeof val !== 'number') return '-';
    if (tempUnit === 'C') {
      return `${Math.round((val - 32) * 5/9)}°C`;
    }
    return `${val}°F`;
  };

  // Helpers for summary
  const validHighs = weatherDays.filter(d => typeof d.tempHigh === 'number').map(d => d.tempHigh as number);
  const validLows = weatherDays.filter(d => typeof d.tempLow === 'number').map(d => d.tempLow as number);
  
  const avgHigh = validHighs.length ? Math.round(validHighs.reduce((a, b) => a + b, 0) / validHighs.length) : 0;
  const avgLow = validLows.length ? Math.round(validLows.reduce((a, b) => a + b, 0) / validLows.length) : 0;
  const totalHoursLost = weatherDays.reduce((acc, d) => acc + d.hoursLost, 0);
  const daysWorked = weatherDays.filter(d => d.hoursLost === 0).length;

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
