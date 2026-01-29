import React from 'react';
import { Upload } from 'lucide-react';
import { ProjectBaselines, MasterTask } from '../../types';

interface ScheduleImportStepProps {
    baselines: ProjectBaselines;
    scheduleText: string;
    setScheduleText: React.Dispatch<React.SetStateAction<string>>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'schedule' | 'bid') => void;
    handleSchedulePaste: (text: string) => void;
    updateScheduleTask: (taskId: string, field: keyof MasterTask, value: string | number | boolean) => void;
}

export function ScheduleImportStep({ baselines, scheduleText, setScheduleText, handleFileUpload, handleSchedulePaste, updateScheduleTask }: ScheduleImportStepProps) {
    return (
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
    );
}
