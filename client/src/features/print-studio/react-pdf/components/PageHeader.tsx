import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { ProjectConfig } from '../../../../types';

interface PageHeaderProps {
  projectConfig: ProjectConfig;
  weekEnding: string;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.text, // zinc-900 equivalent
    height: 50, // Fixed height to reserve space
  },
  leftColumn: {
    flex: 1,
    paddingRight: 16,
  },
  rightColumn: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  projectName: {
    fontSize: 12, // text-lg roughly
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  projectSubtext: {
    fontSize: 9, // text-xs
    color: COLORS.textMuted,
  },
  reportLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

export function PageHeader({ projectConfig, weekEnding }: PageHeaderProps) {
  const formattedDate = formatDate(weekEnding);

  return (
    <View style={styles.container} fixed>
      <View style={styles.leftColumn}>
        <Text style={styles.projectName}>
          {projectConfig.identity.projectName}
        </Text>
        <Text style={styles.projectSubtext}>
          {projectConfig.identity.location || ''} • Job #{projectConfig.identity.jobNumber || ''}
        </Text>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={styles.reportLabel}>WEEKLY REPORT</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
}
