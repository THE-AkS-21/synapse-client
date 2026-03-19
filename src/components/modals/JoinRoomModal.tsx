'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Search, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinRoomModal({ isOpen, onClose }: Props) {
    const [roomId, setRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { rooms, setRooms, setActiveRoom } = useChatStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) setRoomId('');
    }, [isOpen]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedId = roomId.trim();
        if (!trimmedId) return;

        setIsLoading(true);

        // Fast Path: Check if user is already in the room
        if (rooms.some(r => r.id === trimmedId)) {
            setActiveRoom(trimmedId);
            toast.success('Switched to room!');
            onClose();
            setIsLoading(false);
            return;
        }

        try {
            // Check room type before attempting to join
            const roomRes = await api.get(`/api/v1/rooms/${trimmedId}`);
            if (roomRes.data.type === 'PRIVATE') {
                toast.error('This is a private room. Ask the creator to invite you via your User ID.', { icon: '🔒', duration: 5000 });
                setIsLoading(false);
                return;
            }

            // Execute Join
            await api.post(`/api/v1/rooms/${trimmedId}/join`);

            // Re-sync rooms
            const res = await api.get('/api/v1/rooms/user');
            setRooms(res.data);
            setActiveRoom(trimmedId);
            toast.success('Successfully joined the room!');
            onClose();

        } catch (err: any) {
            if (err.response?.status === 404) {
                toast.error('Room not found. Please check the ID.');
            } else {
                toast.error('Failed to join room.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="join-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border bg-surface-elevated text-foreground"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
                        <h2 className="font-heading font-semibold text-foreground">Join a Room</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-hover transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleJoin} className="p-5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">Room ID</label>
                            <Input
                                autoFocus
                                placeholder="e.g. 0000-0000-0000"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                icon={<Search size={16} />}
                                required
                            />
                            <div className="flex items-start gap-2 px-1 mt-2">
                                <Lock size={11} className="mt-0.5 shrink-0 text-amber-500" />
                                <p className="text-[11px] text-foreground/50">
                                    Private rooms require an invitation from the creator.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={isLoading} disabled={!roomId.trim()}>Join Room</Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return createPortal(modalContent, document.body);
}