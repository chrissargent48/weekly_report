/**
 * Look Ahead Section for @react-pdf/renderer
 *
 * Displays a 3-week horizon with activity cards in a 3-column layout:
 * - Week 1 Horizon (Current Week)
 * - Week 2 Horizon (Next Week)
 * - Week 3 Horizon (Future Outlook)
 *
 * Matches the HTML preview's visual structure.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, TargetIcon } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, LookAheadEntry } from '../../../../types';

interface LookAheadSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const lookAheadStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // 3-column grid layout
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  // Individual week column
  column: {
    flex: 1,
  },
  // Column header with bottom border
  columnHeader: {
    paddingBottom: 6,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  columnTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  columnSubtitle: {
    fontSize: 6,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Activity cards container
  cardsContainer: {
    gap: 6,
  },
  // Individual activity card
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 3,
    padding: 8,
  },
  // Card content row (icon + text)
  cardContent: {
    flexDirection: 'row',
    gap: 6,
  },
  // Icon container
  iconContainer: {
    paddingTop: 1,
  },
  // Text content
  textContent: {
    flex: 1,
  },
  // Activity description
  activityDescription: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 1.3,
  },
  // WBS badge
  wbsBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  wbsText: {
    fontSize: 6,
    fontFamily: 'Courier',
    color: COLORS.textMuted,
  },
  // Notes section
  notesContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  notesText: {
    fontSize: 6,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  // Empty state for column
  emptyState: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 7,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  // Legacy bullet list
  legacyContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
  },
  legacyItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 3,
  },
  legacyBullet: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  legacyText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
  },
  // Section empty state
  sectionEmptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

/**
 * Distribute items evenly across 3 columns
 */
function distributeItems(items: LookAheadEntry[]): [LookAheadEntry[], LookAheadEntry[], LookAheadEntry[]] {
  const total = items.length;
  const itemsPerCol = Math.ceil(total / 3);

  const week1 = items.slice(0, itemsPerCol);
  const week2 = items.slice(itemsPerCol, itemsPerCol * 2);
  const week3 = items.slice(itemsPerCol * 2);

  return [week1, week2, week3];
}

/**
 * Single activity card component
 */
function ActivityCard({ item }: { item: LookAheadEntry }) {
  // Clean description (remove leading dash if present)
  const description = item.description.replace(/^-\s*/, '');
  const isSubtask = item.description.trim().startsWith('-');

  return (
    <View style={lookAheadStyles.activityCard} wrap={false}>
      <View style={lookAheadStyles.cardContent}>
        {/* Icon */}
        <View style={lookAheadStyles.iconContainer}>
          <TargetIcon size={10} color={COLORS.primary} />
        </View>

        {/* Text content */}
        <View style={lookAheadStyles.textContent}>
          <Text style={lookAheadStyles.activityDescription}>{description}</Text>

          {/* WBS badge if present */}
          {item.wbs && (
            <View style={lookAheadStyles.wbsBadge}>
              <Text style={lookAheadStyles.wbsText}>{item.wbs}</Text>
            </View>
          )}

          {/* Notes if present */}
          {item.notes && (
            <View style={lookAheadStyles.notesContainer}>
              <Text style={lookAheadStyles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Single week column component
 */
function WeekColumn({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: LookAheadEntry[];
}) {
  return (
    <View style={lookAheadStyles.column}>
      {/* Column Header */}
      <View style={lookAheadStyles.columnHeader}>
        <Text style={lookAheadStyles.columnTitle}>{title}</Text>
        <Text style={lookAheadStyles.columnSubtitle}>{subtitle}</Text>
      </View>

      {/* Activity Cards */}
      <View style={lookAheadStyles.cardsContainer}>
        {items.length > 0 ? (
          items.map((item) => <ActivityCard key={item.id} item={item} />)
        ) : (
          <View style={lookAheadStyles.emptyState}>
            <Text style={lookAheadStyles.emptyText}>No activities scheduled</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function LookAheadSection({ config, reportData, placement }: LookAheadSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const lookAheadItems = reportData.progress?.lookAheadItems?.filter((item) => item.included) || [];

  // Fallback to legacy string array if no structured items
  const legacyItems = reportData.progress?.lookAheadThreeWeek || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? lookAheadItems.length;
  const visibleItems = lookAheadItems.slice(startIdx, endIdx);

  const sectionTitle = isContinued ? 'Three Week Look Ahead (Continued)' : 'Three Week Look Ahead';

  // If using legacy format (simple string array)
  if (lookAheadItems.length === 0 && legacyItems.length > 0) {
    const legacySlice = legacyItems.slice(startIdx, endIdx);
    return (
      <View style={lookAheadStyles.container}>
        {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}
        <View style={lookAheadStyles.legacyContainer}>
          {legacySlice.map((item, i) => (
            <View key={i} style={lookAheadStyles.legacyItem}>
              <Text style={lookAheadStyles.legacyBullet}>•</Text>
              <Text style={lookAheadStyles.legacyText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Empty state
  if (visibleItems.length === 0) {
    return (
      <View style={lookAheadStyles.container}>
        {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}
        <Text style={lookAheadStyles.sectionEmptyText}>No look ahead items scheduled.</Text>
      </View>
    );
  }

  // Distribute items across 3 week columns
  const [week1Items, week2Items, week3Items] = distributeItems(visibleItems);

  const weeks = [
    { title: 'WEEK 1 HORIZON', subtitle: 'Current Week', items: week1Items },
    { title: 'WEEK 2 HORIZON', subtitle: 'Next Week', items: week2Items },
    { title: 'WEEK 3 HORIZON', subtitle: 'Future Outlook', items: week3Items },
  ];

  return (
    <View style={lookAheadStyles.container}>
      {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}

      {/* 3-Column Grid */}
      <View style={lookAheadStyles.grid}>
        {weeks.map((week, idx) => (
          <WeekColumn key={idx} title={week.title} subtitle={week.subtitle} items={week.items} />
        ))}
      </View>
    </View>
  );
}
