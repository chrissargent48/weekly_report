import React, { useEffect, useRef, useState } from 'react';
import { Render } from "@puckeditor/core";
import { puckConfig } from "../config/puckConfig";
import { Previewer } from 'pagedjs';

interface PrintRendererProps {
  data: any;
}

export const PrintRenderer: React.FC<PrintRendererProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!data || !previewRef.current || !containerRef.current) return;

    const renderPrint = async () => {
      setIsProcessing(true);
      
      // 1. Clear previous preview
      previewRef.current!.innerHTML = '';
      
      // 2. Setup Paged.js Previewer
      const previewer = new Previewer();
      
      try {
        // 3. Clone the content to be paginated
        // We use the Render component from Puck to generate the HTML
        // but we hide the source container
        const content = containerRef.current!.innerHTML;
        
        // 4. Run Paged.js
        await previewer.preview(content, ["/print-studio.css"], previewRef.current!);
        
        console.log("Paged.js rendering complete");
      } catch (err) {
        console.error("Paged.js error:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    renderPrint();
  }, [data]);

  return (
    <div className="h-full overflow-y-auto bg-gray-500 p-8 flex flex-col items-center">
      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="font-medium text-gray-700">Calculating Page Breaks...</p>
          </div>
        </div>
      )}

      {/* Hidden source container that Puck renders into */}
      <div ref={containerRef} className="hidden">
        {data && <Render config={puckConfig} data={data} />}
      </div>

      {/* The actual visible preview area where Paged.js will put its pages */}
      <div 
        ref={previewRef} 
        id="print-preview-surface"
        className="w-[210mm] min-h-[297mm]"
      />

      <style>{`
        #print-preview-surface .pagedjs_page {
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          #print-preview-surface, #print-preview-surface * {
            visibility: visible;
          }
          #print-preview-surface {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
           .pagedjs_page {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
