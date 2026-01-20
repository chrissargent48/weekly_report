import React, { useState } from 'react';
import { WeeklyReport, IssueEntry, FieldDirective, ChangeOrder } from '../../types';
import { AlertCircle, Trash2, FileText, DollarSign, Clock, Target, Layers } from 'lucide-react';
import { TabHeader } from '../ui';

interface Props {
    report: WeeklyReport;
    onUpdate: (report: WeeklyReport) => void;
}

type SubTab = 'issues' | 'fds' | 'cos';

// Level of Effort badge colors
const LOE_COLORS = {
    None: 'bg-zinc-100 text-zinc-600',
    TBD: 'bg-zinc-100 text-zinc-600',
    Minor: 'bg-blue-100 text-blue-700',
    Moderate: 'bg-amber-100 text-amber-700',
    Major: 'bg-red-100 text-red-700',
    Addition: 'bg-green-100 text-green-700',
    Deletion: 'bg-red-100 text-red-700',
    Modification: 'bg-purple-100 text-purple-700'
};

export function IssuesTab({ report, onUpdate }: Props) {
    const [subTab, setSubTab] = useState<SubTab>('issues');
    
    const issues = report.issues || [];
    const fieldDirectives = report.fieldDirectives || [];
    const changeOrders = report.changeOrders || [];

    // Issues CRUD
    const addIssue = () => {
        const newIssue: IssueEntry = {
            id: crypto.randomUUID(),
            description: '',
            assignedTo: '',
            dueDate: '',
            status: 'Open'
        };
        onUpdate({ ...report, issues: [...issues, newIssue] });
    };

    const updateIssue = (id: string, field: keyof IssueEntry, value: any) => {
        const updated = issues.map(i => i.id === id ? { ...i, [field]: value } : i);
        onUpdate({ ...report, issues: updated });
    };

    const removeIssue = (id: string) => {
        onUpdate({ ...report, issues: issues.filter(i => i.id !== id) });
    };

    // Field Directives CRUD
    const addFD = () => {
        const fdCount = fieldDirectives.length;
        const newFD: FieldDirective = {
            id: crypto.randomUUID(),
            number: `FD-${String(fdCount + 1).padStart(3, '0')}`,
            dateIssued: new Date().toISOString().split('T')[0],
            description: '',
            issuedBy: '',
            timeImpact: 'None',
            costImpact: 'TBD',
            scopeImpact: 'None',
            status: 'Draft'
        };
        onUpdate({ ...report, fieldDirectives: [...fieldDirectives, newFD] });
    };

    const updateFD = (id: string, field: keyof FieldDirective, value: any) => {
        const updated = fieldDirectives.map(fd => fd.id === id ? { ...fd, [field]: value } : fd);
        onUpdate({ ...report, fieldDirectives: updated });
    };

    const removeFD = (id: string) => {
        onUpdate({ ...report, fieldDirectives: fieldDirectives.filter(fd => fd.id !== id) });
    };

    // Change Orders CRUD
    const addCO = () => {
        const coCount = changeOrders.length;
        const newCO: ChangeOrder = {
            id: crypto.randomUUID(),
            number: `CO-${String(coCount + 1).padStart(3, '0')}`,
            dateSubmitted: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            timeImpact: 'None',
            costImpact: 'TBD',
            scopeImpact: 'None',
            status: 'Draft'
        };
        onUpdate({ ...report, changeOrders: [...changeOrders, newCO] });
    };

    const updateCO = (id: string, field: keyof ChangeOrder, value: any) => {
        const updated = changeOrders.map(co => co.id === id ? { ...co, [field]: value } : co);
        onUpdate({ ...report, changeOrders: updated });
    };

    const removeCO = (id: string) => {
        onUpdate({ ...report, changeOrders: changeOrders.filter(co => co.id !== id) });
    };

    // Calculate CO summary
    const approvedCOTotal = changeOrders
        .filter(co => co.status === 'Approved')
        .reduce((sum, co) => sum + (co.amount || 0), 0);
    
    const pendingCOCount = changeOrders.filter(co => 
        co.status === 'Submitted' || co.status === 'Under Review'
    ).length;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <TabHeader 
                icon={<AlertCircle />} 
                title="Issues & Changes" 
                onAdd={subTab === 'issues' ? addIssue : subTab === 'fds' ? addFD : addCO} 
                addLabel={subTab === 'issues' ? 'Add Issue' : subTab === 'fds' ? 'Add FD' : 'Add CO'} 
            />

            {/* Sub-Tab Navigation */}
            <div className="flex gap-2 bg-zinc-100 p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setSubTab('issues')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                        subTab === 'issues' ? 'bg-white shadow text-zinc-800' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                >
                    Issues ({issues.length})
                </button>
                <button 
                    onClick={() => setSubTab('fds')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                        subTab === 'fds' ? 'bg-white shadow text-zinc-800' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                >
                    Field Directives ({fieldDirectives.length})
                </button>
                <button 
                    onClick={() => setSubTab('cos')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                        subTab === 'cos' ? 'bg-white shadow text-zinc-800' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                >
                    Change Orders ({changeOrders.length})
                </button>
            </div>

            {/* Issues Table */}
            {subTab === 'issues' && (
                issues.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-zinc-400">
                        No active issues logged.
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 w-1/2">Description</th>
                                    <th className="px-4 py-3 text-center">Assigned To</th>
                                    <th className="px-4 py-3 text-center">Due Date</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {issues.map(issue => (
                                    <tr key={issue.id} className="hover:bg-zinc-50/50 group transition">
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white font-medium text-zinc-800 placeholder-zinc-300"
                                                placeholder="Describe the issue..."
                                                value={issue.description}
                                                onChange={e => updateIssue(issue.id, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <input 
                                                type="text" 
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-600 text-center"
                                                placeholder="Name"
                                                value={issue.assignedTo}
                                                onChange={e => updateIssue(issue.id, 'assignedTo', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <input 
                                                type="date" 
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white text-zinc-600 text-center"
                                                value={issue.dueDate}
                                                onChange={e => updateIssue(issue.id, 'dueDate', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span 
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide cursor-pointer select-none border
                                                    ${issue.status === 'Open' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                      issue.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                      'bg-red-50 text-red-700 border-red-200'}`}
                                                onClick={() => {
                                                    const next = issue.status === 'Open' ? 'Closed' : issue.status === 'Closed' ? 'Blocked' : 'Open';
                                                    updateIssue(issue.id, 'status', next);
                                                }}
                                            >
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button 
                                                onClick={() => removeIssue(issue.id)}
                                                className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Field Directives Table - With Level of Effort */}
            {subTab === 'fds' && (
                fieldDirectives.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-zinc-400">
                        <FileText className="mx-auto mb-2 text-zinc-300" size={32} />
                        No field directives logged. Click "Add FD" to create one.
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 w-16">FD #</th>
                                    <th className="px-3 py-3 w-24">Date</th>
                                    <th className="px-3 py-3">Description</th>
                                    <th className="px-3 py-3 w-24 text-center">
                                        <div className="flex items-center justify-center gap-1"><Clock size={12}/>Time</div>
                                    </th>
                                    <th className="px-3 py-3 w-24 text-center">
                                        <div className="flex items-center justify-center gap-1"><DollarSign size={12}/>Cost</div>
                                    </th>
                                    <th className="px-3 py-3 w-24 text-center">
                                        <div className="flex items-center justify-center gap-1"><Layers size={12}/>Scope</div>
                                    </th>
                                    <th className="px-3 py-3 w-24 text-center">Status</th>
                                    <th className="px-3 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {fieldDirectives.map(fd => (
                                    <tr key={fd.id} className="hover:bg-zinc-50/50 group transition">
                                        <td className="px-3 py-2 font-mono text-xs font-bold text-zinc-600">{fd.number}</td>
                                        <td className="px-3 py-2">
                                            <input 
                                                type="date" 
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white w-full"
                                                value={fd.dateIssued}
                                                onChange={e => updateFD(fd.id, 'dateIssued', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input 
                                                type="text" 
                                                className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white w-full placeholder-zinc-300 text-sm"
                                                placeholder="Describe the field directive..."
                                                value={fd.description}
                                                onChange={e => updateFD(fd.id, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select 
                                                className={`text-[10px] font-bold rounded px-2 py-1 border-none w-full text-center cursor-pointer hover:opacity-80 transition ${LOE_COLORS[fd.timeImpact || 'None']}`}
                                                value={fd.timeImpact || 'None'}
                                                onChange={e => updateFD(fd.id, 'timeImpact', e.target.value)}
                                            >
                                                <option value="None">None</option>
                                                <option value="Minor">Minor (1-3d)</option>
                                                <option value="Moderate">Mod (1-2w)</option>
                                                <option value="Major">Major (2w+)</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select 
                                                className={`text-[10px] font-bold rounded px-2 py-1 border-none w-full text-center cursor-pointer hover:opacity-80 transition ${LOE_COLORS[fd.costImpact || 'TBD']}`}
                                                value={fd.costImpact || 'TBD'}
                                                onChange={e => updateFD(fd.id, 'costImpact', e.target.value)}
                                            >
                                                <option value="TBD">TBD</option>
                                                <option value="Minor">Minor (&lt;$5K)</option>
                                                <option value="Moderate">Mod ($5-25K)</option>
                                                <option value="Major">Major ($25K+)</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select 
                                                className={`text-[10px] font-bold rounded px-2 py-1 border-none w-full text-center cursor-pointer hover:opacity-80 transition ${LOE_COLORS[fd.scopeImpact || 'None']}`}
                                                value={fd.scopeImpact || 'None'}
                                                onChange={e => updateFD(fd.id, 'scopeImpact', e.target.value)}
                                            >
                                                <option value="None">None</option>
                                                <option value="Addition">Addition</option>
                                                <option value="Deletion">Deletion</option>
                                                <option value="Modification">Modification</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <select 
                                                className={`text-[10px] font-bold rounded px-2 py-1 border-none cursor-pointer hover:opacity-80 transition ${
                                                    fd.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    fd.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    fd.status === 'Incorporated' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-zinc-100 text-zinc-700'
                                                }`}
                                                value={fd.status}
                                                onChange={e => updateFD(fd.id, 'status', e.target.value)}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Submitted">Submitted</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Incorporated">Incorporated</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <button 
                                                onClick={() => removeFD(fd.id)}
                                                className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Change Orders Table - With Level of Effort */}
            {subTab === 'cos' && (
                <>
                    {changeOrders.length === 0 ? (
                        <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-zinc-400">
                            <DollarSign className="mx-auto mb-2 text-zinc-300" size={32} />
                            No change orders logged. Click "Add CO" to create one.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 w-16">CO #</th>
                                        <th className="px-3 py-3 w-24">Submitted</th>
                                        <th className="px-3 py-3">Description</th>
                                        <th className="px-3 py-3 w-24 text-center">Amount</th>
                                        <th className="px-3 py-3 w-24 text-center">
                                            <div className="flex items-center justify-center gap-1"><Clock size={12}/>Time</div>
                                        </th>
                                        <th className="px-3 py-3 w-24 text-center">
                                            <div className="flex items-center justify-center gap-1"><Target size={12}/>Cost LOE</div>
                                        </th>
                                        <th className="px-3 py-3 w-24 text-center">Status</th>
                                        <th className="px-3 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {changeOrders.map(co => (
                                        <tr key={co.id} className="hover:bg-zinc-50/50 group transition">
                                            <td className="px-3 py-2 font-mono text-xs font-bold text-zinc-600">{co.number}</td>
                                            <td className="px-3 py-2">
                                                <input 
                                                    type="date" 
                                                    className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white w-full"
                                                    value={co.dateSubmitted}
                                                    onChange={e => updateCO(co.id, 'dateSubmitted', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input 
                                                    type="text" 
                                                    className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white w-full placeholder-zinc-300 text-sm"
                                                    placeholder="Describe the change order..."
                                                    value={co.description}
                                                    onChange={e => updateCO(co.id, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">$</span>
                                                    <input 
                                                        type="number" 
                                                        className="form-input h-7 text-xs bg-transparent border-transparent hover:border-zinc-300 focus:bg-white w-20 text-center pl-4 font-bold"
                                                        placeholder="0"
                                                        value={co.amount || ''}
                                                        onChange={e => updateCO(co.id, 'amount', Number(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <select 
                                                    className={`text-[10px] font-bold rounded px-2 py-1 border-none w-full text-center cursor-pointer hover:opacity-80 transition ${LOE_COLORS[co.timeImpact || 'None']}`}
                                                    value={co.timeImpact || 'None'}
                                                    onChange={e => updateCO(co.id, 'timeImpact', e.target.value)}
                                                >
                                                    <option value="None">None</option>
                                                    <option value="Minor">Minor (1-3d)</option>
                                                    <option value="Moderate">Mod (1-2w)</option>
                                                    <option value="Major">Major (2w+)</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <select 
                                                    className={`text-[10px] font-bold rounded px-2 py-1 border-none w-full text-center cursor-pointer hover:opacity-80 transition ${LOE_COLORS[co.costImpact || 'TBD']}`}
                                                    value={co.costImpact || 'TBD'}
                                                    onChange={e => updateCO(co.id, 'costImpact', e.target.value)}
                                                >
                                                    <option value="TBD">TBD</option>
                                                    <option value="Minor">Minor (&lt;$5K)</option>
                                                    <option value="Moderate">Mod ($5-25K)</option>
                                                    <option value="Major">Major ($25K+)</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <select 
                                                    className={`text-[10px] font-bold rounded px-2 py-1 border-none w-auto text-center cursor-pointer hover:opacity-80 transition ${
                                                        co.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        co.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        co.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-zinc-100 text-zinc-700'
                                                    }`}
                                                    value={co.status}
                                                    onChange={e => updateCO(co.id, 'status', e.target.value)}
                                                >
                                                    <option value="Draft">Draft</option>
                                                    <option value="Submitted">Submitted</option>
                                                    <option value="Under Review">Under Review</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button 
                                                    onClick={() => removeCO(co.id)}
                                                    className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* CO Summary */}
                    {changeOrders.length > 0 && (
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-5 shadow-lg">
                            <h4 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Change Order Summary</h4>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">${approvedCOTotal.toLocaleString()}</div>
                                    <div className="text-xs opacity-70">Approved COs</div>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{pendingCOCount}</div>
                                    <div className="text-xs opacity-70">Pending</div>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{changeOrders.length}</div>
                                    <div className="text-xs opacity-70">Total COs</div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
