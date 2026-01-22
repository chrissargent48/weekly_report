/**
 * Weather Section for @react-pdf/renderer
 *
 * Displays 7-day weather forecast with:
 * - Card-based grid layout matching HTML preview
 * - Weather icons (Sun, Cloud, Rain, Snow, Wind)
 * - Temperature high/low
 * - Impact badges for hours lost
 * - Weather notes section
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PAGE } from '../styles';
import { SectionHeader, SunIcon, CloudIcon, CloudRainIcon, CloudSnowIcon, WindIcon } from '../primitives';
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
  // 7-day grid container
  grid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  // Individual day card
  dayCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayCardImpact: {
    borderColor: '#fca5a5', // red-300
    backgroundColor: '#fef2f2', // red-50
  },
  // Day header
  dayName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  dayDate: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  // Icon container
  iconContainer: {
    marginVertical: 4,
  },
  // Impact badge
  impactBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: '#fee2e2', // red-100
    borderWidth: 1,
    borderColor: '#fecaca', // red-200
    borderRadius: 3,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#dc2626', // red-600
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Temperature display
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 'auto',
  },
  tempHigh: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tempDivider: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  tempLow: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  // Notes section
  notesContainer: {
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  notesHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notesGrid: {
    gap: 4,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noteDate: {
    width: 45,
    fontSize: 7,
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  noteText: {
    flex: 1,
    fontSize: 7,
    color: COLORS.text,
    lineHeight: 1.4,
  },
});

/**
 * Get the appropriate weather icon based on condition string
 */
function getWeatherIcon(condition: string, size = 20) {
  const c = (condition || '').toLowerCase();

  if (c.includes('rain') || c.includes('storm') || c.includes('shower')) {
    return <CloudRainIcon size={size} color="#3b82f6" />;
  }
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) {
    return <CloudSnowIcon size={size} color="#93c5fd" />;
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('partly')) {
    return <CloudIcon size={size} color="#71717a" />;
  }
  if (c.includes('wind') || c.includes('breezy') || c.includes('gusty')) {
    return <WindIcon size={size} color="#71717a" />;
  }
  // Default to sunny
  return <SunIcon size={size} color="#f59e0b" />;
}

/**
 * Format a date to display components
 */
function formatDate(date: Date): { dayName: string; monthDay: string } {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  return { dayName, monthDay };
}

export function WeatherSection({ config, reportData, placement }: WeatherSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const rawWeather = reportData.overview?.weather || [];

  if (rawWeather.length === 0) return null;

  // Calculate start date from periodStart or weekEnding
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

  // Generate 7 days of weather data
  const allWeather = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + index);

    const data = rawWeather[index] || {};

    return {
      date: d,
      tempHigh: data.tempHigh ?? '-',
      tempLow: data.tempLow ?? '-',
      condition: data.condition || 'Sunny',
      hoursLost: Number(data.hoursLost) || 0,
      notes: data.notes || '',
    };
  });

  // Handle pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? allWeather.length;
  const weather = allWeather.slice(startIdx, endIdx);

  // Days with notes
  const daysWithNotes = weather.filter(
    (day) => day.notes && day.notes.trim() !== '' && day.notes !== 'None'
  );

  // Section title
  const sectionTitle = isContinued ? 'Weekly Weather (Continued)' : 'Weekly Weather';

  return (
    <View style={weatherStyles.container}>
      {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}

      {/* 7-Day Weather Grid */}
      <View style={weatherStyles.grid}>
        {weather.map((day, index) => {
          const { dayName, monthDay } = formatDate(day.date);
          const hasImpact = day.hoursLost > 0;

          return (
            <View
              key={index}
              style={hasImpact ? [weatherStyles.dayCard, weatherStyles.dayCardImpact] : weatherStyles.dayCard}
              wrap={false}
            >
              {/* Day Header */}
              <Text style={weatherStyles.dayName}>{dayName}</Text>
              <Text style={weatherStyles.dayDate}>{monthDay}</Text>

              {/* Weather Icon */}
              <View style={weatherStyles.iconContainer}>
                {getWeatherIcon(day.condition, 18)}
              </View>

              {/* Impact Badge */}
              {hasImpact && (
                <View style={weatherStyles.impactBadge}>
                  <Text style={weatherStyles.impactText}>Impact</Text>
                </View>
              )}

              {/* Temperature */}
              <View style={weatherStyles.tempContainer}>
                <Text style={weatherStyles.tempHigh}>{day.tempHigh}°</Text>
                <Text style={weatherStyles.tempDivider}>|</Text>
                <Text style={weatherStyles.tempLow}>{day.tempLow}°</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Weather Notes Section */}
      {daysWithNotes.length > 0 && (
        <View style={weatherStyles.notesContainer} wrap={false}>
          <Text style={weatherStyles.notesHeader}>Weather Impacts & Notes</Text>
          <View style={weatherStyles.notesGrid}>
            {daysWithNotes.map((day, index) => {
              const { dayName, monthDay } = formatDate(day.date);
              return (
                <View key={index} style={weatherStyles.noteRow}>
                  <Text style={weatherStyles.noteDate}>
                    {dayName} {monthDay}
                  </Text>
                  <Text style={weatherStyles.noteText}>{day.notes}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
