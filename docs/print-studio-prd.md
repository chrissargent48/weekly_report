# 📄 PRINT STUDIO PRD — Weekly Report PDF Generator

> **Document Version**: 1.0.0  
> **Created**: 2026-01-28  
> **Status**: Ready for Implementation  
> **Target**: AI Coding Agents (Claude, Cursor, Copilot)

---

## 🎯 EXECUTIVE SUMMARY

### What We're Building
A fully functional PDF generation system for the Weekly Report Builder application. Users design their weekly construction report in a WYSIWYG "Print Studio" interface, then generate a professional PDF that exactly matches the preview.

### What's Broken Currently
- PDF generates but doesn't match design requirements
- Data from report tabs (Weather, Photos, Progress, etc.) is NOT being pulled into Print Studio
- PUBLISH button doesn't respond
- Rich text, weather tables, and photo captions don't map from existing report data
- Preview doesn't reflect final PDF accurately

### Success Criteria
When this PRD is fully implemented:
1. ✅ User opens Print Studio and sees ALL report data auto-populated
2. ✅ Preview canvas shows exact representation of final PDF
3. ✅ "Generate PDF" creates a PDF that matches preview pixel-for-pixel
4. ✅ All sections pull data from existing report JSON — NO manual re-entry required

---

## 📁 PROJECT STRUCTURE REFERENCE

```
DO NOT CREATE NEW FILES unless explicitly required.
MODIFY EXISTING FILES listed below.

client/src/features/print-studio/
├── react-pdf/
│   ├── components/
│   │   ├── AccentLine.tsx
│   │   ├── PageFooter.tsx
│   │   ├── PageHeader.tsx
│   │   └── SectionWrapper.tsx
│   ├── primitives/
│   │   ├── Icons.tsx
│   │   ├── SectionHeader.tsx
│   │   └── Table.tsx
│   ├── sections/                    # ← PDF SECTION COMPONENTS
│   │   ├── CoverSection.tsx
│   │   ├── WeatherSection.tsx
│   │   ├── ProgressSection.tsx
│   │   ├── LookAheadSection.tsx
│   │   ├── IssuesSection.tsx
│   │   ├── SafetySection.tsx
│   │   ├── ManpowerSection.tsx
│   │   ├── EquipmentSection.tsx
│   │   ├── MaterialsSection.tsx
│   │   ├── ProcurementSection.tsx
│   │   ├── FinancialsSection.tsx
│   │   ├── ScheduleSection.tsx
│   │   ├── PhotosSection.tsx
│   │   ├── ExecutiveSummary.tsx
│   │   └── KeyPersonnelSection.tsx
│   ├── utils/
│   │   ├── dataMapper.ts           # ← DATA MAPPING LOGIC
│   │   ├── coverPageHelper.ts
│   │   ├── gridHelpers.ts
│   │   └── imageProcessing.ts
│   ├── PDFPreview.tsx
│   ├── ReportDocument.tsx          # ← MAIN PDF DOCUMENT
│   └── styles.ts
├── renderers/
│   └── html-preview/               # ← HTML PREVIEW (matches PDF)
│       ├── PageHeader.tsx
│       ├── PreviewPage.tsx
│       └── PrintPreview.tsx
└── components/
    ├── Sidebar.tsx                 # ← SECTION CONTROLS
    ├── PropertiesPanel.tsx
    └── ...

data/
├── [project-id]/
│   ├── config.json                 # ← PROJECT SETUP DATA
│   ├── images/                     # ← UPLOADED PHOTOS
│   └── reports/
│       └── [YYYY-MM-DD].json       # ← WEEKLY REPORT DATA
```

---

## 📊 DATA STRUCTURE REFERENCE

### Project Config: `data/[project-id]/config.json`

```typescript
// EXACT FIELD PATHS — Use these in code
interface ProjectConfig {
  id: string;                              // "8d22c3bd-6f1d-4630-baad-f89d66122c99"
  name: string;                            // "Ford City - Former Facility SLA - 2024 Site Improvements"
  jobNumber: string;                       // "850030"
  address: string;                         // "1696 Ford City Road, Kittanning, PA"
  
  client: {
    companyName: string;                   // "PPG Industries, Inc"
    address: string;                       // "One PPG Place, Pittsburgh, PA 15272"
    representatives: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
  };
  
  logo?: string;                           // Path to project logo image
  
  personnel: Array<{
    id: string;
    name: string;                          // "Chris Sargent"
    role: string;                          // "Project Manager"
    email: string;
    phone: string;
  }>;
}
```

### Weekly Report: `data/[project-id]/reports/[YYYY-MM-DD].json`

```typescript
// EXACT FIELD PATHS — Use these in code
interface WeeklyReport {
  id: string;                              // "2026-01-18"
  weekEnding: string;                      // "2026-01-18"
  periodStart: string;                     // "2026-01-12"
  
  overview: {
    executiveSummary: string;              // Rich text content
    weather: WeatherDay[];                 // Array of 7 days
    kpis: {
      percentComplete: number;
      schedulePerformanceIndex: number;
      manHoursWeek: number;
      manHoursTotal: number;
      safetyIncidents: number;
      weatherDaysLost: number;
    };
  };
  
  safety: {
    stats: SafetyStats;
    narrative: string;
    weeklyTopic: string;
    weeklyTopicNotes: string;
  };
  
  resources: {
    manpower: ManpowerEntry[];
    equipment: {
      onSite: EquipmentEntry[];
      mobilized: EquipmentEntry[];
      demobilized: EquipmentEntry[];
    };
    materials: MaterialEntry[];
    procurement: ProcurementEntry[];
  };
  
  progress: {
    bidItems: BidItemProgress[];           // ← PROGRESS TABLE DATA
    activitiesThisWeek: Activity[];
    lookAheadItems: LookAheadItem[];       // ← LOOK AHEAD DATA
  };
  
  financials: {
    invoices: Invoice[];                   // ← INVOICE REGISTRY
    summary: {
      earnedToDate: number;
      remainingContractValue: number;
      totalBilled: number;
    };
  };
  
  schedule: {
    milestones: Milestone[];
    analysis: string;
  };
  
  photos: Photo[];                         // ← PHOTO DATA
  issues: Issue[];                         // ← ISSUES DATA
  rfis: RFI[];
  submittals: Submittal[];
  fieldDirectives: FieldDirective[];       // ← FIELD DIRECTIVES
  changeOrders: ChangeOrder[];             // ← CHANGE ORDERS
}

// WEATHER DAY STRUCTURE
interface WeatherDay {
  date: string;                            // "2026-01-12"
  condition: string;                       // "Partly Cloudy" | "Rain" | "Snow" | "Sunny" | "Cloudy"
  tempHigh: number;                        // 35
  tempLow: number;                         // 27
  wind: number;                            // 15 (mph)
  hoursLost: number;                       // 0 or hours lost to weather
  notes: string;                           // Optional notes
}

// PHOTO STRUCTURE — CRITICAL
interface Photo {
  id: string;
  url: string;                             // "/uploads/[project-id]/images/[filename].jpg"
  caption: string;                         // Original filename (NOT displayed)
  directionLooking: string;                // ← THIS IS THE CAPTION TO DISPLAY
                                           // e.g., "01-19-26 - Crew laying out alignment"
}

// PROGRESS BID ITEM
interface BidItemProgress {
  itemId: string;
  itemNumber: string;                      // "1.01"
  description: string;                     // "Mobilization/Demobilization"
  thisWeekQty: number;                     // Progress this week
  toDateQty: number;                       // Total progress to date
}

// LOOK AHEAD ITEM
interface LookAheadItem {
  id: string;
  type: string;                            // "schedule"
  taskId: string;
  wbs: string;                             // "5.05"
  description: string;                     // "Install 4in SDR11 HDPE Pipe"
  baselineStart: string;
  baselineFinish: string;
  forecastStart: string;
  forecastFinish: string;
  included: boolean;                       // Whether to include in PDF
}

// INVOICE
interface Invoice {
  id: string;
  period: string;                          // "2025-12-31"
  invoiceNumber: string;                   // "INV-26-006"
  amount: number;                          // 84833.34
  retainage: number;
  datePaid: string;                        // "" if unpaid
}

// FIELD DIRECTIVE
interface FieldDirective {
  id: string;
  number: string;                          // "FD-001"
  dateIssued: string;
  description: string;
  issuedBy: string;
  status: string;                          // "Draft" | "Pending" | "Approved"
  timeImpact: string;                      // "Minor" | "Major" | "None"
  scopeImpact: string;                     // "Addition" | "Deletion" | "None"
}
```

