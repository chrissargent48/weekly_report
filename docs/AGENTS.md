# AGENTS.md - Weekly Report Builder Command Center

> **Purpose:** This document serves as the canonical source of truth for AI agents (Claude, Gemini, etc.) working on this codebase. It describes architecture, conventions, data flows, and implementation priorities.

---

## 🎯 Project Vision

**Weekly Report Builder** is a local-first, full-stack application for construction project managers to generate professional weekly status reports. It runs as a desktop application via Electron (wrapping a React frontend) and a local Node.js server.

### Core Philosophy

- **Local First:** Data lives in the local file system (JSON files), managed by a local Node.js server.
- **Data Ownership:** You own your data. Projects are folders. Reports are files.
- **Professional Output:** The "Product" is the PDF report. It must look impeccable.
- **WYSIWYG:** The "Print Studio" allows users to design and preview reports exactly as they will look in PDF.
- **Workflow Centric:** The app guides the user through the weekly flow: _Review Schedule -> Update Progress -> Log Issues -> Print_.
- **IT-Friendly Deployment:** The application runs as a local server script (Node.js) accessed via the browser. This avoids the need for administrative privileges or formal software installation, making it easier to deploy in strict IT environments.

---

## 🏗️ Architecture Overview

### Deployment Strategy

To minimize "Shadow IT" friction, this tool is designed to run without a traditional installer:

1.  **Zero-Install**: Runs from a directory on the user's machine.
2.  **Browser Interface**: Uses the system's approved web browser (Chrome/Edge) as the UI.
3.  **Local Server**: A lightweight Node.js process handles file operations, bypassing the need for cloud storage or external API approvals.

### PDF Generation Strategy

We use **Client-Side Generation** via `@react-pdf/renderer`.

- **Why?** It keeps the generation logic in React, allowing us to share components between the "Print Studio" preview and the final PDF file.
- **Tech**: The PDF is built as a React component tree, rendered to a stream/blob in the browser, and saved to disk.

### Tech Stack

| Layer         | Technology           | Purpose                                       |
| :------------ | :------------------- | :-------------------------------------------- |
| **App Shell** | Electron             | Desktop application wrapper                   |
| **Server**    | Node.js + Express    | Local API, File System Access, orchestration  |
| **Client**    | React + TypeScript   | Component-based UI logic                      |
| **Build**     | Vite                 | Fast dev server and bundling                  |
| **Styling**   | Tailwind, HeadlessUI | Utility-first styling & Accessible components |
| **PDF**       | @react-pdf/renderer  | Client-side PDF generation (fully migrated)   |
| **Schemas**   | Zod + Shared Types   | Unified validation for Client & Server        |
| **Layout**    | Server Layout Engine | Yoga-based positioning for complex reports    |
| **Editor**    | Tiptap               | Rich text editing for summaries               |
| **DnD**       | @dnd-kit             | Drag and drop interactions                    |
| **Images**    | react-easy-crop      | Image manipulation & cropping                 |
| **Data**      | JSON, xlsx           | File storage & Excel processing               |

### Directory Structure

```text
.
├── client/                 # React Frontend
│   ├── src/
│   │   ├── features/       # Feature-based architecture (e.g., print-studio)
│   │   ├── components/     # Shared UI Components
│   │   └── types.ts        # Client-specific UI types
│   └── package.json
├── server/                 # Node.js Backend
│   ├── index.ts            # Express App & API Routes
│   ├── DataManager.ts      # File System Persistence Layer (Atomic Writes)
│   ├── services/           # Layout Engine & internal services
│   └── types.ts            # Server-side exports of shared schemas
├── shared/                 # Unified Schemas & Logic
│   └── schemas.ts          # Zod schemas used by both Client & Server
├── electron/               # Electron Main Process layer
├── data/                   # Local Database (JSON files)
│   ├── projects.json       # Index of projects
│   └── [project-id]/       # Per-project data (reports, images, config)
└── AGENTS.md               # This file
```

### Data Flow

1.  **Client** requests data via `fetch('/api/...')`.
2.  **Server** (`index.ts`) routes request to `DataManager`.
3.  **DataManager** reads/writes JSON files in `data/` directory.
4.  **Weather API**: Server proxies requests to Census Bureau (Geocoding) and Open-Meteo/NWS.
5.  **Images**: Uploaded to `data/[project-id]/images` and served via `/uploads` static route.

---

## 📝 Code Conventions

### Component Pattern (Client)

All major components should follow this structure:

```typescript
import React, { useState } from 'react';
import { Icon } from 'lucide-react';
// Note: Client and Server types are currently separate.
import { SharedType } from '../types';

interface Props {
  data: SharedType;
  onUpdate: (newData: SharedType) => void;
}

export function ComponentName({ data, onUpdate }: Props) {
  // 1. Local UI State
  const [isOpen, setIsOpen] = useState(false);

  // 2. Helpers
  const handleChange = (val: string) => {
    onUpdate({ ...data, field: val });
  };

  // 3. Render
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* Tailwind classes first, logic second */}
    </div>
  );
}
```

