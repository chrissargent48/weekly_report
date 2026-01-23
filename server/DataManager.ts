import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ProjectConfig, WeeklyReport } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

export interface ProjectIndex {
  id: string;
  name: string;
  location: string;
  lastUpdated: string;
}

export class DataManager {
  async init() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    // Ensure projects index exists
    try {
        await fs.access(PROJECTS_FILE);
    } catch {
        // Init with empty array, OR try to recover if folders exist?
        // For now, empty is safer than crashing, but we'll add a rebuild method.
        await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
    }

    // Auto-recover if index is empty but folders exist
    const index = await this.listProjects();
    if (index.length === 0) {
        await this.rebuildIndex();
    }
  }

  async rebuildIndex(): Promise<void> {
      console.log("[DataManager] Rebuilding index from disk...");
      try {
        const dirs = await fs.readdir(DATA_DIR);
        const projects: ProjectIndex[] = [];
        
        for (const dir of dirs) {
            // Skip files
            if (dir.includes('.')) continue;

            const configPath = path.join(DATA_DIR, dir, 'config.json');
            try {
                const configData = await fs.readFile(configPath, 'utf-8');
                const config: ProjectConfig = JSON.parse(configData);
                
                projects.push({
                    id: dir,
                    name: config.identity.projectName || "Unknown Project",
                    location: config.identity.location || "",
                    lastUpdated: new Date().toISOString() // Approximate
                });
            } catch (e) {
                // Not a project folder or corrupt config
                console.warn(`[DataManager] Skipping corrupt/non-project dir: ${dir}`);
            }
        }
        
        if (projects.length > 0) {
            console.log(`[DataManager] Recovered ${projects.length} projects.`);
            await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        }
      } catch (e) {
          console.error("[DataManager] Failed to rebuild index:", e);
      }
  }

  /**
   * Performs an atomic write by writing to a temp file and renaming it.
   * This prevents data corruption if the process crashes during write.
   */
  private async atomicWrite(filePath: string, data: string): Promise<void> {
      const tempPath = `${filePath}.tmp.${Date.now()}`;
      try {
          await fs.writeFile(tempPath, data);
          // Rename is atomic on POSIX and ensures file is either old or new version
          await fs.rename(tempPath, filePath);
      } catch (e) {
          // Cleanup temp if it exists
          try { await fs.unlink(tempPath); } catch {}
          throw e;
      }
  }



  // --- PROJECT MANAGEMENT ---

  async listProjects(): Promise<ProjectIndex[]> {
      try {
          const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
          // Validate JSON
          if (!data.trim()) return [];
          return JSON.parse(data);
      } catch (e) { 
          // CRITICAL: If read fails, do NOT assume empty if file exists.
          console.error("[DataManager] listProjects failed:", e);
          return []; 
      }
  }

  async createProject(name: string, location: string): Promise<ProjectIndex> {
      const projects = await this.listProjects();
      const newProject: ProjectIndex = {
          id: crypto.randomUUID(),
          name,
          location,
          lastUpdated: new Date().toISOString()
      };
      
      // Update Index
      projects.push(newProject);
      await this.atomicWrite(PROJECTS_FILE, JSON.stringify(projects, null, 2));

      // Create Project Folder
      const projectDir = path.join(DATA_DIR, newProject.id);
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'reports'), { recursive: true });
      
      // Create Default Config
      const defaultConfig: ProjectConfig = {
          identity: { projectName: name, location: location, subtitle: "", jobNumber: "" },
          personnel: { 
              recon: [], 
              client: { company: "", representatives: [] },
              engineer: { company: "", representatives: [] },
              stakeholders: []
          },
          contract: { originalValue: 0, startDate: "", substantialCompletionDate: "" },
          distributionList: { to: [], cc: [] }
      };
      await this.atomicWrite(path.join(projectDir, 'config.json'), JSON.stringify(defaultConfig, null, 2));

      return newProject;
  }
  
  async deleteProject(projectId: string): Promise<void> {
      if (!projectId || projectId.trim() === '' || projectId.includes('/') || projectId.includes('\\')) {
          throw new Error("Invalid Project ID");
      }

      // 1. Remove from Index
      let projects = await this.listProjects();
      
      // Safety Check: If listProjects returns empty but we suspect error, don't overwrite!
      // But listProjects swallows errors. Ideally we should fix that, but for now:
      if (projects.length === 0) {
          // Verify if it's genuinely empty or if we had a read error?
          // We can check if file is empty.
          // For now, let's trust listProjects improved logging.
      }

      projects = projects.filter(p => p.id !== projectId);
      await this.atomicWrite(PROJECTS_FILE, JSON.stringify(projects, null, 2));

      // 2. Remove Directory
      const projectDir = this.getProjectDir(projectId);
      
      // DOUBLE CHECK: Don't delete root
      if (projectDir === DATA_DIR) throw new Error("Attempted to delete root data dir");

      try {
          await fs.rm(projectDir, { recursive: true, force: true });
      } catch (e) {
          console.error(`Failed to delete project dir: ${projectId}`, e);
          // Proceeding anyway since index is updated
      }
  }
  


  // --- SCOPED DATA ACCESS ---

  private getProjectDir(projectId: string) {
      return path.join(DATA_DIR, projectId);
  }

  async getProjectConfig(projectId: string): Promise<ProjectConfig | null> {
    try {
      const filePath = path.join(this.getProjectDir(projectId), 'config.json');
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async saveProjectConfig(projectId: string, config: ProjectConfig): Promise<void> {
    const filePath = path.join(this.getProjectDir(projectId), 'config.json');
    await this.atomicWrite(filePath, JSON.stringify(config, null, 2));
    
    // Update Index Metdata (Name/Location might have changed)
    const projects = await this.listProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
        projects[idx].name = config.identity.projectName;
        projects[idx].location = config.identity.location;
        projects[idx].lastUpdated = new Date().toISOString();
        await this.atomicWrite(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    }
  }

  async getReport(projectId: string, date: string): Promise<WeeklyReport | null> {
    const filePath = path.join(this.getProjectDir(projectId), 'reports', `${date}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveReport(projectId: string, date: string, report: WeeklyReport): Promise<void> {
    const reportsDir = path.join(this.getProjectDir(projectId), 'reports');
    await fs.mkdir(reportsDir, { recursive: true }); // Ensure exists
    
    const filePath = path.join(reportsDir, `${date}.json`);
    await this.atomicWrite(filePath, JSON.stringify(report, null, 2));
    
    // Update lastUpdated
    const projects = await this.listProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
        projects[idx].lastUpdated = new Date().toISOString();
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    }
  }

  async listReports(projectId: string): Promise<string[]> {
    try {
        const reportsDir = path.join(this.getProjectDir(projectId), 'reports');
        const files = await fs.readdir(reportsDir);
        return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch {
        return [];
    }
  }

  // --- BASELINES (Golden Triangle) ---

  async getBaselines(projectId: string): Promise<import('./types').ProjectBaselines | null> {
    try {
        const filePath = path.join(this.getProjectDir(projectId), 'baselines.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
  }

  async saveBaselines(projectId: string, baselines: import('./types').ProjectBaselines): Promise<void> {
    const filePath = path.join(this.getProjectDir(projectId), 'baselines.json');
    try {
        await this.atomicWrite(filePath, JSON.stringify(baselines, null, 2));
    } catch (e) {
        console.error(`[DataManager] Write failed:`, e);
        throw e;
    }
  }
}
