import React, { useState, useEffect } from 'react';
import { api, ProjectIndex } from '../api';
import { FolderPlusIcon, ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BuildingOffice2Icon } from '@heroicons/react/24/solid';
import { Modal } from './ui';

interface Props {
    onSelect: (projectId: string) => void;
}

export function ProjectSelector({ onSelect }: Props) {
    const [projects, setProjects] = useState<ProjectIndex[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    
    // New Project State
    const [newName, setNewName] = useState("");
    const [newLoc, setNewLoc] = useState("");

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const list = await api.listProjects();
        setProjects(list);
        setLoading(false);
    }

    async function create() {
        if (!newName) return;
        const p = await api.createProject(newName, newLoc);
        onSelect(p.id);
    }

    // Delete Project State
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    function confirmDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        setDeleteTargetId(id);
    }

    async function executeDelete() {
        if (!deleteTargetId) return;
        
        try {
            await api.deleteProject(deleteTargetId);
            setDeleteTargetId(null);
            load();
        } catch(e) {
            console.error("API call failed", e);
            alert("Failed to delete project. Please try again.");
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-zinc-400">Loading Projects...</div>;

    return (
        <div className="min-h-screen bg-zinc-100 p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-surface-dark">My Projects</h1>
                        <p className="text-brand-text-muted">Select a project to manage reports</p>
                    </div>
                    <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
                        <FolderPlusIcon className="w-5 h-5"/> New Project
                    </button>
                </header>

                {projects.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-zinc-300">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <BuildingOffice2Icon className="w-8 h-8"/>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-700">No Projects Found</h3>
                        <p className="text-zinc-500 mb-6">Create your first construction project to get started.</p>
                        <button onClick={() => setShowNew(true)} className="text-brand-primary font-bold hover:underline">Create Project</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {projects.map(p => (
                            <div key={p.id} onClick={() => onSelect(p.id)} className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md hover:border-brand-primary/30 cursor-pointer transition group relative overflow-hidden">
                                <button 
                                    onClick={(e) => confirmDelete(e, p.id)}
                                    className="absolute top-3 right-3 p-1.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-full transition z-20 opacity-0 group-hover:opacity-100"
                                    title="Delete Project"
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-brand-primary/10 transition"/>
                                
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-brand-surface-light rounded-lg flex items-center justify-center text-brand-primary font-bold">
                                        <BuildingOffice2Icon className="w-6 h-6"/>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded mt-1">Active</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-brand-surface-dark mb-1 truncate">{p.name}</h3>
                                <p className="text-sm text-zinc-500 mb-4 truncate">{p.location || "No location set"}</p>
                                
                                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 group-hover:text-brand-primary transition">
                                    <span>Last updated: {new Date(p.lastUpdated).toLocaleDateString()}</span>
                                    <ArrowRightIcon className="w-4 h-4"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Project">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Project Name</label>
                        <input autoFocus className="w-full p-3 border border-zinc-300 rounded-lg font-bold focus:ring-2 ring-brand-primary/20 outline-none" placeholder="e.g. Project Alpha" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Location</label>
                        <input className="w-full p-3 border border-zinc-300 rounded-lg text-sm focus:ring-2 ring-brand-primary/20 outline-none" placeholder="City, State" value={newLoc} onChange={e => setNewLoc(e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowNew(false)} className="flex-1 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-lg">Cancel</button>
                        <button onClick={create} disabled={!newName} className="flex-1 py-3 font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">Create Project</button>
                    </div>
                </div>
            </Modal>

            <Modal open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} title="Delete Project?">
                <div className="space-y-4">
                    <p className="text-zinc-600">
                        Are you sure you want to delete this project? This action <strong>cannot be undone</strong> and all associated reports and data will be permanently removed.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => setDeleteTargetId(null)} 
                            className="flex-1 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeDelete} 
                            className="flex-1 py-3 font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
