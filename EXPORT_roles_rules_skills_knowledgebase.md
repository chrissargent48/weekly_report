# Weekly Report Builder - Complete Export
# Roles, Rules, Skills & Knowledgebase
# Generated: 2026-01-31

---

# TABLE OF CONTENTS

1. [RULES](#1-rules)
2. [WORKFLOWS](#2-workflows)
3. [PROJECT-SPECIFIC CLAUDE SKILLS](#3-project-specific-claude-skills)
4. [CORE SKILLS LIBRARY](#4-core-skills-library)
5. [ROLES & AGENT BEHAVIORAL CONTRACTS](#5-roles--agent-behavioral-contracts)
6. [KNOWLEDGEBASE - Project Architecture](#6-knowledgebase---project-architecture)
7. [EXTERNAL SKILLS INDEX (229 Skills)](#7-external-skills-index-229-skills)

---

# 1. RULES

## Source: `.agent/rules/code-style.md`

### Tailwind CSS
- Use utility classes for everything (margin, padding, colors).
- Use `brand-navy` and `brand-amber` for primary branding.
- Avoid arbitrary values `w-[123px]` unless strictly necessary for print layouts.

### TypeScript
- **No `any`**: Define interfaces in `types.ts`.
- **Props**: Destructure props in function arguments.
- **Event Handlers**: Type events explicitly (e.g., `React.ChangeEvent<HTMLInputElement>`).

### React
- **Functional Components**: Only.
- **Hooks**: Use built-in hooks (`useState`, `useEffect`, `useRef`).
- **Icons**: Use `lucide-react`.

### Print Styles
- **@media print**: Use `print:` prefix for print-specific overrides.
- **Hiding Elements**: `no-print` class (if defined) or `print:hidden`.

---

## Source: `docs/AGENTS.md` - Styling Rules (RECON Brand)

- **Primary Navy:** `bg-brand-navy` / `text-brand-navy`
- **Accent Amber:** `bg-brand-amber` / `text-brand-amber`
- **Backgrounds:** `bg-slate-50` (App), `bg-white` (Cards)
- **Typography:** **Inter** font. `font-sans`.
- **Semantic Tokens Only**: Do NOT use literal color names. Use semantic tokens:
  - `brand-primary` (Main action/color)
  - `brand-accent` (Highlights/Warnings)
  - `brand-surface-dark` / `brand-surface-light` (Backgrounds)
  - `brand-text-muted` (Secondary text)
- **Buttons**: Use `.btn-primary` and `.btn-secondary` classes.

## Refactoring Rules

1. **Unified Search & Validation:** Use `shared/schemas.ts` for all data structures.
2. **Type Safety:** `client/src/types.ts` and `server/types.ts` both import from `shared/schemas.ts`. Use `z.infer<typeof ...>`.
3. **No "Magic" Logic:** Logic belongs in `DataManager` (server) or React Hooks (client). No business logic in JSX.
4. **Local-First Integrity:** Use `DataManager` methods for atomic writes.

---

# 2. WORKFLOWS

## 2a. Log Error Workflow

**Source:** `.agent/workflows/log-error.md`
**Trigger:** `/log-error`

1. **Stop and Reflect**: Do not proceed with fixing the code immediately.
2. **Interview Phase**:
   - Ask 5-8 specific questions about what went wrong.
   - Focus on **User Error** (Prompting, Context, Harnessing) rather than blaming the model.
   - Questions cover: "What was the exact prompt?", "What did you expect vs what happened?", "Did you specify constraints?", "Was context too full?"
3. **Analysis**: Analyze answers.
4. **Log Creation**: Read `logs/metadata.json`, create `logs/errors/error-[ID]-[short-desc].md` with Error Log Template (What Happened, User Error Category, Triggering Prompt, Impact, Prevention).
5. **Commit**: Update `logs/metadata.json`.
6. **Rewind (Optional)**: User decides to rewind or continue.

---

## 2b. Log Success Workflow

**Source:** `.agent/workflows/log-success.md`
**Trigger:** `/log-success`

1. **Identify the Win**: Fast completion, elegant solution, or perfect first-try.
2. **Interview Phase**: Ask 4-6 questions ("Why did this work so well?", "What specific prompt triggered this?", "Was it luck or good context?")
3. **Log Creation**: Read `logs/metadata.json`, create `logs/successes/success-[ID]-[short-desc].md`.
4. **Commit**: Update `logs/metadata.json`.

---

## 2c. Deploy / Distribute Workflow

**Source:** `.agent/workflows/deploy.md`

### Verification
1. `npm install`
2. `npm run build`
3. Fix any TS errors.

### Local Run
1. `npm run dev` or run `start_app.bat`.

### Packaging (Future)
1. Ensure `electron` and `electron-builder` are configured.
2. Run `npm run electron:build`.

---

# 3. PROJECT-SPECIFIC CLAUDE SKILLS

## 3a. scaffold-component

**Source:** `.claude/skills/scaffold-component/SKILL.md`

Create a new React component named `$ARGUMENTS` following project conventions:

1. **Create the component file** at `client/src/components/$ARGUMENTS.tsx`
2. **Structure:**
   ```typescript
   import React from 'react';
   // Icons (if needed)
   // Types (if needed)

   interface Props {
     // Define props here
   }

   export function $ARGUMENTS({ ...props }: Props) {
     // State hooks
     // Handler functions
     return (
       <section className="bg-white rounded border border-slate-200 p-4">
         <h3 className="font-bold text-brand-navy mb-4">Title</h3>
         {/* Content */}
       </section>
     );
   }
   ```
3. **Conventions:** Function components (not arrow for exports), Interface for Props first, Import order: React > Icons > Types > local, Tailwind CSS, `brand-navy` for headings.
4. **After creation:** Add export to index.ts, run build to verify.

---

## 3b. verify-build

**Source:** `.claude/skills/verify-build/SKILL.md`

1. **Run the build:** `cd client && npm run build` - Must complete without errors
2. **Check for `any` types:** Search for explicit `any` in `client/src/` - suggest proper types
3. **Run tests:** `npm test` - All tests should pass
4. **Report results:** Build status, TypeScript errors, `any` types found, test results

---

## 3c. update-types

**Source:** `.claude/skills/update-types/SKILL.md`

1. **Modify the type definition:** Edit `client/src/types.ts`, add JSDoc comments
2. **Update initialization:** Check `App.tsx` for `emptyReport`, ensure defaults
3. **Check update handlers:** Review `ReportEditor.tsx` generic handlers
4. **Update serialization:** Check `data/` JSON schemas, API endpoints
5. **Verify:** `npm run build` to catch type errors

---

## 3d. debug-data

**Source:** `.claude/skills/debug-data/SKILL.md`

1. **Check localStorage hook:** Review `App.tsx` `useLocalStorage`, verify key, check read on mount
2. **Verify useEffect dependencies:** All deps in array, watch for stale closures, check infinite loops
3. **Check JSON parsing:** try/catch on `JSON.parse`, handle circular refs, null/undefined
4. **Debug steps:** `console.log(localStorage.getItem('YOUR_KEY'));`
5. **Common issues:** Storage quota, parsing errors, race conditions, pre-hydration effects
6. **Check server-side storage:** Review `server/index.ts`, check `data/` directory

---

# 4. CORE SKILLS LIBRARY

**Source:** `skills.md`

## Hybrid Skill System Strategy

1. **Core Skills (Always Active):** Project-critical workflows in active memory.
2. **Skill Library (`.agent/skills_library/`):** 130+ specialized capabilities, lazy-loaded by trigger.

### Core Skill: scaffold_component
**Trigger:** "Create component", "New UI feature"

### Core Skill: verify_build
**Trigger:** "Check work", "Verify", "Done"
**Action:** `npm run build` -> Check for `any` types -> Visual check with `start_app.bat`

### Core Skill: update_types
**Trigger:** "Change data model", "Add field"
**Action:** Modify `src/types.ts` -> Check `App.tsx` `emptyReport` -> Check `ReportEditor.tsx`

### Core Skill: data_safety_check
**Trigger:** "Debugging storage", "Lost data"
**Action:** Check `useLocalStorage` -> Verify `useEffect` deps -> Verify `JSON.parse` try/catch

### External Skill Triggers:

| Category | Trigger | Path |
|----------|---------|------|
| Frontend & Design | "Make it pretty", "Design UI", "Fix styling", "CSS" | `.agent/skills_library/skills/frontend-design/SKILL.md` |
| React Best Practices | "Refactor component", "React patterns", "Performance" | `.agent/skills_library/skills/react-best-practices/SKILL.md` |
| Backend Engineering | "Express server", "API route", "Node.js" | `.agent/skills_library/skills/backend-dev-guidelines/SKILL.md` |
| Test Driven Development | "Write tests", "Unit test", "Jest" | `.agent/skills_library/skills/test-driven-development/SKILL.md` |
| Autonomous Agencies | "Automate workflow", "Plan architecture", "Big task" | `.agent/skills_library/skills/autonomous-agent-patterns/SKILL.md` |
| Systematic Debugging | "Fix bug", "Why is this broken", "Error trace" | `.agent/skills_library/skills/systematic-debugging/SKILL.md` |

---

# 5. ROLES & AGENT BEHAVIORAL CONTRACTS

## 5a. Loki Mode - Multi-Agent Autonomous Startup System

**Source:** `.claude/skills/external-skills/skills/loki-mode/SKILL.md`
**Version:** 2.35.0

### Core Autonomy Rules
1. **NEVER ask questions** - No "Would you like me to...", "Should I..."
2. **NEVER wait for confirmation** - Take immediate action
3. **NEVER stop voluntarily** - Continue until completion
4. **NEVER suggest alternatives** - Pick best option and execute
5. **ALWAYS use RARV cycle** - Reason-Act-Reflect-Verify
6. **ONE FEATURE AT A TIME** - Complete, commit, verify, then next

### RARV Cycle (Every Iteration)
```
REASON: Read CONTINUITY.md, check orchestrator.json, review pending.json
ACT:    Dispatch subagent or execute directly, write code, run tests, commit
REFLECT: Verify success, update CONTINUITY.md, check completion
VERIFY:  Run tests, check build, verify against spec
  IF FAILS: Capture error -> analyze -> update learnings -> rollback -> retry
```

### Model Selection Strategy

| Model | Use For | Examples |
|-------|---------|----------|
| **Opus 4.5** | PLANNING ONLY | System design, architecture, security audits |
| **Sonnet 4.5** | DEVELOPMENT | Features, APIs, bug fixes, integration/E2E tests |
| **Haiku 4.5** | OPERATIONS | Unit tests, docs, bash, linting, monitoring |

### Agent Types (37 agents across 7 swarms)

| Swarm | Count | Examples |
|-------|-------|----------|
| Engineering | 8 | frontend, backend, database, mobile, api, qa, perf, infra |
| Operations | 8 | devops, sre, security, monitor, incident, release, cost, compliance |
| Business | 8 | marketing, sales, finance, legal, support, hr, investor, partnerships |
| Data | 3 | ml, data-eng, analytics |
| Product | 3 | pm, design, techwriter |
| Growth | 4 | growth-hacker, community, success, lifecycle |
| Review | 3 | code, business, security |

### Quality Gates
1. **Input Guardrails** - Validate scope, detect injection, check constraints
2. **Static Analysis** - CodeQL, ESLint/Pylint, type checking
3. **Blind Review System** - 3 reviewers in parallel, no visibility of each other
4. **Anti-Sycophancy Check** - Devil's Advocate on unanimous approval
5. **Output Guardrails** - Code quality, spec compliance, no secrets
6. **Severity-Based Blocking** - Critical/High/Medium = BLOCK; Low/Cosmetic = TODO
7. **Test Coverage Gates** - Unit: 100% pass, >80% coverage; Integration: 100% pass

### Constitutional AI Principles
```yaml
core_principles:
  - "Never delete production data without explicit backup"
  - "Never commit secrets or credentials to version control"
  - "Never bypass quality gates for speed"
  - "Always verify tests pass before marking task complete"
  - "Never claim completion without running actual tests"
  - "Prefer simple solutions over clever ones"
  - "Document decisions, not just code"
  - "When unsure, reject action or flag for review"
```

### Essential Patterns
- **Spec-First:** OpenAPI -> Tests -> Code -> Validate
- **Code Review:** Blind Review (parallel) -> Debate (if disagree) -> Devil's Advocate -> Merge
- **Guardrails:** Input Guard (BLOCK) -> Execute -> Output Guard (VALIDATE)
- **Tripwires:** Validation fails -> Halt -> Escalate or retry
- **Fallbacks:** Primary -> Model fallback -> Workflow fallback -> Human escalation
- **Explore-Plan-Code:** Research -> Plan (NO CODE) -> Execute
- **Self-Verification:** Code -> Test -> Fail -> Learn -> Update -> Retry
- **Constitutional Self-Critique:** Generate -> Critique against principles -> Revise
- **Memory Consolidation:** Episodic (trace) -> Pattern Extraction -> Semantic (knowledge)
- **Debate Verification:** Proponent defends -> Opponent challenges -> Synthesize
- **Narrow Scope:** 3-5 steps max -> Human review -> Continue

### Multi-Tiered Fallback System
- **Model-Level:** opus -> sonnet -> haiku
- **Workflow-Level:** Full workflow -> Simplified -> Decompose -> Human escalation
- **Human Escalation Triggers:** retry_count > 3, sensitive domains, confidence < 0.6, timeout, budget exceeded

### Dynamic Agent Selection by Complexity

| Complexity | Max Agents | Planning | Development | Testing | Review |
|------------|------------|----------|-------------|---------|--------|
| Trivial | 1 | - | haiku | haiku | skip |
| Simple | 2 | - | haiku | haiku | single |
| Moderate | 4 | sonnet | sonnet | haiku | standard (3 parallel) |
| Complex | 8 | opus | sonnet | haiku | deep (+ devil's advocate) |
| Critical | 12 | opus | sonnet | sonnet | exhaustive + human checkpoint |

### Red Flags - Never Do These
- NEVER skip code review between tasks
- NEVER proceed with unfixed Critical/High/Medium issues
- NEVER dispatch reviewers sequentially (always parallel)
- NEVER dispatch multiple implementation subagents in parallel
- NEVER use sonnet for reviews (always opus)
- NEVER aggregate before all 3 reviewers complete
- NEVER skip re-review after fixes

---

## 5b. Subagent-Driven Development

**Source:** `.claude/skills/external-skills/skills/subagent-driven-development/SKILL.md`

### Process Flow
```
Read plan -> Extract all tasks -> Create TodoWrite
  Per task:
    Dispatch implementer subagent
      -> Implementer asks questions? -> Answer -> Implement
      -> Implementer implements, tests, commits, self-reviews
    Dispatch spec compliance reviewer
      -> Compliant? Yes -> Next | No -> Fix -> Re-review
    Dispatch code quality reviewer
      -> Approved? Yes -> Mark complete | No -> Fix -> Re-review
  After all tasks:
    Dispatch final code reviewer for entire implementation
    Finish development branch
```

### Three Specialized Reviewer Roles

1. **Implementer Subagent** - Implement task, write tests (TDD), self-review, ask questions if unclear
2. **Spec Compliance Reviewer** - Verify implementation matches specification, check for missing requirements, detect over-engineering
3. **Code Quality Reviewer** - Verify clean, tested, maintainable code (only after spec compliance passes)

---

# 6. KNOWLEDGEBASE - Project Architecture

## Source: `docs/AGENTS.md`

### Project Vision
**Weekly Report Builder** is a local-first, full-stack application for construction project managers to generate professional weekly status reports.

### Core Philosophy
- **Local First:** Data lives in local file system (JSON files)
- **Data Ownership:** Projects are folders. Reports are files.
- **Professional Output:** The PDF report must look impeccable.
- **WYSIWYG:** Print Studio for exact preview.
- **Workflow Centric:** Review Schedule -> Update Progress -> Log Issues -> Print.
- **IT-Friendly:** Runs as local server script via browser.

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| App Shell | Electron | Desktop wrapper |
| Server | Node.js + Express | Local API, File System |
| Client | React + TypeScript | Component-based UI |
| Build | Vite | Dev server and bundling |
| Styling | Tailwind, HeadlessUI | Utility-first styling |
| PDF | @react-pdf/renderer | Client-side PDF generation |
| Schemas | Zod + Shared Types | Unified validation |
| Layout | Server Layout Engine | Yoga-based positioning |
| Editor | Tiptap | Rich text editing |
| DnD | @dnd-kit | Drag and drop |
| Images | react-easy-crop | Image manipulation |
| Data | JSON, xlsx | File storage & Excel |

### Directory Structure
```
.
├── client/                 # React Frontend
│   ├── src/
│   │   ├── features/       # Feature-based architecture
│   │   ├── components/     # Shared UI Components
│   │   └── types.ts        # Client-specific UI types
│   └── package.json
├── server/                 # Node.js Backend
│   ├── index.ts            # Express App & API Routes
│   ├── DataManager.ts      # File System Persistence (Atomic Writes)
│   ├── services/           # Layout Engine & services
│   └── types.ts            # Server-side shared schemas
├── shared/                 # Unified Schemas & Logic
│   └── schemas.ts          # Zod schemas (Client & Server)
├── electron/               # Electron Main Process
├── data/                   # Local Database (JSON files)
│   ├── projects.json       # Index of projects
│   └── [project-id]/       # Per-project data
└── AGENTS.md
```

### Data Flow
1. Client requests data via `fetch('/api/...')`
2. Server routes to `DataManager`
3. `DataManager` reads/writes JSON in `data/`
4. Weather API: Server proxies to Census Bureau + Open-Meteo/NWS
5. Images: Uploaded to `data/[project-id]/images`, served via `/uploads`

### Component Pattern
```typescript
import React, { useState } from 'react';
import { Icon } from 'lucide-react';
import { SharedType } from '../types';

interface Props {
  data: SharedType;
  onUpdate: (newData: SharedType) => void;
}

export function ComponentName({ data, onUpdate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const handleChange = (val: string) => {
    onUpdate({ ...data, field: val });
  };
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* Tailwind classes first, logic second */}
    </div>
  );
}
```

### Agent Instructions When Adding Features
1. Check Data Model: `server/types.ts` AND `client/src/types.ts`
2. Update Server: API endpoints in `server/index.ts`, methods in `DataManager.ts`
3. Update Client: Components in `client/src/components/`
4. Respect the Brand, maintain Local-First, Electron awareness
5. Local Server Continuity: Check server running before assuming bugs

---

# 7. EXTERNAL SKILLS INDEX (229 Skills)

**Source:** `.claude/skills/external-skills/skills/`

Each skill is a self-contained `SKILL.md` file with YAML frontmatter (name, description, triggers) and comprehensive documentation.

| # | Skill Name | Description |
|---|-----------|-------------|
| 1 | 3d-web-experience | Expert in building 3D experiences for the web - Three.js, React Three Fiber, Spline, WebGL |
| 2 | ab-test-setup | Plan, design, or implement A/B tests or experiments |
| 3 | active-directory-attacks | Active Directory penetration testing - Kerberoasting, DCSync, pass-the-hash, BloodHound |
| 4 | address-github-comments | Address review or issue comments on open GitHub PRs using gh CLI |
| 5 | agent-evaluation | Testing and benchmarking LLM agents - behavioral testing, capability assessment, reliability metrics |
| 6 | agent-manager-skill | Manage multiple local CLI agents via tmux sessions with cron scheduling |
| 7 | agent-memory-mcp | Hybrid memory system for AI agents (Architecture, Patterns, Decisions) |
| 8 | agent-memory-systems | Agent memory architecture: short-term, long-term, vector stores, cognitive architectures |
| 9 | agent-tool-builder | Tool design for AI agents - JSON Schema, MCP standard, validation |
| 10 | ai-agents-architect | Designing autonomous AI agents - tool use, memory, planning, multi-agent orchestration |
| 11 | ai-product | LLM integration patterns, RAG architecture, prompt engineering, AI UX, cost optimization |
| 12 | ai-wrapper-product | Building products that wrap AI APIs into focused tools |
| 13 | algolia-search | Algolia search implementation, indexing strategies, React InstantSearch |
| 14 | algorithmic-art | Creating algorithmic art using p5.js with seeded randomness |
| 15 | analytics-tracking | Analytics tracking setup - GA4, conversion tracking, GTM, UTM parameters |
| 16 | api-documentation-generator | Generate comprehensive API documentation from code |
| 17 | api-fuzzing-bug-bounty | API security testing, fuzzing, IDOR vulnerabilities |
| 18 | api-patterns | API design - REST vs GraphQL vs tRPC, response formats, versioning, pagination |
| 19 | app-builder | Full-stack application building orchestrator from natural language |
| 20 | app-store-optimization | ASO toolkit for Apple App Store and Google Play Store |
| 21 | architecture | Architectural decision-making framework, ADR documentation |
| 22 | autonomous-agent-patterns | Design patterns for autonomous coding agents |
| 23 | autonomous-agents | Autonomous AI systems - ReAct loops, goal decomposition, reliability |
| 24 | aws-penetration-testing | AWS security assessment - IAM, S3, Lambda, metadata SSRF |
| 25 | aws-serverless | Production serverless on AWS - Lambda, API Gateway, DynamoDB, SQS/SNS |
| 26 | azure-functions | Azure Functions - isolated worker, Durable Functions, cold start optimization |
| 27 | backend-dev-guidelines | Node.js/Express/TypeScript microservices - layered architecture, Prisma, Zod |
| 28 | bash-linux | Bash/Linux terminal patterns, scripting, error handling |
| 29 | behavioral-modes | AI operational modes (brainstorm, implement, debug, review, teach, ship) |
| 30 | blockrun | External model capabilities (image gen, real-time data) via Blockrun |
| 31 | brainstorming | Pre-creative-work exploration of intent, requirements and design |
| 32 | brand-guidelines-anthropic | Anthropic official brand colors and typography |
| 33 | brand-guidelines-community | Anthropic community brand guidelines |
| 34 | broken-authentication | Authentication and session management vulnerability testing |
| 35 | browser-automation | Playwright and Puppeteer patterns for testing, scraping, agentic control |
| 36 | browser-extension-builder | Chrome/Firefox extension development, manifest v3 |
| 37 | bullmq-specialist | BullMQ Redis-backed job queues and background processing |
| 38 | bun-development | Bun runtime - package management, bundling, testing |
| 39 | burp-suite-testing | Burp Suite web security testing - proxy, repeater, scanner |
| 40 | canvas-design | Visual art creation in PNG/PDF using design philosophy |
| 41 | cc-skill-backend-patterns | Backend architecture, API design, database optimization |
| 42 | cc-skill-clickhouse-io | ClickHouse database patterns and query optimization |
| 43 | cc-skill-coding-standards | Universal coding standards for TypeScript, React, Node.js |
| 44 | cc-skill-continuous-learning | Continuous learning development skill |
| 45 | cc-skill-frontend-patterns | Frontend patterns for React, Next.js, state management |
| 46 | cc-skill-project-guidelines-example | Project guidelines skill example |
| 47 | cc-skill-security-review | Security checklist for auth, user input, secrets, APIs |
| 48 | cc-skill-strategic-compact | Strategic compact development skill |
| 49 | claude-code-guide | Master guide for Claude Code - config, prompting, debugging |
| 50 | claude-d3js-skill | Interactive data visualisations using D3.js |
| 51 | clean-code | Pragmatic coding standards - concise, no over-engineering |
| 52 | clerk-auth | Clerk auth implementation, middleware, organizations, webhooks |
| 53 | cloud-penetration-testing | Cloud security assessment across AWS, Azure, GCP |
| 54 | code-review-checklist | Code review guidelines - quality, security, best practices |
| 55 | competitor-alternatives | Competitor comparison and alternative pages for SEO |
| 56 | computer-use-agents | AI agents that interact with computers - screen viewing, cursor, clicking |
| 57 | concise-planning | Clear, actionable, atomic checklist generation |
| 58 | content-creator | SEO-optimized marketing content with brand voice |
| 59 | context-window-management | LLM context window strategies - summarization, trimming, routing |
| 60 | conversation-memory | Persistent memory systems for LLM conversations |
| 61 | copy-editing | Systematic approach to editing marketing copy |
| 62 | copywriting | Marketing copy for homepage, landing pages, pricing, features |
| 63 | core-components | Core component library and design system patterns |
| 64 | crewai | CrewAI multi-agent framework - roles, tasks, crew orchestration |
| 65 | database-design | Schema design, indexing, ORM selection, serverless databases |
| 66 | deployment-procedures | Safe deployment workflows, rollback, verification |
| 67 | discord-bot-architect | Discord bots - Discord.js, Pycord, slash commands, sharding |
| 68 | dispatching-parallel-agents | Multi-agent orchestration for independent tasks |
| 69 | doc-coauthoring | Structured workflow for co-authoring documentation |
| 70 | docker-expert | Docker multi-stage builds, optimization, security, Compose |
| 71 | documentation-templates | README, API docs, code comments, AI-friendly documentation |
| 72 | docx | Document creation/editing with tracked changes and comments |
| 73 | docx-official | Official DOCX manipulation toolkit |
| 74 | email-sequence | Email sequences, drip campaigns, lifecycle emails |
| 75 | email-systems | Transactional email, marketing automation, deliverability |
| 76 | ethical-hacking-methodology | Penetration testing lifecycle and methodology |
| 77 | executing-plans | Execute implementation plans in separate sessions with review checkpoints |
| 78 | file-organizer | Intelligent file organization, duplicate finding, restructuring |
| 79 | file-path-traversal | Directory traversal and LFI vulnerability testing |
| 80 | file-uploads | File uploads and cloud storage - S3, R2, presigned URLs |
| 81 | finishing-a-development-branch | Guide completion of development work - merge, PR, cleanup |
| 82 | firebase | Firebase Auth, Firestore, Cloud Functions, Storage, Hosting |
| 83 | form-cro | Form optimization for lead capture, contact, demo request forms |
| 84 | free-tool-strategy | Free tools for marketing - engineering as marketing |
| 85 | frontend-design | Distinctive, production-grade frontend interfaces |
| 86 | frontend-dev-guidelines | React/TypeScript - Suspense, lazy loading, MUI, TanStack Router |
| 87 | game-development | Game development orchestrator |
| 88 | gcp-cloud-run | GCP Cloud Run services and functions |
| 89 | geo-fundamentals | Generative Engine Optimization for AI search engines |
| 90 | git-pushing | Stage, commit, push with conventional commit messages |
| 91 | github-workflow-automation | GitHub PR reviews, issue triage, CI/CD, Actions |
| 92 | graphql | GraphQL schema design, resolvers, DataLoader, federation |
| 93 | html-injection-testing | HTML injection attack techniques and testing |
| 94 | hubspot-integration | HubSpot CRM integration - OAuth, objects, webhooks |
| 95 | i18n-localization | Internationalization - translations, locale files, RTL |
| 96 | idor-testing | Insecure Direct Object Reference vulnerability testing |
| 97 | inngest | Inngest serverless background jobs and event-driven workflows |
| 98 | interactive-portfolio | Portfolios that land jobs - memorable experiences |
| 99 | internal-comms-anthropic | Internal communications templates (Anthropic format) |
| 100 | internal-comms-community | Internal communications templates (community format) |
| 101 | javascript-mastery | 33+ essential JavaScript concepts reference |
| 102 | kaizen | Continuous improvement, error proofing, standardization |
| 103 | langfuse | Langfuse LLM observability - tracing, prompt management, evaluation |
| 104 | langgraph | LangGraph stateful multi-actor AI applications |
| 105 | launch-strategy | Product launch, feature announcement, release strategy |
| 106 | lint-and-validate | Automatic quality control, linting, static analysis |
| 107 | linux-privilege-escalation | Linux privilege escalation - sudo, SUID, cron exploitation |
| 108 | linux-shell-scripting | Bash script templates for system administration |
| 109 | llm-app-patterns | Production LLM applications - RAG, agents, LLMOps |
| 110 | loki-mode | Multi-agent autonomous startup system (see Section 5a above) |
| 111 | marketing-ideas | 140 proven marketing approaches by category |
| 112 | marketing-psychology | 70+ mental models for marketing application |
| 113 | mcp-builder | Creating MCP servers for LLM tool integration |
| 114 | metasploit-framework | Metasploit penetration testing - exploits, payloads, post-exploitation |
| 115 | micro-saas-launcher | Indie hacker approach to launching small SaaS products |
| 116 | mobile-design | Mobile-first design for iOS/Android - touch, performance, conventions |
| 117 | moodle-external-api-development | Moodle LMS custom web service APIs |
| 118 | neon-postgres | Neon serverless Postgres, branching, connection pooling |
| 119 | nestjs-expert | NestJS modules, DI, guards, interceptors, TypeORM/Mongoose |
| 120 | network-101 | Web server, HTTP/HTTPS, SNMP, SMB configuration for pentesting |
| 121 | nextjs-best-practices | Next.js App Router - Server Components, data fetching, routing |
| 122 | nextjs-supabase-auth | Supabase Auth with Next.js App Router |
| 123 | nodejs-best-practices | Node.js framework selection, async patterns, security |
| 124 | notebooklm | Query Google NotebookLM from Claude Code |
| 125 | notion-template-business | Building and selling Notion templates as a business |
| 126 | onboarding-cro | Post-signup onboarding, user activation, time-to-value |
| 127 | page-cro | Marketing page conversion rate optimization |
| 128 | paid-ads | Paid advertising - Google Ads, Meta, LinkedIn, Twitter/X |
| 129 | parallel-agents | Multi-agent orchestration for comprehensive analysis |
| 130 | paywall-upgrade-cro | In-app paywalls, upgrade screens, feature gates |
| 131 | pdf | PDF manipulation - extraction, creation, merging, forms |
| 132 | pdf-official | Official PDF toolkit |
| 133 | pentest-checklist | Penetration testing planning and methodology checklist |
| 134 | pentest-commands | Essential penetration testing command references |
| 135 | performance-profiling | Performance measurement, analysis, optimization |
| 136 | personal-tool-builder | Building custom tools that solve your own problems |
| 137 | plaid-fintech | Plaid API integration - Link tokens, transactions, ACH |
| 138 | plan-writing | Structured task planning with dependencies and verification |
| 139 | planning-with-files | Manus-style file-based planning for complex tasks |
| 140 | playwright-skill | Complete Playwright browser automation and testing |
| 141 | popup-cro | Popup/modal optimization for conversions |
| 142 | powershell-windows | PowerShell Windows patterns and scripting |
| 143 | pptx | Presentation creation and editing |
| 144 | pptx-official | Official PPTX toolkit |
| 145 | pricing-strategy | Pricing decisions, packaging, monetization |
| 146 | prisma-expert | Prisma ORM - schema, migrations, query optimization |
| 147 | privilege-escalation-methods | Post-exploitation privilege escalation (Linux/Windows) |
| 148 | product-manager-toolkit | RICE prioritization, interviews, PRDs, discovery frameworks |
| 149 | programmatic-seo | SEO-driven pages at scale using templates and data |
| 150 | prompt-caching | LLM prompt caching strategies including CAG |
| 151 | prompt-engineer | Designing effective prompts for LLM applications |
| 152 | prompt-engineering | Prompt engineering patterns and optimization |
| 153 | prompt-library | Curated prompts for coding, writing, analysis, creative tasks |
| 154 | python-patterns | Python framework selection, async, type hints, structure |
| 155 | rag-engineer | RAG systems - embeddings, vector databases, chunking |
| 156 | rag-implementation | RAG patterns - chunking, embeddings, vector stores, retrieval |
| 157 | react-best-practices | React/Next.js performance optimization (Vercel Engineering) |
| 158 | react-patterns | Modern React patterns - hooks, composition, performance |
| 159 | react-ui-patterns | React UI patterns for loading, error handling, data fetching |
| 160 | receiving-code-review | Receiving code review feedback with technical rigor |
| 161 | red-team-tactics | Red team tactics based on MITRE ATT&CK |
| 162 | red-team-tools | Red team methodology and bug bounty hunting techniques |
| 163 | referral-program | Referral/affiliate program design and optimization |
| 164 | remotion-best-practices | Remotion video creation in React |
| 165 | requesting-code-review | Requesting code review before merging |
| 166 | research-engineer | Academic research engineering with scientific rigor |
| 167 | salesforce-development | Salesforce LWC, Apex, REST/Bulk APIs, Connected Apps |
| 168 | scanning-tools | Security scanning tools and methodologies |
| 169 | schema-markup | Schema.org structured data, JSON-LD, rich snippets |
| 170 | scroll-experience | Immersive scroll-driven experiences and parallax |
| 171 | segment-cdp | Segment Customer Data Platform integration |
| 172 | senior-architect | Software architecture for scalable, maintainable systems |
| 173 | senior-fullstack | Complete fullstack development with React, Next.js, Node.js |
| 174 | seo-audit | SEO audit, technical SEO, meta tags review |
| 175 | seo-fundamentals | SEO fundamentals, E-E-A-T, Core Web Vitals |
| 176 | server-management | Server process management, monitoring, scaling |
| 177 | shodan-reconnaissance | Shodan search for exposed devices and services |
| 178 | shopify-apps | Shopify app development - Remix, App Bridge, Polaris |
| 179 | shopify-development | Shopify development |
| 180 | signup-flow-cro | Signup/registration flow optimization |
| 181 | skill-creator | Guide for creating effective skills |
| 182 | skill-developer | Create and manage Claude Code skills |
| 183 | slack-bot-builder | Slack apps using Bolt framework - Block Kit, commands |
| 184 | slack-gif-creator | Animated GIFs optimized for Slack |
| 185 | smtp-penetration-testing | SMTP server security assessment |
| 186 | social-content | Social media content for LinkedIn, Twitter/X, Instagram, TikTok |
| 187 | software-architecture | Quality-focused software architecture |
| 188 | sql-injection-testing | SQL injection vulnerability testing across database systems |
| 189 | sqlmap-database-pentesting | Automated SQL injection testing with SQLMap |
| 190 | ssh-penetration-testing | SSH security assessment and penetration testing |
| 191 | stripe-integration | Stripe payments, subscriptions, billing, webhooks |
| 192 | subagent-driven-development | Execute plans with fresh subagent per task + two-stage review |
| 193 | systematic-debugging | Rigorous root cause analysis before proposing fixes |
| 194 | tailwind-patterns | Tailwind CSS v4 - CSS-first config, container queries |
| 195 | tdd-workflow | Test-Driven Development RED-GREEN-REFACTOR cycle |
| 196 | telegram-bot-builder | Telegram bots - Bot API, automation, AI-powered |
| 197 | telegram-mini-app | Telegram Mini Apps (TWA) - TON ecosystem, payments |
| 198 | test-driven-development | TDD before writing implementation code |
| 199 | test-fixing | Systematically fix failing tests with smart error grouping |
| 200 | testing-patterns | Jest testing patterns, factories, mocking, TDD |
| 201 | theme-factory | Theme toolkit for styling artifacts (10 preset themes) |
| 202 | top-web-vulnerabilities | OWASP-aligned web vulnerability taxonomy |
| 203 | trigger-dev | Trigger.dev background jobs and AI workflows |
| 204 | twilio-communications | Twilio SMS, voice, WhatsApp, verification |
| 205 | typescript-expert | TypeScript expert |
| 206 | ui-ux-pro-max | UI/UX design - 50 styles, 21 palettes, 50 font pairings, 9 stacks |
| 207 | upstash-qstash | Upstash QStash serverless message queues |
| 208 | using-git-worktrees | Isolated git worktrees for feature work |
| 209 | using-superpowers | Establish skill usage at conversation start |
| 210 | vercel-deployment | Deploying to Vercel with Next.js |
| 211 | verification-before-completion | Verify work before claiming completion |
| 212 | viral-generator-builder | Shareable generator tools - quizzes, name generators |
| 213 | voice-agents | Voice AI - speech-to-speech and pipeline architectures |
| 214 | voice-ai-development | Voice AI apps - OpenAI Realtime, Vapi, Deepgram, ElevenLabs |
| 215 | vulnerability-scanner | OWASP 2025, supply chain security, attack surface mapping |
| 216 | web-artifacts-builder | Multi-component Claude.ai HTML artifacts |
| 217 | web-design-guidelines | Web Interface Guidelines compliance review |
| 218 | webapp-testing | Testing local web apps with Playwright |
| 219 | windows-privilege-escalation | Windows privilege escalation techniques |
| 220 | wireshark-analysis | Network packet capture and analysis with Wireshark |
| 221 | wordpress-penetration-testing | WordPress security assessment and WPScan |
| 222 | workflow-automation | Workflow automation - n8n, Temporal, Inngest |
| 223 | writing-plans | Write implementation plans before touching code |
| 224 | writing-skills | Create, edit, verify skills before deployment |
| 225 | xlsx | Spreadsheet creation, editing, analysis with formulas |
| 226 | xlsx-official | Official XLSX toolkit |
| 227 | xss-html-injection | XSS and HTML injection testing - cookie theft, CSP bypass |
| 228 | zapier-make-patterns | No-code automation with Zapier and Make |

---

# END OF EXPORT

**Summary:**
- **1 Rule File** (code style)
- **3 Workflows** (log-error, log-success, deploy)
- **4 Project-Specific Claude Skills** (scaffold-component, verify-build, update-types, debug-data)
- **4 Core Skills** (scaffold_component, verify_build, update_types, data_safety_check)
- **6 External Skill Triggers** (frontend-design, react-best-practices, backend-dev-guidelines, TDD, autonomous-agents, systematic-debugging)
- **37 Agent Roles** across 7 swarms (Engineering, Operations, Business, Data, Product, Growth, Review)
- **3 Reviewer Roles** (Implementer, Spec Compliance, Code Quality)
- **229 External Skills** covering frontend, backend, DevOps, security, testing, AI/agents, marketing, and more
- **Full Project Knowledgebase** (architecture, tech stack, data flow, conventions, brand guidelines)
