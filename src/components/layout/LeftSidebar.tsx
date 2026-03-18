'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Room } from '@/store/chatStore';
import { api } from '@/services/api';
import { Plus, LogOut, Search, MessageSquare, MessageCircle, Globe, Users } from 'lucide-react';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import UserProfileModal from '@/components/modals/UserProfileModal';
import NotificationBell from '@/components/ui/NotificationBell';
import { Avatar } from '@/components/ui/Avatar';
import { RoomListItem } from '@/components/ui/RoomListItem';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────────────────────────
   Join Confirmation Dialog
   ─────────────────────────────────────────────────────────────── */
interface JoinConfirmProps {
    room: Room;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

function JoinConfirmDialog({ room, onConfirm, onCancel }: JoinConfirmProps) {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
             onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ duration: 0.18 }}
                onClick={e => e.stopPropagation()}
                className="w-80 rounded-2xl border shadow-2xl overflow-hidden"
                style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
            >
                <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                         style={{ background: 'var(--brand-light)' }}>
                        <Users size={26} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-base mb-1" style={{ color: 'var(--foreground)' }}>
                            Join <span style={{ color: 'var(--brand)' }}>#{room.name}</span>?
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.55 }}>
                            This is a public room. You'll be added as a member and can start chatting right away.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)', opacity: 0.7 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handle}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-opacity"
                        style={{ background: 'var(--brand)', opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? 'Joining…' : 'Join Room'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function LeftSidebar() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const rooms = useChatStore(state => state.rooms);
    const setRooms = useChatStore(state => state.setRooms);
    const addRoom = useChatStore(state => state.addRoom);
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    const [publicRooms, setPublicRooms] = useState<Room[]>([]);
    const [pendingJoin, setPendingJoin] = useState<Room | null>(null);

    // FIXED: Unified Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);

    const myRooms = rooms.filter(r => r.type !== 'DIRECT');
    const dmRooms = rooms.filter(r => r.type === 'DIRECT');
    const myRoomIds = new Set(rooms.map(r => r.id));
    const discoverRooms = publicRooms.filter(r => !myRoomIds.has(r.id));

    // Search filters
    const filteredMyRooms = myRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDmRooms = dmRooms.filter(r => (r.dmPartner || r.name).toLowerCase().includes(searchQuery.toLowerCase()));


    const fetchMyRooms = useCallback(async () => {
        try {
            const res = await api.get('/api/v1/rooms/user');
            setRooms(res.data);
        } catch (err) { console.error(err); } finally { setIsLoadingRooms(false); }
    }, [setRooms]);

    const fetchPublicRooms = useCallback(async () => {
        try {
            // FIXED: Removed ?size=50 to match backend endpoint properly
            const res = await api.get('/api/v1/rooms/public');
            const content: Room[] = res.data?.content ?? res.data;
            setPublicRooms(content.filter((r: Room) => r.type === 'PUBLIC'));
        } catch (err) {
            console.error("Failed to fetch public rooms:", err);
        }
    }, []);

    useEffect(() => {
        if (!user?.username) return;
        fetchMyRooms();
        fetchPublicRooms();
    }, [user, fetchMyRooms, fetchPublicRooms]);

    // FIXED: Unified User Search Hook
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setUserResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            api.get(`/api/v1/users/search?query=${encodeURIComponent(searchQuery)}`)
                .then(res => {
                    // Filter out self from search results
                    setUserResults(res.data.filter((u: any) => u.username !== user?.username));
                })
                .catch(console.error);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user?.username]);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout'); // Tell backend to broadcast offline status
        } catch (e) {
            console.error("Logout broadcast failed", e);
        } finally {
            logout(); // Clear Zustand state and redirect
        }
    };

    const handleJoinPublicRoom = async (room: Room) => {
        try {
            const res = await api.post(`/api/v1/rooms/${room.id}/join`);
            addRoom(res.data);
            setActiveRoom(room.id);
            toast.success(`Joined #${room.name}!`);
            fetchPublicRooms();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to join room.');
        }
    };

    // FIXED: Start DM from Search
    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        const existing = rooms.find(r => r.type === 'DIRECT' && r.dmPartner === partnerUsername);
        if (existing) {
            setActiveRoom(existing.id);
            setSearchQuery('');
            return;
        }
        try {
            const res = await api.post('/api/v1/rooms/direct', {
                user1Id: Number(user?.id),
                user2Id: Number(partnerId),
            });
            const newRoom = { ...res.data, type: 'DIRECT' as const, dmPartner: partnerUsername };
            addRoom(newRoom);
            setActiveRoom(newRoom.id);
            setSearchQuery('');
            toast.success(`DM with @${partnerUsername} opened!`);
        } catch {
            toast.error('Failed to open DM.');
        }
    };

    const sidebarStyle: React.CSSProperties = { background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' };
    const roomVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } };

    return (
        <>
            <aside className="w-72 border-r flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative" style={sidebarStyle}>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ background: 'var(--brand)', opacity: 0.07 }} />

                <div className="h-16 flex items-center gap-3 px-5 border-b relative z-10" style={{ borderColor: 'var(--sidebar-border)' }}>
                    <div className="relative">
                        <Image src="/synapse_logo.png" alt="Synapse Logo" width={30} height={30} className="drop-shadow-md" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: 'var(--brand)', borderColor: 'var(--sidebar-bg)', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-heading font-bold text-base tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--brand), var(--brand-hover))' }}>
                            Synapse
                        </h2>
                        <p className="text-[10px] -mt-0.5" style={{ color: 'var(--foreground)', opacity: 0.45 }}>Real-time Chat</p>
                    </div>
                    <NotificationBell />
                </div>

                {/* FIXED: Unified Search Bar UI */}
                <div className="px-4 pt-4 pb-2 relative z-10">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground)', opacity: 0.5 }} />
                        <input
                            type="text"
                            placeholder="Search rooms & people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
                            style={{
                                background: 'var(--surface-hover)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--sidebar-border)'
                            }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 px-3 space-y-5 relative z-10">

                    {/* User Search Results */}
                    {searchQuery.length >= 2 && userResults.length > 0 && (
                        <div>
                            <div className="flex items-center px-3 mb-2 text-xs font-semibold uppercase tracking-wider gap-1.5"
                                 style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                                <Users size={12} />
                                People Matches
                            </div>
                            <motion.div initial="hidden" animate="visible" variants={roomVariants}>
                                {userResults.map(u => (
                                    <motion.div key={u.id} variants={itemVariants}>
                                        <button
                                            onClick={() => handleStartDM(u.id, u.username)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left"
                                            style={{ color: 'var(--foreground)', opacity: 0.8 }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                                        >
                                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                                 style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium truncate flex-1">{u.username}</span>
                                            <MessageCircle size={14} style={{ color: 'var(--brand)' }} />
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* My Rooms */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare size={12} /> My Rooms
                                <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--surface-elevated)', color: 'var(--foreground)' }}>{filteredMyRooms.length}</span>
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setIsJoinModalOpen(true)} className="p-1.5 rounded-lg transition-colors hover:text-indigo-400" title="Join Room by ID"><Search size={14} /></button>
                                <button onClick={() => setIsCreateModalOpen(true)} className="p-1.5 rounded-lg transition-colors hover:text-indigo-400" title="Create new room"><Plus size={14} /></button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoadingRooms ? (
                                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                                            <div className="h-6 w-6 rounded-md animate-pulse" style={{ background: 'var(--surface-hover)' }} />
                                            <div className="h-3.5 rounded-md flex-1 animate-pulse" style={{ background: 'var(--surface-hover)', animationDelay: `${i * 100}ms` }} />
                                        </div>
                                    ))}
                                </motion.div>
                            ) : filteredMyRooms.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-4 px-4">
                                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)', opacity: 0.4 }}>No rooms found</p>
                                </motion.div>
                            ) : (
                                <motion.div key="rooms" initial="hidden" animate="visible" variants={roomVariants}>
                                    {filteredMyRooms.map(room => (
                                        <motion.div key={room.id} variants={itemVariants}>
                                            <RoomListItem id={room.id} name={room.name} type={room.type} isActive={activeRoomId === room.id} onClick={setActiveRoom} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Direct Messages */}
                    {filteredDmRooms.length > 0 && (
                        <div>
                            <div className="flex items-center px-3 mb-2 text-xs font-semibold uppercase tracking-wider gap-1.5" style={{ color: 'var(--foreground)', opacity: 0.45 }}>
                                <MessageCircle size={12} /> Direct Messages
                            </div>
                            <motion.div initial="hidden" animate="visible" variants={roomVariants}>
                                {filteredDmRooms.map(room => (
                                    <motion.div key={room.id} variants={itemVariants}>
                                        <button
                                            onClick={() => setActiveRoom(room.id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left"
                                            style={{
                                                background: activeRoomId === room.id ? 'var(--brand-light)' : 'transparent',
                                                color: activeRoomId === room.id ? 'var(--brand)' : 'var(--foreground)',
                                                opacity: activeRoomId === room.id ? 1 : 0.75,
                                            }}
                                            onMouseEnter={e => { if (activeRoomId !== room.id) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1'; } }}
                                            onMouseLeave={e => { if (activeRoomId !== room.id) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.75'; } }}
                                        >
                                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                                 style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }}>
                                                {(room.dmPartner || room.name).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium truncate flex-1">{room.dmPartner ? `@${room.dmPartner}` : room.name}</span>
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t transition-colors duration-300 relative z-10" style={{ borderColor: 'var(--sidebar-border)', background: 'var(--surface)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded-xl transition-colors" onClick={() => setIsProfileModalOpen(true)}>
                            <Avatar name={user?.username || 'U'} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{user?.username || 'User'}</p>
                                <p className="text-xs text-green-400">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button onClick={handleLogout} className="p-2 rounded-lg text-red-400 opacity-70 hover:opacity-100 hover:bg-red-400/10">
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <JoinRoomModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            <AnimatePresence>
                {pendingJoin && (
                    <JoinConfirmDialog
                        room={pendingJoin}
                        onConfirm={async () => { await handleJoinPublicRoom(pendingJoin); setPendingJoin(null); }}
                        onCancel={() => setPendingJoin(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}