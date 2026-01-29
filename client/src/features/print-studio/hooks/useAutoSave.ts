import { useEffect, useRef } from 'react';

interface PrintSettings {
  enabledSections: Record<string, boolean>;
  sectionOrder: string[];
  sectionConfigs: Record<string, any>;
}

export function useAutoSave(
  projectId: string | undefined,
  reportDate: string | undefined,
  settings: PrintSettings,
  onSaveStatusChange: (status: 'saving' | 'saved' | 'error') => void
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!projectId || !reportDate) return;

    const settingsJson = JSON.stringify(settings);
    
    // Skip if nothing changed
    if (settingsJson === lastSavedRef.current) return;

    // Debounce: wait 1 second after last change before saving
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onSaveStatusChange('saving');

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/reports/${reportDate}/print-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: settingsJson,
        });

        if (!response.ok) throw new Error('Save failed');
        
        lastSavedRef.current = settingsJson;
        onSaveStatusChange('saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
        onSaveStatusChange('error');
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [projectId, reportDate, settings, onSaveStatusChange]);
}
