"use client";

import { useState } from 'react';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinRoomModal({ isOpen, onClose }: Props) {
    const [roomId, setRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { rooms, setRooms, setActiveRoom } = useChatStore();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedId = roomId.trim();
        if (!trimmedId) return;
        setIsLoading(true);

        // Check if user is already in the room visually in client
        if (rooms.some(r => r.id === trimmedId)) {
            setActiveRoom(trimmedId);
            toast.success("Joined existing room!");
            onClose();
            setIsLoading(false);
            return;
        }

        try {
            // Re-fetch the user's rooms from the backend to guarantee synchronization
            const joinRes = await api.post(`/api/v1/rooms/${trimmedId}/join`);
            if (joinRes.status === 200) {
                const res = await api.get(`/api/v1/rooms/user`);
                setRooms(res.data);
                setActiveRoom(trimmedId);
                toast.success("Successfully joined the room!");
                setRoomId('');
                onClose();
            }
        } catch (err) {
            console.error('Failed to join room:', err);
            const axiosError = err as AxiosError;
            if (axiosError.response?.status === 404) {
                toast.error("Room not found. Please check the ID.");
            } else {
                toast.error("Failed to join room. It may be private or invalid.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden glass transition-colors"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-hover">
                            <h2 className="text-lg font-semibold text-foreground">Join Room securely</h2>
                            <button onClick={onClose} className="p-1 rounded-md text-zinc-500 hover:text-foreground hover:bg-surface-elevated transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleJoin} className="p-5 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Unique Room ID
                                </label>
                                <Input
                                    autoFocus
                                    placeholder="Paste Room ID here..."
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    icon={<Search size={18} />}
                                    required
                                />
                                <p className="text-xs text-zinc-500">
                                    A Room ID looks like a UUID (e.g., 550e8400-e29b-41d4-a716-446655440000).
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading} disabled={!roomId.trim()}>
                                    Join Room
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
