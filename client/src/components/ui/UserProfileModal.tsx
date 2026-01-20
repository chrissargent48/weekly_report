import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { UserProfile } from '../../types';

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
    initialData: UserProfile;
    onSave: (data: UserProfile) => void;
}

export function UserProfileModal({ open, onClose, initialData, onSave }: UserProfileModalProps) {
    const [name, setName] = useState(initialData.name);
    const [role, setRole] = useState(initialData.role);
    const [email, setEmail] = useState(initialData.email);
    const [phone, setPhone] = useState(initialData.phone);
    const [profilePicture, setProfilePicture] = useState<string | undefined>(initialData.profilePicture);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setName(initialData.name);
            setRole(initialData.role);
            setEmail(initialData.email);
            setPhone(initialData.phone);
            setProfilePicture(initialData.profilePicture);
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave({ 
            name, 
            role, 
            email, 
            phone, 
            profilePicture 
        });
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <Modal open={open} onClose={onClose} title="Edit User Profile">
            <div className="space-y-6">
                
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center justify-center space-y-3 pb-2">
                    <div 
                        className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-zinc-100 flex items-center justify-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-brand-primary flex items-center justify-center text-3xl font-bold text-white">
                                {getInitials(name)}
                            </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    
                    {profilePicture && (
                        <button 
                            onClick={() => setProfilePicture(undefined)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                            Remove Photo
                        </button>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Chris Sargent" />
                    <Input label="Role / Title" value={role} onChange={setRole} placeholder="e.g. Project Manager" />
                    <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="e.g. chris@recon.com" />
                    <Input label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="e.g. 555-123-4567" />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white hover:brightness-110 shadow-sm transition active:scale-95"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </Modal>
    );
}
