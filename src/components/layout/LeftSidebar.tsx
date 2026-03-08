'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { api } from '@/services/api';
import { Plus, LogOut, Search, MessageSquare, MessageCircle } from 'lucide-react';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import UserProfileModal from '@/components/modals/UserProfileModal';
import { Avatar } from '@/components/ui/Avatar';
import { RoomListItem } from '@/components/ui/RoomListItem';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeftSidebar() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const rooms = useChatStore(state => state.rooms);
    const setRooms = useChatStore(state => state.setRooms);
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    // Split rooms into public/private and DM
    const groupRooms = rooms.filter(r => r.type !== 'DIRECT');
    const dmRooms = rooms.filter(r => r.type === 'DIRECT');

    useEffect(() => {
        let active = true;
        if (user?.username) {
            const fetchRoomsInit = async () => {
                try {
                    const res = await api.get(`/api/v1/rooms/user`);
                    if (active) {
                        setRooms(res.data);
                        setIsLoadingRooms(false);
                    }
                } catch (err) {
                    if (active) {
                        console.error('Failed to load rooms:', err);
                        setIsLoadingRooms(false);
                    }
                }
            };
            fetchRoomsInit();
        }
        return () => { active = false; };
    }, [user, setRooms]);

    const sidebarStyle: React.CSSProperties = {
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
    };

    const roomVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <>
            <aside className="w-72 border-r flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative overflow-hidden"
                style={sidebarStyle}>

                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    style={{ background: 'var(--brand)', opacity: 0.07 }} />

                {/* Header */}
                <div className="h-16 flex items-center gap-3 px-5 border-b relative z-10"
                    style={{ borderColor: 'var(--sidebar-border)' }}>
                    <div className="relative">
                        <Image src="/synapse_logo.png" alt="Synapse Logo" width={30} height={30} className="drop-shadow-md" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                            style={{ background: 'var(--brand)', borderColor: 'var(--sidebar-bg)', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-heading font-bold text-base tracking-tight bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(90deg, var(--brand), var(--brand-hover))' }}>
                            Synapse
                        </h2>
                        <p className="text-[10px] -mt-0.5" style={{ color: 'var(--foreground)', opacity: 0.45 }}>Real-time Chat</p>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 relative z-10">

                    {/* ── ROOMS section ── */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare size={12} />
                                Rooms
                                <span className="px-1.5 py-0.5 rounded text-[10px]"
                                    style={{ background: 'var(--surface-elevated)', color: 'var(--foreground)', opacity: undefined }}>
                                    {groupRooms.length}
                                </span>
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: 'var(--foreground)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--brand)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    title="Join Room by ID"
                                >
                                    <Search size={14} />
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: 'var(--foreground)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--brand)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    title="Create new room"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoadingRooms ? (
                                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                                            <div className="h-6 w-6 rounded-md animate-pulse" style={{ background: 'var(--surface-hover)' }} />
                                            <div className="h-3.5 rounded-md flex-1 animate-pulse" style={{ background: 'var(--surface-hover)', animationDelay: `${i * 100}ms` }} />
                                        </div>
                                    ))}
                                </motion.div>
                            ) : groupRooms.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="text-center py-6 px-4">
                                    <MessageSquare size={24} className="mx-auto mb-2" style={{ color: 'var(--foreground)', opacity: 0.3 }} />
                                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)', opacity: 0.4 }}>No rooms yet</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.3 }}>Create or join a room to get started</p>
                                </motion.div>
                            ) : (
                                <motion.div key="rooms" initial="hidden" animate="visible" variants={roomVariants}>
                                    {groupRooms.map((room) => (
                                        <motion.div key={room.id} variants={itemVariants}>
                                            <RoomListItem
                                                id={room.id}
                                                name={room.name}
                                                isActive={activeRoomId === room.id}
                                                onClick={setActiveRoom}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── DIRECT MESSAGES section ── */}
                    {dmRooms.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                                <span className="flex items-center gap-1.5">
                                    <MessageCircle size={12} />
                                    Direct Messages
                                    <span className="px-1.5 py-0.5 rounded text-[10px]"
                                        style={{ background: 'var(--surface-elevated)', color: 'var(--foreground)' }}>
                                        {dmRooms.length}
                                    </span>
                                </span>
                            </div>
                            <motion.div initial="hidden" animate="visible" variants={roomVariants}>
                                {dmRooms.map((room) => (
                                    <motion.div key={room.id} variants={itemVariants}>
                                        <button
                                            onClick={() => setActiveRoom(room.id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left"
                                            style={{
                                                background: activeRoomId === room.id ? 'var(--brand-light)' : 'transparent',
                                                color: activeRoomId === room.id ? 'var(--brand)' : 'var(--foreground)',
                                            }}
                                            onMouseEnter={e => { if (activeRoomId !== room.id) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                                            onMouseLeave={e => { if (activeRoomId !== room.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                        >
                                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }}>
                                                {(room.dmPartner || room.name).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium truncate">
                                                {room.dmPartner ? `@${room.dmPartner}` : room.name}
                                            </span>
                                            {activeRoomId === room.id && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t transition-colors duration-300 relative z-10"
                    style={{ borderColor: 'var(--sidebar-border)', background: 'var(--surface)' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded-xl transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                            title="Open Profile Settings"
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                            <div className="relative">
                                <Avatar name={user?.username || 'U'} />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                    style={{ background: 'var(--brand)', borderColor: 'var(--sidebar-bg)', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate transition-colors" style={{ color: 'var(--foreground)' }}>
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--brand)' }}>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                                    Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button onClick={logout} title="Log out"
                                className="p-2 rounded-lg transition-colors text-red-400 hover:bg-red-500/10"
                                style={{ color: 'var(--foreground)', opacity: 0.5 }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(248,113,113)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}>
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <JoinRoomModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
    );
}
