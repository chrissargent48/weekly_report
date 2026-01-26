import { WeeklyReport, WeatherDay, ManpowerEntry, PhotoEntry } from "../../../types";
import { PuckData } from "../config/puckConfig";

export const mapReportToPuckData = (report: WeeklyReport): PuckData => {
  const content = [];

  // 1. Cover Page
  content.push({
    type: "CoverPage",
    props: {
      title: "Weekly Progress Report",
      subtitle: "Ford City - Former Facility SLA",
      weekEnding: report.weekEnding,
      location: "1696 Ford City Road, Kittanning, PA",
    }
  });

  // 2. Executive Summary
  content.push({
    type: "RichText",
    props: {
      title: "Executive Summary",
      content: report.overview.executiveSummary,
    }
  });

  // 3. Weather
  content.push({
    type: "WeatherTable",
    props: {
      days: report.overview.weather.map((w: WeatherDay) => ({
        date: w.date,
        condition: w.condition,
        tempHigh: w.tempHigh,
        tempLow: w.tempLow,
        hoursLost: w.hoursLost,
      }))
    }
  });

  // 4. Manpower (Resource Table)
  content.push({
    type: "TableSection",
    props: {
      title: "Resource Log - Manpower",
      headers: [
        { label: "Name" },
        { label: "Role" },
        { label: "Company" },
        { label: "Total Hours" }
      ],
      rows: report.resources.manpower.map((m: ManpowerEntry) => ({
        cells: [
          { value: m.name },
          { value: m.role },
          { value: m.company || "RECON" },
          { value: (Object.values(m.dailyHours) as number[]).reduce((a: number, b: number) => a + b, 0).toString() }
        ]
      }))
    }
  });

  // 5. Photos
  if (report.photos && report.photos.length > 0) {
    content.push({
      type: "PhotoGrid",
      props: {
        photos: report.photos.map((p: PhotoEntry) => ({
          url: p.url,
          caption: p.caption + " - " + p.directionLooking
        }))
      }
    });
  }

  // TODO: Map the rest of the sections...
  // Procurement, Materials, Safety, Progress, Financials, etc.

  return {
    content,
    root: { props: { title: `Weekly Report - ${report.weekEnding}` } }
  };
};
