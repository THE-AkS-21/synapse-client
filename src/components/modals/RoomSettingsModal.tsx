'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
    roomName: string;
}

export default function RoomSettingsModal({ isOpen, onClose, roomId, roomName }: Props) {
    const { setRooms, rooms, setActiveRoom } = useChatStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const router = useRouter();

    const handleDeleteRoom = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/rooms/${roomId}`);
            setRooms(rooms.filter(r => r.id !== roomId));
            setActiveRoom(null);
            toast.success(`Room "${roomName}" deleted.`);
            onClose();
            router.push('/dashboard');
        } catch {
            toast.error('Failed to delete room.');
        } finally {
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border"
                        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-2.5">
                                <Trash2 size={15} style={{ color: 'var(--brand)' }} />
                                <h2 className="font-heading font-semibold" style={{ color: 'var(--foreground)' }}>Room Settings</h2>
                                <span className="text-xs font-mono truncate max-w-[100px]"
                                    style={{ color: 'var(--foreground)', opacity: 0.4 }}>{roomName}</span>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--foreground)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3"
                                style={{ color: 'var(--foreground)', opacity: 0.4 }}>Danger Zone</p>
                            {!confirmDelete ? (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 border-red-500/30"
                                >
                                    <Trash2 size={14} />
                                    Delete Room
                                </button>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl p-4 space-y-3 border border-red-500/30 bg-red-500/10">
                                    <div className="flex items-start gap-2.5">
                                        <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                        <p className="text-xs text-red-300">
                                            Permanently delete <strong>&quot;{roomName}&quot;</strong> and all its messages? This cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirmDelete(false)}
                                            className="flex-1 py-2 text-xs rounded-lg border transition-colors"
                                            style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                                            Cancel
                                        </button>
                                        <button onClick={handleDeleteRoom} disabled={isDeleting}
                                            className="flex-1 py-2 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-60">
                                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
