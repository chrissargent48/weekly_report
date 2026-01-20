export interface ProjectConfig {
  identity: {
    projectName: string;
    subtitle: string;
    jobNumber: string;
    location: string;
    companyAddress: string; // [NEW] Our company address
    logoUrl?: string; // [NEW] Project/Company Logo
  };
  personnel: {
    // RECON Key Personnel - dynamic list to add more staff
    recon: {
      id?: string;   // [NEW] For stable DnD
      name: string;
      role: string;  // "Project Manager", "Superintendent", "Site Safety", etc.
      email: string;
      phone: string;
    }[];
    // Client - company with one or more representatives
    client: {
      company: string;
      address: string; 
      representatives: {
        id?: string;   // [NEW] For stable DnD
        name: string;
        role: string;  // "Owner's Rep", "Project Manager", etc.
        email: string;
        phone: string;
      }[];
    };
    // Engineer of Record - company with representatives
    engineer: {
      company: string;
      address: string; 
      representatives: {
        id?: string;   // [NEW] For stable DnD
        name: string;
        role: string;  // "Lead Engineer", "Inspector", etc.
        email: string;
        phone: string;
      }[];
    };
    // Other stakeholders (subcontractors, inspectors, utilities, etc.)
    stakeholders: {
      id?: string;   // [NEW] For stable DnD
      name: string;
      role: string;
      company: string;
      location?: string; 
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

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  profilePicture?: string; // Base64 data URL
}

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

// Change Management: Field Directives
export interface FieldDirective {
  id: string;
  number: string;              // "FD-001"
  dateIssued: string;
  description: string;
  issuedBy: string;            // Who issued the FD
  estimatedCost?: number;
  // Level of Effort (alternative to exact cost)
  timeImpact?: 'None' | 'Minor' | 'Moderate' | 'Major';  // None, 1-3 days, 1-2 weeks, 2+ weeks
  costImpact?: 'TBD' | 'Minor' | 'Moderate' | 'Major';   // TBD, <$5K, $5-25K, $25K+
  scopeImpact?: 'None' | 'Addition' | 'Deletion' | 'Modification';
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Incorporated';
  relatedCO?: string;          // Link to Change Order if incorporated
}

// Change Management: Change Orders
export interface ChangeOrder {
  id: string;
  number: string;              // "CO-001"
  dateSubmitted: string;
  dateApproved?: string;
  description: string;
  amount: number;
  // Level of Effort (alternative to exact amount)
  timeImpact?: 'None' | 'Minor' | 'Moderate' | 'Major';  // None, 1-3 days, 1-2 weeks, 2+ weeks
  costImpact?: 'TBD' | 'Minor' | 'Moderate' | 'Major';   // TBD, <$5K, $5-25K, $25K+
  scopeImpact?: 'None' | 'Addition' | 'Deletion' | 'Modification';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  linkedFDs?: string[];        // Field directives that led to this CO
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
  lostTime: { week: number; ytd: number };       // "Lost Time Accident or Restricted Duty"
  stopWorks: { week: number; ytd: number };      // "Total Number of Stop Works"
  hofs: { week: number; ytd: number };           // "Hazard Observation Forms"
  safetyAudits: { week: number; ytd: number };   // "Safety Audits (Weekly SSO, WSP, CAMC)"
}

export interface SafetyObservation {
  id: string;
  date: string;
  type: 'Positive' | 'Corrective' | 'Near Miss';
  description: string;
  actionTaken?: string;
  reportedBy?: string;
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

// Look Ahead item for 3-week planning
export interface LookAheadEntry {
  id: string;
  type: 'schedule' | 'custom'; // From schedule or manually added
  taskId?: string;             // Reference to MasterTask.id (for schedule type)
  wbs?: string;                // WBS code for display
  description: string;         // Task name or custom text
  baselineStart?: string;      // Original baseline start from schedule
  baselineFinish?: string;     // Original baseline finish from schedule
  forecastStart?: string;      // User-adjusted forecast start
  forecastFinish?: string;     // User-adjusted forecast finish
  included: boolean;           // Whether to include in look ahead report
  notes?: string;              // Additional notes
}

export interface PhotoEntry {
  id: string;
  url: string; // Local path or data URL
  caption: string;
  directionLooking: string; // "North", "SW", etc.
}

export interface ManpowerEntry {
  id: string;
  type: 'recon' | 'subcontractor'; // Which section
  category?: 'management' | 'field'; // For RECON: management vs field staff
  location?: 'onsite' | 'remote'; // Where they worked from
  name: string; // Person name (optional for subcontractors)
  company?: string; // Company name (for subcontractors)
  role: string; // "Laborer", "Operator", trade
  sortOrder?: number; // For drag-and-drop reordering
  // Daily hours tracking: key = day name, value = hours worked
  dailyHours: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

export interface EquipmentEntry {
  id: string;
  type: string; // "Excavator", "Dozer", etc.
  status: 'Active' | 'Standby' | 'Down' | 'Demobilized';
  notes: string;
  // [NEW] Daily Usage Hours (Mon-Sun)
  dailyHours: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
  // [NEW] Delivery & Pickup Dates
  dates: {
      delivery: string; // YYYY-MM-DD
      pickup: string;   // YYYY-MM-DD
  };
}

export interface MaterialDelivery {
    id: string;
    date: string; // YYYY-MM-DD
    description: string; // e.g. "Class 5 Rock"
    quantity: number;
    uom: string; // "TON", "CY", "EA"
    ticketNumber?: string;
    notes?: string;
}

export interface ProcurementEntry {
    id: string;
    item: string;
    vendor?: string;
    status: 'Ordered' | 'Shipped' | 'Delivered' | 'Delayed' | 'Pending';
    eta?: string;         // YYYY-MM-DD
    deliveryDate?: string; // YYYY-MM-DD
    notes?: string;
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
    weeklyTopic?: string;              // NEW: Weekly safety topic
    weeklyTopicNotes?: string;         // NEW: Notes about the topic
    observations?: SafetyObservation[]; // NEW: Observations log
    narrative: string;                  // "Safety Action Items"
  };

  resources: {
      manpower: ManpowerEntry[];
      equipment: {
          onSite: EquipmentEntry[];
          mobilized: string[]; // Legacy string array, maybe deprecate or keep for simple inputs
          demobilized: string[];
      };
      materials: MaterialDelivery[]; 
      procurement: ProcurementEntry[]; // [NEW] Procurement / Long Lead Items
  };

  progress: {
    bidItems: WeeklyBidEntry[]; // CHANGED: Now uses WeeklyBidEntry
    activitiesThisWeek: string[];
    lookAheadItems?: LookAheadEntry[]; // NEW: Schedule-driven look ahead
    lookAheadThreeWeek?: string[];     // DEPRECATED: Keep for migration
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
  
  // Change Management
  fieldDirectives?: FieldDirective[];
  changeOrders?: ChangeOrder[];
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

export interface PrintSectionConfig {
    id: 'overview' | 'weather' | 'progress' | 'lookahead' | 'manpower' | 'equipment' | 'materials' | 'safety' | 'financials' | 'photos' | 'procurement' | 'issues' | 'schedule' | 'documents';
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
