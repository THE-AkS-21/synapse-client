'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Crucial for "un-sticking" from sidebar
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Room } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { RoomService } from '@/services/room.service';
import { UserService } from '@/services/user.service';
import { api } from '@/services/api';
import { Plus, LogOut, Search, MessageSquare, MessageCircle, Users, X } from 'lucide-react';

// Modals
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import UserProfileModal from '@/components/modals/UserProfileModal';

// UI Components
import NotificationBell from '@/components/ui/NotificationBell';
import { Avatar } from '@/components/ui/Avatar';
import { RoomListItem } from '@/components/ui/RoomListItem';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────────────────────────
   Floating Portal Wrapper
   Ensures modals are centered and escape sidebar constraints.
   ─────────────────────────────────────────────────────────────── */
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
    const { closeSidebars } = useUiStore();

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Search & Data States
    const [searchQuery, setSearchQuery] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    const myRooms = rooms.filter(r => r.type !== 'DIRECT');
    const dmRooms = rooms.filter(r => r.type === 'DIRECT');
    const filteredMyRooms = myRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // ───────────────────────────────────────────────────────────────
    // Handlers
    // ───────────────────────────────────────────────────────────────

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (e) {
            console.error("Logout broadcast failed", e);
        } finally {
            logout(); // Clears store and redirects
        }
    };

    const fetchMyRooms = useCallback(async () => {
        try {
            const data = await RoomService.getUserRooms();
            setRooms(data, user?.id);
        } catch (err) { console.error(err); } finally { setIsLoadingRooms(false); }
    }, [setRooms, user?.id]);

    useEffect(() => {
        if (user?.username) fetchMyRooms();
    }, [user, fetchMyRooms]);

    // Debounced User Search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setUserResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            UserService.searchUsers(searchQuery)
                .then(data => setUserResults(data.filter((u: any) => u.username !== user?.username)))
                .catch(console.error);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user?.username]);

    return (
        <>
            <aside className="w-72 sm:w-80 lg:w-72 border-r flex flex-col h-full flex-shrink-0 transition-colors duration-300 relative z-10"
                   style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>

                {/* Header */}
                <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
                    <Image src="/synapse_logo.png" alt="Logo" width={28} height={28} />
                    <div className="flex-1">
                        <h2 className="font-heading font-bold text-sm text-brand">Synapse</h2>
                        <p className="text-[10px] opacity-40">Connected</p>
                    </div>
                    <NotificationBell />
                    <button onClick={closeSidebars} className="lg:hidden p-1"><X size={18}/></button>
                </div>

                {/* Search Trigger */}
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

                {/* Navigation / Rooms */}
                <div className="flex-1 overflow-y-auto px-3 space-y-6">
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                            <span>My Channels</span>
                            <div className="flex gap-1">
                                <button onClick={() => setIsJoinModalOpen(true)} className="p-1 hover:text-brand"><Search size={13}/></button>
                                <button onClick={() => setIsCreateModalOpen(true)} className="p-1 hover:text-brand"><Plus size={13}/></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {filteredMyRooms.map(room => (
                                <RoomListItem key={room.id} id={room.id} name={room.name} type={room.type} isActive={activeRoomId === room.id} onClick={setActiveRoom} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Profile */}
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

            {/* ───────────────────────────────────────────────────────────────
                PORTALED MODALS (They appear centered/blurred on top of everything)
                ─────────────────────────────────────────────────────────────── */}

            {/* Global Search Results Panel */}
            <AnimatePresence>
                {searchQuery.length >= 2 && userResults.length > 0 && (
                    <PortalWrapper isOpen={true} onClose={() => setSearchQuery('')}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-sm">People & Messages</h3>
                            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-surface-hover rounded-lg"><X size={16}/></button>
                        </div>
                        <div className="p-2 max-h-[60vh] overflow-y-auto">
                            {userResults.map(u => (
                                <button key={u.id} className="w-full flex items-center gap-3 p-3 hover:bg-brand/5 rounded-2xl transition-all group">
                                    <Avatar name={u.username} size="sm" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold">{u.username}</p>
                                        <p className="text-[10px] opacity-40 italic">Member of Synapse</p>
                                    </div>
                                    <MessageSquare size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-brand" />
                                </button>
                            ))}
                        </div>
                    </PortalWrapper>
                )}
            </AnimatePresence>

            {/* Settings, Create, and Join Modals */}
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