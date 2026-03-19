'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Hash, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [roomType, setRoomType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [isLoading, setIsLoading] = useState(false);
    const { rooms, setRooms } = useChatStore();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setRoomType('PUBLIC');
        }
    }, [isOpen]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await api.post('/api/v1/rooms', {
                name: name.trim(),
                type: roomType,
            });
            setRooms([...rooms, res.data]);
            toast.success(`Room "${name.trim()}" created!`, { icon: roomType === 'PRIVATE' ? '🔒' : '🌐' });
            onClose();
        } catch (err) {
            toast.error('Failed to create room. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="create-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border bg-surface-elevated text-foreground"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
                        <h2 className="font-heading font-semibold text-foreground">Create a New Room</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-hover transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="p-5 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">Room Name</label>
                            <Input
                                autoFocus
                                placeholder="e.g. general, engineering"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={<Hash size={16} />}
                                maxLength={32}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">Room Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setRoomType('PUBLIC')}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                                            roomType === 'PUBLIC'
                                                ? 'bg-brand-light border-brand/30 text-brand'
                                                : 'bg-surface border-border text-foreground/60 hover:border-brand/30'
                                        }`}>
                                    <Globe size={15} />
                                    <div>
                                        <p className="text-sm font-semibold">Public</p>
                                        <p className="text-[10px] opacity-70">Anyone with the Room ID</p>
                                    </div>
                                </button>

                                <button type="button" onClick={() => setRoomType('PRIVATE')}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                                            roomType === 'PRIVATE'
                                                ? 'bg-amber-400/10 border-amber-400/30 text-amber-500'
                                                : 'bg-surface border-border text-foreground/60 hover:border-amber-400/30'
                                        }`}>
                                    <Lock size={15} />
                                    <div>
                                        <p className="text-sm font-semibold">Private</p>
                                        <p className="text-[10px] opacity-70">Invite-only via User ID</p>
                                    </div>
                                </button>
                            </div>

                            {roomType === 'PRIVATE' && (
                                <p className="text-[11px] px-1 text-foreground/50 mt-1">
                                    🔒 Others cannot join by ID. Use the room settings panel to invite members.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
                                Create Room
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return createPortal(modalContent, document.body);
}