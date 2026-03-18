'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import RoomSettingsPanel from './RoomSettingsPanel';
import { Users, Globe, Lock, MessageCircle, ChevronDown, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
    'Click the room name to open room settings and invite members',
    'Click any online member in the right sidebar to send a DM',
    'Click your username in the sidebar to update your profile',
    'Press ESC to close the active room at any time',
];

export default function ChatWindow() {
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);
    const rooms = useChatStore(state => state.rooms);
    const typingUsers = useChatStore(state => state.typingUsers);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const token = useAuthStore(state => state.token);
    const currentUser = useAuthStore(state => state.user);
    const { toggleLeftSidebar, toggleRightSidebar } = useUiStore();

    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const headerNameRef = useRef<HTMLButtonElement>(null);

    useChatWebSocket(activeRoomId || '', token);

    // ESC to close room
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeRoomId) {
                if (isSettingsPanelOpen) {
                    setIsSettingsPanelOpen(false);
                } else {
                    setActiveRoom(null);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeRoomId, setActiveRoom, isSettingsPanelOpen]);

    if (!activeRoomId) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden"
                style={{ background: 'var(--background)' }}
            >
                <div className="absolute top-4 left-4 lg:hidden z-50">
                    <button onClick={toggleLeftSidebar} className="p-2 rounded-lg bg-zinc-800 text-white"><Menu size={20}/></button>
                </div>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <motion.div key={i}
                                    animate={{ y: [0, -20, 0], x: [0, 8, 0] }}
                                    transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i }}
                                    className="absolute rounded-full blur-3xl"
                                    style={{
                                        width: `${180 + i * 70}px`, height: `${180 + i * 70}px`,
                                        left: `${[20, 55, 72][i]}%`, top: `${[25, 15, 60][i]}%`,
                                        background: `rgba(74,222,128,${[0.05, 0.04, 0.03][i]})`,
                                    }} />
                    ))}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.9) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }} />
                </div>

                <div className="relative z-10 flex flex-col items-center px-8 max-w-md">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                                className="w-20 h-20 mb-6 relative">
                        <div className="absolute inset-0 rounded-3xl blur-xl" style={{ background: 'var(--brand)', opacity: 0.2 }} />
                        <div className="relative w-20 h-20 rounded-3xl border shadow-2xl overflow-hidden"
                             style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
                            <Image src="/synapse_logo.png" alt="Synapse Logo" fill sizes="80px" className="object-cover" priority />
                        </div>
                    </motion.div>
                    <motion.h2 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                               className="text-2xl font-heading font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                        Welcome to Synapse
                    </motion.h2>
                    <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.32 }}
                              className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                        Select a room or start a DM.{' '}
                        <kbd className="text-xs px-1.5 py-0.5 rounded font-mono border"
                             style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>Esc</kbd> to close.
                    </motion.p>
                    <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                                className="w-full grid grid-cols-2 gap-2">
                        {TIPS.map((tip, i) => (
                            <motion.div key={tip} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.07 }}
                                        className="flex items-start gap-2 rounded-xl p-3 border text-left"
                                        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
                                <MessageCircle size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--brand)' }} />
                                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.55 }}>{tip}</p>
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
    const isCreator = currentUser ? Number(currentUser.id) === room?.creatorId : false;

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300"
             style={{ background: 'var(--background)' }}>

            {/* Subtle dot pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
                backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />

            {/* Room Header */}
            <motion.header
                key={activeRoomId}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b backdrop-blur-md z-20 relative"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={toggleLeftSidebar} className="lg:hidden p-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                        <Menu size={18} style={{ color: 'var(--foreground)' }} />
                    </button>

                    <Avatar name={room?.name || 'R'} size="sm" />
                    <div className="flex-1 min-w-0">
                        {/* Clicking room name opens settings panel */}
                        <button
                            ref={headerNameRef}
                            onClick={() => setIsSettingsPanelOpen(v => !v)}
                            className="flex items-center gap-1.5 group cursor-pointer rounded-lg px-1 -ml-1 py-0.5 transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            title="Click for room settings"
                        >
                            <span className="font-semibold leading-tight truncate text-sm" style={{ color: 'var(--foreground)' }}>
                                {isDM ? `@${room?.dmPartner || room?.name}` : (room?.name || 'Loading...')}
                            </span>
                            {!isDM && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${isPrivate ? 'text-amber-400' : ''}`}
                                      style={!isPrivate ? { color: 'var(--brand)', background: 'var(--brand-light)', borderColor: 'var(--border-hover)' } : { background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' }}>
                                    {isPrivate ? <Lock size={8} /> : <Globe size={8} />}
                                    {isPrivate ? 'Private' : 'Public'}
                                </span>
                            )}
                            <ChevronDown size={12} className="shrink-0 transition-transform"
                                         style={{ color: 'var(--foreground)', opacity: 0.4, transform: isSettingsPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>

                        <div className="flex items-center gap-2 mt-0.5 text-xs px-1" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                            <span className="flex items-center gap-1">
                                <Users size={10} /> {currentOnline.length} online
                            </span>
                            <AnimatePresence>
                                {currentTyping.length > 0 && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                 className="font-medium" style={{ color: 'var(--brand)' }}>
                                        • {currentTyping.join(', ')} typing...
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <button onClick={toggleRightSidebar} className="lg:hidden p-1.5 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand)' }}>
                    <Users size={16} />
                </button>
            </motion.header>

            {/* Floating Room Settings Panel — anchored below header */}
            <AnimatePresence>
                {isSettingsPanelOpen && (
                    <RoomSettingsPanel
                        room={room!}
                        isCreator={isCreator}
                        isPrivate={isPrivate}
                        onClose={() => setIsSettingsPanelOpen(false)}
                    />
                )}
            </AnimatePresence>

            <ChatHistory roomId={activeRoomId} />

            <div className="px-4 pb-4 pt-2 z-10">
                <ChatInput roomId={activeRoomId} />
            </div>
        </div>
    );
}