import React, { useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { GripVertical, Eye, EyeOff, Printer } from 'lucide-react';
import { WeeklyReport, ProjectConfig, PrintOptions } from '../types';
import { PrintView } from './PrintView';
import { generateReportPDF } from '../utils/pdfGenerator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    open: boolean;
    onClose: () => void;
    report: WeeklyReport;
    projectConfig: ProjectConfig;
    onExport: (options: PrintOptions) => Promise<void>;
}

const DEFAULT_SECTIONS = [
    { id: 'overview', label: 'Executive Summary', included: true },
    { id: 'weather', label: 'Weather', included: true },
    { id: 'progress', label: 'Progress', included: true },
    { id: 'lookahead', label: 'Look Ahead', included: true },
    { id: 'manpower', label: 'Manpower', included: true },
    { id: 'equipment', label: 'Equipment', included: true },
    { id: 'materials', label: 'Materials', included: true },
    { id: 'procurement', label: 'Procurement', included: true },
    { id: 'safety', label: 'Safety', included: true },
    { id: 'financials', label: 'Financials', included: true },
    { id: 'schedule', label: 'Schedule Milestones', included: true },
    { id: 'issues', label: 'Issues & Risks', included: true },
    { id: 'documents', label: 'Documents', included: false },
    { id: 'photos', label: 'Photos', included: true }
];

