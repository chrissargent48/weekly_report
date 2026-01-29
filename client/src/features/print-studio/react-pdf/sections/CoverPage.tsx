import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  hero: {
    height: '38%',
    backgroundColor: '#1a365d', // Dark Blue base
    position: 'relative',
    justifyContent: 'flex-start',
    padding: 20,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    opacity: 0.4,
    backgroundColor: '#008B8B', // Teal overlay approximation
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827', // Gray-900
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151', // Gray-700
    marginBottom: 8,
  },
  address: {
    fontSize: 10,
    color: '#008B8B', // Teal
    fontWeight: 'medium',
    marginBottom: 10,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#008B8B',
    marginBottom: 12,
  },
  reportType: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#1F2937',
    marginBottom: 4,
  },
  weekEnding: {
    fontSize: 9,
    color: '#008B8B',
    fontWeight: 'medium',
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  photoPlaceholder: {
    flex: 1,
    aspectRatio: 1.33,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 60,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  detailValue: {
    fontSize: 9,
    color: '#4B5563',
  },
  footerQuote: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: '#008B8B',
    paddingVertical: 8,
    textAlign: 'center',
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontStyle: 'italic',
    fontWeight: 'medium',
  }
});

interface CoverPageProps {
  data: ReportData;
  config?: {
    subtitle?: string;
    showPhotoGrid?: boolean;
    showSafetyQuote?: boolean;
    heroOverlayColor?: string;
    marginTop?: number;
    marginBottom?: number;
    dividerLine?: {
      show: boolean;
      color: string;
      width: number;
      thickness: number;
    };
    coverPhotos?: (string | null)[];
  };
  documentSettings?: any;
}

export const CoverPage: React.FC<CoverPageProps> = ({ data, config = {}, documentSettings }) => {
  const {
    subtitle = '2024 Site Improvements',
    showPhotoGrid = true,
    showSafetyQuote = true,
    heroOverlayColor = '#008B8B',
    marginTop: configMarginTop,
    marginBottom: configMarginBottom,
    dividerLine = { show: true, color: '#008B8B', width: 100, thickness: 2 },
    coverPhotos = [null, null, null]
  } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  const dividerStyle = {
    backgroundColor: dividerLine.color || '#008B8B',
    width: `${dividerLine.width || 100}%`,
    height: dividerLine.thickness || 2,
    marginVertical: 8,
    alignSelf: 'center' as const,
  };

  return (
    <View style={[styles.page, { marginTop, marginBottom }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: heroOverlayColor }]}>
        <View style={[styles.heroOverlay, { backgroundColor: heroOverlayColor }]} />
        <Text style={styles.logoText}>RECON</Text>
      </View>

      {/* Main Content */}
      <View style={[styles.contentContainer, { paddingLeft, paddingRight }]}>
        <Text style={styles.title}>{data.projectName}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        <Text style={styles.address}>{data.projectAddress}</Text>
        
        {dividerLine.show && <View style={dividerStyle} />}
        
        <Text style={styles.reportType}>Weekly Progress Report</Text>
        <Text style={styles.weekEnding}>Week Ending: {data.reportDate}</Text>

        {/* Photo Grid */}
        {showPhotoGrid && (
          <View style={styles.photoGrid}>
             {coverPhotos.map((photoId, i) => {
               const photo = data.availablePhotos.find(p => p.id === photoId);
               return (
                 <View key={i} style={styles.photoPlaceholder}>
                   {photo ? (
                     <Image src={photo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <View style={{ opacity: 0.1 }}>
                        <Text style={{ fontSize: 8 }}>Photo {i + 1}</Text>
                     </View>
                   )}
                 </View>
               );
             })}
          </View>
        )}

        {/* Project Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Client:</Text>
            <Text style={styles.detailValue}>{data.clientName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{data.projectAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Job #:</Text>
            <Text style={styles.detailValue}>{data.jobNumber}</Text>
          </View>
        </View>

        {/* Footer Quote */}
        {showSafetyQuote && (
          <View style={[styles.footerQuote, { backgroundColor: heroOverlayColor }]}>
              <Text style={styles.quoteText}>"Safety is a core value — not a priority that changes."</Text>
          </View>
        )}
      </View>
    </View>
  );
};
