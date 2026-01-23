import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import open from 'open';
import path from 'path';
import { DataManager } from './DataManager';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const dataManager = new DataManager();
import { LayoutEngine } from './services/LayoutEngine';
const layoutEngine = new LayoutEngine();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Support large photo uploads

// Initialize Data Dir
dataManager.init();

// --- PROJECTS API ---

app.get('/api/projects', async (req, res) => {
    const projects = await dataManager.listProjects();
    res.json(projects);
});

app.post('/api/projects', async (req, res) => {
    const { name, location } = req.body;
    const project = await dataManager.createProject(name, location);
    res.json(project);
});

app.delete('/api/projects/:id', async (req, res) => {
    await dataManager.deleteProject(req.params.id);
    res.json({ success: true });
});

// --- SCOPED PROJECT API ---

app.get('/api/projects/:id/config', async (req, res) => {
  const config = await dataManager.getProjectConfig(req.params.id);
  res.json(config || {});
});

app.post('/api/projects/:id/config', async (req, res) => {
  await dataManager.saveProjectConfig(req.params.id, req.body);
  res.json({ success: true });
});

app.get('/api/projects/:id/baselines', async (req, res) => {
  const baselines = await dataManager.getBaselines(req.params.id);
  // Return empty if not found, or 404? 
  // Let's return null if not found, client handles.
  if (!baselines) {
      res.status(404).json({ error: "No baselines found" });
      return;
  }
  res.json(baselines);
});

app.post('/api/projects/:id/baselines', async (req, res) => {
  await dataManager.saveBaselines(req.params.id, req.body);
  res.json({ success: true });
});

app.get('/api/projects/:id/reports', async (req, res) => {
    const reports = await dataManager.listReports(req.params.id);
    res.json(reports);
});

app.get('/api/projects/:id/reports/:date', async (req, res) => {
  const report = await dataManager.getReport(req.params.id, req.params.date);
  res.json(report || {});
});

app.post('/api/projects/:id/reports/:date', async (req, res) => {
  await dataManager.saveReport(req.params.id, req.params.date, req.body);
  res.json({ success: true });
});

// --- LAYOUT ENGINE API ---
app.post('/api/layout/calculate', async (req, res) => {
    try {
        const report = req.body;
        // Basic validation
        if (!report || !report.id) {
            return res.status(400).json({ error: "Invalid report data" });
        }
        
        console.log(`[LayoutEngine] Calculating layout for report ${report.id}`);
        const layout = layoutEngine.calculateLayout(report);
        res.json(layout);
    } catch (e: any) {
        console.error("Layout Calculation Error:", e);
        res.status(500).json({ error: e.message || "Layout calculation failed" });
    }
});

// PDF generation is now handled client-side via pdfmake
// This endpoint is deprecated but kept for backwards compatibility
app.post('/api/projects/:id/reports/:date/pdf', async (req, res) => {
    res.status(410).json({ 
        error: "PDF generation has moved to client-side. Use the Download button in the Print Preview modal.",
        deprecated: true 
    });
});

