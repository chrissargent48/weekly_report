import React from 'react';
import { Trash2 } from 'lucide-react';
import { ProjectBaselines } from '../../types';

interface TaskLinkingStepProps {
    baselines: ProjectBaselines;
    addLink: (taskId: string, bidId: string) => void;
    removeLink: (taskId: string, bidId: string) => void;
    updateAllocation: (taskId: string, bidId: string, percent: number) => void;
    getBidItemAllocationTotal: (bidId: string) => number;
}

export function TaskLinkingStep({ baselines, addLink, removeLink, updateAllocation, getBidItemAllocationTotal }: TaskLinkingStepProps) {
    return (
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
    );
}
