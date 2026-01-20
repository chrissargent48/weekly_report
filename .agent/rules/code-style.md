# Code Style Rules

## Tailwind CSS

- Use utility classes for everything (margin, padding, colors).
- Use `brand-navy` and `brand-amber` for primary branding.
- Avoid arbitrary values `w-[123px]` unless strictly necessary for print layouts.

## TypeScript

- **No `any`**: Define interfaces in `types.ts`.
- **Props**: Destructure props in function arguments.
- **Event Handlers**: Type events explicitly (e.g., `React.ChangeEvent<HTMLInputElement>`).

## React

- **Functional Components**: Only.
- **Hooks**: Use built-in hooks (`useState`, `useEffect`, `useRef`).
- **Icons**: Use `lucide-react`.

## Print Styles

- **@media print**: Use `print:` prefix for print-specific overrides.
- **Hiding Elements**: `no-print` class (if defined) or `print:hidden`.
