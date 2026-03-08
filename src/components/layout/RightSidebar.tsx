'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Info, UserMinus, MessageCircle } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function RightSidebar() {
    const { activeRoomId, onlineUsers, rooms, addRoom, setActiveRoom } = useChatStore();
    const currentUser = useAuthStore(state => state.user);
    const currentOnlineUsers = activeRoomId ? (onlineUsers[activeRoomId] || []) : [];
    const room = rooms.find(r => r.id === activeRoomId);

    // FIXED: Check against creatorId instead of creatorUsername
    const isCreator = room?.creatorId === Number(currentUser?.id);

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!activeRoomId) return;
        if (!confirm(`Remove @${username} from this room?`)) return;
        try {
            await api.delete(`/api/v1/rooms/${activeRoomId}/participants/${userId}`);
            toast.success(`@${username} removed.`);
        } catch {
            toast.error('Failed to remove member.');
        }
    };

    // FIXED: Update to accept partnerId and use the /api/v1/rooms/direct endpoint
    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        // Check if DM room already exists locally
        const existing = rooms.find(
            r => r.type === 'DIRECT' && r.dmPartner === partnerUsername
        );
        if (existing) {
            setActiveRoom(existing.id);
            return;
        }
        try {
            // Call the correct endpoint with user1Id and user2Id
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

    return (
        <aside className="w-60 flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative overflow-hidden border-l"
               style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>

            {/* Subtle green dot pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle, rgba(74,222,128,0.9) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }} />
            {/* Top glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                 style={{ background: 'var(--brand)', opacity: 0.08 }} />

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b backdrop-blur-md relative z-10"
                 style={{ borderColor: 'var(--sidebar-border)', background: 'var(--surface)' }}>
                <h3 className="font-heading font-semibold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
                    Room Members
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand)' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                        {currentOnlineUsers.length}
                    </span>
                </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1"
                   style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                    Online — {currentOnlineUsers.length}
                </p>

                <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1"
                >
                    {currentOnlineUsers.map((u) => (
                        <motion.li
                            variants={itemVariants}
                            key={u.id}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150 border border-transparent"
                            style={{ '--hover-bg': 'var(--surface-hover)' } as React.CSSProperties}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div className="relative shrink-0">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                     style={{ background: `linear-gradient(135deg, var(--brand), var(--brand-hover))` }}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 shadow-sm"
                                     style={{ background: '#4ade80', borderColor: 'var(--sidebar-bg)', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate transition-colors" style={{ color: 'var(--foreground)' }}>
                                    {u.username}
                                    {u.username === currentUser?.username && (
                                        <span className="ml-1.5 text-[10px] font-medium" style={{ color: 'var(--brand)' }}>(you)</span>
                                    )}
                                </p>
                                <p className="text-[11px] font-medium" style={{ color: '#4ade80' }}>Online</p>
                            </div>

                            {/* DM button — for other users */}
                            {u.username !== currentUser?.username && (
                                <button
                                    // FIXED: Pass u.id to handleStartDM
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
                            {isCreator && u.username !== currentUser?.username && (
                                <button
                                    onClick={() => handleRemoveMember(u.id, u.username)}
                                    className="p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10"
                                    title={`Remove @${u.username}`}
                                >
                                    <UserMinus size={13} />
                                </button>
                            )}
                        </motion.li>
                    ))}

                    {currentOnlineUsers.length === 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="text-xs italic px-3 py-6 text-center rounded-xl border border-dashed mt-2"
                            style={{
                                color: 'var(--foreground)',
                                opacity: 0.5,
                                background: 'var(--surface)',
                                borderColor: 'var(--border)',
                            }}
                        >
                            <div className="text-2xl mb-2">💤</div>
                            Waiting for others to join...
                        </motion.div>
                    )}
                </motion.ul>
            </div>

            {/* Footer */}
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