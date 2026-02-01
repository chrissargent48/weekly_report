# Agent Skills Library

> **Usage:** These skills are standard workflows for working on the Weekly Report Builder.

## Skill Architecture Strategy

We use a **Hybrid Skill System** to balance performance with capability.

1.  **Core Skills (Below):** specific, project-critical workflows that must reside in "active memory" (this file).
2.  **Skill Library (`.agent/skills_library/`):** A vast repository of specialized capabilities (130+ skills).
    - **Why separate?** Loading 130+ skills would consume ~100k tokens, degrading reasoning quality and slowing responses.
    - **How to use:** When a task matches a "Trigger" in the index below, **lazy load** the skill by reading its specific `SKILL.md` file using `view_file`.

---

## I. Core Project Skills (Always Active)

### Skill: scaffold_component

**Trigger:** "Create component", "New UI feature"
**Description:** Generates a consistent React component structure.
**Action:**

1.  **Define Interface:** Start with `interface Props`.
2.  **Imports:** React first, then Icons, then Types.
3.  **Structure:**
    ```typescript
    export function FeatureName({ prop }: Props) {
       // State
       // Handlers
       return (
         <section className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-brand-navy mb-4">Title</h3>
            {/* Content */}
         </section>
       );
    }
    ```

### Skill: verify_build

**Trigger:** "Check work", "Verify", "Done"
**Description:** Ensures the application is stable.
**Action:**
Run this sequence:

1.  `npm run build` - Must be Clean.
2.  Check for "Any" types - Minimize use of `any`.
3.  **Visual Check:** Does `start_app.bat` launch successfully?

### Skill: update_types

**Trigger:** "Change data model", "Add field"
**Description:** safely updates the core data schema.
**Action:**

1.  Modify `src/types.ts`.
2.  Check `src/App.tsx` for `emptyReport` initialization (ensure new field has default value).
3.  Check `src/components/ReportEditor.tsx` generic update handlers.

### Skill: data_safety_check

**Trigger:** "Debugging storage", "Lost data"
**Action:**

1.  Check `App.tsx` `useLocalStorage` hook.
2.  Ensure `useEffect` dependency arrays are correct.
3.  Verify `JSON.parse` is wrapped in try/catch.

---

## II. External Skill Index (Lazy Load)

> **Instruction:** If a user request matches a trigger below, `view_file` the corresponding path to "activate" the skill.

### 🎨 Frontend & Design

**Trigger:** "Make it pretty", "Design UI", "Fix styling", "CSS"
**Path:** `.agent/skills_library/skills/frontend-design/SKILL.md`
**Use for:** Creating distinctive, premium, production-grade interfaces.

### ⚛️ React Best Practices

**Trigger:** "Refactor component", "React patterns", "Performance"
**Path:** `.agent/skills_library/skills/react-best-practices/SKILL.md`
**Use for:** Advanced hooks, context patterns, and component composition.

### 🔧 Backend Engineering

**Trigger:** "Express server", "API route", "Node.js"
**Path:** `.agent/skills_library/skills/backend-dev-guidelines/SKILL.md`
**Use for:** structuring code in `server/`, middleware, and error handling.

### 🧪 Test Driven Development

**Trigger:** "Write tests", "Unit test", "Jest"
**Path:** `.agent/skills_library/skills/test-driven-development/SKILL.md`
**Use for:** Writing robust tests in `tests/` before/during implementation.

### 🧠 Autonomous Agencies

**Trigger:** "Automate workflow", "Plan architecture", "Big task"
**Path:** `.agent/skills_library/skills/autonomous-agent-patterns/SKILL.md`
**Use for:** Planning complex multi-step workflows.

### 🐞 Systematic Debugging

**Trigger:** "Fix bug", "Why is this broken", "Error trace"
**Path:** `.agent/skills_library/skills/systematic-debugging/SKILL.md`
**Use for:** rigorous root cause analysis when stuck.

### 📄 Print Studio & PDF

**Trigger:** "Print Studio", "PDF generation", "React-PDF", "Fix PDF layout"
**Path:** `.agent/skills_library/skills/print-studio/SKILL.md`
**Use for:** Best practices for complex PDF generation, pagination, and React-PDF quirks.
