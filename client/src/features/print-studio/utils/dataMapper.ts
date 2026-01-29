import { ProjectConfig, WeeklyReport } from '../../../types';

export interface ReportData {
  // Cover
  projectName: string;
  clientName: string;
  projectAddress: string;
  reportDate: string;
  reportNumber: number;
  periodStart: string;
  periodEnd: string;
  
  // Executive Summary
  executiveSummary: string;

  // Progress
  activitiesThisWeek: Array<{
    activity: string;
    status: string;
    percentComplete: string;
    notes: string;
  }>;

  // Look Ahead
  lookAhead: Array<{
    activity: string;
    date?: string;
  }>;

  // Photos
  photos: Array<{
    url: string;
    caption: string;
    date: string;
  }>;

  // Safety
  safetyStats: {
    nearMisses: { week: number; ytd: number };
    firstAids: { week: number; ytd: number };
    recordables: { week: number; ytd: number };
    lostTime: { week: number; ytd: number };
    stopWorks: { week: number; ytd: number }; // Fixed casing
  };

  // Weather
  weatherDays: Array<{
    date: string;
    day: string;
    condition: string;
    tempHigh: number;
    tempLow: number;
    wind: number;
    precipitation: number; // mapped from hoursLost for now if not explicit? Or just 0 defaults
    workImpact: string;
    notes: string;
  }>;

  configs: Record<string, any>;
  jobNumber: string;
  logoUrl?: string;
  availablePhotos: Array<{
    id: string;
    url: string;
    caption: string;
  }>;
}

export function mapReportData(
  report: WeeklyReport, 
  config: ProjectConfig,
  sectionConfigs?: Record<string, any>
): ReportData {
  // Helper to safely get client name whether string or object
  const getClientName = () => {
    if (!config.personnel?.client) return 'Client Name';
    if (typeof config.personnel.client === 'string') return config.personnel.client;
    return config.personnel.client.company || 'Client Name';
  };

  return {
    // Cover Page Data
    projectName: config.identity?.projectName || 'Project Name',
    clientName: getClientName(),
    projectAddress: config.identity?.location || '',
    jobNumber: config.identity?.jobNumber || 'N/A',
    logoUrl: config.identity?.logoUrl,
    reportDate: report.weekEnding,
    reportNumber: 1, // TODO: Calculate this based on report history if needed
    periodStart: report.periodStart,
    periodEnd: report.weekEnding,

    // Executive Summary
    executiveSummary: report.overview?.executiveSummary || '',

    // Progress
    // Mapping string array to object for now, or using custom lookup if available
    activitiesThisWeek: (report.progress?.activitiesThisWeek || []).map(activity => ({
      activity: activity,
      status: 'In Progress', // Defaulting since source is just string
      percentComplete: '', 
      notes: ''
    })),

    // Look Ahead
    // Support both simple string array (current schema) or future structured items
    lookAhead: (report.progress?.lookAheadThreeWeek || []).map(item => ({
       activity: item,
       // date: 'Upcoming' // No date in string array
    })),

    // Photos
    photos: (report.photos || []).map(p => ({
      url: p.url,
      caption: p.caption,
      date: p.date ? new Date(p.date).toLocaleDateString() : ''
    })),

    // Safety
    safetyStats: {
      nearMisses: report.safety?.stats?.nearMisses || { week: 0, ytd: 0 },
      firstAids: report.safety?.stats?.firstAids || { week: 0, ytd: 0 },
      recordables: report.safety?.stats?.recordables || { week: 0, ytd: 0 },
      lostTime: report.safety?.stats?.lostTime || { week: 0, ytd: 0 }, // Check casing in schema
      stopWorks: report.safety?.stats?.stopWorks || { week: 0, ytd: 0 },
    },

    // Weather Data
    weatherDays: (report.overview?.weather || []).map(day => ({
        date: day.date,
        day: day.day || new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        condition: day.condition,
        tempHigh: day.tempHigh,
        tempLow: day.tempLow,
        wind: day.wind,
        precipitation: 0, // Not explicitly in schema yet, defaulting
        workImpact: day.hoursLost > 0 ? `${day.hoursLost} hrs lost` : 'None',
        notes: day.notes
    })),

    availablePhotos: (report.photos || []).map(p => ({
      id: p.id,
      url: p.url,
      caption: p.caption || ''
    })),

    configs: sectionConfigs || {},
  };
}

/** Legacy / Placeholder for Puck compatibility if needed later */
export function mapReportToPuckData(report: any): any {
  return {
    content: [],
    root: { props: { title: report.weekEnding } }
  };
}

export function mapPuckDataToReport(puckData: any, originalReport: WeeklyReport): WeeklyReport {
  return originalReport;
}
