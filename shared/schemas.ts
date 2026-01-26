import { z } from 'zod';

// --- PRIMITIVES ---

export const StyleSchema = z.object({
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  textAlign: z.enum(['left', 'right', 'center', 'justify']).optional(),
  backgroundColor: z.string().optional(),
});

// --- MASTER DATA (BASELINES) ---

export const MasterBidItemSchema = z.object({
  id: z.string(),
  itemNumber: z.string(),
  description: z.string(),
  unit: z.string(),
  contractQty: z.number(),
  unitPrice: z.number(),
  totalValue: z.number(),
});

export const MasterTaskSchema = z.object({
  id: z.string(),
  wbs: z.string(),
  name: z.string(),
  baselineStart: z.string(),
  baselineFinish: z.string(),
  baselineDuration: z.number(),
  actualStart: z.string().optional(),
  actualFinish: z.string().optional(),
  forecastFinish: z.string().optional(),
  percentComplete: z.number(),
  isCriticalPath: z.boolean(),
  linkedBidItem: z.string().optional(),
});

export const TaskBidLinkSchema = z.object({
  bidItemId: z.string(),
  allocationPercent: z.number(),
});

export const ProjectBaselinesSchema = z.object({
  bidItems: z.array(MasterBidItemSchema),
  schedule: z.array(MasterTaskSchema),
  taskLinks: z.record(z.string(), z.array(TaskBidLinkSchema)),
});

// --- WEEKLY REPORT SUB-SCHEMAS ---

export const WeatherDaySchema = z.object({
  date: z.string(),
  day: z.string().optional(),
  tempHigh: z.number(),
  tempLow: z.number(),
  wind: z.number(),
  condition: z.string(),
  notes: z.string(),
  hoursLost: z.number(),
});

export const SafetyStatsSchema = z.object({
  nearMisses: z.object({ week: z.number(), ytd: z.number() }),
  firstAids: z.object({ week: z.number(), ytd: z.number() }),
  recordables: z.object({ week: z.number(), ytd: z.number() }),
  lostTime: z.object({ week: z.number(), ytd: z.number() }),
  stopWorks: z.object({ week: z.number(), ytd: z.number() }),
  hofs: z.object({ week: z.number(), ytd: z.number() }).optional(),
  safetyAudits: z.object({ week: z.number(), ytd: z.number() }).optional(),
});

export const SafetyObservationSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['Positive', 'Corrective', 'Near Miss']),
  description: z.string(),
  actionTaken: z.string().optional(),
  reportedBy: z.string().optional(),
});

export const WeeklyBidEntrySchema = z.object({
  itemId: z.string(),
  itemNumber: z.string(),
  description: z.string(),
  thisWeekQty: z.number(),
  toDateQty: z.number(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  period: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  retainage: z.number(),
  datePaid: z.string(),
});

export const ScheduleMilestoneSchema = z.object({
  id: z.string(),
  milestone: z.string(),
  startDate: z.string(),
  finishDate: z.string(),
  status: z.enum(['Not Started', 'In Progress', 'Complete']),
});

export const LookAheadEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['schedule', 'custom']),
  taskId: z.string().optional(),
  wbs: z.string().optional(),
  description: z.string(),
  baselineStart: z.string().optional(),
  baselineFinish: z.string().optional(),
  forecastStart: z.string().optional(),
  forecastFinish: z.string().optional(),
  included: z.boolean(),
  notes: z.string().optional(),
});

export const PhotoEntrySchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string(),
  directionLooking: z.string(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const DailyHoursSchema = z.object({
  mon: z.number(),
  tue: z.number(),
  wed: z.number(),
  thu: z.number(),
  fri: z.number(),
  sat: z.number(),
  sun: z.number(),
});

export const ManpowerEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['recon', 'subcontractor']),
  category: z.enum(['management', 'field']).optional(),
  location: z.enum(['onsite', 'remote']).optional(),
  name: z.string(),
  company: z.string().optional(),
  role: z.string(),
  sortOrder: z.number().optional(),
  dailyHours: DailyHoursSchema,
});

export const EquipmentEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.enum(['Active', 'Standby', 'Down', 'Demobilized']),
  notes: z.string(),
  dailyHours: DailyHoursSchema.optional(),
  dates: z.object({
      delivery: z.string(),
      pickup: z.string(),
  }).optional(),
});

