import React, { useState, useCallback, useRef } from 'react';
import { PuckEditor } from './components/PuckEditor';
import { ChevronLeft, Edit, Printer, Save, Calendar, MapPin, LayoutTemplate, Loader2 } from 'lucide-react';
import { ProjectConfig, WeeklyReport } from '../../types';
import { mapReportData, mapReportToPuckData, mapPuckDataToReport } from './utils/dataMapper';
import { api } from '../../api';
import { PDFViewer } from '@react-pdf/renderer';
import { ReportDocument } from './react-pdf/ReportDocument';

type StudioMode = 'editor' | 'print';

interface StudioContainerProps {
  onBack?: () => void;
  report?: WeeklyReport;
  projectConfig?: ProjectConfig;
  projectId?: string;
  onUpdate?: (updatedReport: WeeklyReport) => void;
}

export const StudioContainer: React.FC<StudioContainerProps> = ({ onBack, report, projectConfig, projectId, onUpdate }) => {
  const [mode, setMode] = useState<StudioMode>('editor');
  const [paperSize, setPaperSize] = useState<'A4' | 'LETTER' | 'LEGAL'>('A4');
  const [reportData, setReportData] = useState<any>(() => 
    (report && projectConfig) ? mapReportData(report as WeeklyReport, projectConfig) : null
  );
  // Layout state removed - we render directly from reportData (PuckData)
  const [isSaving, setIsSaving] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize internal Puck state if report changes significantly from outside
  React.useEffect(() => {
    if (report && projectConfig && !reportData) {
      setReportData(mapReportData(report as WeeklyReport, projectConfig));
    }
  }, [report, projectConfig]);

  // Handle Debounced Persistence (Bi-directional Sync)
  const handlePuckChange = useCallback((newData: any) => {
    // Immediate local state update for UI responsiveness
    setReportData(newData);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!report || !projectId) return;
      
      setIsSaving(true);
      try {
        console.log("[Studio] Syncing changes to master report...");
        const updatedReport = mapPuckDataToReport(newData, report as WeeklyReport);
        await api.saveReport(projectId, report.weekEnding, updatedReport);
        if (onUpdate) onUpdate(updatedReport);
        console.log("[Studio] Sync complete.");
      } catch (err) {
        console.error("Failed to sync changes:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1500); // 1.5s debounce
  }, [report, projectId, onUpdate]);

  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success'>('idle');

  const handlePublish = useCallback(async (data: any) => {
      setPublishStatus('publishing');
      try {
          const updatedReport = mapPuckDataToReport(data, report as WeeklyReport);
          await api.saveReport(projectId!, report!.weekEnding, updatedReport);
          if (onUpdate) onUpdate(updatedReport);
          setPublishStatus('success');
          setTimeout(() => setPublishStatus('idle'), 3000);
      } catch (err) {
          console.error("Publish failed:", err);
          setPublishStatus('idle');
      }
  }, [report, projectId, onUpdate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Studio Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            Print <span className="text-blue-600">Studio</span>
          </h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200">
            {projectConfig?.identity.projectName} — {report?.weekEnding}
          </span>
          {isSaving && (
            <div className="flex items-center gap-2 text-blue-500 text-[10px] font-bold animate-pulse uppercase ml-4">
              <Save className="w-3 h-3" />
              Syncing Changes...
            </div>
          )}
          {publishStatus === 'publishing' && (
            <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold animate-spin ml-4 uppercase">
              <Loader2 className="w-3 h-3" />
              Publishing...
            </div>
          )}
          {publishStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold ml-4 uppercase bg-green-50 px-2 py-1 rounded border border-green-200">
              ✓ Layout Published Successfully
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Paper Size Selector */}
           <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200 mr-2">
              <span className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size:</span>
              <select 
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="A4">A4 (210x297mm)</option>
                <option value="LETTER">Letter (8.5x11")</option>
                <option value="LEGAL">Legal (8.5x14")</option>
              </select>
           </div>

          <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
            <button
              onClick={() => setMode('editor')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                mode === 'editor'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Editor
              </div>
            </button>
            <button
              onClick={() => setMode('print')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                mode === 'print'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Preview
              </div>
            </button>
          </div>
          
          {mode === 'print' && (
             <button 
                onClick={() => window.print()} 
                className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
             >
               <Printer className="w-4 h-4" />
               Download PDF
             </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {mode === 'editor' ? (
          <PuckEditor 
            onChange={handlePuckChange} 
            initialData={reportData} 
            onPublish={handlePublish}
            paperSize={paperSize}
          />
        ) : (
          <div className="h-full flex flex-col bg-gray-200">
             <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
                <ReportDocument 
                  data={reportData}
                  enabledSections={{
                    cover: true,
                    executive: true,
                    weather: true,
                    progress: true,
                    lookahead: true,
                    photos: true,
                    safety: true
                  }}
                />
             </PDFViewer>
          </div>
        )}
      </main>
    </div>
  );
};
