/**
 * Cover Section for @react-pdf/renderer
 *
 * Renders the first page with pixel-perfect layout:
 * - Full-bleed hero image section (~45% of page, 350pt)
 * - Semi-transparent teal overlay on hero image
 * - Logo positioned in top-left corner
 * - Title block with project name, location, accent bar, report type
 * - Photo strip (stretches available photos to fill width)
 * - Client info block
 * - Safety banner at bottom
 * - Page footer with page numbers
 *
 * Layout breakdown:
 * ┌─────────────────────────────────────────────────┐
 * │ ┌─────────────────────────────────────────────┐ │
 * │ │           HERO IMAGE (full bleed)          │ │
 * │ │    ┌──────────────┐                        │ │
 * │ │    │ LOGO         │  (top-left, from file) │ │
 * │ │    └──────────────┘                        │ │
 * │ └─────────────────────────────────────────────┘ │
 * │                                                 │
 * │  Project Name - Title                           │
 * │  ─────────────── (golden accent bar)            │
 * │  Location (teal text)                           │
 * │                                                 │
 * │  WEEKLY PROGRESS REPORT                         │
 * │  Week Ending: 2026-01-18  (teal text)           │
 * │                                                 │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
 * │  │ Photo 1 │ │ Photo 2 │ │ Photo 3 │           │
 * │  └─────────┘ └─────────┘ └─────────┘           │
 * │         (photos stretch to fill width)          │
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
import { AccentLine } from '../components';
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

  // ===== HEADER SECTION (Hero Image + Logo) - FULL BLEED =====
  header: {
    width: '100%',
    height: COVER.HEADER_HEIGHT, // 350pt (~45% of page)
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
  // Semi-transparent teal overlay (~85% opacity)
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  // Solid teal background when no hero image
  headerFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
  },

  // ===== LOGO POSITIONING =====
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
    maxHeight: 60,
    maxWidth: 180,
    objectFit: 'contain',
  },
  // Fallback text logo (when no image)
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginTop: 2,
  },
  logoAccent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent, // Yellow accent
    letterSpacing: 1,
  },

  // ===== CONTENT AREA (with margins) =====
  content: {
    flex: 1,
    paddingHorizontal: PAGE.MARGIN_LEFT, // 40pt margins
    paddingTop: 40, // Increased top padding
    paddingBottom: COVER.SAFETY_BANNER_HEIGHT + COVER.FOOTER_HEIGHT + 16, // Space for banner + footer
  },

  // ===== TITLE BLOCK =====
  titleBlock: {
    marginBottom: 16,
  },
  projectName: {
    fontSize: 30, // Increased from 22
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 1.2,
  },
  projectLocation: {
    fontSize: 16, // Increased from 12
    color: COLORS.primaryDark, // Darker teal
    marginBottom: 12,
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
  },

  // ===== PHOTO STRIP =====
  photoStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
    height: COVER.PHOTO_STRIP_HEIGHT, // 100pt
  },
  stripPhoto: {
    flex: 1, // Stretches to fill available width
    height: '100%',
    objectFit: 'cover',
    borderRadius: 4,
  },
  stripPhotoPlaceholder: {
    flex: 1,
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // ===== CLIENT INFO =====
  infoGrid: {
    marginTop: 'auto', // Push to bottom
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  infoLabel: {
    width: 50,
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
    bottom: COVER.FOOTER_HEIGHT + 4, // Above footer
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
    bottom: 8,
    left: PAGE.MARGIN_LEFT,
    right: PAGE.MARGIN_RIGHT,
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

  // Strip photos - get available photos and stretch them
  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const stripPhotos = stripIndexes
    .map((idx) => reportData.photos?.[idx])
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo?.url));
  const showStrip = config.showCoverPhotos !== false && stripPhotos.length > 0;

  // Logo configuration
  const logoUrl = projectConfig.identity?.logoUrl;
  const hasLogo = logoUrl && logoUrl.length > 0;
  const logoScale = (config.logoScale || 100) / 100;

  // Calculate scaled logo dimensions
  const scaledLogoHeight = 60 * logoScale;
  const scaledLogoWidth = 180 * logoScale;

  // Logo alignment style
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
      {/* ===== HEADER SECTION (Full Bleed) ===== */}
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
            {/* Semi-transparent teal overlay */}
            <View style={coverStyles.headerOverlay} />
          </>
        ) : (
          <View style={coverStyles.headerFallback} />
        )}

        {/* Logo */}
        <View style={getLogoContainerStyle()}>
          {hasLogo ? (
            <Image
              src={logoUrl}
              style={{
                maxHeight: scaledLogoHeight,
                maxWidth: scaledLogoWidth,
                objectFit: 'contain',
              }}
            />
          ) : (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={coverStyles.logoText}>REC</Text>
                <Text style={coverStyles.logoAccent}>O</Text>
                <Text style={coverStyles.logoText}>N</Text>
              </View>
              <Text style={coverStyles.logoSubtext}>A KELLER COMPANY</Text>
            </View>
          )}
        </View>
      </View>

      {/* ===== MAIN CONTENT (with margins) ===== */}
      <View style={coverStyles.content}>
        {/* Title Block */}
        <View style={coverStyles.titleBlock}>
          <Text style={coverStyles.projectName}>{projectName}</Text>
          <AccentLine width={100} height={3} marginBottom={12} />
          {location && (
            <Text style={coverStyles.projectLocation}>{location}</Text>
          )}
          <Text style={coverStyles.reportType}>Weekly Progress Report</Text>
          <Text style={coverStyles.weekEnding}>Week Ending: {weekEnding}</Text>
        </View>

        {/* Photo Strip - stretches available photos */}
        {showStrip && (
          <View style={coverStyles.photoStrip}>
            {stripPhotos.map((photo, i) => (
              <Image
                key={i}
                src={photo.url}
                style={coverStyles.stripPhoto}
              />
            ))}
          </View>
        )}

        {/* Client Info Grid - pushed to bottom */}
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