export const MaterialDeliverySchema = z.object({
    id: z.string(),
    date: z.string(),
    description: z.string(),
    quantity: z.number(),
    uom: z.string(),
    ticketNumber: z.string().optional(),
    notes: z.string().optional(),
});

export const ProcurementEntrySchema = z.object({
    id: z.string(),
    item: z.string(),
    vendor: z.string().optional(),
    status: z.enum(['Ordered', 'Shipped', 'Delivered', 'Delayed', 'Pending']),
    eta: z.string().optional(),
    deliveryDate: z.string().optional(),
    notes: z.string().optional(),
});

export const IssueEntrySchema = z.object({
  id: z.string(),
  description: z.string(),
  assignedTo: z.string(),
  dueDate: z.string(),
  status: z.enum(['Open', 'Closed', 'Blocked']),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  impact: z.string().optional(),
  actionPlan: z.string().optional(),
});

export const RfiEntrySchema = z.object({
  id: z.string(),
  rfiNumber: z.string(),
  subject: z.string(),
  dateSent: z.string(),
  dateDue: z.string(),
  status: z.enum(['Draft', 'Open', 'Closed']),
});

export const SubmittalEntrySchema = z.object({
  id: z.string(),
  submittalNumber: z.string(),
  description: z.string(),
  dateSent: z.string(),
  dateNeededBy: z.string(),
  status: z.enum(['New', 'Revision']),
});


// --- CHANGE MANAGEMENT ---

export const FieldDirectiveSchema = z.object({
  id: z.string(),
  number: z.string(),
  dateIssued: z.string(),
  description: z.string(),
  issuedBy: z.string(),
  estimatedCost: z.number().optional(),
  timeImpact: z.enum(['None', 'Minor', 'Moderate', 'Major']).optional(),
  costImpact: z.enum(['TBD', 'Minor', 'Moderate', 'Major']).optional(),
  scopeImpact: z.enum(['None', 'Addition', 'Deletion', 'Modification']).optional(),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Rejected', 'Incorporated']),
  relatedCO: z.string().optional(),
});

export const ChangeOrderSchema = z.object({
  id: z.string(),
  number: z.string(),
  dateSubmitted: z.string(),
  dateApproved: z.string().optional(),
  description: z.string(),
  amount: z.number(),
  timeImpact: z.enum(['None', 'Minor', 'Moderate', 'Major']).optional(),
  costImpact: z.enum(['TBD', 'Minor', 'Moderate', 'Major']).optional(),
  scopeImpact: z.enum(['None', 'Addition', 'Deletion', 'Modification']).optional(),
  status: z.enum(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected']),
  linkedFDs: z.array(z.string()).optional(),
});

// --- CANVAS LAYOUT ---

export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['section', 'image', 'text', 'shape']),
  sectionType: z.enum(['cover', 'header', 'overview', 'weather', 'progress', 'manpower', 'financials', 'photos']).optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  zIndex: z.number().optional(),
  content: z.string().optional(),
  style: z.object({
    fontSize: z.number().optional(),
    fontColor: z.string().optional(),
    backgroundColor: z.string().optional(),
  }).optional(),
});

export const ReportLayoutSchema = z.object({
  pages: z.array(z.object({
    id: z.string(),
    items: z.array(CanvasNodeSchema),
  })),
});

// --- REPORT SCHEMA ---

