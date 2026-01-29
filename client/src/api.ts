import { ProjectConfig, WeeklyReport } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorBody.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface ProjectIndex {
  id: string;
  name: string;
  location: string;
  lastUpdated: string;
}

export const api = {
  // --- PROJECTS ---
  listProjects: async (): Promise<ProjectIndex[]> => {
      return apiFetch<ProjectIndex[]>(`${API_BASE}/projects`);
  },

  createProject: async (name: string, location: string): Promise<ProjectIndex> => {
      return apiFetch<ProjectIndex>(`${API_BASE}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, location })
      });
  },

  deleteProject: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new ApiError(res.status, errorBody.error || `Request failed: ${res.status}`);
      }
  },

  // --- SCOPED ---
  getConfig: async (projectId: string): Promise<ProjectConfig> => {
      return apiFetch<ProjectConfig>(`${API_BASE}/projects/${projectId}/config`);
  },

  saveConfig: async (projectId: string, config: ProjectConfig): Promise<void> => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
      });
      if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new ApiError(res.status, errorBody.error || `Request failed: ${res.status}`);
      }
  },

  listReports: async (projectId: string): Promise<string[]> => {
      return apiFetch<string[]>(`${API_BASE}/projects/${projectId}/reports`);
  },

  getReport: async (projectId: string, date: string): Promise<WeeklyReport> => {
      return apiFetch<WeeklyReport>(`${API_BASE}/projects/${projectId}/reports/${date}`);
  },

  async saveReport(projectId: string, date: string, data: WeeklyReport) {
      return apiFetch(`${API_BASE}/projects/${projectId}/reports/${date}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
  },

  async downloadPDF(projectId: string, date: string, options?: import('./types').PrintOptions) {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports/${date}/pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options })
      });
      if (!res.ok) throw new ApiError(res.status, "Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WeeklyReport_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  },

  // --- BASELINES ---
  getBaselines: async (projectId: string): Promise<import('./types').ProjectBaselines | null> => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/baselines`);
      if (res.status === 404) return null;
      if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new ApiError(res.status, errorBody.error || `Request failed: ${res.status}`);
      }
      return res.json();
  },

  saveBaselines: async (projectId: string, data: import('./types').ProjectBaselines) => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/baselines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new ApiError(res.status, errorBody.error || `Request failed: ${res.status}`);
      }
  },

  // --- WEATHER (NWS + Census Bureau geocoding) ---
  fetchWeather: async (address: string, startDate: string, endDate: string): Promise<{
      success: boolean;
      location?: { lat: number; lon: number; matchedAddress: string };
      weather?: import('./types').WeatherDay[];
      error?: string;
  }> => {
      const params = new URLSearchParams({ address, startDate, endDate });
      return apiFetch(`${API_BASE}/weather?${params}`);
  },

  // --- LAYOUT ---
  calculateLayout: async (report: WeeklyReport): Promise<import('./types').ReportLayout> => {
      return apiFetch(`${API_BASE}/layout/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
      });
  },

  // --- MEDIA ---
  uploadImage: async (projectId: string, file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
              try {
                  const base64 = reader.result as string;
                  const res = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ image: base64, filename: file.name })
                  });

                  if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new ApiError(res.status, errorData.error || `Upload failed with status ${res.status}`);
                  }
                  const data = await res.json();
                  resolve(data.url);
              } catch (e) {
                  reject(e);
              }
          };
          reader.onerror = (e) => reject(e);
      });
  }
};
