import React, { useState } from 'react';
import { 
  FileText, Cloud, TrendingUp, Camera, Users, Truck, Shield, 
  DollarSign, Calendar, ClipboardList, ChevronDown, ChevronRight, 
  Layers, GripVertical, Square, Table, Image, Type, Minus
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionPaletteProps {
  selectedSection: string;
  onSelectSection: (id: string) => void;
  enabledSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  sectionOrder: string[];
  onReorder: (newOrder: string[]) => void;
}

const sectionsHeader = [
  { id: 'cover', label: 'Cover Page', icon: FileText },
  { id: 'executive', label: 'Executive Summary', icon: ClipboardList },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'lookahead', label: '3-Week Look Ahead', icon: Calendar },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'personnel', label: 'Personnel', icon: Users },
  { id: 'equipment', label: 'Equipment', icon: Truck },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'financials', label: 'Financials', icon: DollarSign },
];

const SortableSectionItem = ({ 
  id, 
  label, 
  icon: Icon, 
  selected, 
  enabled, 
  onSelect, 
  onToggle 
}: { 
  id: string; 
  label: string; 
  icon: any; 
  selected: boolean; 
  enabled: boolean; 
  onSelect: () => void; 
  onToggle: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mx-1.5 mb-0.5 px-1.5 py-1.5 rounded flex items-center gap-1.5 cursor-pointer group transition-all ${
        selected ? 'bg-teal-50 border border-teal-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'
      } ${isDragging ? 'bg-white border-teal-300 shadow-lg scale-[1.02]' : ''}`}
      onClick={onSelect}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-gray-100 rounded"
      >
        <GripVertical size={10} className="text-gray-300 group-hover:text-gray-400" />
      </div>
      
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-3 h-3 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        onClick={e => e.stopPropagation()}
      />
      
      <Icon size={12} className={selected ? 'text-teal-600' : 'text-gray-400'} />
      
      <span className={`text-[11px] truncate ${selected ? 'text-teal-700 font-semibold' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
};

export const SectionPalette: React.FC<SectionPaletteProps> = ({
  selectedSection,
  onSelectSection,
  enabledSections,
  onToggleSection,
  sectionOrder,
  onReorder
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['sections', 'elements']);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags when clicking checkboxes/rows
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      onReorder(arrayMove(sectionOrder, oldIndex, newIndex));
    }
  };

  const elements = [
    { type: 'table', label: 'Table', icon: Table },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'text', label: 'Text', icon: Type },
    { type: 'divider', label: 'Divider', icon: Minus },
  ];

  return (
    <>
      <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report Builder</div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Sections Group */}
        <div className="border-b border-gray-100">
          <button 
            onClick={() => toggleGroup('sections')}
            className="w-full px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 text-left transition-colors"
          >
            {expandedGroups.includes('sections') ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
            <Layers size={12} className="text-teal-600" />
            <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">Sections</span>
            <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 font-medium">
              {Object.values(enabledSections).filter(Boolean).length}
            </span>
          </button>
          
          {expandedGroups.includes('sections') && (
            <div className="pb-1.5">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sectionOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {sectionOrder.map(id => {
                    const section = sectionsHeader.find(s => s.id === id);
                    if (!section) return null;
                    return (
                      <SortableSectionItem
                        key={id}
                        id={id}
                        label={section.label}
                        icon={section.icon}
                        selected={selectedSection === id}
                        enabled={enabledSections[id]}
                        onSelect={() => onSelectSection(id)}
                        onToggle={() => onToggleSection(id)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Elements Group */}
        <div>
          <button 
            onClick={() => toggleGroup('elements')}
            className="w-full px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 text-left transition-colors"
          >
            {expandedGroups.includes('elements') ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
            <Square size={12} className="text-teal-600" />
            <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">Elements</span>
          </button>
          
          {expandedGroups.includes('elements') && (
            <div className="pb-3 px-1.5 grid grid-cols-2 gap-1.5">
              {elements.map(element => (
                <div key={element.type} className="p-2.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 cursor-grab flex flex-col items-center gap-1.5 transition-all group shadow-sm hover:shadow active:cursor-grabbing active:scale-95">
                  <element.icon size={18} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                  <span className="text-[10px] font-medium text-gray-500 group-hover:text-teal-700 transition-colors">{element.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );
};
