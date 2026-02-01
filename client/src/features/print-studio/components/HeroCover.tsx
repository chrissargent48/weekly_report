import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { CoverConfig } from '../config/printConfig.types';

const styles = StyleSheet.create({
  // The full page container (includes Bleed area)
  heroContainer: {
    position: 'absolute', // Absolute to page
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    zIndex: -1, // Ensure it's behind content if used in a flow, but for Cover it's usually the only thing
  },
  // 1. Background Layer (Z-Index 0) - Extends to Bleed
  backgroundImage: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // 2. Overlay Layer (Z-Index 1) - Visual tint
  overlay: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  // 3. Safe Zone (Z-Index 2) - Constrained to Print Margins
  // This mimics the "Print Safe" area (e.g. 20mm margins)
  safeZone: {
    position: 'absolute',
    top: 56,    // ~20mm
    left: 56,
    right: 56,
    bottom: 56,
    flexDirection: 'column',
    justifyContent: 'space-between', // Push logo to bottom, title to top
  },
  // Title Block
  titleBlock: {
    flexDirection: 'column',
  },
  reportTitle: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Helvetica',
  },
  // User Logo - Absolute within Safe Zone or Flex positioned
  userLogo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    alignSelf: 'flex-end', // Flexbox positioning for logo
  }
});

interface HeroCoverProps {
  title: string;
  config?: CoverConfig;
  logoUrl?: string;
  bgUrl?: string;
}

/**
 * HERO COVER PAGE
 * ---------------
 * Uses Stacking Context pattern to handle full-bleed backgrounds with "Safe Zone" content.
 */
export const HeroCover: React.FC<HeroCoverProps> = ({ 
  title, 
  config, 
  logoUrl, 
  bgUrl 
}) => {
  const overlayColor = config?.heroOverlayColor || '#000000';
  const overlayOpacity = config?.heroOverlayOpacity ?? 0.4;
  
  // Decide which photo to use (hero, or first cover photo, or fallback)
  const backgroundSource = bgUrl || config?.coverPhotos?.[0];

  return (
    <View style={styles.heroContainer}>
      {/* Background - Fills Bleed */}
      {backgroundSource && (
        <Image 
          src={backgroundSource} 
          style={styles.backgroundImage} 
        />
      )}
      
      {/* Overlay Layer */}
      <View style={[styles.overlay, { backgroundColor: overlayColor, opacity: overlayOpacity }]} />

      {/* Content - Trapped in Safe Zone */}
      <View style={styles.safeZone}>
          <View style={styles.titleBlock}>
            <Text style={styles.reportTitle}>{title}</Text>
            {config?.subtitle && (
                <Text style={styles.reportSubtitle}>{config.subtitle}</Text>
            )}
            {config?.safetySlogan && (
                <Text style={[styles.reportSubtitle, { fontSize: 12, marginTop: 12, fontStyle: 'italic' }]}>
                    "{config.safetySlogan}"
                </Text>
            )}
          </View>

          {logoUrl && (
             <Image src={logoUrl} style={styles.userLogo} />
          )}
      </View>
    </View>
  );
};
