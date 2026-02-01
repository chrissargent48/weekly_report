import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { WidgetProps } from '../types/widgetTypes';

// Shared PDF styles
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  }
});

/**
 * PDF Bridge
 * ----------
 * Renders widgets using @react-pdf/renderer primitives.
 * This is used for:
 * 1. The Final PDF Output
 * 2. Visual previews that mimic the PDF exactly
 */
export const PdfBridge = <T extends any>({ type, data, config }: WidgetProps<T>) => {
  const customStyle = config?.style || {};

  switch (type) {
    case 'text':
      return (
        <View style={[styles.container, customStyle]}>
          <Text style={styles.text}>{String(data)}</Text>
        </View>
      );

    case 'table':
      // Placeholder for PDF Table
      // This will eventually consume the LayoutFragment data to render
      // only the slice of rows allocated to this page.
      return (
        <View style={[styles.container, customStyle]}>
           <Text style={[styles.title, { fontSize: 10, color: '#666' }]}>
             [Table: {config?.title}]
           </Text>
           {/* 
             TODO: Implement detailed row rendering here.
             We will reuse the same logic for header/body/footer cells
             as the Phantom Renderer to ensure 1:1 match.
           */}
           <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 4 }}>
             <Text style={styles.text}>Row Data Placeholder</Text>
           </View>
        </View>
      );

    case 'chart':
      // High-DPI Chart Rasterization Handling
      // In PDF mode, we can't render Recharts directly.
      // We expect 'data' to contain a pre-serialized base64 image
      // OR we trigger a conversion here (less optimal for sync rendering).
      
      const chartImage = (data as any)?.chartImageBuffer;
      
      if (chartImage) {
        return (
          <View style={[styles.container, customStyle]}>
            <Image 
              src={chartImage} 
              style={{ width: '100%', objectFit: 'contain' }} 
            />
          </View>
        );
      }
      
      return (
         <View style={[styles.container, { height: 150, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999', fontSize: 10 }}>
              [Chart: Visualization not available in PDF yet]
            </Text>
            <Text style={{ color: '#aaa', fontSize: 8 }}>
              Requires Canvas High-DPI Serialization
            </Text>
         </View>
      );

    case 'summary':
       return (
         <View style={[styles.container, customStyle]}>
            {config?.title && <Text style={styles.title}>{config.title}</Text>}
            <Text style={styles.text}>
               Summary Data Present
            </Text>
         </View>
       );

    default:
      return (
        <View style={{ padding: 10, borderColor: 'red', borderWidth: 1 }}>
          <Text style={{ color: 'red' }}>Unknown Widget: {type}</Text>
        </View>
      );
  }
};
