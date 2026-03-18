'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Room } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { RoomService } from '@/services/room.service';
import { UserService } from '@/services/user.service';
import { api } from '@/services/api';
import { Plus, LogOut, Search, MessageCircle, Hash, X } from 'lucide-react';

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

function PortalWrapper({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden relative"
            >
                {children}
            </motion.div>
        </div>,
        document.body
    );
}

export default function LeftSidebar() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const rooms = useChatStore(state => state.rooms);
    const setRooms = useChatStore(state => state.setRooms);
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);
    const chatMessages = useChatStore(state => state.messages);
    const { closeSidebars } = useUiStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);
    const [publicRooms, setPublicRooms] = useState<Room[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    // Grouping Rooms vs DMs separately
    const myRooms = rooms.filter(r => r.type !== 'DIRECT');
    const dmRooms = rooms.filter(r => r.type === 'DIRECT');

    const filteredMyRooms = myRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDmRooms = dmRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter public rooms to only show ones the user hasn't joined yet
    const discoverableRooms = publicRooms.filter(pr => !myRooms.some(mr => mr.id === pr.id));

    const handleLogout = async () => {
        try { await api.post('/api/auth/logout'); }
        catch (e) { console.error(e); }
        finally { logout(); }
    };

    const fetchData = useCallback(async () => {
        try {
            const [userRoomsData, publicRoomsData] = await Promise.all([
                RoomService.getUserRooms(),
                RoomService.getPublicRooms()
            ]);
            setRooms(userRoomsData, user?.id);
            setPublicRooms(publicRoomsData);
        } catch (err) {
            console.error("Failed to load sidebar data", err);
        } finally {
            setIsLoadingRooms(false);
        }
    }, [setRooms, user?.id]);

    useEffect(() => {
        if (user?.username) {
            setIsLoadingRooms(true);
            fetchData();

            // Automatic interval polling. Forces DMs and Nodes to update instantly for everyone connected
            const pollInterval = setInterval(fetchData, 5000);
            return () => clearInterval(pollInterval);
        }
    }, [user, fetchData]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setUserResults([]);
            return;
        }
        const delay = setTimeout(() => {
            UserService.searchUsers(searchQuery)
                .then(data => setUserResults(data.filter((u: any) => u.username !== user?.username)))
                .catch(console.error);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery, user?.username]);

    const handleStartDM = async (partnerId: string, partnerUsername: string) => {
        const existing = rooms.find(r => r.type === 'DIRECT' && r.dmPartner === partnerUsername);
        if (existing) {
            setActiveRoom(existing.id);
            setSearchQuery('');
            closeSidebars();
            return;
        }
        try {
            const data = await RoomService.startDirectMessage(Number(user?.id), Number(partnerId));
            const newRoom = { ...data, type: 'DIRECT' as const, dmPartner: partnerUsername };
            useChatStore.getState().addRoom(newRoom, user?.id);
            setActiveRoom(newRoom.id);
            setSearchQuery('');
            toast.success(`Chat with @${partnerUsername} started!`);
            closeSidebars();
        } catch (err: any) {
            const msgData = err?.response?.data;
            toast.error(msgData?.message || (typeof msgData === 'string' ? msgData : 'Failed to open DM.'));
        }
    };

    const handleJoinPublicRoom = async (room: Room) => {
        try {
            const data = await RoomService.joinPublicRoom(room.id);
            useChatStore.getState().addRoom(data, user?.id);
            setActiveRoom(room.id);
            toast.success(`Joined #${room.name}!`);
            fetchData();
        } catch (err: any) {
            const msgData = err?.response?.data;
            toast.error(msgData?.message || (typeof msgData === 'string' ? msgData : 'Failed to join room.'));
        }
    };

    return (
        <>
            <aside className="w-72 sm:w-80 lg:w-72 border-r flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative z-10"
                   style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>

                <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
                    <Image src="/synapse_logo.png" alt="Logo" width={28} height={28} />
                    <div className="flex-1">
                        <h2 className="font-heading font-bold text-sm text-brand">Synapse</h2>
                        <p className="text-[10px] opacity-40">Connected</p>
                    </div>
                    <NotificationBell />
                    <button onClick={closeSidebars} className="lg:hidden p-1"><X size={18}/></button>
                </div>

                <div className="px-4 py-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
                            style={{ background: 'var(--surface-hover)', color: 'var(--foreground)' }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-4">
                    {/* My Channels */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                            <span>My Channels</span>
                            <div className="flex gap-1">
                                <button onClick={() => setIsJoinModalOpen(true)} className="p-1 hover:text-brand"><Search size={13}/></button>
                                <button onClick={() => setIsCreateModalOpen(true)} className="p-1 hover:text-brand"><Plus size={13}/></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {filteredMyRooms.length === 0 && !isLoadingRooms && (
                                <p className="text-xs px-3 opacity-40 italic">No channels joined.</p>
                            )}
                            {filteredMyRooms.map(room => (
                                <RoomListItem key={room.id} id={room.id} name={room.name} type={room.type} isActive={activeRoomId === room.id} onClick={setActiveRoom} />
                            ))}
                        </div>
                    </div>

                    {/* Direct Messages Section */}
                    {filteredDmRooms.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                <span>Direct Messages</span>
                            </div>
                            <div className="space-y-1">
                                {filteredDmRooms.map(room => (
                                    <RoomListItem key={room.id} id={room.id} name={room.name} type={room.type} isActive={activeRoomId === room.id} onClick={setActiveRoom} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discover Public Rooms */}
                    {discoverableRooms.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                <span>Discover Rooms</span>
                            </div>
                            <div className="space-y-1">
                                {discoverableRooms.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => handleJoinPublicRoom(room)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all hover:bg-surface-hover opacity-70 hover:opacity-100 group"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-[10px] font-bold group-hover:bg-brand group-hover:text-white transition-colors">
                                            <Hash size={12} />
                                        </div>
                                        <span className="truncate flex-1 text-left">{room.name}</span>
                                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-brand">JOIN</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)', background: 'var(--surface)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group" onClick={() => setIsProfileModalOpen(true)}>
                            <Avatar name={user?.username || 'U'} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-brand transition-colors">{user?.username || 'User'}</p>
                                <p className="text-[10px] text-green-400 font-bold uppercase">Settings</p>
                            </div>
                        </div>
                        <ThemeToggle />
                        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Global Search Results Panel */}
            <AnimatePresence>
                {searchQuery.length >= 2 && userResults.length > 0 && (
                    <PortalWrapper isOpen={true} onClose={() => setSearchQuery('')}>
                        <div className="p-4 border-b flex justify-between items-center bg-surface-hover/30">
                            <h3 className="font-bold text-sm">People Search</h3>
                            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-surface-elevated rounded-lg"><X size={16}/></button>
                        </div>
                        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2">
                            {userResults.map(u => {
                                let lastMsg = null;
                                for (const rId in chatMessages) {
                                    const msgs = chatMessages[rId].filter(m => m.senderUsername === u.username);
                                    if (msgs.length > 0) lastMsg = msgs[msgs.length - 1].content;
                                }

                                return (
                                    <button
                                        key={u.id}
                                        onClick={() => handleStartDM(u.id, u.username)}
                                        className="w-full flex flex-col gap-2 p-3 hover:bg-brand/5 border border-transparent hover:border-brand/20 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Avatar name={u.username} size="sm" />
                                            <div className="text-left">
                                                <p className="text-sm font-bold group-hover:text-brand transition-colors">{u.username}</p>
                                                <p className="text-[10px] text-green-400 font-bold uppercase">Member</p>
                                            </div>
                                            <MessageCircle size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-brand transition-opacity" />
                                        </div>
                                        {lastMsg && (
                                            <div className="ml-11 mt-0.5 p-2.5 rounded-xl text-[12px] text-left opacity-80 italic truncate max-w-[85%]"
                                                 style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                                                "{lastMsg}"
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </PortalWrapper>
                )}
            </AnimatePresence>

            <PortalWrapper isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
                <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            </PortalWrapper>

            <PortalWrapper isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            </PortalWrapper>

            <PortalWrapper isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
                <JoinRoomModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
            </PortalWrapper>
        </>
    );
}