export interface ProjectConfig {
  identity: {
    projectName: string;
    subtitle: string;
    jobNumber: string;
    location: string;
  };
  personnel: {
    // RECON Key Personnel - dynamic list to add more staff
    recon: {
      name: string;
      role: string;  // "Project Manager", "Superintendent", "Site Safety", etc.
      email: string;
      phone: string;
    }[];
    // Client - company with one or more representatives
    client: {
      company: string;
      representatives: {
        name: string;
        role: string;  // "Owner's Rep", "Project Manager", etc.
        email: string;
        phone: string;
      }[];
    };
    // Engineer of Record - company with representatives
    engineer: {
      company: string;
      representatives: {
        name: string;
        role: string;  // "Lead Engineer", "Inspector", etc.
        email: string;
        phone: string;
      }[];
    };
    // Other stakeholders (subcontractors, inspectors, utilities, etc.)
    stakeholders: {
      name: string;
      role: string;
      company: string;
      email: string;
      phone: string;
    }[];
  };
  contract: {
    originalValue: number;
    startDate: string;
    substantialCompletionDate: string;
  };
  distributionList: {
    to: string[];
    cc: string[];
  };
}

// --- MASTER DATA (BASELINES) ---

export interface MasterBidItem {
  id: string; // e.g. "bid-2.01"
  itemNumber: string; // "2.01"
  description: string;
  unit: string; // CY, LS, TON
  contractQty: number;
  unitPrice: number;
  totalValue: number; // contractQty * unitPrice
}

export interface MasterTask {
  id: string; // e.g. "task-001"
  wbs: string; // "1.2.1"
  name: string;
  baselineStart: string; // YYYY-MM-DD or "Mon 12/8/25" format
  baselineFinish: string;
  baselineDuration: number; // Days
  // Actuals
  actualStart?: string;
  actualFinish?: string;
  forecastFinish?: string;
  percentComplete: number; // From schedule or computed from linked bid items
  isCriticalPath: boolean;
  linkedBidItem?: string; // Bid item number (e.g. "1.01") from Schedule.xlsx for auto-linking
}

export interface ProjectBaselines {
  bidItems: MasterBidItem[];
  schedule: MasterTask[];
  // Enhanced Link Table: Task ID -> Array of Bid Item Links with allocation percentages
  // allocationPercent: What % of the bid item's total value applies to this task
  // This enables a single bid item to be split across multiple schedule tasks
  taskLinks: Record<string, TaskBidLink[]>; 
}

// NEW: Enhanced task-bid link that supports percentage allocation
// Example: "Earthwork" task links to bid item "2.01 Excavation" at 40% allocation
// This means 40% of bid item 2.01's total value drives this task's progress
export interface TaskBidLink {
  bidItemId: string;           // Reference to MasterBidItem.id
  allocationPercent: number;   // 0-100, what % of bid item total applies to this task
}

// --- WEEKLY REPORT DATA ---

export interface WeatherDay {
  date: string; // YYYY-MM-DD
  day?: string; // "Mon", "Tue"... (Optional now)
  tempHigh: number;
  tempLow: number;
  wind: number;
  condition: string;
  notes: string; // "Rain Event - No Work", "None"
  hoursLost: number;
}

export interface SafetyStats {
  nearMisses: { week: number; ytd: number };
  firstAids: { week: number; ytd: number };
  recordables: { week: number; ytd: number };
  lostTime: { week: number; ytd: number };
  stopWorks: { week: number; ytd: number };
}

// Renamed from BidItem to distinguish from Master
export interface WeeklyBidEntry {
  itemId: string; // Reference to MasterBidItem.id
  itemNumber: string; // Snapshot for display
  description: string; // Snapshot for display
  thisWeekQty: number; // The user input
  toDateQty: number;   // Calculated
}

export interface Invoice {
  id: string;
  period: string;
  invoiceNumber: string;
  amount: number;
  retainage: number;
  datePaid: string;
}

export interface ScheduleMilestone {
  id: string;
  milestone: string;
  startDate: string;
  finishDate: string;
  status: 'Not Started' | 'In Progress' | 'Complete';
}

export interface PhotoEntry {
  id: string;
  url: string; // Local path or data URL
  caption: string;
  directionLooking: string; // "North", "SW", etc.
}

export interface ManpowerEntry {
  id: string;
  entity: string; // "RECON", "Subcontractor"
  role: string; // "Laborer", "Operator"
  headcount: number;
  hours: number;
}

export interface EquipmentEntry {
  id: string;
  type: string;
  status: 'Active' | 'Standby' | 'Down' | 'Demobilized';
  notes: string;
}

export interface WeeklyReport {
  id: string; // Usually the weekEnding date
  weekEnding: string; // YYYY-MM-DD
  periodStart: string; // [NEW] YYYY-MM-DD (Usually weekEnding - 6 days)
  
  overview: {
    executiveSummary: string; // Rich text / Plain text
    weather: WeatherDay[];
    kpis: {
      percentComplete: number; // EV / Contract
      schedulePerformanceIndex: number; // SPI
      // manHoursWeek is now derived from manpower entries, but kept for cache/compat
      manHoursWeek: number; 
      manHoursTotal: number;
      safetyIncidents: number; // usually 0
      weatherDaysLost: number;
    };
  };

  safety: {
    stats: SafetyStats;
    narrative: string; // "Safety Action Items"
  };

  resources: {
      manpower: ManpowerEntry[];
      equipment: {
          onSite: EquipmentEntry[];
          mobilized: string[];
          demobilized: string[];
      };
  };

  progress: {
    bidItems: WeeklyBidEntry[]; // CHANGED: Now uses WeeklyBidEntry
    activitiesThisWeek: string[];
    lookAheadThreeWeek: string[];
  };

  financials: {
    invoices: Invoice[];
    summary: { // Auto-calculated usually, but can be stored
      earnedToDate: number;
      remainingContractValue: number;
      totalBilled: number;
    };
  };

  schedule: {
    milestones: ScheduleMilestone[];
    analysis: string; // "Schedule Implications & Critical Path Analysis"
  };

  photos: PhotoEntry[];
  
  // [NEW] Modules
  issues: IssueEntry[];
  rfis: RfiEntry[];
  submittals: SubmittalEntry[];
}

export interface IssueEntry {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'Open' | 'Closed' | 'Blocked';
}

export interface RfiEntry {
  id: string;
  rfiNumber: string;
  subject: string;
  dateSent: string;
  dateDue: string;
  status: 'Draft' | 'Open' | 'Closed';
}

export interface SubmittalEntry {
  id: string;
  submittalNumber: string;
  description: string;
  dateSent: string;
  dateNeededBy: string;
  status: 'New' | 'Revision';
}
