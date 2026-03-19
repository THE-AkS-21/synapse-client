'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Hash, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [roomType, setRoomType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [isLoading, setIsLoading] = useState(false);
    const { rooms, setRooms } = useChatStore();

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
            setName('');
            setRoomType('PUBLIC');
            onClose();
        } catch (err) {
            console.error('Failed to create room:', err);
            toast.error('Failed to create room. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
                        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b"
                            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <h2 className="font-heading font-semibold" style={{ color: 'var(--foreground)' }}>Create a New Room</h2>
                            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--foreground)', opacity: 0.5 }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-5">
                            {/* Room Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: 'var(--foreground)', opacity: 0.45 }}>Room Name</label>
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

                            {/* Room Type Toggle */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: 'var(--foreground)', opacity: 0.45 }}>Room Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setRoomType('PUBLIC')}
                                        className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all"
                                        style={{
                                            background: roomType === 'PUBLIC' ? 'var(--brand-light)' : 'var(--surface)',
                                            borderColor: roomType === 'PUBLIC' ? 'var(--border-hover)' : 'var(--border)',
                                            color: roomType === 'PUBLIC' ? 'var(--brand)' : 'var(--foreground)',
                                            opacity: roomType === 'PUBLIC' ? 1 : 0.6,
                                        }}>
                                        <Globe size={15} />
                                        <div>
                                            <p className="text-sm font-semibold">Public</p>
                                            <p className="text-[10px] opacity-70">Anyone with the Room ID</p>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => setRoomType('PRIVATE')}
                                        className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all"
                                        style={{
                                            background: roomType === 'PRIVATE' ? 'rgba(251,191,36,0.08)' : 'var(--surface)',
                                            borderColor: roomType === 'PRIVATE' ? 'rgba(251,191,36,0.3)' : 'var(--border)',
                                            color: roomType === 'PRIVATE' ? 'rgb(251,191,36)' : 'var(--foreground)',
                                            opacity: roomType === 'PRIVATE' ? 1 : 0.6,
                                        }}>
                                        <Lock size={15} />
                                        <div>
                                            <p className="text-sm font-semibold">Private</p>
                                            <p className="text-[10px] opacity-70">Invite-only via User ID</p>
                                        </div>
                                    </button>
                                </div>
                                {roomType === 'PRIVATE' && (
                                    <p className="text-[11px] px-1" style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                                        🔒 Others can&apos;t join by ID — use the room settings panel to invite members by their User ID.
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
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
