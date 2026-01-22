/**
 * SVG Icons for @react-pdf/renderer
 *
 * These are hand-crafted SVG icons that render natively in PDF.
 * Based on Lucide icon paths but optimized for react-pdf.
 */

import React from 'react';
import { Svg, Path, Circle, G } from '@react-pdf/renderer';

interface IconProps {
  size?: number;
  color?: string;
}

// ========== WEATHER ICONS ==========

/**
 * Sun icon - clear/sunny weather
 */
export function SunIcon({ size = 24, color = '#f59e0b' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" fill={color} />
      <Path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Cloud icon - cloudy/overcast weather
 */
export function CloudIcon({ size = 24, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Cloud with rain icon - rainy weather
 */
export function CloudRainIcon({ size = 24, color = '#3b82f6' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.5 13H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Cloud with snow icon - snowy weather
 */
export function CloudSnowIcon({ size = 24, color = '#93c5fd' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.5 13H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="16" r="1" fill={color} />
      <Circle cx="8" cy="20" r="1" fill={color} />
      <Circle cx="12" cy="18" r="1" fill={color} />
      <Circle cx="12" cy="22" r="1" fill={color} />
      <Circle cx="16" cy="16" r="1" fill={color} />
      <Circle cx="16" cy="20" r="1" fill={color} />
    </Svg>
  );
}

/**
 * Wind icon - windy weather
 */
export function WindIcon({ size = 24, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ========== UI ICONS ==========

/**
 * Shield icon - safety related
 */
export function ShieldIcon({ size = 16, color = '#16a34a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Check circle icon - completed/positive status
 */
export function CheckCircleIcon({ size = 16, color = '#16a34a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * Alert triangle icon - warning/issue
 */
export function AlertTriangleIcon({ size = 16, color = '#dc2626' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Info icon - informational
 */
export function InfoIcon({ size = 16, color = '#3b82f6' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Package icon - materials/procurement
 */
export function PackageIcon({ size = 16, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Truck icon - delivery/materials
 */
export function TruckIcon({ size = 16, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="5.5" cy="18.5" r="2.5" fill={color} stroke={color} strokeWidth="2" />
      <Circle cx="18.5" cy="18.5" r="2.5" fill={color} stroke={color} strokeWidth="2" />
    </Svg>
  );
}

/**
 * Target icon - look ahead/goals
 */
export function TargetIcon({ size = 16, color = '#0891b2' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

/**
 * Dollar sign icon - financials
 */
export function DollarSignIcon({ size = 16, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * File text icon - documents
 */
export function FileTextIcon({ size = 16, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Calendar icon - schedule
 */
export function CalendarIcon({ size = 16, color = '#71717a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ========== PROGRESS INDICATORS ==========

/**
 * Circular progress indicator using arc path
 * @param percent - 0 to 100
 * @param size - diameter in points
 */
export function CircularProgress({
  percent = 0,
  size = 24,
  strokeWidth = 3,
  backgroundColor = '#e4e4e7',
  progressColor = '#0891b2',
  completeColor = '#16a34a',
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  completeColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const normalizedPercent = Math.min(Math.max(percent, 0), 100);

  // Color based on completion
  const color = normalizedPercent >= 100 ? completeColor : progressColor;

  // Calculate arc path for progress
  // Start at top (12 o'clock position)
  const startAngle = -90;
  const endAngle = startAngle + (normalizedPercent / 100) * 360;

  // Convert angle to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate start and end points
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  // Large arc flag (1 if > 180 degrees)
  const largeArc = normalizedPercent > 50 ? 1 : 0;

  // Arc path (only if percent > 0)
  const arcPath =
    normalizedPercent > 0
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
      : '';

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      {normalizedPercent > 0 && (
        <Path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

export default {
  SunIcon,
  CloudIcon,
  CloudRainIcon,
  CloudSnowIcon,
  WindIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  PackageIcon,
  TruckIcon,
  TargetIcon,
  DollarSignIcon,
  FileTextIcon,
  CalendarIcon,
  CircularProgress,
};
