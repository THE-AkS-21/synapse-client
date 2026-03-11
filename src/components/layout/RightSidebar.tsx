'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Info, UserMinus, MessageCircle, Shield } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { useEffect, useState } from "react";

export default function RightSidebar() {
    const { activeRoomId, onlineUsers, rooms, addRoom, setActiveRoom } = useChatStore();
    const currentUser = useAuthStore(state => state.user);
    const currentOnlineUsers = activeRoomId ? (onlineUsers[activeRoomId] || []) : [];
    const room = rooms.find(r => r.id === activeRoomId);
    const [allMembers, setAllMembers] = useState<any[]>([]);

    const isCreator = room?.creatorId === Number(currentUser?.id);

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!activeRoomId) return;
        if (!confirm(`Remove @${username} from this room?`)) return;
        try {
            await api.delete(`/api/v1/rooms/${activeRoomId}/participants/${userId}`);
            toast.success(`@${username} removed.`);
            // Optimistically update the local state
            setAllMembers(prev => prev.filter(m => m.id !== userId));
        } catch {
            toast.error('Failed to remove member.');
        }
    };

    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        const existing = rooms.find(
            r => r.type === 'DIRECT' && r.dmPartner === partnerUsername
        );
        if (existing) {
            setActiveRoom(existing.id);
            return;
        }
        try {
            const res = await api.post('/api/v1/rooms/direct', {
                user1Id: Number(currentUser?.id),
                user2Id: Number(partnerId),
            });
            const newRoom = {
                ...res.data,
                type: 'DIRECT' as const,
                dmPartner: partnerUsername,
            };
            addRoom(newRoom);
            setActiveRoom(newRoom.id);
            toast.success(`DM with @${partnerUsername} opened!`);
        } catch {
            toast.error('Failed to open DM.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, x: 16 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 22 } }
    };

    useEffect(() => {
        if (!activeRoomId) {
            setAllMembers([]); // Clear members if no room is active
            return;
        }

        api.get(`/api/v1/rooms/${activeRoomId}/participants`)
            .then(res => setAllMembers(res.data))
            .catch(error => {
                console.error("Failed to fetch participants:", error);
                toast.error("Could not load room members.");
                setAllMembers([]); // Reset to prevent showing stale data from a previous room
            });
    }, [activeRoomId]);

    return (
        <aside className="w-60 flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative overflow-hidden border-l"
               style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>

            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.9) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                 style={{ background: 'var(--brand)', opacity: 0.08 }} />

            <div className="h-16 flex items-center justify-between px-5 border-b backdrop-blur-md relative z-10"
                 style={{ borderColor: 'var(--sidebar-border)', background: 'var(--surface)' }}>
                <h3 className="font-heading font-semibold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
                    Room Members
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand)' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                        {currentOnlineUsers.length} Online
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1"
                   style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                    All Members — {allMembers.length}
                </p>

                <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
                    {allMembers.map((u) => {
                        // Check if this specific member is in the active online users array
                        const isOnline = currentOnlineUsers.some(onlineUser =>
                            String(onlineUser.id) === String(u.id) || onlineUser.username === u.username
                        );
                        const isAdmin = room?.creatorId === Number(u.id);
                        const isMe = u.username === currentUser?.username;

                        return (
                            <motion.li
                                variants={itemVariants}
                                key={u.id}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150 border border-transparent"
                                style={{ '--hover-bg': 'var(--surface-hover)' } as React.CSSProperties}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div className="relative shrink-0">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${isOnline ? '' : 'grayscale opacity-60'}`}
                                         style={{ background: `linear-gradient(135deg, var(--brand), var(--brand-hover))` }}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 shadow-sm"
                                             style={{ background: '#4ade80', borderColor: 'var(--sidebar-bg)', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate transition-colors flex items-center gap-1" style={{ color: 'var(--foreground)' }}>
                                        {u.username}
                                        {isAdmin && (
                                            <span title="Room Admin" className="flex">
                                                <Shield size={12} className="text-indigo-400" />
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] font-medium" style={{ color: isOnline ? '#4ade80' : 'var(--zinc-500)' }}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>

                                {/* DM button — for other users */}
                                {!isMe && (
                                    <button
                                        onClick={() => handleStartDM(u.id, u.username)}
                                        className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        style={{ color: 'var(--brand)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        title={`Send DM to @${u.username}`}
                                    >
                                        <MessageCircle size={13} />
                                    </button>
                                )}

                                {/* Remove member — creator only, not for self */}
                                {isCreator && !isMe && (
                                    <button
                                        onClick={() => handleRemoveMember(u.id, u.username)}
                                        className="p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 ml-1"
                                        title={`Remove @${u.username}`}
                                    >
                                        <UserMinus size={13} />
                                    </button>
                                )}
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </div>

            <div className="px-3 py-3 border-t relative z-10" style={{ borderColor: 'var(--sidebar-border)' }}>
                <Link
                    href="/about"
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all group"
                    style={{ color: 'var(--foreground)', opacity: 0.5 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                    <Info size={13} className="shrink-0" />
                    <span>About Synapse</span>
                </Link>
            </div>
        </aside>
    );
}