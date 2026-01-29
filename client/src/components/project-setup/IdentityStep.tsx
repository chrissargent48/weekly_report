import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { ProjectConfig } from '../../types';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ProjectSetup';

interface IdentityStepProps {
    localConfig: ProjectConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>;
    sensors: SensorDescriptor<SensorOptions>[];
    handleDragEnd: (event: DragEndEvent, listKey: 'recon' | 'stakeholders' | 'client' | 'engineer') => void;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ensureArray: (arr: any) => any[];
}

export function IdentityStep({ localConfig, setLocalConfig, sensors, handleDragEnd, handleLogoUpload, ensureArray }: IdentityStepProps) {
    return (
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
    );
}
