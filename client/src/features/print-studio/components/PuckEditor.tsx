import React from 'react';
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "../config/puckConfig";

interface PuckEditorProps {
  initialData: any;
  onChange: (data: any) => void;
  onPublish?: (data: any) => void;
  paperSize?: 'A4' | 'LETTER' | 'LEGAL';
}

export const PuckEditor: React.FC<PuckEditorProps> = ({ initialData, onChange, onPublish, paperSize = 'A4' }) => {
  
  const getPageDimensions = () => {
      switch (paperSize) {
          case 'LETTER': return { width: '8.5in', height: '11in' };
          case 'LEGAL': return { width: '8.5in', height: '14in' };
          case 'A4': default: return { width: '210mm', height: '297mm' };
      }
  };

  const dims = getPageDimensions();

  return (
    <div className="h-full puck-studio overflow-hidden">
      <Puck
        config={puckConfig}
        data={initialData || { content: [], root: {} }}
        onChange={onChange}
        onPublish={onPublish}
        headerPath="/print-studio"
      />
      <style>{`
        /* 1. Reset & Background */
        .puck-studio .puck-app {
          height: 100%;
          background-color: #cbd5e1; /* Darker gray for better contrast with white paper */
          position: relative;
        }
        
        /* 2. Scrollable Canvas Area */
        .puck-studio .puck-canvas {
           padding: 4rem 2rem;
           overflow-y: auto !important;
           height: 100%;
           display: flex;
           justify-content: center;
           scroll-behavior: smooth;
           background-image: radial-gradient(#94a3b8 1px, transparent 1px);
           background-size: 30px 30px; /* Dotted grid background */
        }

        /* 3. The "Paper" Simulation */
        .puck-studio .puck-root {
           background-color: white;
           width: ${dims.width} !important;
           min-height: ${dims.height} !important;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
           margin: 0 auto;
           position: relative;
           max-width: none !important; 
           
           /* Page Break Indicators - Repeating SVG for Multi-page context */
           background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='${dims.height}' viewBox='0 0 1000 ${parseInt(dims.height)}' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='${parseInt(dims.height) - 1}' x2='1000' y2='${parseInt(dims.height) - 1}' stroke='%23ef4444' stroke-width='2' stroke-dasharray='5,5' /%3E%3Ctext x='10' y='${parseInt(dims.height) - 10}' font-family='monospace' font-size='12' fill='%23ef4444' font-weight='bold'%3E✂ PAGE BREAK (PHYSICAL LIMIT)%3C/text%3E%3C/svg%3E");
           background-size: 100% ${dims.height};
           background-repeat: repeat-y;
        }

        /* 4. Sidebar Branding overrides */
        .puck-studio .puck-sidebar {
           border-right: 1px solid #e2e8f0;
           background-color: white;
           z-index: 10;
        }

        /* 6. Puck UI Cleanup */
        .puck-studio .puck-canvas-container {
            padding: 0;
            background: transparent;
        }
      `}</style>
    </div>
  );
};
