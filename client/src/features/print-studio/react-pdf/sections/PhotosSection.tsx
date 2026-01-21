/**
 * Photos Section for @react-pdf/renderer
 *
 * Grid layout of site photos with captions
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PAGE } from '../styles';
import { SectionHeader } from '../primitives';
import { PrintConfig, PagePlacement } from '../../config/printConfig.types';
import { WeeklyReport, PhotoEntry } from '../../../../types';

interface PhotosSectionProps {
  config: PrintConfig;
  reportData: WeeklyReport;
  placement?: PagePlacement;
}

const photosStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoContainer: {
    width: '48%',
    marginBottom: 10,
  },
  photoImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
  },
  photoPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  captionContainer: {
    marginTop: 4,
  },
  caption: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  description: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  direction: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 1,
  },
  emptyText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

// Photos per page constant
const PHOTOS_PER_PAGE = 6;

export function PhotosSection({ config, reportData, placement }: PhotosSectionProps) {
  const isContinued = placement?.continuesFromPrevious ?? false;
  const photos = reportData.photos || [];

  // Exclude photos used for cover (hero and strip)
  const heroIndex = config.heroPhotoIndex ?? 0;
  const stripIndexes = config.stripPhotoIndexes || [1, 2, 3];
  const coverIndexes = new Set([heroIndex, ...stripIndexes]);

  const availablePhotos = photos.filter((_, idx) => !coverIndexes.has(idx));

  // Handle data slicing for pagination
  const startIdx = placement?.dataRange?.start ?? 0;
  const endIdx = placement?.dataRange?.end ?? availablePhotos.length;
  const visiblePhotos = availablePhotos.slice(startIdx, endIdx);

  if (visiblePhotos.length === 0) {
    return (
      <View style={photosStyles.container}>
        <SectionHeader title="Site Photos" isContinued={isContinued} />
        <Text style={photosStyles.emptyText}>No photos available.</Text>
      </View>
    );
  }

  return (
    <View style={photosStyles.container}>
      <SectionHeader title="Site Photos" isContinued={isContinued} />
      <View style={photosStyles.grid}>
        {visiblePhotos.map((photo, i) => (
          <View key={photo.id || i} style={photosStyles.photoContainer} wrap={false}>
            {photo.url ? (
              <Image src={photo.url} style={photosStyles.photoImage} />
            ) : (
              <View style={photosStyles.photoPlaceholder}>
                <Text style={photosStyles.placeholderText}>No image</Text>
              </View>
            )}
            <View style={photosStyles.captionContainer}>
              {photo.caption && (
                <Text style={photosStyles.caption}>{photo.caption}</Text>
              )}
              {photo.description && (
                <Text style={photosStyles.description}>{photo.description}</Text>
              )}
              {photo.directionLooking && (
                <Text style={photosStyles.direction}>Looking {photo.directionLooking}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
