import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type SelectableElementType = 'image' | 'section' | 'text' | 'table';

export interface SelectedElement {
  id: string;
  type: SelectableElementType;
  // For images: photo index; for sections: section id
  dataId: string | number;
  // Bounding rect for positioning panels
  rect?: DOMRect;
}

interface SelectionContextType {
  selectedElement: SelectedElement | null;
  selectElement: (element: SelectedElement | null) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

  const selectElement = useCallback((element: SelectedElement | null) => {
    setSelectedElement(element);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedElement?.id === id;
  }, [selectedElement]);

  return (
    <SelectionContext.Provider value={{ selectedElement, selectElement, clearSelection, isSelected }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
