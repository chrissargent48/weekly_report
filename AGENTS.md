# AGENTS.md - Weekly Report Builder Command Center

> **Purpose:** This document serves as the canonical source of truth for AI agents (Claude, Gemini, etc.) working on this codebase. It describes architecture, conventions, data flows, and implementation priorities.

---

## 🎯 Project Vision

**Weekly Report Builder** is a local-first, full-stack application for construction project managers to generate professional weekly status reports.

### Core Philosophy

- **Local First:** Data lives in the local file system (JSON files), managed by a local Node.js server.
- **Data Ownership:** You own your data. Projects are folders. Reports are files.
- **Professional Output:** The "Product" is the PDF report. It must look impeccable.
- **Workflow Centric:** The app guides the user through the weekly flow: _Review Schedule -> Update Progress -> Log Issues -> Print_.

---

## 🏗️ Architecture Overview

### Tech Stack

| Layer       | Technology         | Purpose                                          |
| :---------- | :----------------- | :----------------------------------------------- |
| **Server**  | Node.js + Express  | Local API, File System Access, orchestration     |
| **Client**  | React + TypeScript | Component-based UI logic                         |
| **Build**   | Vite               | Fast dev server and bundling                     |
| **Styling** | Tailwind CSS       | Utility-first styling (RECON Theme)              |
| **PDF**     | Puppeteer          | High-fidelity PDF generation via Headless Chrome |
| **Data**    | JSON + File System | Simple, human-readable data storage              |

### Directory Structure

```
.
├── client/                 # React Frontend
│   ├── src/
│   │   ├── App.tsx         # Main Controller
│   │   ├── components/     # UI Components
│   │   └── index.css       # Tailwind Styles
│   └── package.json
├── server/                 # Node.js Backend
│   ├── index.ts            # Express App & API Routes
│   ├── DataManager.ts      # File System Persistence Layer
│   └── types.ts            # Shared Types
├── data/                   # Local Database (JSON files)
│   ├── projects.json       # Index of projects
│   └── [project-id]/       # Per-project data
└── AGENTS.md               # This file
```

### Data Flow

1.  **Client** requests data via `fetch('/api/...')`.
2.  **Server** (`index.ts`) routes request to `DataManager`.
3.  **DataManager** reads/writes JSON files in `data/` directory.
4.  **Client** receives JSON and updates React State.

---

## 📝 Code Conventions

### Component Pattern (Client)

All major components should follow this structure:

```typescript
import React, { useState } from 'react';
import { Icon } from 'lucide-react';
import { SharedType } from '../../server/types'; // Import from server source of truth

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

1. **The "Print" Test:** Never merge a UI refactor without verifying that `print:break-inside-avoid` and other print-specific classes are preserved.
2. **Type Safety:** We share types between Client and Server. If you refactor a Server type in `types.ts`, you MUST immediately update the consuming Client component.
3. **No "Magic" Logic:** Logic belongs in `DataManager` (server) or React Hooks (client). Do not put business logic inside JSX rendering blocks.

---

## 🔒 Safety & Stability

### 1. Data Integrity

- **Server-Side Validation:** Ensure `DataManager` checks for file existence before reading.
- **Atomic Writes:** (Goal) Prevent partial writes to JSON files.
- **Types:** Keep `client` and `server` types in sync (currently defined in server/types.ts).

### 2. Print Safety

- **Puppeteer Fidelity:** PDF generation happens on the server via Puppeteer, visiting the client in a special print mode.
- **CSS Print Media:** Always test changes with `print:break-inside-avoid`.

---

## 🤖 Agent Instructions

### When Adding Features

1.  **Check Data Model**: Does `server/types.ts` support this?
2.  **Update Server**: Add API endpoints in `server/index.ts` and methods in `server/DataManager.ts`.
3.  **Update Client**: Create components in `client/src/components/` that consume the new API.

### When Refactoring

1.  **Respect the Brand**: Do not verify from RECON colors.
2.  **Maintain "Local-First"**: Do not add dependencies that require internet access (cloud DBs, external analytics) without explicit user permission.
