'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="room-settings"
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-border bg-surface-elevated text-foreground"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
                        <div className="flex items-center gap-2.5">
                            <Trash2 size={15} className="text-brand" />
                            <h2 className="font-heading font-semibold text-foreground">Room Settings</h2>
                            <span className="text-xs font-mono truncate max-w-[100px] text-foreground/40">{roomName}</span>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-hover transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-5 bg-surface-elevated">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-foreground/40">Danger Zone</p>

                        {!confirmDelete ? (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/30 text-sm font-medium transition-colors text-red-500 hover:bg-red-500/10"
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
                                            className="flex-1 py-2 text-xs rounded-lg border border-border text-foreground bg-surface hover:bg-surface-hover transition-colors">
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
            </AnimatePresence>
        </div>
    );
}