import { PrintSection } from './printConfig.types';

export const DEFAULT_SECTIONS: PrintSection[] = [
    { id: 'cover', label: 'Cover Page', included: true, order: -1 },
    { id: 'key_personnel', label: 'Key Personnel', included: true, order: 0 },
    { id: 'overview', label: 'Weekly Recap', included: true, order: 1 },
    { id: 'weather', label: 'Weather', included: true, order: 1 },
    { id: 'progress', label: 'Progress', included: true, order: 2 },
    { id: 'lookahead', label: 'Look Ahead', included: true, order: 3 },
    { id: 'manpower', label: 'Manpower', included: true, order: 4 },
    { id: 'equipment', label: 'Equipment', included: true, order: 5 },
    { id: 'materials', label: 'Materials', included: true, order: 6 },
    { id: 'procurement', label: 'Procurement', included: true, order: 7 },
    { id: 'safety', label: 'Safety', included: true, order: 8 },
    { id: 'financials', label: 'Financials', included: true, order: 9 },
    { id: 'schedule', label: 'Schedule Milestones', included: true, order: 10 },
    { id: 'issues', label: 'Issues & Risks', included: true, order: 11 },
    { id: 'documents', label: 'Documents', included: false, order: 12 },
    { id: 'photos', label: 'Photos', included: true, order: 13 }
];