---

## 🖼️ COVER PAGE SPECIFICATION

### Visual Layout (Based on Reference Image)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  [RECON LOGO - White]     HERO IMAGE                    │ │
│ │  Top-left corner          with TEAL OVERLAY             │ │
│ │                           (40% of page height)          │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Ford City - Former Facility SLA - 2024 Site               │
│  Improvements                                               │
│  ─────────────────────────────────────────── (large, bold) │
│                                                             │
│  1696 Ford City Road, Kittanning, PA         (teal, small) │
│                                                             │
│  ═══════════════════════════════════════════ (teal line)   │
│                                                             │
│  WEEKLY PROGRESS REPORT                      (bold, caps)  │
│  Week Ending: 2026-01-18                     (teal)        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Photo   │ │  Photo   │ │  Photo   │   (3 thumbnails)   │
│  │    1     │ │    2     │ │    3     │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  Client:    PPG Industries, Inc                            │
│  Address:   1696 Ford City Road, Kittanning, PA            │
│  Job #:     850030                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         Safety is a core value            (teal banner) ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Ford City - Former Facility SLA...              Page 1    │
└─────────────────────────────────────────────────────────────┘
```

### Cover Page Data Mapping

| Visual Element | Data Source | Field Path |
|----------------|-------------|------------|
| RECON Logo | Static asset | `/assets/recon-logo-white.png` |
| Hero Image | User selection from photos | `report.photos[selectedIndex].url` |
| Teal Overlay | CSS/Style | `rgba(0, 128, 128, 0.7)` or brand teal |
| Project Name | config.json | `config.name` |
| Address | config.json | `config.address` |
| Week Ending | report.json | `report.weekEnding` |
| Photo Thumbnails | First 3 photos | `report.photos.slice(0, 3)` |
| Client | config.json | `config.client.companyName` |
| Job # | config.json | `config.jobNumber` |

### Cover Page Controls (Sidebar)

```typescript
interface CoverPageSettings {
  heroImageId: string | null;              // Selected photo ID for hero
  heroImageZoom: number;                   // 1.0 = 100%
  heroImagePan: { x: number; y: number };  // Offset in pixels
  overlayOpacity: number;                  // 0.0 to 1.0
  overlayColor: string;                    // Hex color (default: brand teal)
  showThumbnails: boolean;                 // Show 3-photo grid
  thumbnailPhotoIds: string[];             // Which photos to show as thumbnails
}
```

---

## 🌤️ WEATHER SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  WEATHER SUMMARY                           (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  │  Sun   │  Mon   │  Tue   │  Wed   │  Thu   │  Fri   │  Sat   │
│  │ 01/12  │ 01/13  │ 01/14  │ 01/15  │ 01/16  │ 01/17  │ 01/18  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│  │  ⛅    │  🌧️    │  🌨️    │  🌨️    │  🌨️    │  🌨️    │  🌨️    │
│  │ Partly │  Rain  │  Snow  │  Snow  │  Snow  │  Snow  │  Snow  │
│  │ Cloudy │        │        │        │        │        │        │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│  │ H: 35° │ H: 46° │ H: 44° │ H: 25° │ H: 32° │ H: 37° │ H: 27° │
│  │ L: 27° │ L: 28° │ L: 26° │ L: 14° │ L: 11° │ L: 26° │ L: 14° │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│  │ 🌬️ 15  │ 🌬️ 14  │ 🌬️ 17  │ 🌬️ 17  │ 🌬️ 12  │ 🌬️ 14  │ 🌬️ 9   │
│  │  mph   │  mph   │  mph   │  mph   │  mph   │  mph   │  mph   │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│  │   —    │ -2 hrs │   —    │   —    │   —    │   —    │   —    │
│  │        │ (Rain) │        │        │        │        │        │
│  └────────┴────────┴────────┴────────┴────────┴────────┴────────┘
│                                                             │
│  Weather Impact Notes:                                      │
│  • 01/13: Rain today lead to impacts in production.         │
│           Estimated reduction was 2 hours                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Weather Data Mapping

| Visual Element | Data Source | Field Path |
|----------------|-------------|------------|
| Date | weather array | `report.overview.weather[i].date` |
| Weather Icon | Derived from condition | Map `condition` → icon |
| Condition Text | weather array | `report.overview.weather[i].condition` |
| High Temp | weather array | `report.overview.weather[i].tempHigh` |
| Low Temp | weather array | `report.overview.weather[i].tempLow` |
| Wind | weather array | `report.overview.weather[i].wind` |
| Hours Lost | weather array | `report.overview.weather[i].hoursLost` |
| Notes | weather array | `report.overview.weather[i].notes` |

### Weather Icon Mapping

```typescript
// DO NOT use external APIs. Map condition string to icon.
const WEATHER_ICONS: Record<string, string> = {
  'Sunny': '☀️',
  'Clear': '☀️',
  'Partly Cloudy': '⛅',
  'Cloudy': '☁️',
  'Overcast': '☁️',
  'Rain': '🌧️',
  'Showers': '🌧️',
  'Thunderstorm': '⛈️',
  'Snow': '🌨️',
  'Sleet': '🌨️',
  'Fog': '🌫️',
  'Windy': '💨',
};