// --- WEATHER API ---
// Uses Census Bureau for geocoding, Open-Meteo for historical, NWS for forecast
app.get('/api/weather', async (req, res) => {
    try {
        const { address, startDate, endDate } = req.query;
        
        if (!address || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing address, startDate, or endDate parameters" });
        }

        // Step 1: Geocode address using Census Bureau API
        const geocodeUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address as string)}&benchmark=2020&format=json`;
        const geocodeRes = await fetch(geocodeUrl);
        const geocodeData = await geocodeRes.json();
        
        const match = geocodeData?.result?.addressMatches?.[0];
        if (!match) {
            return res.status(404).json({ error: "Could not geocode address. Try adding city/state." });
        }
        
        const lat = match.coordinates.y;
        const lon = match.coordinates.x;
        
        // Determine if we need historical or forecast data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        const isHistorical = end < today;
        
        let weatherDays = [];
        
        if (isHistorical) {
            // Use Open-Meteo Historical API (free, no key required)
            console.log("[Weather] Using Open-Meteo for historical data");
            
            const startStr = (startDate as string);
            const endStr = (endDate as string);
            
            const openMeteoUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America/Chicago`;
            
            const meteoRes = await fetch(openMeteoUrl);
            const meteoData = await meteoRes.json();
            
            if (meteoData.error) {
                return res.status(500).json({ error: `Open-Meteo error: ${meteoData.reason}` });
            }
            
            const daily = meteoData.daily;
            
            // Map weather codes to conditions
            const weatherCodeToCondition = (code: number): string => {
                if (code === 0) return 'Sunny';
                if (code <= 3) return 'Partly Cloudy';
                if (code <= 49) return 'Cloudy';
                if (code <= 69) return 'Rain';
                if (code <= 79) return 'Snow';
                if (code <= 99) return 'Rain';
                return 'Unknown';
            };
            
            for (let i = 0; i < (daily?.time?.length || 0); i++) {
                weatherDays.push({
                    date: daily.time[i],
                    condition: weatherCodeToCondition(daily.weathercode?.[i] || 0),
                    tempHigh: Math.round(daily.temperature_2m_max?.[i] || 0),
                    tempLow: Math.round(daily.temperature_2m_min?.[i] || 0),
                    wind: Math.round(daily.windspeed_10m_max?.[i] || 0),
                    hoursLost: 0,
                    notes: ''
                });
            }
        } else {
            // Use NWS Forecast API
            console.log("[Weather] Using NWS for forecast data");
            
            const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
            const pointsRes = await fetch(pointsUrl, { 
                headers: { 'User-Agent': 'WeeklyReportApp (contact@example.com)' } 
            });
            const pointsData = await pointsRes.json();
            
            const forecastUrl = pointsData?.properties?.forecast;
            if (!forecastUrl) {
                return res.status(500).json({ error: "Could not get NWS forecast URL" });
            }
            
            const forecastRes = await fetch(forecastUrl, {
                headers: { 'User-Agent': 'WeeklyReportApp (contact@example.com)' }
            });
            const forecastData = await forecastRes.json();
            
            const periods = forecastData?.properties?.periods || [];
            
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);
                const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
                
                const dayPeriod = periods.find((p: any) => 
                    p.name === dayName || p.name.startsWith(dayName)
                );
                
                const nightPeriod = periods.find((p: any) => 
                    p.name === `${dayName} Night`
                );
                
                weatherDays.push({
                    date: currentDate.toISOString().split('T')[0],
                    condition: dayPeriod?.shortForecast || 'Unknown',
                    tempHigh: dayPeriod?.temperature || 0,
                    tempLow: nightPeriod?.temperature || (dayPeriod?.temperature ? dayPeriod.temperature - 15 : 0),
                    wind: parseInt(dayPeriod?.windSpeed || '0') || 0,
                    hoursLost: 0,
                    notes: ''
                });
            }
        }
        
        res.json({ 
            success: true, 
            source: isHistorical ? 'open-meteo' : 'nws',
            location: { lat, lon, matchedAddress: match.matchedAddress },
            weather: weatherDays 
        });
        
    } catch (e) {
        console.error("Weather API Error:", e);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});


// Link 'uploads' URL to the local data directory
app.use('/uploads', express.static(path.join(process.cwd(), 'data')));

// --- UTILITIES ---
const ensureDir = async (dir: string) => {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}
import fs from 'fs/promises';

// --- MEDIA API ---
app.post('/api/projects/:id/upload', async (req, res) => {
    try {
        const { id } = req.params;
        const { image, filename } = req.body;

        if (!image || !filename) {
            return res.status(400).json({ error: "Missing image data or filename" });
        }

        // Decode Base64
        // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ error: "Invalid image data format" });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        
        // Target Dir: data/{projectId}/images
        const projectDir = path.join(process.cwd(), 'data', id);
        const imagesDir = path.join(projectDir, 'images');
        await ensureDir(imagesDir);

        // Generate safe filename (UUID is redundant if we trust client UUID, but let's be safe or just use their ID?)
        // The client generates a UUID for the photo ID. Let's use that if provided as filename, otherwise gen new.
        // Actually, the client sends `filename` which is usually the original file name. 
        // Let's generate a unique name to avoid collisions.
        const ext = path.extname(filename) || '.jpg'; // web defaults to jpg often but let's try to keep orig
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(imagesDir, uniqueName);

        await fs.writeFile(filePath, buffer);

        // Return the public URL
        // mapped to /uploads/{projectId}/images/{filename}
        const publicUrl = `/uploads/${id}/images/${uniqueName}`;
        
        console.log(`[Upload] Saved image to ${filePath}`);

        res.json({ url: publicUrl });

    } catch (e) {
        console.error("Upload Error:", e);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

// Serve Frontend (Production/Build)
// In dev mode, we just run the API and let Vite handle the frontend on 5173
// But for the final "Launcher" experience, we'd serve static files.
// For now, let's assume Development Mode where we launch the Vite URL.
const DEV_URL = 'http://localhost:5173';

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Launching application...`);
  await open(DEV_URL); // Launch the UI
});
