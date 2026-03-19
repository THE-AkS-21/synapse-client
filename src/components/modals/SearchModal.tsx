'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MessageCircle } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { RoomService } from '@/services/room.service';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const currentUser = useAuthStore(state => state.user);
    const { rooms, addRoom, setActiveRoom, messages } = useChatStore();
    const { closeSidebars } = useUiStore();

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setUserResults([]);
        }
    }, [isOpen]);

    useEffect(() => {

        const query = searchQuery.trim();

        if (query.length < 2) {
            setUserResults([]);
            return;
        }

        setIsLoading(true);

        const delay = setTimeout(async () => {
            try {
                let results = [];

                // 🔥 If query looks like ID → search by ID
                const isIdSearch = /^\d+$/.test(query) || query.includes('-');

                if (isIdSearch) {
                    try {
                        const user = await UserService.getUserById(query);
                        if (user && user.username !== currentUser?.username) {
                            results = [user];
                        }
                    } catch {
                        results = [];
                    }
                } else {
                    // 🔥 Normal username search
                    const data = await UserService.searchUsers(query);
                    results = data.filter((u: any) => u.username !== currentUser?.username);
                }

                setUserResults(results);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [searchQuery, currentUser?.username]);

    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        const existing = rooms.find(r => r.type === 'DIRECT' && r.dmPartner === partnerUsername);
        if (existing) {
            setActiveRoom(existing.id);
            onClose();
            closeSidebars();
            return;
        }
        try {
            const data = await RoomService.startDirectMessage(Number(currentUser?.id), Number(partnerId));
            const newRoom = { ...data, type: 'DIRECT' as const, dmPartner: partnerUsername };
            addRoom(newRoom, currentUser?.id);
            setActiveRoom(newRoom.id);
            toast.success(`Chat with @${partnerUsername} started!`);
            onClose();
            closeSidebars();
        } catch (err: any) {
            toast.error('Failed to open DM.');
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[70vh]"
                        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                            <Search size={18} className="text-foreground/40" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search users by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/40 text-base"
                            />
                            <button onClick={onClose} className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-surface-hover transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 bg-surface">
                            {searchQuery.length > 0 && searchQuery.length < 2 && (
                                <p className="text-center text-sm text-foreground/40 py-8">Type at least 2 characters...</p>
                            )}
                            {isLoading && (
                                <p className="text-center text-sm text-foreground/40 py-8">Searching...</p>
                            )}
                            {!isLoading && searchQuery.length >= 2 && userResults.length === 0 && (
                                <p className="text-center text-sm text-foreground/40 py-8">No users found.</p>
                            )}

                            <div className="space-y-1">
                                {userResults.map(u => {
                                    let lastMsg = null;
                                    for (const rId in messages) {
                                        const msgs = messages[rId].filter(m => m.senderUsername === u.username);
                                        if (msgs.length > 0) lastMsg = msgs[msgs.length - 1].content;
                                    }

                                    return (
                                        <button
                                            key={u.id}
                                            onClick={() => handleStartDM(u.id, u.username)}
                                            className="w-full flex flex-col gap-2 p-3 hover:bg-brand/5 border border-transparent hover:border-brand/20 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar name={u.username} size="sm" />
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">{u.username}</p>
                                                    <p className="text-[10px] text-brand font-bold uppercase">Member</p>
                                                </div>
                                                <MessageCircle size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-brand transition-opacity" />
                                            </div>
                                            {lastMsg && (
                                                <div className="ml-11 mt-0.5 p-2 rounded-lg text-[11px] text-left text-foreground/60 italic truncate max-w-[85%] bg-surface border border-border">
                                                    "{lastMsg}"
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
    return createPortal(modalContent, document.body);
}