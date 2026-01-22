/**
 * Key Personnel Section for @react-pdf/renderer
 *
 * Displays project team in a 3-column layout:
 * - Client column (company + representatives)
 * - Engineer of Record column (company + representatives)
 * - RECON Team column (contractor personnel)
 *
 * Matches the HTML preview's visual structure.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from '../styles';
import { SectionHeader } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, ProjectConfig } from '../../../../types';

interface KeyPersonnelSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig: ProjectConfig;
  placement?: PagePlacement;
}

const personnelStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // 3-column grid layout
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  // Column card - Client/Engineer style
  columnCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt, // zinc-50
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
  },
  // Column card - RECON style (emphasized)
  columnCardRecon: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
  },
  // Column header
  columnHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // Company info block
  companyBlock: {
    marginBottom: 8,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 7,
    color: COLORS.textMuted,
    lineHeight: 1.3,
  },
  // Person row
  personRow: {
    marginBottom: 6,
  },
  personRowLast: {
    marginBottom: 0,
  },
  personName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 1.2,
  },
  personRole: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // Contact info
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  contactItem: {
    fontSize: 6,
    color: COLORS.textLight,
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
 * Render a single person row with name, role, and optional contact info
 */
function PersonRow({
  name,
  role,
  email,
  phone,
  isLast = false,
}: {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isLast?: boolean;
}) {
  return (
    <View style={isLast ? personnelStyles.personRowLast : personnelStyles.personRow}>
      <Text style={personnelStyles.personName}>{name}</Text>
      <Text style={personnelStyles.personRole}>{role}</Text>
      {(email || phone) && (
        <View style={personnelStyles.contactRow}>
          {email && <Text style={personnelStyles.contactItem}>{email}</Text>}
          {phone && <Text style={personnelStyles.contactItem}>{phone}</Text>}
        </View>
      )}
    </View>
  );
}

export function KeyPersonnelSection({
  config,
  reportData,
  projectConfig,
  placement,
}: KeyPersonnelSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const showHeader = placement?.renderConfig?.showHeader ?? true;
  const personnel = projectConfig.personnel;

  if (!personnel) {
    return (
      <View style={personnelStyles.container}>
        {showHeader && <SectionHeader title="Key Personnel" isContinued={isContinued} />}
        <Text style={personnelStyles.emptyText}>No personnel information available.</Text>
      </View>
    );
  }

  // Handle pagination slicing
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end;

  // Get representatives from each group
  const clientReps = (personnel.client?.representatives || []).slice(startIdx, endIdx);
  const engineerReps = (personnel.engineer?.representatives || []).slice(startIdx, endIdx);
  const reconReps = (personnel.recon || []).slice(startIdx, endIdx);

  // Skip if all columns are empty
  if (clientReps.length === 0 && engineerReps.length === 0 && reconReps.length === 0) {
    return null;
  }

  const sectionTitle = isContinued ? 'Key Personnel (Continued)' : 'Key Personnel';

  return (
    <View style={personnelStyles.container}>
      {showHeader && <SectionHeader title={sectionTitle} isContinued={isContinued} />}

      {/* 3-Column Grid */}
      <View style={personnelStyles.grid}>
        {/* Client Column */}
        <View style={personnelStyles.columnCard} wrap={false}>
          <Text style={personnelStyles.columnHeader}>Client</Text>
          {personnel.client && (
            <View style={personnelStyles.companyBlock}>
              <Text style={personnelStyles.companyName}>
                {personnel.client.company || 'Client Company'}
              </Text>
              {personnel.client.address && (
                <Text style={personnelStyles.companyAddress}>
                  {personnel.client.address}
                </Text>
              )}
            </View>
          )}
          {clientReps.map((rep: any, i: number) => (
            <PersonRow
              key={rep.id || i}
              name={rep.name}
              role={rep.role}
              email={rep.email}
              phone={rep.phone}
              isLast={i === clientReps.length - 1}
            />
          ))}
        </View>

        {/* Engineer of Record Column */}
        <View style={personnelStyles.columnCard} wrap={false}>
          <Text style={personnelStyles.columnHeader}>Engineer of Record</Text>
          {personnel.engineer && (
            <View style={personnelStyles.companyBlock}>
              <Text style={personnelStyles.companyName}>
                {personnel.engineer.company || 'Engineer Company'}
              </Text>
              {personnel.engineer.address && (
                <Text style={personnelStyles.companyAddress}>
                  {personnel.engineer.address}
                </Text>
              )}
            </View>
          )}
          {engineerReps.map((rep: any, i: number) => (
            <PersonRow
              key={rep.id || i}
              name={rep.name}
              role={rep.role}
              email={rep.email}
              phone={rep.phone}
              isLast={i === engineerReps.length - 1}
            />
          ))}
        </View>

        {/* RECON Column (emphasized with thicker border) */}
        <View style={personnelStyles.columnCardRecon} wrap={false}>
          <Text style={personnelStyles.columnHeader}>RECON Key Personnel</Text>
          {reconReps.map((person: any, i: number) => (
            <PersonRow
              key={person.id || i}
              name={person.name}
              role={person.role}
              email={person.email}
              phone={person.phone}
              isLast={i === reconReps.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
