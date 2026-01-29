# Print Studio Data Mapping Audit

**Date:** 2026-01-29
**Scope:** Client-side data flow for Weekly Report Print Studio

## Executive Summary

There is a **Critical Architecture Gap** in how data is handled between the screen preview and the final PDF generation. The application currently maintains two parallel component trees using two different data structures, which is a major source of potential bugs and maintenance overhead.

## Data Flow Diagram

```mermaid
graph TD
    API[Back End API] -->|WeeklyReport| Dashboard[Dashboard]
    Dashboard -->|WeeklyReport| PrintStudio[Print Studio]

    subgraph "Screen Preview (HTML)"
        PrintStudio -->|WeeklyReport| HTMLPreview[PrintPreview.tsx]
        HTMLPreview -->|WeeklyReport| HTMLSections[features/print-studio/sections/*]
    end

    subgraph "PDF Generation (React-PDF)"
        PrintStudio -->|WeeklyReport| DataMapper[dataMapper.ts]
        DataMapper -->|ReportData (Flattened)| PDFRenderer[ReportDocument.tsx]
        PDFRenderer -->|ReportData| PDFSections[features/print-studio/react-pdf/sections/*]
    end
```

## Discrepancies

### 1. Dual Component Hierarchy

- **HTML Preview**: Uses components in `client/src/features/print-studio/sections/`
- **PDF Generation**: Uses components in `client/src/features/print-studio/react-pdf/sections/`

**Impact**: Any visual change (e.g., adding a new field to the Weather section) must be implemented TWICE: once for the screen and once for the PDF. If these fall out of sync, the user sees one thing on screen but prints another.

### 2. Dual Data Shapes

- **Source of Truth**: `WeeklyReport` (defined in `shared/schemas.ts`). This is a nested, structured object used by the API and Dashboard.
- **HTML Preview**: Consumes `WeeklyReport` directly.
- **PDF Generation**: Consumes `ReportData` (defined in `dataMapper.ts`). This is a "flattened" version of the report, often converting complex objects into strings or mismatched arrays.

**Impact**:

- `WeatherSection` (HTML) expects `report.overview.weather`.
- `WeatherSection` (PDF) expects `report.weatherDays`.
- Field names differ (e.g., `hoursLost` (number) vs `workImpact` (string)).

## Specific Component Gaps

| Section      | HTML Expectation (Source)              | PDF Expectation (Mapped)            | Notes                                               |
| :----------- | :------------------------------------- | :---------------------------------- | :-------------------------------------------------- |
| **Common**   | `WeeklyReport`                         | `ReportData`                        | Fundamental type mismatch                           |
| **Weather**  | `overview.weather` (WeatherDay[])      | `weatherDays` (FLATTENED)           | Logic for dates/impacts duplicated/divergent        |
| **Progress** | `progress.bidItems` (WeeklyBidEntry[]) | `activitiesThisWeek` (String Array) | PDF mapper loses structured bid item data entirely? |
| **Photos**   | `photos` (PhotoEntry[])                | `photos` (Simplified)               | PDF mapper converts dates to strings immediately    |

## Recommendations

1.  **Unify Data Shape**: Refactor `ReportDocument.tsx` and PDF sections to accept the exact same `WeeklyReport` (Source of Truth) interface as the HTML preview.
2.  **Deprecate `dataMapper.ts`**: Remove the flattening logic. If generic formatting is needed (e.g., date formatting), it should be done via utility functions called by the components, not by transforming the entire data object before rendering.
3.  **Unified Component Library (Long Term)**: Ideally, use a library that renders to both DOM and PDF from the same component code (if possible with `react-pdf`, though styling differs significantly), OR ensure strict strict type parity between the two folder structures.
