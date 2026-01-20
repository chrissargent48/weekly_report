import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, CheckCircle, ArrowRight, Save, RefreshCw, Trash2, GripVertical } from 'lucide-react';
import { ProjectConfig, ProjectBaselines, MasterTask, MasterBidItem, TaskBidLink } from '../types';
import { api } from '../api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    config: ProjectConfig;
    onSaveConfig: (config: ProjectConfig) => Promise<void>;
    onClose: () => void;
    projectId: string;
}

// Helper to sanitize excel rows
// Helper to sanitize excel rows
const cleanRow = (row: any[]) => row.map(cell => (cell?.toString() || "").trim());

function SortableItem({ id, children, onRemove }: { id: string, children: React.ReactNode, onRemove?: () => void }) {
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
                    <div className="max-w-5xl mx-auto space-y-6">
                         <h3 className="text-lg font-bold">Project Identity & Personnel</h3>
                         
                         {/* Core Info */}
                         <div className="p-6 bg-zinc-50 rounded-xl border">
                            <h4 className="font-bold text-brand-primary uppercase text-xs border-b pb-1 mb-4">Core Project Info</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Project Name</label>
                                    <input className="w-full border p-2 rounded text-sm font-bold" value={localConfig.identity.projectName} onChange={e => setLocalConfig({...localConfig, identity: {...localConfig.identity, projectName: e.target.value}})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Job Number</label>
                                    <input className="w-full border p-2 rounded text-sm" value={localConfig.identity.jobNumber} onChange={e => setLocalConfig({...localConfig, identity: {...localConfig.identity, jobNumber: e.target.value}})} />
                                </div>
                                <div className="col-span-2 flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Location / Site Address</label>
                                        <input className="w-full border p-2 rounded text-sm" value={localConfig.identity.location} onChange={e => setLocalConfig({...localConfig, identity: {...localConfig.identity, location: e.target.value}})} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Our Company Address</label>
                                        <input className="w-full border p-2 rounded text-sm" placeholder="123 Builder Lane..." value={localConfig.identity.companyAddress || ""} onChange={e => setLocalConfig({...localConfig, identity: {...localConfig.identity, companyAddress: e.target.value}})} />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Project Logo (Cover Page)</label>
                                    <div className="flex items-center gap-4 p-2 bg-white border rounded">
                                        {localConfig.identity.logoUrl ? (
                                            <div className="relative group">
                                                <img src={localConfig.identity.logoUrl} alt="Project Logo" className="h-12 w-auto object-contain" />
                                                <button 
                                                    onClick={() => setLocalConfig(prev => ({...prev, identity: {...prev.identity, logoUrl: undefined}}))}
                                                    className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 bg-zinc-100 rounded flex items-center justify-center text-zinc-300">
                                                <Upload size={20} />
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-300 rounded cursor-pointer hover:bg-zinc-200 transition text-xs font-bold text-zinc-700">
                                            <Upload size={14}/> {localConfig.identity.logoUrl ? "Replace Logo" : "Upload Logo"}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                        </label>
                                        <p className="text-xs text-zinc-400">Recommended: PNG/SVG with transparent background</p>
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* RECON Key Personnel - Dynamic List */}
                         <div className="p-6 bg-zinc-50 rounded-xl border">
                            <div className="flex justify-between items-center border-b pb-1 mb-4">
                                <h4 className="font-bold text-brand-primary uppercase text-xs">RECON Key Personnel</h4>
                                <button onClick={() => {
                                    const newPerson = { name: "", role: "Project Manager", email: "", phone: "" };
                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: [...ensureArray(localConfig.personnel.recon), newPerson]}});
                                }} className="text-xs bg-brand-primary text-white px-3 py-1 rounded hover:bg-brand-primary/90 font-bold">+ Add Staff</button>
                            </div>
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'recon')}>
                                    <SortableContext items={ensureArray(localConfig.personnel.recon).map(p => p.id || "")} strategy={verticalListSortingStrategy}>
                                        {ensureArray(localConfig.personnel.recon).map((person: any, i: number) => (
                                            <SortableItem key={person.id} id={person.id} onRemove={() => {
                                                const list = [...ensureArray(localConfig.personnel.recon)].filter((_, idx) => idx !== i);
                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: list}});
                                            }}>
                                                <input className="flex-1 border p-1.5 rounded text-sm" placeholder="Name" value={person.name} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.recon)]; list[i] = {...list[i], name: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: list}});
                                                }} />
                                                <select className="border p-1.5 rounded text-sm bg-white" value={person.role} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.recon)]; list[i] = {...list[i], role: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: list}});
                                                }}>
                                                    <option>Project Manager</option>
                                                    <option>Superintendent</option>
                                                    <option>Construction Manager</option>
                                                    <option>General Manager</option>
                                                    <option>Site Safety</option>
                                                    <option>Business Manager</option>
                                                    <option>Field Engineer</option>
                                                    <option>Project Engineer</option>
                                                </select>
                                                <input className="w-40 border p-1.5 rounded text-sm" placeholder="Email" value={person.email} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.recon)]; list[i] = {...list[i], email: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: list}});
                                                }} />
                                                <input className="w-32 border p-1.5 rounded text-sm" placeholder="Phone" value={person.phone} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.recon)]; list[i] = {...list[i], phone: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, recon: list}});
                                                }} />
                                            </SortableItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                {ensureArray(localConfig.personnel.recon).length === 0 && <p className="text-zinc-400 text-sm italic">No RECON personnel added yet</p>}
                            </div>
                         </div>

                         {/* Client & Engineer - Company + Representatives */}
                         <div className="grid grid-cols-2 gap-6">
                            {/* Client */}
                            <div className="p-6 bg-zinc-50 rounded-xl border">
                                <h4 className="font-bold text-brand-primary uppercase text-xs border-b pb-1 mb-4">Client / Owner</h4>
                                <div className="mb-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Company Name</label>
                                        <input className="w-full border p-2 rounded text-sm font-bold" placeholder="Client Company Name" 
                                            value={localConfig.personnel.client?.company || ""} 
                                            onChange={e => setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client: {...(localConfig.personnel.client || {company: "", address: "", representatives: []}), company: e.target.value}}})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Company Address</label>
                                        <input className="w-full border p-2 rounded text-sm" placeholder="100 Main St..." 
                                            value={localConfig.personnel.client?.address || ""} 
                                            onChange={e => setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client: {...(localConfig.personnel.client || {company: "", address: "", representatives: []}), address: e.target.value}}})} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-zinc-500">Representatives</label>
                                    <button onClick={() => {
                                        const client = localConfig.personnel.client || {company: "", address: "", representatives: []};
                                        const newRep = { name: "", role: "Owner's Rep", email: "", phone: "" };
                                        setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client: {...client, representatives: [...ensureArray(client.representatives), newRep]}}});
                                    }} className="text-[10px] bg-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-300 font-bold">+ Add Rep</button>
                                </div>
                                <div className="space-y-3">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'client')}>
                                        <SortableContext items={ensureArray(localConfig.personnel.client?.representatives).map(p => p.id || "")} strategy={verticalListSortingStrategy}>
                                            {ensureArray(localConfig.personnel.client?.representatives).map((rep: any, i: number) => (
                                                <SortableItem key={rep.id} id={rep.id} onRemove={() => {
                                                    const client = {...(localConfig.personnel.client || {company: "", address: "", representatives: []})};
                                                    client.representatives = client.representatives.filter((_, idx) => idx !== i);
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client}});
                                                }}>
                                                    <div className="flex-1 w-full">
                                                        <div className="flex gap-4 w-full mb-2">
                                                            <input className="flex-[2] border p-2 h-9 rounded text-sm font-bold placeholder:font-normal" placeholder="Name" value={rep.name} onChange={e => {
                                                                const client = {...(localConfig.personnel.client || {company: "", address: "", representatives: []})};
                                                                client.representatives = [...client.representatives]; client.representatives[i] = {...client.representatives[i], name: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client}});
                                                            }} />
                                                            <input className="flex-1 border p-2 h-9 rounded text-xs" placeholder="Role / Title" value={rep.role} onChange={e => {
                                                                const client = {...(localConfig.personnel.client || {company: "", address: "", representatives: []})};
                                                                client.representatives = [...client.representatives]; client.representatives[i] = {...client.representatives[i], role: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client}});
                                                            }} />
                                                        </div>
                                                        <div className="flex gap-4 w-full">
                                                            <input className="flex-[2] border p-2 h-9 rounded text-xs bg-zinc-50" placeholder="Email Address" value={rep.email} onChange={e => {
                                                                const client = {...(localConfig.personnel.client || {company: "", address: "", representatives: []})};
                                                                client.representatives = [...client.representatives]; client.representatives[i] = {...client.representatives[i], email: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client}});
                                                            }} />
                                                            <input className="flex-1 border p-2 h-9 rounded text-xs bg-zinc-50" placeholder="Phone Number" value={rep.phone} onChange={e => {
                                                                const client = {...(localConfig.personnel.client || {company: "", address: "", representatives: []})};
                                                                client.representatives = [...client.representatives]; client.representatives[i] = {...client.representatives[i], phone: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, client}});
                                                            }} />
                                                        </div>
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>

                            {/* Engineer */}
                            <div className="p-6 bg-zinc-50 rounded-xl border">
                                <h4 className="font-bold text-brand-primary uppercase text-xs border-b pb-1 mb-4">Engineer of Record</h4>
                                <div className="mb-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Company Name</label>
                                        <input className="w-full border p-2 rounded text-sm font-bold" placeholder="Engineering Firm" 
                                            value={localConfig.personnel.engineer?.company || ""} 
                                            onChange={e => setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer: {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []}), company: e.target.value}}})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-1">Company Address</label>
                                        <input className="w-full border p-2 rounded text-sm" placeholder="456 Engineer Blvd..." 
                                            value={localConfig.personnel.engineer?.address || ""} 
                                            onChange={e => setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer: {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []}), address: e.target.value}}})} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-zinc-500">Representatives</label>
                                    <button onClick={() => {
                                        const engineer = localConfig.personnel.engineer || {company: "", address: "", representatives: []};
                                        const newRep = { name: "", role: "Lead Engineer", email: "", phone: "" };
                                        setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer: {...engineer, representatives: [...ensureArray(engineer.representatives), newRep]}}});
                                    }} className="text-[10px] bg-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-300 font-bold">+ Add Rep</button>
                                </div>
                                <div className="space-y-3">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'engineer')}>
                                        <SortableContext items={ensureArray(localConfig.personnel.engineer?.representatives).map(p => p.id || "")} strategy={verticalListSortingStrategy}>
                                            {ensureArray(localConfig.personnel.engineer?.representatives).map((rep: any, i: number) => (
                                                <SortableItem key={rep.id} id={rep.id} onRemove={() => {
                                                    const engineer = {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []})};
                                                    engineer.representatives = engineer.representatives.filter((_, idx) => idx !== i);
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer}});
                                                }}>
                                                    <div className="flex-1 w-full">
                                                        <div className="flex gap-4 w-full mb-2">
                                                            <input className="flex-[2] border p-2 h-9 rounded text-sm font-bold placeholder:font-normal" placeholder="Name" value={rep.name} onChange={e => {
                                                                const engineer = {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []})};
                                                                engineer.representatives = [...engineer.representatives]; engineer.representatives[i] = {...engineer.representatives[i], name: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer}});
                                                            }} />
                                                            <input className="flex-1 border p-2 h-9 rounded text-xs" placeholder="Role / Title" value={rep.role} onChange={e => {
                                                                const engineer = {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []})};
                                                                engineer.representatives = [...engineer.representatives]; engineer.representatives[i] = {...engineer.representatives[i], role: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer}});
                                                            }} />
                                                        </div>
                                                        <div className="flex gap-4 w-full">
                                                            <input className="flex-[2] border p-2 h-9 rounded text-xs bg-zinc-50" placeholder="Email Address" value={rep.email} onChange={e => {
                                                                const engineer = {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []})};
                                                                engineer.representatives = [...engineer.representatives]; engineer.representatives[i] = {...engineer.representatives[i], email: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer}});
                                                            }} />
                                                            <input className="flex-1 border p-2 h-9 rounded text-xs bg-zinc-50" placeholder="Phone Number" value={rep.phone} onChange={e => {
                                                                const engineer = {...(localConfig.personnel.engineer || {company: "", address: "", representatives: []})};
                                                                engineer.representatives = [...engineer.representatives]; engineer.representatives[i] = {...engineer.representatives[i], phone: e.target.value};
                                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, engineer}});
                                                            }} />
                                                        </div>
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                         </div>

                         {/* Other Stakeholders */}
                         <div className="p-6 bg-zinc-50 rounded-xl border">
                            <div className="flex justify-between items-center border-b pb-1 mb-4">
                                <h4 className="font-bold text-brand-primary uppercase text-xs">Other Stakeholders</h4>
                                <datalist id="stakeholder-roles">
                                    <option value="Subcontractor" />
                                    <option value="Inspector" />
                                    <option value="Utility Rep" />
                                    <option value="Supplier" />
                                    <option value="City Official" />
                                </datalist>
                                <button onClick={() => {
                                    const newS = { name: "", role: "", company: "", location: "", email: "", phone: "" };
                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: [...ensureArray(localConfig.personnel.stakeholders), newS]}});
                                }} className="text-xs bg-zinc-200 px-3 py-1 rounded hover:bg-zinc-300 font-bold">+ Add Stakeholder</button>
                            </div>
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'stakeholders')}>
                                    <SortableContext items={ensureArray(localConfig.personnel.stakeholders).map(p => p.id || "")} strategy={verticalListSortingStrategy}>
                                        {ensureArray(localConfig.personnel.stakeholders).map((s: any, i: number) => (
                                            <SortableItem key={s.id} id={s.id} onRemove={() => {
                                                const list = [...ensureArray(localConfig.personnel.stakeholders)].filter((_, idx) => idx !== i);
                                                setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                            }}>
                                                <input className="flex-1 border p-1.5 rounded text-sm" placeholder="Name" value={s.name} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.stakeholders)]; list[i] = {...list[i], name: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                                }} />
                                                <input className="w-32 border p-1.5 rounded text-sm" placeholder="Role" list="stakeholder-roles" value={s.role} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.stakeholders)]; list[i] = {...list[i], role: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                                }} />
                                                <input className="w-32 border p-1.5 rounded text-sm" placeholder="Location" value={s.location || ""} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.stakeholders)]; list[i] = {...list[i], location: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                                }} />
                                                <input className="w-40 border p-1.5 rounded text-sm" placeholder="Company" value={s.company || ""} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.stakeholders)]; list[i] = {...list[i], company: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                                }} />
                                                <input className="w-40 border p-1.5 rounded text-sm" placeholder="Email" value={s.email} onChange={e => {
                                                    const list = [...ensureArray(localConfig.personnel.stakeholders)]; list[i] = {...list[i], email: e.target.value};
                                                    setLocalConfig({...localConfig, personnel: {...localConfig.personnel, stakeholders: list}});
                                                }} />
                                            </SortableItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                {ensureArray(localConfig.personnel.stakeholders).length === 0 && <p className="text-zinc-400 text-sm italic">No stakeholders added yet</p>}
                            </div>
                         </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-bold mb-2">Import Schedule Baseline</h3>
                        <p className="text-sm text-zinc-500 mb-4">Upload Excel/CSV with headers. Recommended columns: <strong>[Task Name] [Start] [Finish] [Duration] [Bid Item] [% Complete]</strong></p>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-300 rounded cursor-pointer hover:bg-zinc-200 transition text-sm font-bold text-zinc-700">
                                    <Upload size={16}/> Upload Excel/CSV
                                    <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => handleFileUpload(e, 'schedule')} />
                                </label>
                                <span className="text-xs text-zinc-400 uppercase font-bold">OR</span>
                            </div>
                            <div className="flex gap-4">
                                <textarea 
                                    className="flex-1 h-32 border p-2 rounded text-xs font-mono" 
                                    placeholder="Paste rows here..."
                                    value={scheduleText}
                                    onChange={e => setScheduleText(e.target.value)}
                                />
                                <button onClick={() => handleSchedulePaste(scheduleText)} className="btn-primary text-sm h-fit self-end flex items-center gap-2">
                                    Process Paste
                                </button>
                            </div>
                        </div>
                        <div className="border rounded bg-zinc-50 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-100 border-b">
                                    <tr>
                                        <th className="text-left p-2">WBS</th>
                                        <th className="text-left p-2">Task Name</th>
                                        <th className="text-left p-2">Start</th>
                                        <th className="text-left p-2">Finish</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {baselines.schedule.map(task => (
                                        <tr key={task.id} className="border-b bg-white hover:bg-zinc-50">
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm font-mono" 
                                                    value={task.wbs} 
                                                    onChange={e => updateScheduleTask(task.id, 'wbs', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm font-medium" 
                                                    value={task.name} 
                                                    onChange={e => updateScheduleTask(task.id, 'name', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm" 
                                                    value={task.baselineStart} 
                                                    onChange={e => updateScheduleTask(task.id, 'baselineStart', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm" 
                                                    value={task.baselineFinish} 
                                                    onChange={e => updateScheduleTask(task.id, 'baselineFinish', e.target.value)} 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {baselines.schedule.length === 0 && <div className="p-4 text-center text-zinc-400">No tasks imported</div>}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-bold mb-2">Import Bid Schedule</h3>
                        <p className="text-sm text-zinc-500 mb-4">Upload Excel/CSV or Paste Data. Columns: <strong>[Item#] [Desc] [Unit] [Qty] [Price]</strong></p>
                        <div className="flex flex-col gap-4 mb-4">
                             <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-300 rounded cursor-pointer hover:bg-zinc-200 transition text-sm font-bold text-zinc-700">
                                    <Upload size={16}/> Upload Excel/CSV
                                    <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => handleFileUpload(e, 'bid')} />
                                </label>
                                <span className="text-xs text-zinc-400 uppercase font-bold">OR</span>
                            </div>
                            <div className="flex gap-4">
                                <textarea 
                                    className="flex-1 h-32 border p-2 rounded text-xs font-mono" 
                                    placeholder="Paste rows here..."
                                    value={bidText}
                                    onChange={e => setBidText(e.target.value)}
                                />
                                <button onClick={() => handleBidPaste(bidText)} className="btn-primary text-sm h-fit self-end flex items-center gap-2">
                                    Process Paste
                                </button>
                            </div>
                        </div>
                        <div className="border rounded bg-zinc-50 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-100 border-b">
                                    <tr>
                                        <th className="text-left p-2">Item</th>
                                        <th className="text-left p-2">Description</th>
                                        <th className="text-right p-2">Qty</th>
                                        <th className="text-right p-2">Unit</th>
                                        <th className="text-right p-2">Unit Price</th>
                                        <th className="text-right p-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {baselines.bidItems.map(item => (
                                        <tr key={item.id} className="border-b bg-white hover:bg-zinc-50">
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm font-mono" 
                                                    value={item.itemNumber} 
                                                    onChange={e => updateBidItem(item.id, 'itemNumber', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm" 
                                                    value={item.description} 
                                                    onChange={e => updateBidItem(item.id, 'description', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    type="number"
                                                    className="w-full border rounded p-1 text-sm text-right" 
                                                    value={item.contractQty} 
                                                    onChange={e => {
                                                        const qty = parseFloat(e.target.value) || 0;
                                                        updateBidItem(item.id, 'contractQty', qty);
                                                        updateBidItem(item.id, 'totalValue', qty * item.unitPrice);
                                                    }} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    className="w-full border rounded p-1 text-sm text-right" 
                                                    value={item.unit} 
                                                    onChange={e => updateBidItem(item.id, 'unit', e.target.value)} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full border rounded p-1 text-sm text-right" 
                                                    value={item.unitPrice} 
                                                    onChange={e => {
                                                        const price = parseFloat(e.target.value) || 0;
                                                        updateBidItem(item.id, 'unitPrice', price);
                                                        updateBidItem(item.id, 'totalValue', item.contractQty * price);
                                                    }} 
                                                />
                                            </td>
                                            <td className="p-2 text-right font-bold">${item.totalValue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {baselines.bidItems.length === 0 && <div className="p-4 text-center text-zinc-400">No bid items imported</div>}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-6xl mx-auto h-full flex flex-col">
                         <div className="mb-4">
                            <h3 className="text-lg font-bold">Link Tasks to Bid Items</h3>
                            <p className="text-sm text-zinc-500">Select which bid items drive the progress of each task. Set allocation % when a bid item spans multiple tasks.</p>
                         </div>
                         
                         <div className="flex-1 flex border rounded-lg overflow-hidden bg-white shadow-sm">
                             {/* TASK LIST (LEFT) */}
                             <div className="w-1/2 border-r overflow-y-auto bg-zinc-50">
                                 {baselines.schedule.map(task => {
                                     const links = baselines.taskLinks[task.id] || [];
                                     const linkedCount = links.length;
                                     return (
                                        <div key={task.id} className="p-3 border-b hover:bg-white cursor-default group">
                                        <div className="flex justify-between items-start mb-1">
                                                <div className="font-bold text-sm text-zinc-800">
                                                    <span className="font-mono text-brand-primary mr-2">{task.wbs}</span>
                                                    {task.name}
                                                </div>
                                                {linkedCount > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 rounded-full">{linkedCount} items</span>}
                                            </div>
                                            <div className="text-xs text-zinc-500">{task.baselineStart} - {task.baselineFinish}</div>
                                            
                                            <div className="mt-2 space-y-1">
                                                {/* Show linked items with allocation percentage */}
                                                {links.map(link => {
                                                    const item = baselines.bidItems.find(b => b.id === link.bidItemId);
                                                    if (!item) return null;
                                                    const totalAlloc = getBidItemAllocationTotal(link.bidItemId);
                                                    const isOverAllocated = totalAlloc > 100;
                                                    const allocValue = (item.totalValue * link.allocationPercent / 100);
                                                    return (
                                                        <div key={link.bidItemId} className="flex items-center gap-2 text-xs bg-white border p-1.5 rounded">
                                                            <button onClick={() => removeLink(task.id, link.bidItemId)} className="text-red-400 hover:text-red-600">
                                                                <Trash2 size={12} />
                                                            </button>
                                                            <span className="font-mono font-bold text-zinc-600">{item.itemNumber}</span>
                                                            <span className="truncate flex-1 text-zinc-500">{item.description}</span>
                                                            <div className="flex items-center gap-1">
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="100" 
                                                                    value={link.allocationPercent}
                                                                    onChange={(e) => updateAllocation(task.id, link.bidItemId, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                                    className={`w-12 p-0.5 text-center border rounded text-xs font-bold ${isOverAllocated ? 'border-amber-400 bg-amber-50' : ''}`}
                                                                />
                                                                <span className="text-zinc-400">%</span>
                                                            </div>
                                                            <span className="text-[10px] text-zinc-400 w-16 text-right">${allocValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                                        </div>
                                                    )
                                                })}
                                                
                                                {/* Add Link Button */}
                                                <div className="relative group/add">
                                                    <button className="text-xs text-brand-primary font-bold hover:underline">+ Link Bid Item</button>
                                                    {/* HOVER MENU */}
                                                    <div className="hidden group-hover/add:block absolute left-0 top-full bg-white border shadow-xl p-2 z-10 w-72 max-h-48 overflow-y-auto">
                                                        {baselines.bidItems.map(item => {
                                                            const alreadyLinked = links.some(l => l.bidItemId === item.id);
                                                            const totalAlloc = getBidItemAllocationTotal(item.id);
                                                            return (
                                                                <div 
                                                                    key={item.id} 
                                                                    onClick={() => !alreadyLinked && addLink(task.id, item.id)} 
                                                                    className={`p-1.5 cursor-pointer text-xs ${alreadyLinked ? 'bg-zinc-100 text-zinc-400' : 'hover:bg-zinc-100'}`}
                                                                >
                                                                    <div className="flex justify-between">
                                                                        <span className="truncate">{item.itemNumber} - {item.description}</span>
                                                                        {totalAlloc > 0 && <span className={`text-[10px] ${totalAlloc >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{totalAlloc}%</span>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                     );
                                 })}
                             </div>
                             
                             {/* ALLOCATION SUMMARY (RIGHT) */}
                             <div className="w-1/2 p-4 overflow-y-auto bg-white">
                                 <h4 className="font-bold text-sm mb-3 text-zinc-600">Bid Item Allocation Summary</h4>
                                 <div className="space-y-2">
                                    {baselines.bidItems.map(item => {
                                        const totalAlloc = getBidItemAllocationTotal(item.id);
                                        const isComplete = totalAlloc === 100;
                                        const isOver = totalAlloc > 100;
                                        const isUnder = totalAlloc > 0 && totalAlloc < 100;
                                        return (
                                            <div key={item.id} className="flex items-center gap-2 text-xs p-2 border rounded bg-zinc-50">
                                                <span className="font-mono font-bold w-12">{item.itemNumber}</span>
                                                <span className="truncate flex-1">{item.description}</span>
                                                <div className="w-24">
                                                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all ${isOver ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : isUnder ? 'bg-amber-400' : 'bg-zinc-300'}`}
                                                            style={{ width: `${Math.min(100, totalAlloc)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold w-10 text-right ${isOver ? 'text-red-600' : isComplete ? 'text-emerald-600' : isUnder ? 'text-amber-600' : 'text-zinc-400'}`}>
                                                    {totalAlloc}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                 </div>
                                 {baselines.bidItems.length === 0 && (
                                    <div className="text-center text-zinc-400 py-8">
                                        <p>No bid items imported yet</p>
                                    </div>
                                 )}
                             </div>
                         </div>
                    </div>
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
