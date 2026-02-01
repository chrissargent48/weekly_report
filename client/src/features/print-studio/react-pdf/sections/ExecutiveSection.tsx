import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';
import { PagePlacement } from '../../config/printConfig.types';

const styles = StyleSheet.create({
  container: {
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
  // Two-column layout
  columns: {
    flexDirection: 'row',
    gap: 16,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: 180,
  },
  // Narrative box
  narrativeBox: {
    borderWidth: 1,
    borderColor: '#D4D4D8',
    borderRadius: 4,
    padding: 12,
    flex: 1,
  },
  narrativeLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#52525B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  narrativeText: {
    fontSize: 9,
    color: '#3F3F46',
    lineHeight: 1.5,
  },
  // Manpower box
  manpowerBox: {
    borderWidth: 2,
    borderColor: '#A1A1AA',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  manpowerLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#52525B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  manpowerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  manpowerName: {
    fontSize: 9,
    color: '#3F3F46',
  },
  manpowerValue: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#18181B',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#D4D4D8',
    marginVertical: 6,
  },
  totalName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#18181B',
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#18181B',
  },
  // Metrics box
  metricsBox: {
    borderWidth: 2,
    borderColor: '#A1A1AA',
    borderRadius: 4,
    padding: 12,
  },
  metricsLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#52525B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricName: {
    fontSize: 8,
    color: '#52525B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#008B8B',
  },
  metricValueDanger: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#DC2626',
  },
  metricValueSuccess: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#16A34A',
  },
});

interface ExecutiveSectionProps {
  data: ReportData;
  config?: {
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
  placement?: PagePlacement;
}

// Helper: sum daily hours for a manpower entry
function sumDailyHours(m: any): number {
  const dh = m.dailyHours || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
  return Number(dh.mon || 0) + Number(dh.tue || 0) + Number(dh.wed || 0) +
    Number(dh.thu || 0) + Number(dh.fri || 0) + Number(dh.sat || 0) + Number(dh.sun || 0);
}

// Strip HTML tags from rich text for plain text PDF rendering
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const ExecutiveSection: React.FC<ExecutiveSectionProps> = ({ data, config = {}, documentSettings, placement }) => {
  const isContinued = placement?.continuesFromPrevious ?? false;

  // Narrative text
  const narrative = data.executiveSummary || data.overview?.executiveSummary || '';
  const plainNarrative = stripHtml(narrative);

  // Manpower breakdown (matching HTML preview calculations)
  const manpower = data.resources?.manpower || [];

  const reconOnsite = manpower
    .filter((m: any) => m.type === 'recon' && (m.location === 'onsite' || !m.location))
    .reduce((sum: number, m: any) => sum + sumDailyHours(m), 0);

  const reconRemote = manpower
    .filter((m: any) => m.type === 'recon' && m.location === 'remote')
    .reduce((sum: number, m: any) => sum + sumDailyHours(m), 0);

  const subcontractors = manpower
    .filter((m: any) => m.type === 'subcontractor')
    .reduce((sum: number, m: any) => sum + sumDailyHours(m), 0);

  const weekTotal = reconOnsite + reconRemote + subcontractors;
  const jobToDate = data.overview?.kpis?.manHoursTotal || 0;

  // Key metrics
  const percentComplete = data.overview?.kpis?.percentComplete || 0;

  // Weather days lost (matching HTML calculation)
  const weather = data.overview?.weather || [];
  const totalHoursLost = weather.reduce((sum: number, day: any) => sum + (day.hoursLost || 0), 0);
  const daysLost = totalHoursLost / 10; // 10-hour workday

  // Safety incidents
  const safetyIncidents = data.safetyStats?.recordables?.week || 0;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isContinued ? 'Weekly Summary (Continued)' : 'Weekly Summary'}
        </Text>
      </View>

      {/* Two Column Layout */}
      <View style={styles.columns}>
        {/* Left: Narrative */}
        <View style={styles.leftColumn}>
          <View style={styles.narrativeBox}>
            <Text style={styles.narrativeLabel}>Weekly Recap</Text>
            <Text style={styles.narrativeText}>
              {plainNarrative || 'No summary provided.'}
            </Text>
          </View>
        </View>

        {/* Right: Manpower + Metrics */}
        <View style={styles.rightColumn}>
          {/* Manpower Summary */}
          <View style={styles.manpowerBox}>
            <Text style={styles.manpowerLabel}>Manpower Summary</Text>
            <View style={styles.manpowerRow}>
              <Text style={styles.manpowerName}>RECON Onsite</Text>
              <Text style={styles.manpowerValue}>{reconOnsite} hrs</Text>
            </View>
            <View style={styles.manpowerRow}>
              <Text style={styles.manpowerName}>RECON Remote</Text>
              <Text style={styles.manpowerValue}>{reconRemote} hrs</Text>
            </View>
            <View style={styles.manpowerRow}>
              <Text style={styles.manpowerName}>Subcontractors</Text>
              <Text style={styles.manpowerValue}>{subcontractors} hrs</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.manpowerRow}>
              <Text style={styles.totalName}>Week Total</Text>
              <Text style={styles.totalValue}>{weekTotal} hrs</Text>
            </View>
            <View style={styles.manpowerRow}>
              <Text style={styles.totalName}>Job to Date</Text>
              <Text style={styles.totalValue}>{jobToDate.toLocaleString()} hrs</Text>
            </View>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsBox}>
            <Text style={styles.metricsLabel}>Key Metrics</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>% Complete</Text>
              <Text style={styles.metricValue}>{percentComplete}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Weather Lost</Text>
              <Text style={daysLost > 0 ? styles.metricValueDanger : styles.metricValue}>
                {daysLost > 0 ? `${daysLost.toFixed(1)} days` : '0 days'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Safety Incidents</Text>
              <Text style={safetyIncidents > 0 ? styles.metricValueDanger : styles.metricValueSuccess}>
                {safetyIncidents}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
