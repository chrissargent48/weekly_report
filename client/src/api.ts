import { ProjectConfig, WeeklyReport } from './types';

const API_BASE = 'http://localhost:3000/api';

export interface ProjectIndex {
  id: string;
  name: string;
  location: string;
  lastUpdated: string;
}

export const api = {
  // --- PROJECTS ---
  listProjects: async (): Promise<ProjectIndex[]> => {
      const res = await fetch(`${API_BASE}/projects`);
      return res.json();
  },

  createProject: async (name: string, location: string): Promise<ProjectIndex> => {
      const res = await fetch(`${API_BASE}/projects`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, location })
      });
      return res.json();
  },

  deleteProject: async (id: string): Promise<void> => {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  },

  // --- SCOPED ---
  getConfig: async (projectId: string): Promise<ProjectConfig> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/config`);
    return res.json();
  },

  saveConfig: async (projectId: string, config: ProjectConfig): Promise<void> => {
    await fetch(`${API_BASE}/projects/${projectId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  },

  listReports: async (projectId: string): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/reports`);
    return res.json();
  },

  getReport: async (projectId: string, date: string): Promise<WeeklyReport> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/reports/${date}`);
    return res.json();
  },

  async saveReport(projectId: string, date: string, data: WeeklyReport) {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports/${date}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
  },
  
  async downloadPDF(projectId: string, date: string, options?: import('./types').PrintOptions) {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports/${date}/pdf`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options }) 
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
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
      return res.json();
  },

  saveBaselines: async (projectId: string, data: import('./types').ProjectBaselines) => {
      await fetch(`${API_BASE}/projects/${projectId}/baselines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
  },

  // --- WEATHER (NWS + Census Bureau geocoding) ---
  fetchWeather: async (address: string, startDate: string, endDate: string): Promise<{
      success: boolean;
      location?: { lat: number; lon: number; matchedAddress: string };
      weather?: import('./types').WeatherDay[];
      error?: string;
  }> => {
      const params = new URLSearchParams({ address, startDate, endDate });
      const res = await fetch(`${API_BASE}/weather?${params}`);
      return res.json();
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
                      throw new Error(errorData.error || `Upload failed with status ${res.status}`);
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
