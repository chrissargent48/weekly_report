import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProjectSetup } from './components/ProjectSetup';
import { ReportEditor } from './components/ReportEditor';
import { ProjectSelector } from './components/ProjectSelector';
import { PrintView } from './components/PrintView';
import { UserProfileModal } from './components/ui/UserProfileModal';
import { ProjectConfig, WeeklyReport, UserProfile } from './types';
import { api } from './api';

const initialConfig: ProjectConfig = {
    identity: { projectName: "New Project", subtitle: "", jobNumber: "", location: "", companyAddress: "" },
    personnel: { 
        recon: [], 
        client: { company: "", address: "", representatives: [] },
        engineer: { company: "", address: "", representatives: [] },
        stakeholders: []
    },
    contract: { originalValue: 0, startDate: "", substantialCompletionDate: "" },
    distributionList: { to: [], cc: [] }
};

const emptyReport = (date: string): WeeklyReport => {
    // Calculate start date (6 days prior)
    const end = new Date(date);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const startStr = start.toISOString().split('T')[0];

    return {
    id: date, weekEnding: date, periodStart: startStr,
    overview: { 
        executiveSummary: "", 
        weather: [], 
        kpis: { 
            percentComplete: 0, 
            schedulePerformanceIndex: 0, 
            manHoursWeek: 0, 
            manHoursTotal: 0, 
            safetyIncidents: 0, 
            weatherDaysLost: 0 
        } 
    },
    safety: { stats: { nearMisses: {week:0, ytd:0}, firstAids: {week:0, ytd:0}, recordables: {week:0, ytd:0}, lostTime: {week:0, ytd:0}, stopWorks: {week:0, ytd:0}, hofs: {week:0, ytd:0}, safetyAudits: {week:0, ytd:0} }, narrative: "" },
    resources: { manpower: [], equipment: { onSite: [], mobilized: [], demobilized: [] }, materials: [], procurement: [] },
    progress: { bidItems: [], activitiesThisWeek: [], lookAheadThreeWeek: [] },
    financials: { invoices: [], summary: { earnedToDate: 0, remainingContractValue: 0, totalBilled: 0 } },
    schedule: { milestones: [], analysis: "" },
    photos: [],
    issues: [],
    rfis: [],
    submittals: []
  };
};