function getWeatherIcon(condition: string): string {
  return WEATHER_ICONS[condition] || '🌡️';
}
```

### Weather Section Controls (Sidebar)

```typescript
interface WeatherSectionSettings {
  visible: boolean;                        // Show/hide section
  forcePageBreak: boolean;                 // Start on new page
}
```

---

## 📈 PROGRESS SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PROGRESS                                  (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  EXECUTIVE SUMMARY                                          │
│  ─────────────────────────────────────────────────────────  │
│  This week's operations focused on site calibration and     │
│  the commencement of drilling. Early in the week, the team  │
│  identified a site alignment discrepancy during GPS         │
│  calibration...                                             │
│                                                             │
│  BID ITEM PROGRESS                                          │
│  ─────────────────────────────────────────────────────────  │
│  ┌────────┬─────────────────────────────┬──────────┬───────┐
│  │ Item # │ Description                 │ This Wk  │ To Dt │
│  ├────────┼─────────────────────────────┼──────────┼───────┤
│  │ 1.01   │ Mobilization/Demobilization │    —     │  0.5  │
│  │ 1.02   │ Pre-Construction Survey...  │   0.2    │  0.2  │
│  │ 5.03   │ Collection Sumps            │    3     │   3   │
│  │ 5.04   │ Sump Casing (2.5 LF SS)     │   18     │  18   │
│  │ ...    │ ...                         │   ...    │  ...  │
│  └────────┴─────────────────────────────┴──────────┴───────┘
│                                                             │
│  Overall Progress: 17% Complete                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Progress Data Mapping

| Visual Element | Data Source | Field Path |
|----------------|-------------|------------|
| Executive Summary | overview | `report.overview.executiveSummary` |
| Bid Item Number | bidItems array | `report.progress.bidItems[i].itemNumber` |
| Bid Item Description | bidItems array | `report.progress.bidItems[i].description` |
| This Week Qty | bidItems array | `report.progress.bidItems[i].thisWeekQty` |
| To Date Qty | bidItems array | `report.progress.bidItems[i].toDateQty` |
| Overall % Complete | kpis | `report.overview.kpis.percentComplete` |

### Progress Table Logic

```typescript
// ONLY show bid items that have progress (thisWeekQty > 0 OR toDateQty > 0)
function getProgressItems(report: WeeklyReport): BidItemProgress[] {
  return report.progress.bidItems.filter(
    item => item.thisWeekQty > 0 || item.toDateQty > 0
  );
}
```

---

## 🔮 LOOK AHEAD SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  LOOK AHEAD (3-WEEK)                       (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  ┌───────┬─────────────────────────────────┬────────────────┐
│  │  WBS  │ Description                     │ Forecast Dates │
│  ├───────┼─────────────────────────────────┼────────────────┤
│  │ 5.05  │ Install 4in SDR11 HDPE Pipe     │ 01/22 - 01/22  │
│  │ 5.06  │ Backfill with No8 Stone         │ 01/23 - 01/23  │
│  │ 5.10  │ Set 5x5x4 Vaults                │ 01/26 - 01/26  │
│  │ 5.05  │ Install Airline and Water Conv. │ 01/26 - 01/27  │
│  │ ...   │ ...                             │ ...            │
│  └───────┴─────────────────────────────────┴────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Look Ahead Data Mapping

| Visual Element | Data Source | Field Path |
|----------------|-------------|------------|
| WBS | lookAheadItems array | `report.progress.lookAheadItems[i].wbs` |
| Description | lookAheadItems array | `report.progress.lookAheadItems[i].description` |
| Forecast Start | lookAheadItems array | `report.progress.lookAheadItems[i].forecastStart` |
| Forecast Finish | lookAheadItems array | `report.progress.lookAheadItems[i].forecastFinish` |

### Look Ahead Filter Logic

```typescript
// ONLY show items where included === true
function getLookAheadItems(report: WeeklyReport): LookAheadItem[] {
  return report.progress.lookAheadItems.filter(item => item.included === true);
}
```

---

## ⚠️ ISSUES SECTION SPECIFICATION

### Conditional Display Logic

```typescript
// This section shows THREE types of items:
// 1. Issues (report.issues)
// 2. Field Directives (report.fieldDirectives)
// 3. Change Orders (report.changeOrders)

// RULE: Only show subsections that have data
// RULE: If ALL three are empty, hide entire section

interface IssuesSectionData {
  hasIssues: boolean;
  hasFieldDirectives: boolean;
  hasChangeOrders: boolean;
  shouldShow: boolean;  // true if ANY of the above is true
}

