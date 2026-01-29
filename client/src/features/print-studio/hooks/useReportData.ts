import { useState, useEffect, useCallback } from 'react';
import { WeeklyReport, ProjectConfig } from '../../../types';
import { api } from '../../../api';

interface UseReportDataProps {
  projectId?: string;
  reportDate?: string; // YYYY-MM-DD format
}

interface UseReportDataReturn {
  report: WeeklyReport | null;
  projectConfig: ProjectConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReportData({ projectId, reportDate }: UseReportDataProps): UseReportDataReturn {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId || !reportDate) return;

    setIsLoading(true);
    setError(null);

    try {
        console.log(`[PrintStudio] Fetching data for Project: ${projectId}, Report: ${reportDate}`);
        
        // Parallel fetch for speed
        const [configData, reportData] = await Promise.all([
            api.getConfig(projectId),
            api.getReport(projectId, reportDate)
        ]);

        console.log("[PrintStudio] Data fetched successfully", { configData, reportData });

        setProjectConfig(configData);
        setReport(reportData);
    } catch (err) {
        console.error("Failed to fetch print studio data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
        setIsLoading(false);
    }
  }, [projectId, reportDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { report, projectConfig, isLoading, error, refetch: fetchData };
}