function App() {
  // Routing State
  const [view, setView] = useState<'selector' | 'dashboard' | 'settings' | 'editor' | 'canvas'>('selector');
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Data State
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [reports, setReports] = useState<string[]>([]);
  const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);

  // User Profile State (persisted in localStorage)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem('user_profile_v2');
      return saved ? JSON.parse(saved) : {
          name: "Chris Sargent",
          role: "Project Manager",
          email: "",
          phone: "",
          profilePicture: undefined
      };
  });

  const handleSaveProfile = (newProfile: UserProfile) => {
      setUserProfile(newProfile);
      localStorage.setItem('user_profile_v2', JSON.stringify(newProfile));
  };

  // Check for Print Mode (URL Query)
  const urlParams = new URLSearchParams(window.location.search);
  const printMode = urlParams.get('mode') === 'print';
  const printDate = urlParams.get('date');
  const printProjectId = urlParams.get('projectId');
  const printOptionsJson = urlParams.get('printOptions');
  const printOptions = printOptionsJson ? JSON.parse(decodeURIComponent(printOptionsJson)) : undefined;

  if (printMode && printDate && printProjectId) {
      return <PrintView date={printDate} projectId={printProjectId} options={printOptions} />;
  }

  // Load Project Data when ID changes
  useEffect(() => {
    if (projectId) {
        loadProjectData(projectId);
        setView('dashboard');
    } else {
        setView('selector');
    }
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
        const [cfg, rpts] = await Promise.all([api.getConfig(id), api.listReports(id)]);
        setConfig(cfg && cfg.identity ? cfg : initialConfig);
        setReports(rpts);
    } catch (e) {
        console.error("Failed to load project data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateReport = useCallback(async (date: string) => {
    if (!projectId) return;
    const newReport = emptyReport(date);
    await api.saveReport(projectId, date, newReport);
    setReports(prev => [...prev, date]);
    setCurrentReport(newReport);
    setView('editor');
  }, [projectId]);

  const handleOpenReport = useCallback(async (date: string) => {
      if (!projectId) return;
      const rpt = await api.getReport(projectId, date);
      if (rpt) {
          setCurrentReport(rpt);
          setView('editor');
      }
  }, [projectId]);

  const handleSaveReport = useCallback(async (rpt: WeeklyReport) => {
      if (!projectId) return;
      await api.saveReport(projectId, rpt.weekEnding, rpt);
      setCurrentReport(rpt);
      loadProjectData(projectId); // Refresh to update totals if needed
  }, [projectId]);

  const handleSaveConfig = useCallback(async (newConfig: ProjectConfig) => {
      if (!projectId) return;
      await api.saveConfig(projectId, newConfig);
      setConfig(newConfig);
  }, [projectId]);

  // --- VIEWS ---

  if (view === 'selector') {
      return <ProjectSelector onSelect={setProjectId} />;
  }

  if (loading || !config) return <div className="flex h-screen items-center justify-center text-zinc-500">Loading Project...</div>;

  return (
    <div className="flex bg-zinc-100 h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-surface-dark text-white flex flex-col shrink-0 border-r border-brand-text-muted/20">
         {/* Sidebar Header - Stacked Layout */}
         <div className="px-5 pt-5 pb-4 border-b border-white/10">
            {/* Logo */}
            <img src="/recon-logo.svg" alt="RECON" className="h-10 w-auto mb-3" />
            
            {/* App Title */}
            <h1 className="font-bold text-lg text-white leading-tight">Weekly Report</h1>
            <span className="text-[10px] text-brand-text-muted uppercase tracking-widest">Project Controls v2.2</span>
            
            {/* Project Name */}
            <p className="text-sm text-brand-primary font-semibold mt-3 truncate">{config.identity.projectName}</p>
         </div>

         <nav className="flex-1 px-3 pt-4 space-y-1">
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${view === 'dashboard' ? 'bg-white/10 text-white' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}>
                Dashboard
            </button>
            <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${view === 'settings' ? 'bg-white/10 text-white' : 'text-brand-text-muted hover:text-white hover:bg-white/5'}`}>
                Project Setup
            </button>
         </nav>
         
         <div className="p-4 border-t border-white/10">
             <button onClick={() => setProjectId(null)} className="w-full text-left text-xs text-brand-text-muted hover:text-white flex items-center gap-2 mb-4">
                 <span>← Switch Project</span>
             </button>
             
             {/* User Profile Card - Clickable */}
             <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-white/10 transition group text-left"
             >
                 <div className="w-10 h-10 shrink-0 rounded-full bg-brand-text-muted/20 flex items-center justify-center font-bold text-brand-text-muted border-2 border-brand-primary overflow-hidden relative">
                    {userProfile.profilePicture ? (
                        <img src={userProfile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>
                            {userProfile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </span>
                    )}
                 </div>
                 <div className="min-w-0">
                     <div className="text-sm font-bold text-white truncate">{userProfile.name}</div>
                     <div className="text-xs text-brand-text-muted truncate group-hover:text-white/80 transition">{userProfile.role}</div>
                 </div>
             </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         {view === 'dashboard' && (
             <Dashboard 
                config={config} 
                reports={reports} 
                onCreate={handleCreateReport} 
                onOpen={handleOpenReport}
                projectId={projectId || ""}
             />
         )}
         {view === 'settings' && projectId && (
             <ProjectSetup 
                config={config} 
                onSaveConfig={handleSaveConfig} 
                onClose={() => setView('dashboard')} 
                projectId={projectId}
             />
         )}
         {view === 'editor' && currentReport && projectId && (
             <ReportEditor 
                report={currentReport} 
                projectConfig={config} 
                onUpdate={setCurrentReport} 
                onSave={() => handleSaveReport(currentReport)}
                onClose={() => setView('dashboard')} 
                projectId={projectId}
             />
         )}



         {/* Profile Editor Modal */}
         <UserProfileModal 
            open={showProfileModal} 
            onClose={() => setShowProfileModal(false)}
            initialData={userProfile}
            onSave={handleSaveProfile}
         />
      </main>
    </div>
  );
}

export default App;
