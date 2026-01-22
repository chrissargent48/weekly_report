/**
 * Issues Section for @react-pdf/renderer
 *
 * Displays issues/risks/concerns as priority-colored cards:
 * - High priority: Red background
 * - Medium priority: Amber background
 * - Low priority: Zinc/gray background
 *
 * Each card shows icon, description, priority badge, impact, owner, due date, and action plan.
 * Matches the HTML preview's visual structure.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader, AlertTriangleIcon, CheckCircleIcon } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, IssueEntry } from '../../../../types';

interface IssuesSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const issuesStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // Cards container
  cardsContainer: {
    gap: 8,
  },
  // Base card style
  card: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  // Priority-based card variants
  cardHigh: {
    backgroundColor: '#fef2f2', // red-50
    borderColor: '#fecaca', // red-100
  },
  cardMedium: {
    backgroundColor: '#fffbeb', // amber-50
    borderColor: '#fef3c7', // amber-100
  },
  cardLow: {
    backgroundColor: COLORS.backgroundAlt, // zinc-50
    borderColor: COLORS.borderLight, // zinc-100
  },
  // Icon container
  iconContainer: {
    paddingTop: 2,
  },
  // Content container
  contentContainer: {
    flex: 1,
  },
  // Header row (description + priority badge)
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  // Issue description
  description: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 8,
    lineHeight: 1.3,
  },
  descriptionHigh: {
    color: '#7f1d1d', // red-900
  },
  descriptionNormal: {
    color: COLORS.text,
  },
  // Priority badge
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  priorityBadgeHigh: {
    borderColor: '#fecaca', // red-200
  },
  priorityBadgeNormal: {
    borderColor: COLORS.border,
  },
  priorityText: {
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priorityTextHigh: {
    color: '#b91c1c', // red-700
  },
  priorityTextNormal: {
    color: COLORS.textMuted,
  },
  // Impact text
  impactText: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  // Metadata row (owner, due date, action)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 7,
    color: COLORS.text,
  },
  actionPlan: {
    flex: 1,
    fontSize: 7,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  // Empty state
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

/**
 * Get card styles based on priority
 */
function getCardStyle(priority: string | undefined) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return issuesStyles.cardHigh;
    case 'medium':
      return issuesStyles.cardMedium;
    default:
      return issuesStyles.cardLow;
  }
}

/**
 * Get icon color based on priority and status
 */
function getIconColor(priority: string | undefined, status: string | undefined) {
  if (status?.toLowerCase() === 'resolved' || status?.toLowerCase() === 'closed') {
    return COLORS.green;
  }
  switch (priority?.toLowerCase()) {
    case 'high':
      return COLORS.red;
    case 'medium':
      return COLORS.amber;
    default:
      return COLORS.textLight;
  }
}

/**
 * Single issue card component
 */
function IssueCard({ issue }: { issue: IssueEntry }) {
  const isResolved =
    issue.status?.toLowerCase() === 'resolved' || issue.status?.toLowerCase() === 'closed';
  const isHigh = issue.priority?.toLowerCase() === 'high';
  const iconColor = getIconColor(issue.priority, issue.status);

  return (
    <View style={[issuesStyles.card, getCardStyle(issue.priority)]} wrap={false}>
      {/* Icon */}
      <View style={issuesStyles.iconContainer}>
        {isResolved ? (
          <CheckCircleIcon size={14} color={iconColor} />
        ) : (
          <AlertTriangleIcon size={14} color={iconColor} />
        )}
      </View>

      {/* Content */}
      <View style={issuesStyles.contentContainer}>
        {/* Header: Description + Priority Badge */}
        <View style={issuesStyles.headerRow}>
          <Text
            style={[
              issuesStyles.description,
              isHigh ? issuesStyles.descriptionHigh : issuesStyles.descriptionNormal,
            ]}
          >
            {issue.description}
          </Text>

          {issue.priority && (
            <View
              style={[
                issuesStyles.priorityBadge,
                isHigh ? issuesStyles.priorityBadgeHigh : issuesStyles.priorityBadgeNormal,
              ]}
            >
              <Text
                style={[
                  issuesStyles.priorityText,
                  isHigh ? issuesStyles.priorityTextHigh : issuesStyles.priorityTextNormal,
                ]}
              >
                {issue.priority} Priority
              </Text>
            </View>
          )}
        </View>

        {/* Impact */}
        <Text style={issuesStyles.impactText}>
          {issue.impact || 'Potential impact not specified.'}
        </Text>

        {/* Metadata Row */}
        <View style={issuesStyles.metaRow}>
          <View style={issuesStyles.metaItem}>
            <Text style={issuesStyles.metaLabel}>Owner:</Text>
            <Text style={issuesStyles.metaValue}>{issue.assignedTo || 'Unassigned'}</Text>
          </View>

          <View style={issuesStyles.metaItem}>
            <Text style={issuesStyles.metaLabel}>Due:</Text>
            <Text style={issuesStyles.metaValue}>{issue.dueDate || 'No Date'}</Text>
          </View>

          {issue.actionPlan && (
            <Text style={issuesStyles.actionPlan}>
              Action: {issue.actionPlan}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function IssuesSection({ config, reportData, placement }: IssuesSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const issues = reportData.issues || [];

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? issues.length;
  const visibleIssues = issues.slice(startIdx, endIdx);

  const sectionTitle = isContinued
    ? 'Issues, Risks & Concerns (Continued)'
    : 'Issues, Risks & Concerns';

  // Empty state
  if (visibleIssues.length === 0) {
    return (
      <View style={issuesStyles.container}>
        {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}
        <Text style={issuesStyles.emptyText}>No open issues.</Text>
      </View>
    );
  }

  return (
    <View style={issuesStyles.container}>
      {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}

      {/* Issue Cards */}
      <View style={issuesStyles.cardsContainer}>
        {visibleIssues.map((issue, idx) => (
          <IssueCard key={issue.id || idx} issue={issue} />
        ))}
      </View>
    </View>
  );
}
