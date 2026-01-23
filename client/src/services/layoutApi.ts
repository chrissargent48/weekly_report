
import { WeeklyReport, ReportLayout } from '../../../../server/types';

// We need to fetch from the API port (defaults to 3000 in dev, usually proxied)
// In this setup, we seem to have server on 3000 and client on 5173.
// We should check if there is a configured API_URL or just use relative path if proxied.
// Based on package.json, there isn't an explicit proxy config visible, but let's assume /api routes might need full URL if not proxied.
// However, standard Create-React-App/Vite setup usually proxies. Let's try relative first, or default to localhost:3000 if not.

const API_BASE = 'http://localhost:3000'; // Hardcoded for now based on server index.ts

export const layoutApi = {
    calculateLayout: async (report: WeeklyReport): Promise<ReportLayout> => {
        const response = await fetch(`${API_BASE}/api/layout/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || 'Failed to calculate layout');
        }

        return response.json();
    },
};
