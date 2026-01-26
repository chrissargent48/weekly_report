import React, { useState } from 'react';
import { PuckEditor } from './components/PuckEditor';
import { PrintRenderer } from './components/PrintRenderer';
import { Printer, Edit } from 'lucide-react';
import { mapReportToPuckData } from './utils/dataMapper';

type StudioMode = 'editor' | 'print';

export const StudioContainer: React.FC = () => {
  const [mode, setMode] = useState<StudioMode>('editor');
  const [reportData, setReportData] = useState<any>(null);

  // Mock initial data loading
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/8d22c3bd-6f1d-4630-baad-f89d66122c99/reports/2026-01-18.json');
        const report = await response.json();
        const puckData = mapReportToPuckData(report);
        setReportData(puckData);
      } catch (err) {
        console.error("Failed to load report data:", err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Studio Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight italic flex items-center gap-2">
            <span className="not-italic text-2xl">👷</span> 
            LeadEazy <span className="text-blue-600 not-italic">Studio</span>
          </h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200">
            Ford City Report
          </span>
        </div>

        <div className="flex items-center gap-2">
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
          <PuckEditor onChange={setReportData} initialData={reportData} />
        ) : (
          <PrintRenderer data={reportData} />
        )}
      </main>
    </div>
  );
};
