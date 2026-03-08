'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { Users, Copy, Globe, Lock, Trash2, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';

const TIPS = [
    'Use the search icon to join a room by its ID',
    'Click any online member to send them a DM',
    'Click your username to update your profile',
    'Messages auto-delete after 7 days to keep things clean',
];

export default function ChatWindow() {
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);
    const setRooms = useChatStore(state => state.setRooms);
    const rooms = useChatStore(state => state.rooms);
    const typingUsers = useChatStore(state => state.typingUsers);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const token = useAuthStore(state => state.token);
    const currentUser = useAuthStore(state => state.user);
    const [isConfirmDelete, setIsConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useChatWebSocket(activeRoomId || '', token);

    // ESC to close active room
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeRoomId) {
                setActiveRoom(null);
                setIsConfirmDelete(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeRoomId, setActiveRoom]);

    const handleCopyRoomId = () => {
        if (activeRoomId) {
            navigator.clipboard.writeText(activeRoomId);
            toast.success('Room ID copied!', { icon: '📋' });
        }
    };

    const handleDeleteRoom = async () => {
        if (!activeRoomId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/v1/rooms/${activeRoomId}`);
            setRooms(rooms.filter(r => r.id !== activeRoomId));
            setActiveRoom(null);
            toast.success('Room deleted.');
        } catch {
            toast.error('Failed to delete room.');
        } finally {
            setIsDeleting(false);
            setIsConfirmDelete(false);
        }
    };

    if (!activeRoomId) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden"
                style={{ background: 'var(--background)' }}
            >
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <motion.div key={i}
                            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.8 }}
                            className="absolute rounded-full blur-3xl"
                            style={{
                                width: `${200 + i * 80}px`, height: `${200 + i * 80}px`,
                                left: `${[15, 55, 70, 5][i]}%`, top: `${[20, 10, 60, 65][i]}%`,
                                background: `rgba(74,222,128,${[0.05, 0.04, 0.03, 0.05][i]})`,
                            }}
                        />
                    ))}
                    <div className="absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }} />
                </div>

                <div className="relative z-10 flex flex-col items-center px-8 max-w-lg">
                    <motion.div initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 mb-6 relative"
                    >
                        <div className="absolute inset-0 rounded-3xl blur-xl" style={{ background: 'var(--brand)', opacity: 0.2 }} />
                        <div className="relative w-24 h-24 rounded-3xl border shadow-2xl overflow-hidden"
                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
                            <Image src="/synapse_logo.png" alt="Synapse Logo" fill className="object-cover" priority />
                        </div>
                    </motion.div>
                    <motion.h2 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                        className="text-2xl font-heading font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                        Welcome to Synapse
                    </motion.h2>
                    <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.32 }}
                        className="text-sm leading-relaxed mb-8" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                        Select a room from the sidebar, or create one to get started. Press{' '}
                        <kbd className="text-xs px-1.5 py-0.5 rounded font-mono border"
                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>Esc</kbd> at any time to close a room.
                    </motion.p>
                    <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                        className="w-full grid grid-cols-2 gap-2.5 max-w-md">
                        {TIPS.map((tip, i) => (
                            <motion.div key={tip} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 + i * 0.08 }}
                                className="flex items-start gap-2 rounded-xl p-3 text-left border"
                                style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
                                <MessageCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--brand)' }} />
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{tip}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    const room = rooms.find(r => r.id === activeRoomId);
    const currentTyping = typingUsers[activeRoomId] || [];
    const currentOnline = onlineUsers[activeRoomId] || [];
    const isPrivate = room?.type === 'PRIVATE';
    const isDM = room?.type === 'DIRECT';
    const isCreator = room?.creatorUsername === currentUser?.username;

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300"
            style={{ background: 'var(--background)' }}>

            {/* Subtle background dot pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
                backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />
            {/* Top green glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 blur-3xl pointer-events-none"
                style={{ background: 'var(--brand)', opacity: 0.06 }} />

            {/* Room Header */}
            <motion.header
                ref={headerRef}
                key={activeRoomId}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b backdrop-blur-md z-10"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-3 w-full min-w-0">
                    <Avatar name={room?.name || 'R'} size="sm" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold leading-tight truncate" style={{ color: 'var(--foreground)' }}>
                                {isDM ? `@${room?.dmPartner || room?.name}` : (room?.name || 'Loading...')}
                            </span>
                            {!isDM && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${isPrivate
                                    ? 'text-amber-500 bg-amber-400/10 border-amber-400/20'
                                    : 'border'}`}
                                    style={!isPrivate ? { color: 'var(--brand)', background: 'var(--brand-light)', borderColor: 'var(--border-hover)' } : {}}>
                                    {isPrivate ? <Lock size={8} /> : <Globe size={8} />}
                                    {isPrivate ? 'Private' : 'Public'}
                                </span>
                            )}
                            {isDM && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
                                    style={{ color: 'var(--brand)', background: 'var(--brand-light)', borderColor: 'var(--border-hover)' }}>
                                    <MessageCircle size={8} /> DM
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                            <span className="flex items-center gap-1">
                                <Users size={11} />{currentOnline.length} online
                            </span>
                            <AnimatePresence>
                                {currentTyping.length > 0 && (
                                    <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                                        className="font-medium" style={{ color: 'var(--brand)' }}>
                                        • {currentTyping.join(', ')} {currentTyping.length > 1 ? 'are' : 'is'} typing...
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Copy room ID */}
                        <button onClick={handleCopyRoomId} title="Click to copy Room ID"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border group cursor-pointer transition-all duration-200"
                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                            <span className="text-[11px] font-mono tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{activeRoomId}</span>
                            <Copy size={12} style={{ color: 'var(--foreground)', opacity: 0.4 }} />
                        </button>

                        {/* Delete room button — creator only, non-DM */}
                        {isCreator && !isDM && (
                            <AnimatePresence mode="wait">
                                {!isConfirmDelete ? (
                                    <motion.button
                                        key="delete-btn"
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setIsConfirmDelete(true)}
                                        className="p-2 rounded-xl border text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                                        style={{ borderColor: 'var(--border)' }}
                                        title="Delete Room"
                                    >
                                        <Trash2 size={14} />
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="confirm"
                                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <span className="text-xs text-red-400 font-medium">Delete?</span>
                                        <button onClick={handleDeleteRoom} disabled={isDeleting}
                                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
                                            {isDeleting ? '...' : 'Yes'}
                                        </button>
                                        <button onClick={() => setIsConfirmDelete(false)}
                                            className="px-2.5 py-1 text-xs rounded-lg border transition-colors"
                                            style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                                            No
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </motion.header>

            <ChatHistory roomId={activeRoomId} />

            <div className="px-4 pb-4 pt-2 bg-transparent mt-auto z-10">
                <ChatInput roomId={activeRoomId} />
            </div>
        </div>
    );
}
