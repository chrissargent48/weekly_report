import { ProjectConfig, WeeklyReport } from '../../../types';
import { resolveImageUrl } from './resolveImageUrl';

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
  
  // Bid Items (Detailed Progress)
  bidItems: Array<{
    itemNumber: string;
    description: string;
    thisWeekQty: number;
    toDateQty: number;
    unit: string;
    contractQty: number;
  }>;

  // Look Ahead
  lookAhead: Array<{
    activity: string;
    date?: string;
  }>;

  // Photos
  photos: Array<{
    id: string;
    url: string;
    caption: string; // This will now hold the "directionLooking"
    date: string;
  }>;

  // Resources (passed through)
  resources: WeeklyReport['resources'];

  // Issues & Changes
  issues: WeeklyReport['issues'];
  fieldDirectives: WeeklyReport['fieldDirectives'];
  changeOrders: WeeklyReport['changeOrders'];

  // Financials
  financials: WeeklyReport['financials'];

  // Safety
  safetyStats: {
    nearMisses: { week: number; ytd: number };
    firstAids: { week: number; ytd: number };
    recordables: { week: number; ytd: number };
    lostTime: { week: number; ytd: number };
    stopWorks: { week: number; ytd: number };
    hofs: { week: number; ytd: number };
    safetyAudits: { week: number; ytd: number };
  };

  // Safety Detail (full safety block for parity with HTML preview)
  safety: WeeklyReport['safety'];

  // Overview (full overview block for parity with HTML preview)
  overview: WeeklyReport['overview'];

  // Weather
  weatherDays: Array<{
    date: string;
    day: string;
    condition: string;
    tempHigh: number;
    tempLow: number;
    wind: number;
    precipitation: number;
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
  originalReport: WeeklyReport;
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
    logoUrl: resolveImageUrl(config.identity?.logoUrl),
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

    // Bid Items (New mapping)
    bidItems: (report.progress?.bidItems || []).map(item => ({
      itemNumber: item.itemNumber,
      description: item.description,
      thisWeekQty: item.thisWeekQty,
      toDateQty: item.toDateQty,
      unit: 'LS', // Defaulting as it's not in WeeklyBidEntry
      contractQty: 0 // Defaulting as it's not in WeeklyBidEntry
    })),

    // Look Ahead
    // Support both simple string array (current schema) or future structured items
    lookAhead: (report.progress?.lookAheadThreeWeek || []).map(item => ({
       activity: item,
       // date: 'Upcoming' // No date in string array
    })),

    // Photos – resolve all URLs to absolute before they touch the UI or PDF
    // CRITICAL: Mapping directionLooking to caption as per PRD
    photos: (report.photos || []).map(p => ({
      id: p.id,
      url: resolveImageUrl(p.url),
      caption: p.directionLooking || p.caption || 'No caption', 
      date: p.date ? new Date(p.date).toLocaleDateString() : ''
    })),

    // Resources (Pass through)
    resources: report.resources || {
      manpower: [],
      equipment: { onSite: [], mobilized: [], demobilized: [] },
      materials: [],
      procurement: []
    },

    // Issues & Changes (Pass through)
    issues: report.issues || [],
    fieldDirectives: report.fieldDirectives || [],
    changeOrders: report.changeOrders || [],

    // Financials (Pass through)
    financials: report.financials || { invoices: [], summary: { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 } },

    // Safety
    safetyStats: {
      nearMisses: report.safety?.stats?.nearMisses || { week: 0, ytd: 0 },
      firstAids: report.safety?.stats?.firstAids || { week: 0, ytd: 0 },
      recordables: report.safety?.stats?.recordables || { week: 0, ytd: 0 },
      lostTime: report.safety?.stats?.lostTime || { week: 0, ytd: 0 },
      stopWorks: report.safety?.stats?.stopWorks || { week: 0, ytd: 0 },
      hofs: report.safety?.stats?.hofs || { week: 0, ytd: 0 },
      safetyAudits: report.safety?.stats?.safetyAudits || { week: 0, ytd: 0 },
    },

    // Safety Detail
    safety: report.safety,

    // Overview
    overview: report.overview,

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
      url: resolveImageUrl(p.url),
      caption: p.directionLooking || p.caption || ''
    })),

    configs: sectionConfigs || {},
    originalReport: report,
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

