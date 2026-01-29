import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../utils/dataMapper';

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#008B8B',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#9CA3AF',
  },
  photoDetails: {
    padding: 8,
  },
  caption: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#374151',
    marginBottom: 4,
  },
  date: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  noPhotos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noPhotosText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  }
});

interface PhotosSectionProps {
  data: ReportData;
  config?: {
    columns?: number;
    showCaptions?: boolean;
    showDates?: boolean;
    marginTop?: number;
    marginBottom?: number;
  };
  documentSettings?: any;
}

export const PhotosSection: React.FC<PhotosSectionProps> = ({ data, config = {}, documentSettings }) => {
  const {
      columns = 2,
      showCaptions = true,
      showDates = true,
      marginTop: configMarginTop,
      marginBottom: configMarginBottom
  } = config;

  const margins = documentSettings?.defaultMargins || { top: 24, bottom: 24, left: 24, right: 24 };
  const applyToAll = documentSettings?.applyToAll || false;

  const marginTop = applyToAll ? margins.top : (configMarginTop ?? margins.top);
  const marginBottom = applyToAll ? margins.bottom : (configMarginBottom ?? margins.bottom);
  const paddingLeft = margins.left;
  const paddingRight = margins.right;

  // Calculate widths based on columns
  const gap = 10;
  // Available width is 612 (LETTER width) - margins
  const availableContentWidth = 612 - paddingLeft - paddingRight;
  const itemWidth = (availableContentWidth - (gap * (columns - 1))) / columns;

  return (
    <View style={[styles.container, { marginTop, marginBottom, paddingLeft, paddingRight }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Photos</Text>
      </View>

      <View style={styles.grid}>
        {data.photos.length > 0 ? (
          data.photos.map((photo, i) => (
            <View key={i} style={[styles.photoItem, { width: itemWidth }]}>
              {photo.url ? (
                <Image src={photo.url} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                    <Text>No Image</Text>
                </View>
              )}
              
              {(showCaptions || showDates) && (
                <View style={styles.photoDetails}>
                  {showCaptions && <Text style={styles.caption}>{photo.caption || 'No caption'}</Text>}
                  {showDates && <Text style={styles.date}>{photo.date}</Text>}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.noPhotos}>
            <Text style={styles.noPhotosText}>No photos uploaded for this week.</Text>
          </View>
        )}
      </View>
    </View>
  );
};
