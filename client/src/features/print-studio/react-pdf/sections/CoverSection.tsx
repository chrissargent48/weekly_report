/**
 * Cover Section for @react-pdf/renderer
 *
 * Renders the first page with pixel-perfect layout matching the HTML preview:
 * - Header with hero image/gradient and logo overlay
 * - Title block with project name, location, accent bar, report type
 * - Photo strip (3 photos)
 * - Client info block
 * - Safety banner at bottom
 * - Page footer with page numbers
 *
 * Layout breakdown (from mockup):
 * ┌─────────────────────────────────────────────────┐
 * │ ┌─────────────────────────────────────────────┐ │
 * │ │           HERO IMAGE (full width)          │ │
 * │ │    ┌──────────────┐                        │ │
 * │ │    │ RECON LOGO   │  (positioned top-left) │ │
 * │ │    │ A Keller Co  │                        │ │
 * │ │    └──────────────┘                        │ │
 * │ └─────────────────────────────────────────────┘ │
 * │                                                 │
 * │  Project Name - Title                           │
 * │  Location (teal text)                           │
 * │  ─────────────── (golden accent bar)            │
 * │                                                 │
 * │  WEEKLY PROGRESS REPORT                         │
 * │  Week Ending: 2026-01-18  (teal text)           │
 * │                                                 │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
 * │  │ Photo 1 │ │ Photo 2 │ │ Photo 3 │           │
 * │  └─────────┘ └─────────┘ └─────────┘           │
 * │                                                 │
 * │                        (spacer pushes info down)│
 * │                                                 │
 * │  Client:    PPG Industries, Inc                 │
 * │  Job #:     850030                              │
 * │                                                 │
 * │  ┌─────────────────────────────────────────┐   │
 * │  │       Safety is a core value            │   │
 * │  └─────────────────────────────────────────┘   │
 * │ ─────────────────────────────────────────────── │
 * │  Project Name...            Page 1 of 14        │
 * └─────────────────────────────────────────────────┘
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
  // Main container - fills entire page
  container: {
    flex: 1,
    position: 'relative',
  },

  // ===== HEADER SECTION (Hero Image + Logo) =====
  header: {
    width: '100%',
    height: COVER.HEADER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Gradient overlay on hero image
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  // Fallback solid background when no hero image
  headerFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  // Logo positioning
  logoContainer: {
    position: 'absolute',
    top: 24,
    left: 32,
  },
  logoContainerCenter: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoContainerRight: {
    position: 'absolute',
    top: 24,
    right: 32,
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

  // ===== CONTENT AREA =====
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 70, // Space for safety banner + footer
  },

  // ===== TITLE BLOCK =====
  titleBlock: {
    marginBottom: 16,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
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
    borderRadius: 2,
  },
  reportType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  weekEnding: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // ===== PHOTO STRIP =====
  photoStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  stripPhotoContainer: {
    flex: 1,
    height: 90,
  },
  stripPhoto: {
    width: '100%',
    height: 90,
    objectFit: 'cover',
    borderRadius: 3,
  },
  stripPhotoPlaceholder: {
    flex: 1,
    height: 90,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },

  // ===== CLIENT INFO =====
  infoGrid: {
    marginTop: 'auto', // Push to bottom of flex container
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
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

  // ===== SAFETY BANNER =====
  safetyBanner: {
    position: 'absolute',
    bottom: 30, // Above footer
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

  // ===== FOOTER =====
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
});

export function CoverSection({ config, reportData, projectConfig }: CoverSectionProps) {
  // ===== DATA EXTRACTION =====

  // Hero photo (main background image)
  const heroIndex = config.heroPhotoIndex ?? 0;
  const heroPhoto = reportData.photos?.[heroIndex];
  const hasHeroImage = heroPhoto?.url && heroPhoto.url.length > 0;

  // Strip photos (3 photos below title)
  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const stripPhotos = stripIndexes
    .map((idx) => reportData.photos?.[idx])
    .filter(Boolean)
    .slice(0, 3);
  const showStrip = config.showCoverPhotos !== false && stripPhotos.length > 0;

  // Logo configuration
  const logoUrl = projectConfig.identity?.logoUrl;
  const hasLogo = logoUrl && logoUrl.length > 0;
  const logoScale = (config.logoScale || 100) / 100;

  // Logo alignment style selection
  const getLogoContainerStyle = () => {
    switch (config.logoAlign) {
      case 'center':
        return coverStyles.logoContainerCenter;
      case 'right':
        return coverStyles.logoContainerRight;
      default:
        return coverStyles.logoContainer;
    }
  };

  // Project info
  const projectName = projectConfig.identity?.projectName || 'Project Name';
  const location =
    projectConfig.identity?.location ||
    projectConfig.identity?.companyAddress ||
    '';
  const clientCompany =
    projectConfig.personnel?.client?.company || 'Client';
  const jobNumber = projectConfig.identity?.jobNumber || '00-00000';
  const weekEnding = reportData.weekEnding || '';

  // Footer visibility
  const showFooter = config.showFooter !== false;
  const showPageNumbers = config.showPageNumbers !== false;

  return (
    <View style={coverStyles.container}>
      {/* ===== HEADER SECTION ===== */}
      <View style={coverStyles.header}>
        {/* Hero Image or Fallback Background */}
        {hasHeroImage ? (
          <>
            <Image
              src={heroPhoto.url}
              style={[
                coverStyles.heroImage,
                {
                  objectPosition: `${config.heroPhotoPosition?.x ?? 50}% ${
                    config.heroPhotoPosition?.y ?? 50
                  }%`,
                },
              ]}
            />
            {/* Teal overlay on image */}
            <View style={coverStyles.headerOverlay} />
          </>
        ) : (
          // Solid teal background fallback
          <View style={coverStyles.headerFallback} />
        )}

        {/* Logo - positioned based on config */}
        <View
          style={[
            getLogoContainerStyle(),
            { transform: `scale(${logoScale})` },
          ]}
        >
          {hasLogo ? (
            <Image src={logoUrl} style={coverStyles.logoImage} />
          ) : (
            <View>
              <Text style={coverStyles.logoText}>RECON</Text>
              <Text style={coverStyles.logoSubtext}>A KELLER COMPANY</Text>
            </View>
          )}
        </View>
      </View>

      {/* ===== MAIN CONTENT ===== */}
      <View style={coverStyles.content}>
        {/* Title Block */}
        <View style={coverStyles.titleBlock}>
          <Text style={coverStyles.projectName}>{projectName}</Text>
          {location && (
            <Text style={coverStyles.projectLocation}>{location}</Text>
          )}
          <View style={coverStyles.accentBar} />
          <Text style={coverStyles.reportType}>Weekly Progress Report</Text>
          <Text style={coverStyles.weekEnding}>Week Ending: {weekEnding}</Text>
        </View>

        {/* Photo Strip */}
        {showStrip && (
          <View style={coverStyles.photoStrip}>
            {stripPhotos.map((photo: any, i: number) => (
              <View key={i} style={coverStyles.stripPhotoContainer}>
                {photo?.url ? (
                  <Image src={photo.url} style={coverStyles.stripPhoto} />
                ) : (
                  <View style={coverStyles.stripPhotoPlaceholder} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Client Info Grid - pushed to bottom by marginTop: auto */}
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

      {/* ===== SAFETY BANNER ===== */}
      <View style={coverStyles.safetyBanner}>
        <Text style={coverStyles.safetyText}>Safety is a core value</Text>
      </View>

      {/* ===== FOOTER ===== */}
      {showFooter && (
        <View style={coverStyles.footer}>
          <Text style={coverStyles.footerText}>
            {projectName} - Weekly Report
          </Text>
          {showPageNumbers && (
            <Text
              style={coverStyles.footerText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

export default CoverSection;