export function PrintPreviewModal({ open, onClose, report, projectConfig, onExport }: Props) {
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [logoScale, setLogoScale] = useState(100);
    const [logoAlign, setLogoAlign] = useState<'left'|'center'|'right'>('left');
    const [showPageBreaks, setShowPageBreaks] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Cover photo selection state
    const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
    const [stripPhotoIndexes, setStripPhotoIndexes] = useState<number[]>([1, 2, 3]);
    const [spacing, setSpacing] = useState<'compact' | 'standard' | 'relaxed'>('standard');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleSection = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, included: !s.included } : s));
    };

    const handleExport = async () => {
        setIsGenerating(true);
        try {
            // Build print options from current state
            const printOptions = { 
                sections: sections as any,
                logoScale,
                logoAlign,
                heroPhotoIndex,
                stripPhotoIndexes,
                spacing
            };
            
            // Generate PDF client-side using pdfmake (no server needed!)
            await generateReportPDF(report, projectConfig, printOptions);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-zinc-900/90" aria-hidden="true" />

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-[95vw] h-[90vh] bg-zinc-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                            
                            {/* Left Sidebar: Controls */}
                            <div className="w-full md:w-96 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 z-10">
                                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                            <Printer className="w-5 h-5 text-brand-primary" />
                                            Print Studio
                                        </h2>
                                        <p className="text-xs text-zinc-500 mt-1">Customize report layout</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Report Sections</p>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                            <ul className="space-y-2">
                                                {sections.map((section) => (
                                                    <SortableSectionItem 
                                                        key={section.id} 
                                                        section={section} 
                                                        onToggle={() => toggleSection(section.id)} 
                                                    />
                                                ))}
                                            </ul>
                                        </SortableContext>
                                    </DndContext>

                                    <div className="mt-8 pt-6 border-t border-zinc-100">
                                        <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Preview Options</p>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative inline-flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showPageBreaks}
                                                    onChange={(e) => setShowPageBreaks(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </div>
                                            <span className="text-xs font-medium text-zinc-700">Show Page Break Guides</span>
                                        </label>
                                    </div>
                                    
                                    {/* Layout Options */}
                                    <div className="mt-6 pt-6 border-t border-zinc-100">
                                        <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Layout Options</p>
                                        
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-zinc-600 mb-2 block">Spacing Priority</label>
                                            <div className="grid grid-cols-3 bg-zinc-100 p-1 rounded-lg gap-1">
                                                {(['compact', 'standard', 'relaxed'] as const).map((space) => (
                                                    <button
                                                        key={space}
                                                        onClick={() => setSpacing(space)}
                                                        className={`py-1.5 px-2 text-[10px] font-medium rounded capitalize transition flex flex-col items-center gap-1 ${
                                                            spacing === space 
                                                                ? 'bg-white text-brand-primary shadow-sm ring-1 ring-black/5' 
                                                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                                                        }`}
                                                    >
                                                        {space}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-zinc-400 mt-2">
                                                {spacing === 'compact' && "Tight layout to fit more on one page."}
                                                {spacing === 'standard' && "Balanced spacing for readability."}
                                                {spacing === 'relaxed' && "More whitespace for a cleaner look."}
                                            </p>
                                        </div>

                                        <p className="text-xs font-bold uppercase text-zinc-400 mb-4 pt-4 border-t border-zinc-100 tracking-wider">Cover Logo Options</p>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <label className="text-xs font-bold text-zinc-600">Scale</label>
                                                <span className="text-xs text-zinc-400">{logoScale}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="20" 
                                                max="200" 
                                                value={logoScale} 
                                                onChange={(e) => setLogoScale(parseInt(e.target.value))}
                                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-zinc-600 mb-2 block">Alignment</label>
                                            <div className="flex bg-zinc-100 p-1 rounded-lg">
                                                {(['left', 'center', 'right'] as const).map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => setLogoAlign(align)}
                                                        className={`flex-1 py-1 text-xs font-medium rounded capitalize transition ${
                                                            logoAlign === align 
                                                                ? 'bg-white text-brand-primary shadow-sm' 
                                                                : 'text-zinc-500 hover:text-zinc-700'
                                                        }`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    
                                    {/* Cover Photo Selection */}
                                    {report.photos.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-zinc-100">
                                            <p className="text-xs font-bold uppercase text-zinc-400 mb-4 tracking-wider">Cover Photos</p>
                                            
                                            {/* Hero Photo Selection */}
                                            <div className="mb-4">
                                                <label className="text-xs font-bold text-zinc-600 mb-2 block">Hero Image</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {report.photos.slice(0, 8).map((photo, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setHeroPhotoIndex(idx)}
                                                            className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                                                                heroPhotoIndex === idx 
                                                                    ? 'border-brand-primary ring-2 ring-brand-primary/30' 
                                                                    : 'border-zinc-200 hover:border-zinc-300'
                                                            }`}
                                                        >
                                                            <img 
                                                                src={photo.url} 
                                                                alt={`Photo ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {heroPhotoIndex === idx && (
                                                                <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                                                    <span className="bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">HERO</span>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Strip Photos Selection */}
                                            <div>
                                                <label className="text-xs font-bold text-zinc-600 mb-2 block">Photo Strip (select up to 3)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {report.photos.slice(0, 8).map((photo, idx) => {
                                                        const isSelected = stripPhotoIndexes.includes(idx);
                                                        const selectionOrder = stripPhotoIndexes.indexOf(idx) + 1;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setStripPhotoIndexes(stripPhotoIndexes.filter(i => i !== idx));
                                                                    } else if (stripPhotoIndexes.length < 3) {
                                                                        setStripPhotoIndexes([...stripPhotoIndexes, idx]);
                                                                    }
                                                                }}
                                                                className={`relative aspect-square rounded overflow-hidden border-2 transition ${
                                                                    isSelected 
                                                                        ? 'border-brand-primary ring-2 ring-brand-primary/30' 
                                                                        : 'border-zinc-200 hover:border-zinc-300'
                                                                }`}
                                                            >
                                                                <img 
                                                                    src={photo.url} 
                                                                    alt={`Photo ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {isSelected && (
                                                                    <div className="absolute top-1 right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                                        {selectionOrder}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-zinc-100 bg-zinc-50">
                                    <button 
                                        onClick={handleExport}
                                        disabled={isGenerating}
                                        className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-brand-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Generating PDF...
                                            </>
                                        ) : (
                                            <>
                                                <DocumentArrowDownIcon className="w-5 h-5" />
                                                Download Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel: Live Preview */}
                            <div className="flex-1 overflow-auto bg-zinc-200/50 p-8 flex justify-center relative shadow-inner">
                                <div className="absolute top-4 right-4 bg-zinc-800 text-white text-xs px-3 py-1 rounded-full font-medium opacity-50 pointer-events-none">
                                    Start of Preview
                                </div>
                                <div className="origin-top scale-[0.65] md:scale-[0.85] xl:scale-100 transition-transform duration-300 ease-out shadow-2xl">
                                    {/* Render the actual PrintView component here, mimicking the A4 page */}
                                    {/* Render the actual PrintView component here, mimicking the A4 page */}
                                    <PrintView 
                                        date={report.weekEnding} 
                                        projectId={projectConfig.identity?.jobNumber || 'preview'} 
                                        options={{ 
                                            sections: sections as any,
                                            logoScale,
                                            logoAlign,
                                            heroPhotoIndex,
                                            stripPhotoIndexes,
                                            spacing
                                        }} 
                                        showPageBreaks={showPageBreaks}
                                        // We pass mock Report/Config data directly to avoid PrintView fetch
                                        initialData={{ report, config: projectConfig }}
                                    />
                                </div>
                            </div>


                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

function SortableSectionItem({ section, onToggle }: { section: { id: string, label: string, included: boolean }, onToggle: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
        position: 'relative' as 'relative',
    };

    return (
        <li ref={setNodeRef} style={style} className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group ${isDragging ? 'border-brand-primary shadow-lg ring-1 ring-brand-primary' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </button>
                <span className={`text-sm font-medium ${section.included ? 'text-zinc-700' : 'text-zinc-400 line-through'}`}>{section.label}</span>
            </div>
            <button 
                onClick={onToggle}
                className={`p-1.5 rounded-md transition ${section.included ? 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20' : 'text-zinc-400 hover:bg-zinc-100'}`}
            >
                {section.included ? <Eye size={16}/> : <EyeOff size={16}/>}
            </button>
        </li>
    );
}
