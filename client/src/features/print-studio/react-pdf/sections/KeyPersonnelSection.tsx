/**
 * Key Personnel Section for @react-pdf/renderer
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  cardHeader: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
  },
  cardHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: 8,
  },
  personRow: {
    marginBottom: 6,
  },
  personName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  personRole: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 3,
    gap: 8,
  },
  contactItem: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Person card content
function PersonCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={personnelStyles.card} wrap={false}>
      <View style={personnelStyles.cardHeader}>
        <Text style={personnelStyles.cardHeaderText}>{title}</Text>
      </View>
      <View style={personnelStyles.cardBody}>{children}</View>
    </View>
  );
}

// Person row
function PersonRow({ name, role, email, phone }: { name: string; role: string; email?: string; phone?: string }) {
  return (
    <View style={personnelStyles.personRow}>
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

export function KeyPersonnelSection({ config, reportData, projectConfig, placement }: KeyPersonnelSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const personnel = projectConfig.personnel;

  if (!personnel) {
    return (
      <View style={personnelStyles.container}>
        <SectionHeader title="Key Personnel" isContinued={isContinued} />
        <Text style={personnelStyles.emptyText}>No personnel information available.</Text>
      </View>
    );
  }

  const reconPersonnel = personnel.recon || [];
  const clientReps = personnel.client?.representatives || [];
  const engineerReps = personnel.engineer?.representatives || [];

  return (
    <View style={personnelStyles.container}>
      <SectionHeader title="Key Personnel" isContinued={isContinued} />
      <View style={personnelStyles.grid}>
        {/* RECON Team */}
        {reconPersonnel.length > 0 && (
          <React.Fragment>
            <PersonCard title="RECON Team">
              {reconPersonnel.map((person, i) => (
                <PersonRow
                  key={person.id || i}
                  name={person.name}
                  role={person.role}
                  email={person.email}
                  phone={person.phone}
                />
              ))}
            </PersonCard>
            {config.manualBreaks?.some(b => b.sectionId === 'key_personnel' && b.afterRowIndex === 0) && <View break />}
          </React.Fragment>
        )}

        {/* Client */}
        {personnel.client && (
          <React.Fragment>
            <PersonCard title="Client">
              <Text style={personnelStyles.companyName}>{personnel.client.company}</Text>
              {personnel.client.address && (
                <Text style={personnelStyles.companyAddress}>{personnel.client.address}</Text>
              )}
              {clientReps.map((rep, i) => (
                <PersonRow
                  key={rep.id || i}
                  name={rep.name}
                  role={rep.role}
                  email={rep.email}
                  phone={rep.phone}
                />
              ))}
            </PersonCard>
             {config.manualBreaks?.some(b => b.sectionId === 'key_personnel' && b.afterRowIndex === 1) && <View break />}
          </React.Fragment>
        )}

        {/* Engineer */}
        {personnel.engineer && engineerReps.length > 0 && (
          <React.Fragment>
            <PersonCard title="Engineer of Record">
              <Text style={personnelStyles.companyName}>{personnel.engineer.company}</Text>
              {personnel.engineer.address && (
                <Text style={personnelStyles.companyAddress}>{personnel.engineer.address}</Text>
              )}
              {engineerReps.map((rep, i) => (
                <PersonRow
                  key={rep.id || i}
                  name={rep.name}
                  role={rep.role}
                  email={rep.email}
                  phone={rep.phone}
                />
              ))}
            </PersonCard>
             {config.manualBreaks?.some(b => b.sectionId === 'key_personnel' && b.afterRowIndex === 2) && <View break />}
          </React.Fragment>
        )}
      </View>
    </View>
  );
}
