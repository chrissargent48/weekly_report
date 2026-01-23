import { z } from 'zod';
import { 
    ProjectConfigSchema,
    WeeklyReportSchema,
    ProjectBaselinesSchema,
    MasterBidItemSchema,
    MasterTaskSchema,
    TaskBidLinkSchema,
    IssueEntrySchema,
    RfiEntrySchema,
    SubmittalEntrySchema,
    WeatherDaySchema,
    SafetyStatsSchema,
    InvoiceSchema,
    ScheduleMilestoneSchema,
    PhotoEntrySchema,
    ManpowerEntrySchema,
    EquipmentEntrySchema,
    MaterialDeliverySchema,
    ProcurementEntrySchema,
    ReportLayoutSchema,
    CanvasNodeSchema
} from '../shared/schemas';

// --- SHARED TYPES ---
// We export the Types inferred from the Shared Schemas.
// This ensures that the Server uses the Exact Same Structure as the Validation Logic.

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;
export type ProjectBaselines = z.infer<typeof ProjectBaselinesSchema>;

// Sub-types often used in server logic
export type MasterBidItem = z.infer<typeof MasterBidItemSchema>;
export type MasterTask = z.infer<typeof MasterTaskSchema>;
export type TaskBidLink = z.infer<typeof TaskBidLinkSchema>;

export type WeatherDay = z.infer<typeof WeatherDaySchema>;
export type SafetyStats = z.infer<typeof SafetyStatsSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type ScheduleMilestone = z.infer<typeof ScheduleMilestoneSchema>;
export type PhotoEntry = z.infer<typeof PhotoEntrySchema>;
export type ManpowerEntry = z.infer<typeof ManpowerEntrySchema>;
export type EquipmentEntry = z.infer<typeof EquipmentEntrySchema>;
export type MaterialDelivery = z.infer<typeof MaterialDeliverySchema>;
export type ProcurementEntry = z.infer<typeof ProcurementEntrySchema>;

export type IssueEntry = z.infer<typeof IssueEntrySchema>;
export type RfiEntry = z.infer<typeof RfiEntrySchema>;
export type SubmittalEntry = z.infer<typeof SubmittalEntrySchema>;

export type ReportLayout = z.infer<typeof ReportLayoutSchema>;
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