export const WeeklyReportSchema = z.object({
  id: z.string(),
  weekEnding: z.string(),
  periodStart: z.string(),
  
  overview: z.object({
    executiveSummary: z.string(),
    weather: z.array(WeatherDaySchema),
    kpis: z.object({
      percentComplete: z.number(),
      schedulePerformanceIndex: z.number(),
      manHoursWeek: z.number(),
      manHoursTotal: z.number(),
      safetyIncidents: z.number(),
      weatherDaysLost: z.number(),
    }),
  }),

  safety: z.object({
    stats: SafetyStatsSchema,
    weeklyTopic: z.string().optional(),
    weeklyTopicNotes: z.string().optional(),
    observations: z.array(SafetyObservationSchema).optional(),
    narrative: z.string(),
  }),

  resources: z.object({
      manpower: z.array(ManpowerEntrySchema),
      equipment: z.object({
          onSite: z.array(EquipmentEntrySchema),
          mobilized: z.array(z.string()),
          demobilized: z.array(z.string()),
      }),
      materials: z.array(MaterialDeliverySchema),
      procurement: z.array(ProcurementEntrySchema),
  }),

  progress: z.object({
    bidItems: z.array(WeeklyBidEntrySchema),
    activitiesThisWeek: z.array(z.string()),
    lookAheadItems: z.array(LookAheadEntrySchema).optional(),
    lookAheadThreeWeek: z.array(z.string()).optional(),
  }),

  financials: z.object({
    invoices: z.array(InvoiceSchema),
    summary: z.object({
      earnedToDate: z.number(),
      remainingContractValue: z.number(),
      totalBilled: z.number(),
    }),
  }),

  schedule: z.object({
    milestones: z.array(ScheduleMilestoneSchema),
    analysis: z.string(),
  }),

  photos: z.array(PhotoEntrySchema),
  
  issues: z.array(IssueEntrySchema),
  rfis: z.array(RfiEntrySchema),
  submittals: z.array(SubmittalEntrySchema),

  // Change Management
  fieldDirectives: z.array(FieldDirectiveSchema).optional(),
  changeOrders: z.array(ChangeOrderSchema).optional(),

  // Custom Layout Data
  layout: ReportLayoutSchema.optional(),
});


// --- TYPE EXPORTS ---

// --- CONFIG SCHEMA ---

export const ProjectConfigSchema = z.object({
  identity: z.object({
    projectName: z.string(),
    subtitle: z.string(),
    jobNumber: z.string(),
    location: z.string(),
    companyAddress: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  personnel: z.object({
    recon: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      role: z.string(),
      email: z.string(),
      phone: z.string(),
    })),
    client: z.object({
      company: z.string(),
      address: z.string().optional(),
      representatives: z.array(z.object({
        id: z.string().optional(),
        name: z.string(),
        role: z.string(),
        email: z.string(),
        phone: z.string(),
      })),
    }),
    engineer: z.object({
      company: z.string(),
      address: z.string().optional(),
      representatives: z.array(z.object({
        id: z.string().optional(),
        name: z.string(),
        role: z.string(),
        email: z.string(),
        phone: z.string(),
      })),
    }),
    stakeholders: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      role: z.string(),
      company: z.string(),
      location: z.string().optional(),
      email: z.string(),
      phone: z.string(),
    })),
  }),
  contract: z.object({
    originalValue: z.number(),
    startDate: z.string(),
    substantialCompletionDate: z.string(),
  }),
  distributionList: z.object({
    to: z.array(z.string()),
    cc: z.array(z.string()),
  }),
});


export type FieldDirective = z.infer<typeof FieldDirectiveSchema>;
export type ChangeOrder = z.infer<typeof ChangeOrderSchema>;
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
export type ReportLayout = z.infer<typeof ReportLayoutSchema>;

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;
export type ProjectBaselines = z.infer<typeof ProjectBaselinesSchema>;
export type MasterBidItem = z.infer<typeof MasterBidItemSchema>;
export type MasterTask = z.infer<typeof MasterTaskSchema>;
export type TaskBidLink = z.infer<typeof TaskBidLinkSchema>;
export type WeatherDay = z.infer<typeof WeatherDaySchema>;
export type SafetyStats = z.infer<typeof SafetyStatsSchema>;
export type SafetyObservation = z.infer<typeof SafetyObservationSchema>;
export type WeeklyBidEntry = z.infer<typeof WeeklyBidEntrySchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type ScheduleMilestone = z.infer<typeof ScheduleMilestoneSchema>;
export type LookAheadEntry = z.infer<typeof LookAheadEntrySchema>;
export type PhotoEntry = z.infer<typeof PhotoEntrySchema>;
export type ManpowerEntry = z.infer<typeof ManpowerEntrySchema>;
export type EquipmentEntry = z.infer<typeof EquipmentEntrySchema>;
export type MaterialDelivery = z.infer<typeof MaterialDeliverySchema>;
export type ProcurementEntry = z.infer<typeof ProcurementEntrySchema>;
export type IssueEntry = z.infer<typeof IssueEntrySchema>;
export type RfiEntry = z.infer<typeof RfiEntrySchema>;
export type SubmittalEntry = z.infer<typeof SubmittalEntrySchema>;

