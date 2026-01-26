import React from 'react';
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "../config/puckConfig";

interface PuckEditorProps {
  initialData: any;
  onChange: (data: any) => void;
}

export const PuckEditor: React.FC<PuckEditorProps> = ({ initialData, onChange }) => {
  return (
    <div className="h-full puck-studio">
      <Puck
        config={puckConfig}
        data={initialData || { content: [], root: {} }}
        onPublish={(data) => {
          console.log("Published Data:", data);
          onChange(data);
        }}
        headerPath="/print-studio"
      />
      <style>{`
        .puck-studio .puck-app {
          height: 100%;
        }
        .puck-studio .puck-canvas {
          background-color: #f3f4f6;
          padding: 2rem;
        }
        /* Custom overrides for the Puck UI to match brand */
        .puck-studio .puck-sidebar {
           border-right: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};
