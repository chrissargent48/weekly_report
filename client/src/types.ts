import { 
  ProjectConfig as SharedProjectConfig,
  WeeklyReport as SharedWeeklyReport,
  ProjectBaselines as SharedProjectBaselines,
  WeatherDay,
  SafetyStats,
  SafetyObservation,
  WeeklyBidEntry,
  Invoice,
  ScheduleMilestone,
  LookAheadEntry,
  PhotoEntry,
  ManpowerEntry,
  EquipmentEntry,
  MaterialDelivery,
  ProcurementEntry,
  IssueEntry,
  RfiEntry,
  SubmittalEntry,
  FieldDirective,
  ChangeOrder,
  CanvasNode,
  ReportLayout
} from '@shared/schemas';

// Re-export shared types
export type ProjectConfig = SharedProjectConfig;
export type WeeklyReport = SharedWeeklyReport;
export type ProjectBaselines = SharedProjectBaselines;

export type {
  WeatherDay,
  SafetyStats,
  SafetyObservation,
  WeeklyBidEntry,
  Invoice,
  ScheduleMilestone,
  LookAheadEntry,
  PhotoEntry,
  ManpowerEntry,
  EquipmentEntry,
  MaterialDelivery,
  ProcurementEntry,
  IssueEntry,
  RfiEntry,
  SubmittalEntry,
  FieldDirective,
  ChangeOrder,
  CanvasNode,
  ReportLayout
};

// --- CLIENT SPECIFIC TYPES ---

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  profilePicture?: string; // Base64 data URL
}

export interface PrintSectionConfig {
    id: 'overview' | 'weather' | 'progress' | 'lookahead' | 'manpower' | 'equipment' | 'materials' | 'safety' | 'financials' | 'photos' | 'procurement' | 'issues' | 'schedule' | 'documents' | 'key_personnel';
    label: string;
    included: boolean;
}

export interface PrintOptions {
    sections: PrintSectionConfig[];
    logoScale?: number; // percentage (e.g. 100)
    logoAlign?: 'left' | 'center' | 'right';
    heroPhotoIndex?: number; // Index of photo to use as hero (default: 0 = first photo)
    stripPhotoIndexes?: number[]; // Indexes of photos for the strip (default: [1,2,3])
    spacing?: 'compact' | 'standard' | 'relaxed';
}