### Styling Rules (RECON Brand)

- **Primary Navy:** `bg-brand-navy` / `text-brand-navy`
- **Accent Amber:** `bg-brand-amber` / `text-brand-amber`
- **Backgrounds:** `bg-slate-50` (App), `bg-white` (Cards)
- **Typography:** **Inter** font. `font-sans`.
- **Semantic Tokens Only**: Do NOT use literal color names (e.g., `brand-navy`). Use semantic tokens:
  - `brand-primary` (Main action/color)
  - `brand-accent` (Highlights/Warnings)
  - `brand-surface-dark` / `brand-surface-light` (Backgrounds)
  - `brand-text-muted` (Secondary text)
- **Buttons**: Use `.btn-primary` and `.btn-secondary` classes.

### Refactoring Rules

1.  **Unified Search & Validation:** Use `shared/schemas.ts` for all data structures. Changes to the data model MUST be made there first.
2.  **Type Safety:** `client/src/types.ts` and `server/types.ts` both import from `shared/schemas.ts`. Ensure you use the inferred types (`z.infer<typeof ...>`).
3.  **No "Magic" Logic:** Logic belongs in `DataManager` (server) or React Hooks (client). Do not put business logic inside JSX rendering blocks.
4.  **Local-First Integrity:** Use `DataManager` methods to ensure atomic writes (writes to `.tmp` then rename).

---

## 🔒 Safety & Stability

### 1. Data Integrity

- **Atomic Writes:** `DataManager` writes to a temporary file and renames it to prevent corruption during crashes.
- **Index Recovery:** The server can rebuild `projects.json` by scanning project directories for `config.json` files.

### 2. Print Safety

- **PDF Fidelity:** We use `@react-pdf/renderer` in the "Print Studio". This allows for a precise PREVIEW of the PDF before generation.
- **Client-Side Generation:** PDF generation is entirely client-side to ensure what the user sees in the preview is exactly what they get in the file.

### 3. Local Connectivity

- **Server Health Check**: Always verify that the backend is responsive before running browser-based tasks. If you encounter a `localhost` connection error, verify the process is active.

---

## 🚀 Current Status & Milestones (Jan 2026)

- **Print Studio v2**: Fully functional WYSIWYG editor with drag-and-drop report items.
- **Unified Schema Layer**: All project and report data is validated via shared `Zod` schemas.
- **Smart Weather**: Multi-source API that automatically switches between historical data (Open-Meteo) and forecasts (NWS).
- **Golden Triangle Integration**: Tight coupling between Project Schedule, Weekly Progress, and Financial Tracking.

---

## 🤖 Agent Instructions

### When Adding Features

1.  **Check Data Model**: Does `server/types.ts` AND `client/src/types.ts` support this?
2.  **Update Server**: Add API endpoints in `server/index.ts` and methods in `server/DataManager.ts`.
3.  **Update Client**: Create components in `client/src/components/` that consume the new API.

### When Refactoring

1.  **Respect the Brand**: Do not verifiy from RECON colors.
2.  **Maintain "Local-First"**: Do not add dependencies that require internet access (cloud DBs, external analytics) without explicit user permission.
3.  **Electron Awareness**: Remember the app handles local file paths and native windows.
4.  **Local Server Continuity**: If `localhost:5173` (or the configured port) is unreachable, **STOP** and check if the server is running. Use `run_command` with `npm start` or `npm run dev` before assuming a browser or code bug.

---

## 🙋‍♂️ User Question: How do I ask other AIs for help?

If you need to ask another AI (like ChatGPT, Claude web, etc.) for help, **copy and paste this context block** first. It ensures they understand your unique setup (Local Server + React + Electron Scaffolding) and don't give you generic "Web App" advice that won't work.

**👇 COPY THIS BLOCK:**

> **Context for my coding question:**
> I am building a "Local-First" Desktop App for construction reporting.
>
> - **Stack:** React 18 (Vite) + TypeScript + Tailwind CSS (Client)
> - **Backend:** Node.js Express server running locally on the user's machine (not a cloud server).
> - **Deployment:** It's a web app running on `localhost`, but wrapped in Electron scaffolding (though actively just using the browser for now).
> - **Key Constraints:**
>   - I have direct access to the local file system via my `DataManager` backend.
>   - I use `@react-pdf/renderer` to generate PDFs client-side.
>   - Do not suggest cloud databases (Firebase, AWS) unless explicitly asked.
>   - Keep solutions compatible with Windows.

**Then ask your question.** (e.g., "How do I create a new photo grid component?")
