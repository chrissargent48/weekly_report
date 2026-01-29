import { useCallback } from 'react';
import { WeeklyReport } from '../types';

/**
 * Hook for updating a top-level section of a WeeklyReport.
 * Reduces boilerplate in tab components by providing a typed updater.
 * 
 * Usage:
 *   const updateSafety = useReportSection(report, onUpdate, 'safety');
 *   updateSafety('narrative', 'some text');
 *   // equivalent to: onUpdate({...report, safety: {...report.safety, narrative: 'some text'}})
 */
export function useReportSection<K extends keyof WeeklyReport>(
  report: WeeklyReport,
  onUpdate: (report: WeeklyReport) => void,
  section: K
) {
  return useCallback(
    (field: string, value: any) => {
      onUpdate({
        ...report,
        [section]: {
          ...(report[section] as any),
          [field]: value,
        },
      });
    },
    [report, onUpdate, section]
  );
}

/**
 * Hook for replacing an entire array within a nested report path.
 * Useful for tabs like Procurement that update resources.procurement directly.
 * 
 * Usage:
 *   const updateEntries = useReportArrayUpdate(report, onUpdate, 
 *     (r) => r.resources.procurement,
 *     (r, val) => ({...r, resources: {...r.resources, procurement: val}})
 *   );
 *   updateEntries([...newItems]);
 */
export function useReportArrayUpdate<T>(
  report: WeeklyReport,
  onUpdate: (report: WeeklyReport) => void,
  setter: (report: WeeklyReport, value: T) => WeeklyReport
) {
  return useCallback(
    (value: T) => {
      onUpdate(setter(report, value));
    },
    [report, onUpdate, setter]
  );
}

/**
 * Generic CRUD helpers for array fields within a report section.
 * Returns add, update, remove functions for a typed array.
 * 
 * Usage:
 *   const { items, add, update, remove } = useReportCrud(
 *     report, onUpdate,
 *     report.issues,
 *     (items) => ({...report, issues: items}),
 *     () => ({ id: crypto.randomUUID(), description: '', ... })
 *   );
 */
export function useReportCrud<T extends { id: string }>(
  report: WeeklyReport,
  onUpdate: (report: WeeklyReport) => void,
  items: T[],
  setItems: (items: T[]) => WeeklyReport,
  createNew: () => T
) {
  const add = useCallback(() => {
    onUpdate(setItems([...items, createNew()]));
  }, [items, onUpdate, setItems, createNew]);

  const update = useCallback(
    (id: string, field: keyof T, value: T[keyof T]) => {
      const updated = items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      onUpdate(setItems(updated));
    },
    [items, onUpdate, setItems]
  );

  const remove = useCallback(
    (id: string) => {
      onUpdate(setItems(items.filter(item => item.id !== id)));
    },
    [items, onUpdate, setItems]
  );

  return { items, add, update, remove };
}
