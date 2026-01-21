/**
 * Weather Section for @react-pdf/renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, Table, TableColumn } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, WeatherDay } from '../../../../types';

interface WeatherSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const weatherStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  conditionText: {
    fontSize: 8,
    color: COLORS.text,
  },
  tempText: {
    fontSize: 8,
    color: COLORS.text,
  },
  lostText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  lostPositive: {
    color: COLORS.red,
  },
  lostZero: {
    color: COLORS.textMuted,
  },
});

export function WeatherSection({ config, reportData, placement }: WeatherSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const weather = reportData.overview?.weather || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? weather.length;
  const visibleWeather = weather.slice(startIdx, endIdx);

  const columns: TableColumn[] = [
    {
      key: 'date',
      header: 'Date',
      width: '15%',
      render: (value) => (
        <Text style={{ fontSize: 8, fontFamily: 'Courier', color: COLORS.textMuted }}>
          {value}
        </Text>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      width: '25%',
      render: (value) => (
        <Text style={weatherStyles.conditionText}>{value || '-'}</Text>
      ),
    },
    {
      key: 'temps',
      header: 'High / Low',
      width: '15%',
      align: 'center',
      render: (_, row: WeatherDay) => (
        <Text style={weatherStyles.tempText}>
          {row.tempHigh}° / {row.tempLow}°
        </Text>
      ),
    },
    {
      key: 'wind',
      header: 'Wind',
      width: '12%',
      align: 'center',
      render: (value) => (
        <Text style={{ fontSize: 8, color: COLORS.text }}>
          {value ? `${value} mph` : '-'}
        </Text>
      ),
    },
    {
      key: 'hoursLost',
      header: 'Lost',
      width: '10%',
      align: 'center',
      render: (value) => {
        const hours = Number(value) || 0;
        return (
          <Text style={[
            weatherStyles.lostText,
            hours > 0 ? weatherStyles.lostPositive : weatherStyles.lostZero
          ]}>
            {hours > 0 ? hours : '-'}
          </Text>
        );
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '23%',
      render: (value) => (
        <Text style={{ fontSize: 7, color: COLORS.textMuted }}>
          {value || '-'}
        </Text>
      ),
    },
  ];

  // Transform data for table
  const tableData = visibleWeather.map((day) => ({
    ...day,
    temps: '', // Handled by render
  }));

  return (
    <View style={weatherStyles.container}>
      <SectionHeader title="Weather Log" isContinued={isContinued} />
      <Table
        columns={columns}
        data={tableData}
        keyExtractor={(item) => item.date}
        alternateRowColor={true}
      />
    </View>
  );
}