function getIssuesSectionData(report: WeeklyReport): IssuesSectionData {
  const hasIssues = report.issues.length > 0;
  const hasFieldDirectives = report.fieldDirectives.length > 0;
  const hasChangeOrders = report.changeOrders.length > 0;
  
  return {
    hasIssues,
    hasFieldDirectives,
    hasChangeOrders,
    shouldShow: hasIssues || hasFieldDirectives || hasChangeOrders,
  };
}
```

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ISSUES & CHANGES                          (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  FIELD DIRECTIVES                    (only if data exists)  │
│  ─────────────────────────────────────────────────────────  │
│  ┌────────┬────────┬─────────────────────────┬──────────────┐
│  │ Number │  Date  │ Description             │ Status       │
│  ├────────┼────────┼─────────────────────────┼──────────────┤
│  │ FD-001 │ 01/16  │ Crew directed to auger/ │ Draft        │
│  │        │        │ drill additional loc... │ Time: Minor  │
│  └────────┴────────┴─────────────────────────┴──────────────┘
│                                                             │
│  CHANGE ORDERS                       (only if data exists)  │
│  ─────────────────────────────────────────────────────────  │
│  No change orders this period.       (or table if exists)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📸 PHOTOS SECTION SPECIFICATION

### Visual Layout Options

**Option A: 1 Photo Per Page**
```
┌─────────────────────────────────────────────────────────────┐
│  PHOTOS                                    (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  01-19-26 - Crew laying out alignment/locations of sumps    │
│  ─────────────────────────────────────────── (caption TOP)  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │                                                         ││
│  │                    LARGE PHOTO                          ││
│  │                    (fills width)                        ││
│  │                                                         ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Option B: 2 Photos Per Page (Stacked Vertically)**
```
┌─────────────────────────────────────────────────────────────┐
│  PHOTOS                                    (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  01-19-26 - Crew laying out alignment/locations of sumps    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    PHOTO 1                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  01-19-26 - Fence Removed at SB-09 Location                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    PHOTO 2                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Photo Data Mapping — CRITICAL

```typescript
// ⚠️ CRITICAL: Use directionLooking for caption, NOT caption field
interface Photo {
  id: string;
  url: string;
  caption: string;           // ← DO NOT USE (this is filename)
  directionLooking: string;  // ← USE THIS AS CAPTION
}

function getPhotoCaption(photo: Photo): string {
  // directionLooking contains the actual descriptive caption
  // e.g., "01-19-26 - Crew laying out alignment/locations of sumps"
  return photo.directionLooking || 'No caption';
}
```

### Photo Section Controls (Sidebar)

```typescript
interface PhotoSectionSettings {
  visible: boolean;
  forcePageBreak: boolean;
  layout: '1-per-page' | '2-per-page';
  selectedPhotoIds: string[];              // Which photos to include
  photoOrder: string[];                    // Order of photo IDs
}
```

### Photo Selection UI Logic

```typescript
// Sidebar should show dropdown/list of all photos in report
// User can toggle which photos to include
// User can reorder photos via drag-and-drop or up/down buttons

function getAvailablePhotos(report: WeeklyReport): Photo[] {
  return report.photos;  // All photos from Photos tab
}

function getSelectedPhotos(
  report: WeeklyReport,
  settings: PhotoSectionSettings
): Photo[] {
  const { selectedPhotoIds, photoOrder } = settings;
  
  // Filter to selected photos, maintain order
  return photoOrder
    .filter(id => selectedPhotoIds.includes(id))
    .map(id => report.photos.find(p => p.id === id))
    .filter(Boolean) as Photo[];
}
```

---

## 💰 FINANCIALS SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  FINANCIALS                                (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  INVOICE REGISTRY                                           │
│  ─────────────────────────────────────────────────────────  │
│  ┌──────────┬────────────┬────────────┬──────────┬─────────┐
│  │ Invoice# │   Period   │   Amount   │ Retain.  │  Status │
│  ├──────────┼────────────┼────────────┼──────────┼─────────┤
│  │INV-26-006│ 2025-12-31 │ $84,833.34 │   $0.00  │ Unpaid  │
│  ├──────────┼────────────┼────────────┼──────────┼─────────┤
│  │          │            │            │          │         │
│  │   TOTAL  │            │ $84,833.34 │   $0.00  │         │
│  └──────────┴────────────┴────────────┴──────────┴─────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Financials Data Mapping

| Visual Element | Data Source | Field Path |
|----------------|-------------|------------|
| Invoice Number | invoices array | `report.financials.invoices[i].invoiceNumber` |
| Period | invoices array | `report.financials.invoices[i].period` |
| Amount | invoices array | `report.financials.invoices[i].amount` |
| Retainage | invoices array | `report.financials.invoices[i].retainage` |
| Status | Derived | `datePaid ? 'Paid' : 'Unpaid'` |

### Status Logic

```typescript
function getInvoiceStatus(invoice: Invoice): string {
  return invoice.datePaid && invoice.datePaid !== '' 
    ? `Paid ${formatDate(invoice.datePaid)}` 
    : 'Unpaid';
}
```

---

## 👷 MANPOWER SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  MANPOWER                                  (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  RECON PERSONNEL                                            │
│  ─────────────────────────────────────────────────────────  │
│  ┌──────────────────┬─────────────────┬─────┬─────┬───┬───┬─────┐
│  │ Name             │ Role            │ Mon │ Tue │...│Fri│Total│
│  ├──────────────────┼─────────────────┼─────┼─────┼───┼───┼─────┤
│  │ Chris Sargent    │ Sr Project Mgr  │  8  │  8  │ 8 │ 8 │  40 │
│  │ Corey Allen      │ Superintendent  │ 10  │ 10  │10 │10 │  50 │
│  │ ...              │ ...             │ ... │ ... │...│...│ ... │
│  └──────────────────┴─────────────────┴─────┴─────┴───┴───┴─────┘
│                                                             │
│  SUBCONTRACTORS                                             │
│  ─────────────────────────────────────────────────────────  │
│  ┌──────────────────┬─────────────────┬─────┬─────┬───┬───┬─────┐
│  │ Company          │ Role            │ Mon │ Tue │...│Fri│Total│
│  ├──────────────────┼─────────────────┼─────┼─────┼───┼───┼─────┤
│  │ Keller Group PLC │ Driller         │  0  │  0  │ 8 │10 │  28 │
│  │ ...              │ ...             │ ... │ ... │...│...│ ... │
│  └──────────────────┴─────────────────┴─────┴─────┴───┴───┴─────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Manpower Data Mapping

```typescript
// Separate RECON personnel from subcontractors
function getManpowerData(report: WeeklyReport) {
  const reconPersonnel = report.resources.manpower.filter(
    p => p.type === 'recon'
  );
  const subcontractors = report.resources.manpower.filter(
    p => p.type === 'subcontractor'
  );
  
  return { reconPersonnel, subcontractors };
}

// Calculate total hours for a person
function getTotalHours(entry: ManpowerEntry): number {
  const hours = entry.dailyHours;
  return (hours.mon || 0) + (hours.tue || 0) + (hours.wed || 0) +
         (hours.thu || 0) + (hours.fri || 0) + (hours.sat || 0) +
         (hours.sun || 0);
}
```

---

## 🔧 EQUIPMENT SECTION SPECIFICATION

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  EQUIPMENT                                 (section header) │
│  ═══════════════════════════════════════════════════════════│
│                                                             │
│  ON-SITE EQUIPMENT                                          │
│  ─────────────────────────────────────────────────────────  │
│  ┌────────────────────────────┬──────────┬─────────────────┐
│  │ Equipment                  │  Status  │ Notes           │
│  ├────────────────────────────┼──────────┼─────────────────┤
│  │ Excavator - Cat 320        │  Active  │                 │
│  │ Loader - Cat 926M          │  Active  │                 │
│  │ Mini Excavator - Takeuchi  │  Active  │ Rental extended │
│  └────────────────────────────┴──────────┴─────────────────┘
│                                                             │
│  DEMOBILIZED THIS WEEK                                      │
│  ─────────────────────────────────────────────────────────  │
│  • Mini Ex Breaker (Picked up: 01/12)                       │
│  • Jumping Jack Tamper (Picked up: 01/12)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 HEADER & FOOTER SPECIFICATION

### Header (All Pages After Cover)

```
┌─────────────────────────────────────────────────────────────┐
│ Ford City - Former Facility SLA    Week Ending: 2026-01-18 │
│ ═══════════════════════════════════════════════════════════ │
```

| Position | Content | Data Source |
|----------|---------|-------------|
| Left | Project Name | `config.name` |
| Right | "Week Ending: " + date | `report.weekEnding` |

### Footer (All Pages)

```
│ ═══════════════════════════════════════════════════════════ │
│ PPG Industries, Inc                              Page 2 of 8│
└─────────────────────────────────────────────────────────────┘
```

| Position | Content | Data Source |
|----------|---------|-------------|
| Left | Client name | `config.client.companyName` |
| Right | Page X of Y | Auto-generated |

---

## 🎛️ SECTION ORDER & VISIBILITY

### Default Section Order

```typescript
const DEFAULT_SECTION_ORDER: SectionId[] = [
  'cover',
  'executive-summary',
  'weather',
  'progress',
  'look-ahead',
  'issues',           // Includes issues, field directives, change orders
  'safety',
  'manpower',
  'equipment',
  'materials',
  'procurement',
  'financials',
  'schedule',
  'photos',
];

type SectionId = 
  | 'cover'
  | 'executive-summary'
  | 'weather'
  | 'progress'
  | 'look-ahead'
  | 'issues'
  | 'safety'
  | 'manpower'
  | 'equipment'
  | 'materials'
  | 'procurement'
  | 'financials'
  | 'schedule'
  | 'photos';
```

### Section Visibility Controls

```typescript
interface SectionSettings {
  id: SectionId;
  visible: boolean;
  forcePageBreak: boolean;
  order: number;
}

// Default: All sections visible except those with no data
function getDefaultVisibility(report: WeeklyReport): Record<SectionId, boolean> {
  return {
    'cover': true,
    'executive-summary': report.overview.executiveSummary.length > 0,
    'weather': report.overview.weather.length > 0,
    'progress': report.progress.bidItems.some(i => i.thisWeekQty > 0 || i.toDateQty > 0),
    'look-ahead': report.progress.lookAheadItems.some(i => i.included),
    'issues': report.issues.length > 0 || report.fieldDirectives.length > 0 || report.changeOrders.length > 0,
    'safety': true,
    'manpower': report.resources.manpower.length > 0,
    'equipment': report.resources.equipment.onSite.length > 0,
    'materials': report.resources.materials.length > 0,
    'procurement': report.resources.procurement.length > 0,
    'financials': report.financials.invoices.length > 0,
    'schedule': report.schedule.milestones.length > 0 || report.schedule.analysis.length > 0,
    'photos': report.photos.length > 0,
  };
}
```

---

## 🚫 DO NOT RULES

These rules address past failures. The AI agent MUST follow these without exception.

### Data Mapping Rules

```
❌ DO NOT make external API calls from Print Studio
   All data comes from existing report JSON files.
   Weather data is ALREADY in report.overview.weather — do not fetch from Open-Meteo/NWS.

❌ DO NOT use photo.caption as the display caption
   USE photo.directionLooking instead.
   photo.caption contains the filename, not descriptive text.

❌ DO NOT require manual data entry for fields that exist in report
   Auto-populate EVERYTHING from the report JSON.
   Manual entry is only for overrides/customization.

❌ DO NOT create duplicate data structures
   Use the existing report data directly.
   Do not copy data into a separate "print studio state" object.
```

### Component Rules

```
❌ DO NOT create new files unless explicitly instructed
   Modify existing files in:
   - client/src/features/print-studio/react-pdf/sections/
   - client/src/features/print-studio/react-pdf/utils/dataMapper.ts

❌ DO NOT break existing functionality
   Run tests before committing.
   If a change affects other components, verify they still work.

❌ DO NOT implement features partially
   Each feature must be complete and testable.
   Do not claim "done" until acceptance criteria are met.
```

### Styling Rules

```
❌ DO NOT use arbitrary colors
   Use only brand colors defined in styles.ts or Tailwind config.
   Primary Teal: #0d9488 (or brand-primary)
   Navy: #1e3a5f (or brand-navy)

❌ DO NOT use inline styles in React-PDF components
   Use StyleSheet.create() for all styles.

❌ DO NOT ignore page size constraints
   All content must fit within page margins.
   Tables must not overflow.
```

---

## ✅ ACCEPTANCE CRITERIA

### AC-001: Cover Page Generation

```gherkin
GIVEN a user opens Print Studio for a report with photos
WHEN the Cover Page section is rendered
THEN:
  - Project name displays from config.name
  - Address displays from config.address
  - Week ending date displays from report.weekEnding
  - Client name displays from config.client.companyName
  - Job number displays from config.jobNumber
  - First 3 photos appear as thumbnails (if photos exist)
  - RECON logo appears in hero area
  - "Safety is a core value" banner appears at bottom
```

### AC-002: Weather Section Data Mapping

```gherkin
GIVEN a report with weather data for 7 days
WHEN the Weather section is rendered
THEN:
  - All 7 days appear in the weather table
  - Weather icons match the condition string
  - High and low temperatures display correctly
  - Wind speed displays in mph
  - Hours lost displays for days with weather impacts
  - Notes appear below the table for days with notes
```

### AC-003: Photo Caption Display

```gherkin
GIVEN a report with photos
WHEN the Photos section is rendered
THEN:
  - Caption text comes from photo.directionLooking field
  - Caption appears ABOVE the photo
  - If directionLooking is empty, display "No caption"
  - DO NOT display photo.caption (filename) as the caption
```

### AC-004: Progress Section Data Mapping

```gherkin
GIVEN a report with bid item progress
WHEN the Progress section is rendered
THEN:
  - Executive summary displays from report.overview.executiveSummary
  - Only bid items with thisWeekQty > 0 OR toDateQty > 0 appear
  - Item number, description, this week qty, to date qty columns display
  - Overall percentage complete displays from report.overview.kpis.percentComplete
```

### AC-005: Issues Section Conditional Display

```gherkin
GIVEN a report where:
  - issues array is empty
  - fieldDirectives has 1 item
  - changeOrders is empty
WHEN the Issues section is rendered
THEN:
  - Issues subsection does NOT appear
  - Field Directives subsection DOES appear with data
  - Change Orders subsection does NOT appear

GIVEN a report where all three arrays are empty
THEN:
  - The entire Issues section is hidden
```

### AC-006: PDF Generation Matches Preview

```gherkin
GIVEN a user has configured all sections in Print Studio
WHEN the user clicks "Generate PDF"
THEN:
  - PDF file downloads to user's Downloads folder
  - Filename follows format: {ProjectName}_WeeklyReport_{YYYY-MM-DD}.pdf
  - PDF content matches the preview canvas exactly
  - All section order, visibility, and page breaks are preserved
```

### AC-007: Section Visibility Toggle

```gherkin
GIVEN a user in Print Studio
WHEN the user toggles a section's visibility to OFF
THEN:
  - The section disappears from the preview immediately
  - The section does not appear in the generated PDF
  - Other sections adjust their page positions accordingly
```

### AC-008: Photo Selection and Ordering

```gherkin
GIVEN a report with 10 photos
WHEN the user configures the Photos section
THEN:
  - User sees a list of all 10 photos (showing thumbnail + directionLooking caption)
  - User can select/deselect which photos to include
  - User can reorder selected photos
  - Preview updates to show only selected photos in specified order
```

---

## 🔄 IMPLEMENTATION SEQUENCE

Execute these tasks in order. Each task should be complete before moving to the next.

### Task 1: Fix Data Mapper

**File**: `client/src/features/print-studio/react-pdf/utils/dataMapper.ts`

**Objective**: Ensure all report data maps correctly to PDF sections.

**Requirements**:
1. Create/update mapping functions for each section
2. Use exact field paths from this PRD
3. Handle missing data gracefully (show placeholders, not errors)

```typescript
// Example structure for dataMapper.ts

import { ProjectConfig, WeeklyReport, Photo } from '../../../../types';

export function mapCoverPageData(config: ProjectConfig, report: WeeklyReport) {
  return {
    projectName: config.name,
    address: config.address,
    jobNumber: config.jobNumber,
    clientName: config.client.companyName,
    weekEnding: report.weekEnding,
    thumbnailPhotos: report.photos.slice(0, 3),
  };
}

export function mapWeatherData(report: WeeklyReport) {
  return report.overview.weather.map(day => ({
    date: day.date,
    condition: day.condition,
    icon: getWeatherIcon(day.condition),
    tempHigh: day.tempHigh,
    tempLow: day.tempLow,
    wind: day.wind,
    hoursLost: day.hoursLost,
    notes: day.notes,
  }));
}

export function mapPhotosData(report: WeeklyReport) {
  return report.photos.map(photo => ({
    id: photo.id,
    url: photo.url,
    caption: photo.directionLooking || 'No caption',  // ← CRITICAL: Use directionLooking
  }));
}

// ... additional mapping functions
```

### Task 2: Update Weather Section Component

**File**: `client/src/features/print-studio/react-pdf/sections/WeatherSection.tsx`

**Requirements**:
1. Accept mapped weather data as props
2. Render 7-day table with icons
3. Show weather impact notes below table

### Task 3: Update Photos Section Component

**File**: `client/src/features/print-studio/react-pdf/sections/PhotosSection.tsx`

**Requirements**:
1. Accept mapped photos data as props
2. Display caption from `directionLooking` ABOVE each photo
3. Support 1-per-page and 2-per-page layouts
4. Handle photos with missing captions

### Task 4: Update Progress Section Component

**File**: `client/src/features/print-studio/react-pdf/sections/ProgressSection.tsx`

**Requirements**:
1. Display executive summary text (preserve formatting)
2. Render bid items table (filtered to items with progress)
3. Show overall percentage complete

### Task 5: Update Issues Section Component

**File**: `client/src/features/print-studio/react-pdf/sections/IssuesSection.tsx`

**Requirements**:
1. Conditionally show Issues, Field Directives, Change Orders subsections
2. Hide entire section if all three are empty
3. Format tables consistently

### Task 6: Update Financials Section Component

**File**: `client/src/features/print-studio/react-pdf/sections/FinancialsSection.tsx`

**Requirements**:
1. Show invoice registry table
2. Calculate running totals
3. Display paid/unpaid status

### Task 7: Update Sidebar Controls

**File**: `client/src/features/print-studio/components/Sidebar.tsx`

**Requirements**:
1. List all sections with visibility toggles
2. Show page break controls
3. For Photos section: show photo selection list with checkboxes
4. Support section reordering (drag-and-drop)

### Task 8: Connect PDF Generation

**File**: `client/src/features/print-studio/react-pdf/ReportDocument.tsx`

**Requirements**:
1. Compose all section components
2. Pass mapped data to each section
3. Respect visibility and order settings
4. Generate proper page breaks

### Task 9: Fix Generate PDF Button

**Requirements**:
1. Wire up "Generate PDF" button to pdf generation
2. Generate filename: `{ProjectName}_WeeklyReport_{YYYY-MM-DD}.pdf`
3. Save to Downloads folder
4. Show loading state during generation
5. Show success/error feedback

### Task 10: Sync Preview with PDF

**Requirements**:
1. HTML preview in `renderers/html-preview/` must match PDF output
2. Use same data mapping functions
3. Use equivalent styling (CSS that matches React-PDF styles)

---

## 📝 TESTING CHECKLIST

Before marking any task complete, verify:

- [ ] Component renders without errors
- [ ] Data populates from report JSON (not hardcoded)
- [ ] Preview matches expected layout
- [ ] PDF output matches preview
- [ ] Section visibility toggle works
- [ ] Page breaks work correctly
- [ ] Missing data handled gracefully (no blank pages or errors)
- [ ] Existing features still work (no regressions)

---

## 📚 APPENDIX: Complete Type Definitions

For reference, here are the complete TypeScript interfaces that should exist in your codebase:

```typescript
// These should be in shared/schemas.ts or similar

export interface ProjectConfig {
  id: string;
  name: string;
  jobNumber: string;
  address: string;
  logo?: string;
  client: {
    companyName: string;
    address: string;
    representatives: Representative[];
  };
  personnel: Personnel[];
}

export interface WeeklyReport {
  id: string;
  weekEnding: string;
  periodStart: string;
  overview: Overview;
  safety: Safety;
  resources: Resources;
  progress: Progress;
  financials: Financials;
  schedule: Schedule;
  photos: Photo[];
  issues: Issue[];
  rfis: RFI[];
  submittals: Submittal[];
  fieldDirectives: FieldDirective[];
  changeOrders: ChangeOrder[];
}

export interface WeatherDay {
  date: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  wind: number;
  hoursLost: number;
  notes: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;           // Filename - DO NOT display
  directionLooking: string;  // Actual caption - USE THIS
}

export interface BidItemProgress {
  itemId: string;
  itemNumber: string;
  description: string;
  thisWeekQty: number;
  toDateQty: number;
}

export interface LookAheadItem {
  id: string;
  type: string;
  taskId: string;
  wbs: string;
  description: string;
  baselineStart: string;
  baselineFinish: string;
  forecastStart: string;
  forecastFinish: string;
  included: boolean;
}

export interface Invoice {
  id: string;
  period: string;
  invoiceNumber: string;
  amount: number;
  retainage: number;
  datePaid: string;
}

export interface FieldDirective {
  id: string;
  number: string;
  dateIssued: string;
  description: string;
  issuedBy: string;
  status: string;
  timeImpact: string;
  scopeImpact: string;
}

export interface ManpowerEntry {
  id: string;
  type: 'recon' | 'subcontractor';
  category?: string;
  location?: string;
  name: string;
  company: string;
  role: string;
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
  type: string;
  status: 'Active' | 'Demobilized' | 'Mobilized';
  notes: string;
  dailyHours: Record<string, number>;
  dates?: {
    delivery?: string;
    pickup?: string;
  };
}
```

---

## 🎨 UX & DESIGN SYSTEM SPECIFICATION

> **Goal**: Create a professional, intuitive Print Studio interface that makes users feel confident and in control. The PDF output should look like it was designed by a professional — not generated by software.

---

### 🖥️ INTERFACE ARCHITECTURE (Canva-Style Three-Panel Layout)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOOLBAR (Top)                                                           │
│  [Undo] [Redo] | [Zoom: 100% ▼] | [Grid ☐] | [Preview] | [Generate PDF] │
├────────────┬─────────────────────────────────────────┬───────────────────┤
│            │                                         │                   │
│  COMPONENT │          CANVAS (Center)                │   PROPERTIES      │
│  PALETTE   │                                         │   PANEL           │
│  (Left)    │   ┌─────────────────────────────┐      │   (Right)         │
│            │   │                             │      │                   │
│  ▾ Sections│   │     LIVE PDF PREVIEW        │      │  Selected:        │
│   □ Cover  │   │                             │      │  "Cover Section"  │
│   □ Weather│   │     (Scrollable page view   │      │                   │
│   □ Progress   │      with page breaks)       │      │  ▾ Typography     │
│   □ Photos │   │                             │      │    Font: Inter    │
│            │   │                             │      │    Size: 24px     │
│  ▾ Elements│   └─────────────────────────────┘      │    Weight: Bold   │
│   ⊞ Table  │                                         │                   │
│   🖼 Image │         [Page 1 of 5]                   │  ▾ Spacing        │
│   T Text   │                                         │    Margin: 16px   │
│            │                                         │    Padding: 8px   │
│            │                                         │                   │
└────────────┴─────────────────────────────────────────┴───────────────────┘
```

#### Panel Specifications

**Left Panel — Component Palette (Width: 240px, Collapsible)**
```typescript
interface ComponentPalette {
  width: '240px';
  minWidth: '200px';
  maxWidth: '320px';
  
  sections: {
    // Drag these onto canvas or use checkboxes to include
    reportSections: [
      { id: 'cover', label: 'Cover Page', icon: 'FileText' },
      { id: 'executive', label: 'Executive Summary', icon: 'ClipboardList' },
      { id: 'weather', label: 'Weather', icon: 'Cloud' },
      { id: 'progress', label: 'Progress', icon: 'TrendingUp' },
      { id: 'lookahead', label: '3-Week Look Ahead', icon: 'Calendar' },
      { id: 'photos', label: 'Photos', icon: 'Camera' },
      { id: 'personnel', label: 'Personnel', icon: 'Users' },
      { id: 'equipment', label: 'Equipment', icon: 'Truck' },
      { id: 'safety', label: 'Safety', icon: 'Shield' },
      { id: 'financials', label: 'Financials', icon: 'DollarSign' },
    ];
    
    // Insertable elements
    elements: [
      { type: 'table', label: 'Data Table', icon: 'Table' },
      { type: 'image', label: 'Image', icon: 'Image' },
      { type: 'text', label: 'Text Block', icon: 'Type' },
      { type: 'divider', label: 'Divider', icon: 'Minus' },
      { type: 'spacer', label: 'Spacer', icon: 'Square' },
    ];
  };
}
```

**Center Panel — Canvas (Flexible Width)**
```typescript
interface CanvasPanel {
  background: '#f5f5f5'; // Light gray to contrast white pages
  pageGap: '24px';       // Space between pages
  
  zoom: {
    levels: [50, 75, 100, 125, 150, 200];
    default: 100;
    fitToWidth: true;    // Option to fit page width to viewport
  };
  
  // Show subtle grid for alignment
  grid: {
    enabled: false;      // Toggle-able
    size: 8;             // 8px grid
    color: 'rgba(0,0,0,0.1)';
  };
  
  // Page representation
  page: {
    width: '8.5in';
    height: '11in';
    shadow: '0 4px 12px rgba(0,0,0,0.15)';
    borderRadius: '2px';
  };
}
```

**Right Panel — Properties (Width: 280px, Contextual)**
```typescript
interface PropertiesPanel {
  width: '280px';
  
  // Shows different controls based on selection
  contexts: {
    noSelection: 'Document Settings',
    sectionSelected: 'Section Properties',
    elementSelected: 'Element Properties',
  };
  
  // Common property groups
  groups: [
    'typography',    // Font, size, weight, color, alignment
    'spacing',       // Margin, padding
    'appearance',    // Background, border, shadow
    'layout',        // Width, height, position
    'data',          // Data binding options
  ];
}
```

---

### 📐 TYPOGRAPHY SYSTEM

> **Principle**: Typography is 95% of design. Get this right and everything looks professional.

```typescript
// Design tokens for Print Studio
const typography = {
  // Font families
  fontFamily: {
    display: '"Inter", system-ui, -apple-system, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  // Type scale (Major Third — 1.250 ratio)
  fontSize: {
    display: '48px',   // Cover page title only
    h1: '32px',        // Section headers
    h2: '24px',        // Subsection headers
    h3: '20px',        // Table headers, card titles
    bodyLarge: '18px', // Lead paragraphs, emphasis
    body: '16px',      // Standard text (NEVER go smaller in UI)
    small: '14px',     // Captions, metadata
    tiny: '12px',      // Footnotes only (minimum readable)
  },
  
  // Line heights (optimized for readability)
  lineHeight: {
    display: 1.1,      // Tight for large text
    heading: 1.25,     // Comfortable for headings
    body: 1.6,         // Spacious for body text
    tight: 1.4,        // For captions
  },
  
  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',   // For display text
    normal: '0',
    wide: '0.02em',     // For small caps, labels
    extraWide: '0.1em', // For uppercase labels
  },
};
```

#### Typography Usage Rules

| Context | Size | Weight | Line Height | Example |
|---------|------|--------|-------------|---------|
| Cover Title | 48px | Bold | 1.1 | "Ford City Site Improvements" |
| Section Header | 32px | Semibold | 1.25 | "Weather Summary" |
| Table Header | 20px | Semibold | 1.25 | "Date | Conditions | High/Low" |
| Body Text | 16px | Regular | 1.6 | Paragraph content |
| Table Cell | 14px | Regular | 1.4 | "72°F / 58°F" |
| Caption | 14px | Regular | 1.4 | "Looking north at excavation" |
| Footer | 12px | Medium | 1.4 | "Page 1 of 5" |

---

### 🎨 COLOR SYSTEM

```typescript
const colors = {
  // Brand colors (from RECON branding)
  brand: {
    primary: '#008B8B',      // Teal — main brand color
    primaryDark: '#006666',  // Darker teal for hover states
    primaryLight: '#00AAAA', // Lighter teal for backgrounds
    accent: '#F5A623',       // Amber — highlights, warnings
    navy: '#1a365d',         // Navy — professional dark
  },
  
  // Semantic colors
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Neutral palette
  neutral: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    black: '#000000',
  },
  
  // Text colors
  text: {
    primary: '#111827',      // Main text
    secondary: '#4b5563',    // Supporting text
    tertiary: '#9ca3af',     // Disabled, hints
    inverse: '#ffffff',      // Text on dark backgrounds
    brand: '#008B8B',        // Brand-colored text
  },
  
  // Background colors
  background: {
    app: '#f3f4f6',          // App background
    surface: '#ffffff',      // Cards, panels
    surfaceHover: '#f9fafb', // Hover state
    overlay: 'rgba(0,0,0,0.5)', // Modal overlays
  },
};
```

---

### 📏 SPACING & LAYOUT SYSTEM

```typescript
// 8-point grid system
const spacing = {
  // Base unit
  unit: 8,
  
  // Spacing scale
  scale: {
    0: '0px',
    1: '4px',   // Half unit — icons, tight spacing
    2: '8px',   // 1 unit — inline elements
    3: '12px',  // 1.5 units — small gaps
    4: '16px',  // 2 units — standard spacing
    5: '20px',  // 2.5 units
    6: '24px',  // 3 units — section gaps
    8: '32px',  // 4 units — large gaps
    10: '40px', // 5 units
    12: '48px', // 6 units — page margins
    16: '64px', // 8 units — major sections
  },
  
  // Component-specific spacing
  components: {
    buttonPadding: '8px 16px',
    inputPadding: '10px 12px',
    cardPadding: '16px',
    sectionGap: '24px',
    pageMargin: '48px',  // 0.5 inch equivalent
  },
};

// Layout grid
const layout = {
  // 12-column grid for PDF content
  columns: 12,
  gutter: '24px',
  margin: '48px',  // Print-safe margins (0.5 inch)
  
  // Common layout patterns
  patterns: {
    fullWidth: 'span 12',
    twoColumn: 'span 6',
    threeColumn: 'span 4',
    sidebar: { main: 'span 8', side: 'span 4' },
  },
};
```

---

### 🖱️ INTERACTION STATES & MICRO-INTERACTIONS

#### Drag & Drop Behavior

```typescript
interface DragDropStates {
  idle: {
    // Section card in palette
    background: 'white';
    border: '1px solid #e5e7eb';
    cursor: 'grab';
  };
  
  hover: {
    // User hovers over draggable item
    background: '#f9fafb';
    border: '1px solid #d1d5db';
    cursor: 'grab';
    // Show drag handle icon (⋮⋮)
    showDragHandle: true;
    transition: 'all 150ms ease';
  };
  
  dragging: {
    // Item being dragged
    opacity: 0.8;
    transform: 'scale(1.02) rotate(1deg)';
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)';
    cursor: 'grabbing';
    // Ghost preview follows cursor
  };
  
  dropZone: {
    // Valid drop target
    idle: {
      border: '2px dashed transparent';
    };
    active: {
      border: '2px dashed #008B8B';
      background: 'rgba(0, 139, 139, 0.05)';
    };
    invalid: {
      border: '2px dashed #ef4444';
      background: 'rgba(239, 68, 68, 0.05)';
    };
  };
  
  onDrop: {
    // Animation when item is dropped
    animation: 'dropBounce 200ms ease-out';
    // Brief highlight
    highlight: {
      background: 'rgba(0, 139, 139, 0.1)';
      duration: '300ms';
    };
  };
}
```

#### Selection States

```typescript
interface SelectionStates {
  // Nothing selected
  idle: {
    outline: 'none';
  };
  
  // Mouse hovering over selectable element
  hover: {
    outline: '2px solid rgba(0, 139, 139, 0.3)';
    cursor: 'pointer';
  };
  
  // Element is selected
  selected: {
    outline: '2px solid #008B8B';
    // Show resize handles at corners
    handles: {
      size: '8px';
      color: '#008B8B';
      background: 'white';
    };
  };
  
  // Multiple elements selected
  multiSelect: {
    outline: '2px solid #008B8B';
    // Show bounding box around all
    boundingBox: {
      stroke: '1px dashed #008B8B';
    };
  };
}
```

#### Button States

```typescript
const buttonStyles = {
  primary: {
    idle: {
      background: '#008B8B';
      color: 'white';
      border: 'none';
      padding: '10px 20px';
      borderRadius: '6px';
      fontWeight: 600;
      transition: 'all 150ms ease';
    },
    hover: {
      background: '#006666';
      transform: 'translateY(-1px)';
      boxShadow: '0 4px 12px rgba(0, 139, 139, 0.3)';
    },
    active: {
      background: '#005555';
      transform: 'translateY(0)';
      boxShadow: 'none';
    },
    disabled: {
      background: '#9ca3af';
      cursor: 'not-allowed';
    },
    loading: {
      // Show spinner, disable interaction
      cursor: 'wait';
      opacity: 0.8;
    },
  },
  
  secondary: {
    idle: {
      background: 'white';
      color: '#008B8B';
      border: '1px solid #008B8B';
    },
    hover: {
      background: 'rgba(0, 139, 139, 0.05)';
    },
  },
  
  ghost: {
    idle: {
      background: 'transparent';
      color: '#4b5563';
    },
    hover: {
      background: '#f3f4f6';
    },
  },
};
```

---

### ⌨️ KEYBOARD SHORTCUTS

```typescript
const keyboardShortcuts = {
  // Document operations
  'Cmd+S': 'Save changes',
  'Cmd+Z': 'Undo',
  'Cmd+Shift+Z': 'Redo',
  'Cmd+P': 'Generate PDF',
  
  // Selection
  'Escape': 'Deselect all',
  'Tab': 'Select next element',
  'Shift+Tab': 'Select previous element',
  'Cmd+A': 'Select all on current page',
  
  // Element manipulation
  'Delete / Backspace': 'Remove selected element',
  'Cmd+D': 'Duplicate selected element',
  'Arrow keys': 'Nudge element 1px',
  'Shift+Arrow': 'Nudge element 10px',
  
  // View
  'Cmd++': 'Zoom in',
  'Cmd+-': 'Zoom out',
  'Cmd+0': 'Zoom to 100%',
  'Cmd+1': 'Fit to width',
  'G': 'Toggle grid',
  
  // Navigation
  'Space+Drag': 'Pan canvas',
  'Page Up/Down': 'Navigate pages',
};
```

---

### 📄 PDF COMPONENT SPECIFICATIONS

#### Cover Page Layout (Critical — Most Visible)

```typescript
interface CoverPageLayout {
  // Hero image section (upper 40%)
  hero: {
    height: '40%';
    image: {
      objectFit: 'cover';
      filter: 'brightness(0.7)'; // Darken for text readability
    };
    overlay: {
      background: 'linear-gradient(to bottom, rgba(0,139,139,0.4), rgba(0,139,139,0.7))';
    };
    logo: {
      position: 'top-left';
      margin: '32px';
      height: '48px';
      filter: 'brightness(0) invert(1)'; // White logo
    };
  };
  
  // Content section (lower 60%)
  content: {
    padding: '32px 48px';
    
    projectName: {
      fontSize: '36px';
      fontWeight: 700;
      color: '#111827';
      marginBottom: '8px';
    };
    
    address: {
      fontSize: '18px';
      fontWeight: 500;
      color: '#008B8B';
      marginBottom: '16px';
    };
    
    divider: {
      height: '3px';
      background: '#008B8B';
      width: '120px';
      marginBottom: '16px';
    };
    
    reportTitle: {
      fontSize: '24px';
      fontWeight: 600;
      letterSpacing: '0.05em';
      textTransform: 'uppercase';
    };
    
    weekEnding: {
      fontSize: '18px';
      color: '#008B8B';
      marginTop: '8px';
    };
  };
  
  // Photo thumbnails (3-up)
  photoGrid: {
    display: 'flex';
    gap: '12px';
    margin: '24px 0';
    
    thumbnail: {
      width: '150px';
      height: '100px';
      objectFit: 'cover';
      borderRadius: '4px';
      border: '1px solid #e5e7eb';
    };
  };
  
  // Client info block
  clientInfo: {
    marginTop: '24px';
    fontSize: '14px';
    lineHeight: 1.6;
    
    label: {
      fontWeight: 600;
      minWidth: '80px';
    };
  };
  
  // Safety banner
  safetyBanner: {
    position: 'absolute';
    bottom: '60px';  // Above footer
    left: 0;
    right: 0;
    background: '#008B8B';
    color: 'white';
    padding: '12px 48px';
    fontSize: '14px';
    fontWeight: 600;
    fontStyle: 'italic';
    textAlign: 'center';
  };
  
  // Footer
  footer: {
    position: 'absolute';
    bottom: '24px';
    left: '48px';
    right: '48px';
    display: 'flex';
    justifyContent: 'space-between';
    fontSize: '12px';
    color: '#6b7280';
  };
}
```

#### Data Table Component

```typescript
interface TableStyles {
  container: {
    width: '100%';
    borderCollapse: 'collapse';
    fontSize: '14px';
  };
  
  header: {
    row: {
      background: '#008B8B';
      color: 'white';
    };
    cell: {
      padding: '12px 16px';
      fontWeight: 600;
      textAlign: 'left';
      fontSize: '14px';
    };
  };
  
  body: {
    row: {
      borderBottom: '1px solid #e5e7eb';
      
      // Alternating colors
      even: { background: 'white' };
      odd: { background: '#f9fafb' };
    };
    cell: {
      padding: '10px 16px';
      verticalAlign: 'top';
    };
  };
  
  // Specific column styles
  columns: {
    date: { width: '100px' };
    status: { width: '120px' };
    description: { flex: 1 };
    amount: { width: '100px', textAlign: 'right' };
  };
}
```

#### Photo Layout Options

```typescript
interface PhotoLayouts {
  // Single photo, full width
  single: {
    width: '100%';
    maxHeight: '400px';
    objectFit: 'cover';
    borderRadius: '4px';
    border: '1px solid #e5e7eb';
    marginBottom: '8px';
    
    caption: {
      fontSize: '14px';
      color: '#4b5563';
      fontStyle: 'italic';
      marginTop: '8px';
    };
  };
  
  // Two photos side by side
  double: {
    display: 'grid';
    gridTemplateColumns: '1fr 1fr';
    gap: '16px';
    
    image: {
      width: '100%';
      height: '200px';
      objectFit: 'cover';
    };
  };
  
  // Three photos in a row
  triple: {
    display: 'grid';
    gridTemplateColumns: 'repeat(3, 1fr)';
    gap: '12px';
    
    image: {
      width: '100%';
      height: '150px';
      objectFit: 'cover';
    };
  };
  
  // Grid layout (2x2 or 2x3)
  grid: {
    display: 'grid';
    gridTemplateColumns: 'repeat(2, 1fr)';
    gap: '16px';
    
    image: {
      width: '100%';
      height: '180px';
      objectFit: 'cover';
    };
  };
}
```

---

### 🔄 LOADING & FEEDBACK STATES

```typescript
interface FeedbackStates {
  // PDF Generation Progress
  pdfGeneration: {
    stages: [
      { id: 'preparing', label: 'Preparing document...', percent: 10 },
      { id: 'rendering', label: 'Rendering pages...', percent: 40 },
      { id: 'images', label: 'Processing images...', percent: 70 },
      { id: 'finalizing', label: 'Finalizing PDF...', percent: 90 },
      { id: 'complete', label: 'Complete!', percent: 100 },
    ];
    
    ui: {
      modal: true;
      progressBar: true;
      cancelable: true;
      showElapsedTime: true;
    };
  };
  
  // Auto-save indicator
  autoSave: {
    saving: {
      icon: 'spinner';
      text: 'Saving...';
      color: '#9ca3af';
    };
    saved: {
      icon: 'check';
      text: 'Saved';
      color: '#22c55e';
      duration: '2000ms'; // Show briefly then fade
    };
    error: {
      icon: 'alert';
      text: 'Save failed';
      color: '#ef4444';
      action: 'Retry';
    };
  };
  
  // Toast notifications
  toasts: {
    position: 'bottom-right';
    maxVisible: 3;
    duration: 4000;
    
    types: {
      success: { background: '#22c55e', icon: 'check-circle' };
      error: { background: '#ef4444', icon: 'x-circle' };
      warning: { background: '#f59e0b', icon: 'alert-triangle' };
      info: { background: '#3b82f6', icon: 'info' };
    };
  };
}
```

---

### 📱 RESPONSIVE PREVIEW OPTIONS

```typescript
// Preview different page sizes
const pagePresets = {
  letter: {
    name: 'US Letter',
    width: '8.5in',
    height: '11in',
    default: true,
  },
  a4: {
    name: 'A4',
    width: '210mm',
    height: '297mm',
  },
  legal: {
    name: 'US Legal',
    width: '8.5in',
    height: '14in',
  },
};

// Zoom presets
const zoomPresets = [
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' },
  { value: 125, label: '125%' },
  { value: 150, label: '150%' },
  { value: 'fit', label: 'Fit Width' },
];
```

---

### ✅ UX ACCEPTANCE CRITERIA

```gherkin
Feature: Print Studio User Experience

  Scenario: Intuitive First-Time Experience
    Given a user opens Print Studio for the first time
    When the interface loads
    Then they should see their report data already populated
    And sections should be clearly labeled with recognizable icons
    And the Generate PDF button should be prominently visible
    And they should NOT need to manually re-enter any data

  Scenario: Drag and Drop Section Reordering
    Given a user is viewing the Print Studio
    When they drag a section from the palette to the canvas
    Then visual feedback should show valid drop zones
    And the section should snap into place with animation
    And the preview should update within 100ms

  Scenario: Real-Time Preview Updates
    Given a user is editing section properties
    When they change any value (font, spacing, color)
    Then the preview should update immediately (< 100ms)
    And no page refresh should occur
    And the change should persist when they click elsewhere

  Scenario: PDF Generation Feedback
    Given a user clicks "Generate PDF"
    Then a progress indicator should appear immediately
    And they should see which stage is processing
    And they should be able to cancel if desired
    And on completion, the PDF should download automatically

  Scenario: Error Recovery
    Given a user encounters an error (missing image, API failure)
    Then a clear, non-technical error message should appear
    And they should be offered a specific action to resolve it
    And the error should NOT crash the entire interface
```

---

## END OF PRD

This document is the single source of truth for the Print Studio PDF generation feature. All implementation should reference this document. If you encounter ambiguity, refer back to this PRD before making assumptions.

**Document Owner**: [Your Name]  
**Last Updated**: 2026-01-29  
**Version**: 1.1.0 — Added UX & Design System Specification
