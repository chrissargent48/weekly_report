import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { CheckCircle, ArrowRight, Save, RefreshCw, GripVertical, Trash2 } from 'lucide-react';
import { ProjectConfig, ProjectBaselines, MasterTask, MasterBidItem, TaskBidLink } from '../types';
import { api } from '../api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IdentityStep } from './project-setup/IdentityStep';
import { ScheduleImportStep } from './project-setup/ScheduleImportStep';
import { BidImportStep } from './project-setup/BidImportStep';
import { TaskLinkingStep } from './project-setup/TaskLinkingStep';

interface Props {
    config: ProjectConfig;
    onSaveConfig: (config: ProjectConfig) => Promise<void>;
    onClose: () => void;
    projectId: string;
}

// Helper to sanitize excel rows
// Helper to sanitize excel rows
const cleanRow = (row: any[]) => row.map(cell => (cell?.toString() || "").trim());

export function SortableItem({ id, children, onRemove }: { id: string, children: React.ReactNode, onRemove?: () => void }) {
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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center bg-white p-2 rounded border group shadow-sm">
            <div {...attributes} {...listeners} className="cursor-grab text-zinc-300 hover:text-zinc-600 active:cursor-grabbing p-1">
                <GripVertical size={16} />
            </div>
            {children}
            {onRemove && (
                <button onClick={onRemove} className="text-zinc-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
}

export function ProjectSetup({ config, onSaveConfig, onClose, projectId }: Props) {
    const [step, setStep] = useState(1);
    const [localConfig, setLocalConfig] = useState<ProjectConfig>(config);
    const [baselines, setBaselines] = useState<ProjectBaselines>({ bidItems: [], schedule: [], taskLinks: {} });
    const [scheduleText, setScheduleText] = useState("");
    const [bidText, setBidText] = useState("");
    const [loading, setLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Ensure all items have IDs for DnD
    useEffect(() => {
        let changed = false;
        const newConfig = { ...localConfig };

        const ensureIds = (list: any[]) => {
            return list.map(item => {
                if (!item.id) {
                    changed = true;
                    return { ...item, id: crypto.randomUUID() };
                }
                return item;
            });
        };

        if (newConfig.personnel) {
            newConfig.personnel.recon = ensureIds(newConfig.personnel.recon || []);
            newConfig.personnel.stakeholders = ensureIds(newConfig.personnel.stakeholders || []);

            if (newConfig.personnel.client) {
                newConfig.personnel.client.representatives = ensureIds(newConfig.personnel.client.representatives || []);
            }
            if (newConfig.personnel.engineer) {
                newConfig.personnel.engineer.representatives = ensureIds(newConfig.personnel.engineer.representatives || []);
            }
        }

        if (changed) {
            setLocalConfig(newConfig);
        }
    }, []); // Run once on mount (or when config loaded if we added dependency)

    const handleDragEnd = (event: DragEndEvent, listKey: 'recon' | 'stakeholders' | 'client' | 'engineer') => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLocalConfig((prev) => {
                const prevConfig = { ...prev };
                let items: any[] = [];

                if (listKey === 'recon') items = prevConfig.personnel.recon || [];
                if (listKey === 'stakeholders') items = prevConfig.personnel.stakeholders || [];
                if (listKey === 'client') items = prevConfig.personnel.client?.representatives || [];
                if (listKey === 'engineer') items = prevConfig.personnel.engineer?.representatives || [];

                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newItems = arrayMove(items, oldIndex, newIndex);

                    if (listKey === 'recon') prevConfig.personnel.recon = newItems;
                    if (listKey === 'stakeholders') prevConfig.personnel.stakeholders = newItems;
                    if (listKey === 'client') {
                        prevConfig.personnel.client = { ...(prevConfig.personnel.client || {company: "", address: "", representatives: []}), representatives: newItems };
                    }
                    if (listKey === 'engineer') {
                        prevConfig.personnel.engineer = { ...(prevConfig.personnel.engineer || {company: "", address: "", representatives: []}), representatives: newItems };
                    }
                }

                return prevConfig;
            });
        }
    };

    useEffect(() => {
        if (projectId) {
            api.getBaselines(projectId).then(b => {
                if (b) setBaselines(b);
            });
        }
    }, [projectId]);

    const saveBaselines = async () => {
        setLoading(true);
        try {
            await api.saveBaselines(projectId, baselines);
        } catch (e) {
            console.error(e);
            alert("Failed to save baselines");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        // Save config on step 1
        if (step === 1) {
            await onSaveConfig(localConfig);
        }
        // Auto-save baselines after every step to persist progress
        if (step >= 2) {
            await api.saveBaselines(projectId, baselines);
        }
        setStep(prev => prev + 1);
    };

    const handleManualSave = async () => {
        setLoading(true);
        try {
            if (step === 1) {
                await onSaveConfig(localConfig);
            } else {
                await api.saveBaselines(projectId, baselines);
            }
            // Optional: Add toast or visual success indicator
        } catch (e) {
            console.error(e);
            alert("Failed to save progress");
        } finally {
            setLoading(false);
        }
    };

    // --- DATA PROCESSING ---
    // Schedule.xlsx format: Flexible columns based on headers
    // common cols: [Bid Item] [Task Name] [% Complete] [Duration] [Start] [Finish]
    const processScheduleData = (rows: any[][]) => {
         if (!rows || rows.length === 0) return;

         const headers = rows[0]?.map(c => c?.toString().toLowerCase().trim() || "") || [];
         const hasHeader = headers.some(h => h.includes('name') || h.includes('task') || h.includes('start') || h.includes('desc'));
         const startIdx = hasHeader ? 1 : 0;

         // Column Indices (default to legacy format if no clear headers found)
         let colIdx = {
             bidItem: 0,
             name: 1,
             pct: 2,
             dur: 3,
             start: 4,
             finish: 5
         };

         if (hasHeader) {
             // Try to map based on headers
             const findIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

             const n = findIdx(['task', 'name', 'activity', 'desc']);
             const s = findIdx(['start', 'begin']);
             const f = findIdx(['finish', 'end']);
             const d = findIdx(['duration', 'days']);
             const p = findIdx(['%', 'pct', 'complete', 'progress']);
            const b = findIdx(['bid', 'item', 'wbs', 'code']);

             // Only override if we found at least Name and Start (critical fields)
             if (n !== -1) {
                 colIdx.name = n;
                 colIdx.start = s !== -1 ? s : -1;
                 colIdx.finish = f !== -1 ? f : -1;
                 colIdx.dur = d !== -1 ? d : -1;
                 colIdx.pct = p !== -1 ? p : -1;
                 colIdx.bidItem = b !== -1 ? b : -1;
             }
         }

         const tasks: MasterTask[] = rows.slice(startIdx).map((rowRaw, i) => {
             const row = cleanRow(rowRaw);
             if (row.length < 2) return null; // basic sanity check

             const requestName = colIdx.name !== -1 ? row[colIdx.name] : "";
             if (!requestName) return null;

             // Format bid item number properly (1.01 format)
             let bidItemNum = "";
             if (colIdx.bidItem !== -1) {
                 const rawBid = rowRaw[colIdx.bidItem];
                 if (typeof rawBid === 'number') {
                     bidItemNum = rawBid.toFixed(2);
                 } else {
                     bidItemNum = row[colIdx.bidItem]?.toString() || "";
                 }
             }

             // Parse percentage
             let percentComplete = 0;
             if (colIdx.pct !== -1) {
                 const pctVal = parseFloat(row[colIdx.pct] || "0");
                 // Heuristic: if <= 1, treat as decimal (0.5 = 50%), else integer (50 = 50%)
                 // Exception: 0 is 0%, 1 is 100%
                 if (pctVal <= 1 && pctVal >= 0) {
                     // If it's exactly 1, could be 1% or 100%. Usually 1.0 is 100%.
                     // If user types "1", logic assumes 100%.
                     // If they meant 1%, they should type 0.01 or 1%.
                     // This is standard Excel behavior often.
                     percentComplete = Math.round(pctVal * 100);
                 } else {
                     percentComplete = Math.round(pctVal);
                 }
                 // Clamp 0-100
                 percentComplete = Math.max(0, Math.min(100, percentComplete));
             }

             // Parse Duration
             let duration = 0;
             if (colIdx.dur !== -1) {
                 duration = parseFloat(row[colIdx.dur]) || 0; // Changed to parseFloat
             }

             return {
                id: `task-${crypto.randomUUID().slice(0, 8)}`,
                wbs: bidItemNum || `${i + 1}`,
                name: requestName,
                baselineStart: colIdx.start !== -1 ? (row[colIdx.start] || "") : "",
                baselineFinish: colIdx.finish !== -1 ? (row[colIdx.finish] || "") : "",
                baselineDuration: duration,
                percentComplete: percentComplete,
                isCriticalPath: false,
                linkedBidItem: bidItemNum
             };
         }).filter(Boolean) as MasterTask[];

         // Auto-link tasks to bid items if there's a matching linkedBidItem
         const autoLinks: Record<string, { bidItemId: string; allocationPercent: number; }[]> = {};
         tasks.forEach(task => {
             if (task.linkedBidItem) {
                 // Find matching bid item by itemNumber
                 const matchingBid = baselines.bidItems.find(b => b.itemNumber === task.linkedBidItem);
                 if (matchingBid) {
                     autoLinks[task.id] = [{ bidItemId: matchingBid.id, allocationPercent: 100 }];
                 }
             }
         });

         setBaselines(prev => ({
             ...prev,
             schedule: tasks,
             taskLinks: { ...prev.taskLinks, ...autoLinks }
         }));
    };

    // Bid Form.xlsx format: [Item, Description, Quantity, Unit, Unit Cost, Total]
    const processBidData = (rows: any[][]) => {
         if (!rows || rows.length === 0) return;
         // Check for header row
         const firstCell = rows[0]?.[0]?.toString().toLowerCase() || "";
         const hasHeader = firstCell.includes('item') || firstCell.includes('desc');
         const startIdx = hasHeader ? 1 : 0;

         const items: MasterBidItem[] = rows.slice(startIdx).map(rowRaw => {
             const row = cleanRow(rowRaw);
             if (row.length < 2 || !row[1]?.trim()) return null;

             // Format bid item number properly (1.01 format)
             let itemNumber = rowRaw[0];
             if (typeof itemNumber === 'number') {
                 itemNumber = itemNumber.toFixed(2); // Keep decimal format
             } else {
                 itemNumber = row[0]?.toString() || "";
             }

             const qty = parseFloat(row[2]?.replace(/,/g, '') || "0");   // Column 2: Quantity
             const price = parseFloat(row[4]?.replace(/[^0-9.]/g, '') || "0");  // Column 4: Unit Cost
             const total = parseFloat(row[5]?.replace(/[^0-9.]/g, '') || "0") || (qty * price);  // Column 5: Total (or calculate)

             return {
                 id: `bid-${itemNumber.replace(/\./g, '-')}`,  // Use item number as ID base
                 itemNumber: itemNumber,
                 description: row[1]?.trim() || "Unknown",
                 unit: row[3] || "EA",  // Column 3: Unit
                 contractQty: qty,
                 unitPrice: price,
                 totalValue: total
             };
         }).filter(Boolean) as MasterBidItem[];

         setBaselines(prev => ({ ...prev, bidItems: items }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'schedule' | 'bid') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (type === 'schedule') processScheduleData(json);
        else processBidData(json);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await api.uploadImage(projectId, file);
            setLocalConfig(prev => ({
                ...prev,
                identity: { ...prev.identity, logoUrl: url }
            }));
        } catch (error) {
            console.error("Failed to upload logo:", error);
            alert("Failed to upload logo");
        }
    };

    const handleSchedulePaste = (text: string) => {
        const wb = XLSX.read(text, { type: 'string' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        processScheduleData(json);
    };

    const handleBidPaste = (text: string) => {
        const wb = XLSX.read(text, { type: 'string' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        processBidData(json);
    };

    // Add a new link between a task and a bid item (defaults to 100% allocation)
    const addLink = (taskId: string, bidId: string) => {
        setBaselines(prev => {
            const currentLinks = prev.taskLinks[taskId] || [];
            // Don't add duplicate links
            if (currentLinks.some(link => link.bidItemId === bidId)) return prev;
            const newLink: TaskBidLink = { bidItemId: bidId, allocationPercent: 100 };
            return {
                ...prev,
                taskLinks: { ...prev.taskLinks, [taskId]: [...currentLinks, newLink] }
            };
        });
    };

    // Remove a link between a task and a bid item
    const removeLink = (taskId: string, bidId: string) => {
        setBaselines(prev => {
            const currentLinks = prev.taskLinks[taskId] || [];
            return {
                ...prev,
                taskLinks: { ...prev.taskLinks, [taskId]: currentLinks.filter(link => link.bidItemId !== bidId) }
            };
        });
    };

    // Update the allocation percentage for a specific link
    const updateAllocation = (taskId: string, bidId: string, percent: number) => {
        setBaselines(prev => {
            const currentLinks = prev.taskLinks[taskId] || [];
            return {
                ...prev,
                taskLinks: {
                    ...prev.taskLinks,
                    [taskId]: currentLinks.map(link =>
                        link.bidItemId === bidId ? { ...link, allocationPercent: percent } : link
                    )
                }
            };
        });
    };

    // Calculate total allocation for a bid item across all tasks (should sum to 100%)
    const getBidItemAllocationTotal = (bidId: string): number => {
        return Object.values(baselines.taskLinks).reduce((total, links) => {
            const link = links.find(l => l.bidItemId === bidId);
            return total + (link?.allocationPercent || 0);
        }, 0);
    };

    // Helper to update a single schedule task field
    const updateScheduleTask = (taskId: string, field: keyof MasterTask, value: string | number | boolean) => {
        setBaselines(prev => ({
            ...prev,
            schedule: prev.schedule.map(t => t.id === taskId ? { ...t, [field]: value } : t)
        }));
    };

    // Helper to update a single bid item field
    const updateBidItem = (itemId: string, field: keyof MasterBidItem, value: string | number) => {
        setBaselines(prev => ({
            ...prev,
            bidItems: prev.bidItems.map(b => b.id === itemId ? { ...b, [field]: value } : b)
        }));
    };

    // Helper to ensure array
    const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];


    return (
        <div className="flex flex-col h-full bg-white">
            {/* PROGRESS HEADER */}
            <div className="border-b px-8 py-4 bg-zinc-50 flex items-center justify-between">
                <div>
                     <h2 className="text-xl font-bold text-brand-surface-dark">Project Setup Wizard</h2>
                     <p className="text-sm text-zinc-500">Define the Fundamental Truths of the project</p>
                </div>
                <div className="flex items-center gap-6">
                    <button
                         onClick={handleManualSave}
                         disabled={loading}
                         className="flex items-center gap-2 text-zinc-600 hover:text-brand-primary font-bold text-sm bg-white border border-zinc-200 shadow-sm px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {loading ? "Saving..." : "Save Progress"}
                    </button>
                    <div className="flex gap-2">
                        {[1,2,3,4].map(s => (
                            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'bg-brand-primary text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                {step > s ? <CheckCircle size={16} /> : s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-auto p-8">
                {step === 1 && (
                    <IdentityStep
                        localConfig={localConfig}
                        setLocalConfig={setLocalConfig}
                        sensors={sensors}
                        handleDragEnd={handleDragEnd}
                        handleLogoUpload={handleLogoUpload}
                        ensureArray={ensureArray}
                    />
                )}

                {step === 2 && (
                    <ScheduleImportStep
                        baselines={baselines}
                        scheduleText={scheduleText}
                        setScheduleText={setScheduleText}
                        handleFileUpload={handleFileUpload}
                        handleSchedulePaste={handleSchedulePaste}
                        updateScheduleTask={updateScheduleTask}
                    />
                )}

                {step === 3 && (
                    <BidImportStep
                        baselines={baselines}
                        bidText={bidText}
                        setBidText={setBidText}
                        handleFileUpload={handleFileUpload}
                        handleBidPaste={handleBidPaste}
                        updateBidItem={updateBidItem}
                    />
                )}

                {step === 4 && (
                    <TaskLinkingStep
                        baselines={baselines}
                        addLink={addLink}
                        removeLink={removeLink}
                        updateAllocation={updateAllocation}
                        getBidItemAllocationTotal={getBidItemAllocationTotal}
                    />
                )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="border-t p-4 flex justify-between bg-zinc-50">
                <button disabled={step === 1} onClick={() => setStep(prev => Math.max(1, prev - 1))} className="px-4 py-2 disabled:opacity-50">Back</button>
                <div className="flex gap-2">
                    {step < 4 ? (
                        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button disabled={loading} onClick={async () => { await saveBaselines(); onClose(); }} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16} />}
                            {loading ? "Saving..." : "Finish Setup"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
