import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ProjectConfig } from '../../../../types';

// Keep it extremely simple
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 200,
  }
});

interface Props {
    projectConfig: ProjectConfig;
    // We intentionally ignore other props for now to test the "Hollow Frame"
    config?: any;
    reportData?: any;
    baselines?: any;
}

export function ReportDocument({ projectConfig }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
            <Text style={styles.text}>Print Studio Clean Rebuild</Text>
            <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 10, color: '#666' }}>
                Project: {projectConfig.identity.projectName}
            </Text>
            <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5, color: '#666' }}>
                Step 1: Hollow Frame Active
            </Text>
        </View>
      </Page>
    </Document>
  );
}
