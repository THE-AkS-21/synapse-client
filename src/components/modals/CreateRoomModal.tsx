'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { rooms, setRooms } = useChatStore();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsLoading(true);

        try {
            const res = await api.post('/api/v1/rooms', {
                name: name.trim(),
                type: 'PUBLIC'
            });
            setRooms([...rooms, res.data]);
            toast.success("Room created successfully!");
            setName('');
            onClose();
        } catch (err) {
            console.error('Failed to create room:', err);
            toast.error("Failed to create room. Try again.");
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
                        className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
                            <h2 className="text-lg font-semibold text-white">Create a New Room</h2>
                            <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Room Name
                                </label>
                                <Input
                                    autoFocus
                                    placeholder="e.g. general, engineering"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    icon={<Hash size={18} />}
                                    maxLength={32}
                                    required
                                />
                                <p className="text-xs text-zinc-500">
                                    This is where you and others will chat. Keep it recognizable.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
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
}
