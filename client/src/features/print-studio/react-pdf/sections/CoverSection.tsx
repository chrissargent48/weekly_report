/**
 * Cover Section for @react-pdf/renderer
 *
 * Renders the first page with:
 * - Header with hero image/gradient and logo
 * - Title block with project name, address, report type
 * - Photo strip (3 photos)
 * - Client info
 * - Safety banner at bottom
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { COLORS, COVER, PAGE } from '../styles';
import { PrintConfig } from '../../config/printConfig.types';
import { WeeklyReport, ProjectConfig } from '../../../../types';

interface CoverSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  projectConfig: ProjectConfig;
}

const coverStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  // Header section with hero image
  header: {
    width: '100%',
    height: COVER.HEADER_HEIGHT,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  logoContainer: {
    position: 'absolute',
    top: 24,
    left: 32,
    zIndex: 50, // Ensure logo sits on top of overlay
  },
  logoImage: {
    maxHeight: 50,
    maxWidth: 160,
    objectFit: 'contain',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginTop: 2,
  },
  // Main content area
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 60, // Space for safety banner
  },
  // Title block
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  projectLocation: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 12,
  },
  accentBar: {
    width: 100,
    height: 4,
    backgroundColor: COLORS.accent,
    marginBottom: 16,
  },
  reportType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  weekEnding: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  // Photo strip
  photoStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stripPhoto: {
    flex: 1,
    height: 85,
    borderRadius: 3,
    objectFit: 'cover',
    backgroundColor: COLORS.borderLight,
  },
  stripPhotoPlaceholder: {
    flex: 1,
    height: 85,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  // Client info
  infoGrid: {
    marginTop: 'auto',
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabel: {
    width: 55,
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoValueMuted: {
    flex: 1,
    fontSize: 9,
    color: COLORS.textMuted,
  },
  // Safety banner
  safetyBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: COVER.SAFETY_BANNER_HEIGHT,
    backgroundColor: COLORS.safetyBanner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export function CoverSection({ config, reportData, projectConfig }: CoverSectionProps) {
  // Hero photo
  const heroIndex = config.heroPhotoIndex ?? 0;
  const heroPhoto = reportData.photos?.[heroIndex];

  // Strip photos
  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const stripPhotos = stripIndexes
    .map(idx => reportData.photos?.[idx])
    .filter(Boolean)
    .slice(0, 3);
  const showStrip = config.showCoverPhotos && stripPhotos.length > 0;

  // Logo
  const logoUrl = projectConfig.identity?.logoUrl;
  const hasLogo = logoUrl && logoUrl.length > 0;
  const logoScale = (config.logoScale || 100) / 100;

  // Project info
  const projectName = projectConfig.identity?.projectName || 'Project Name';
  const location = projectConfig.identity?.location || projectConfig.identity?.companyAddress || '';
  const clientCompany = projectConfig.personnel?.client?.company || 'Client';
  const jobNumber = projectConfig.identity?.jobNumber || '00-00000';
  const weekEnding = reportData.weekEnding || '';

  return (
    <View style={coverStyles.container}>
      {/* Header Section */}
      <View style={coverStyles.header}>
        {/* Hero Image (if available) */}
        {heroPhoto?.url && (
          <Image
            src={heroPhoto.url}
            style={[
              coverStyles.heroImage,
              {
                objectPosition: `${config.heroPhotoPosition?.x ?? 50}% ${config.heroPhotoPosition?.y ?? 50}%`
              }
            ]}
          />
        )}
        {/* Overlay */}
        <View style={coverStyles.headerOverlay} />
        {/* Logo */}
        <View 
          style={[
            coverStyles.logoContainer, 
            { 
              transform: `scale(${logoScale})`,
              // alignments
              ...(config.logoAlign === 'center' ? { left: '50%', marginLeft: -80 } : {}), // centering trick since transform is used for scale
              ...(config.logoAlign === 'right' ? { left: 'auto', right: 32 } : {}),
            }
          ]}
        >
          {hasLogo ? (
            <Image
              src={logoUrl}
              style={coverStyles.logoImage}
            />
          ) : (
            <View>
              <Text style={coverStyles.logoText}>RECON</Text>
              <Text style={coverStyles.logoSubtext}>A KELLER COMPANY</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={coverStyles.content}>
        {/* Title Block */}
        <Text style={coverStyles.projectName}>{projectName}</Text>
        <Text style={coverStyles.projectLocation}>{location}</Text>
        <View style={coverStyles.accentBar} />
        <Text style={coverStyles.reportType}>Weekly Progress Report</Text>
        <Text style={coverStyles.weekEnding}>Week Ending: {weekEnding}</Text>

        {/* Photo Strip */}
        {showStrip && (
          <View style={coverStyles.photoStrip}>
            {stripPhotos.map((photo: any, i: number) => (
              photo?.url ? (
                <Image
                  key={i}
                  src={photo.url}
                  style={coverStyles.stripPhoto}
                />
              ) : (
                <View key={i} style={coverStyles.stripPhotoPlaceholder} />
              )
            ))}
          </View>
        )}

        {/* Client Info Grid */}
        <View style={coverStyles.infoGrid}>
          <View style={coverStyles.infoRow}>
            <Text style={coverStyles.infoLabel}>Client:</Text>
            <Text style={coverStyles.infoValue}>{clientCompany}</Text>
          </View>
          <View style={coverStyles.infoRow}>
            <Text style={coverStyles.infoLabel}>Job #:</Text>
            <Text style={coverStyles.infoValueMuted}>{jobNumber}</Text>
          </View>
        </View>
      </View>

      {/* Safety Banner - Moved up to allow Footer below */}
      <View style={[coverStyles.safetyBanner, { bottom: 30 }]}>
        <Text style={coverStyles.safetyText}>Safety is a core value</Text>
      </View>

      {/* Footer (Manual placement for Cover Page) */}
      <View style={{
        position: 'absolute',
        bottom: 10,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 6,
      }}>
         <Text style={{ fontSize: 7, color: COLORS.textMuted }}>
           {projectName} - Weekly Report
         </Text>
         <Text style={{ fontSize: 7, color: COLORS.textMuted }} render={({ pageNumber, totalPages }) => (
           `${pageNumber} of ${totalPages}`
         )} fixed />
      </View>
    </View>
  );
}
