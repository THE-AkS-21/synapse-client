'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { api } from '@/services/api';
import { Plus, LogOut, Search } from 'lucide-react';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import UserProfileModal from '@/components/modals/UserProfileModal';
import { Avatar } from '@/components/ui/Avatar';
import { RoomListItem } from '@/components/ui/RoomListItem';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LeftSidebar() {
    // ... hooks same
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

    return (
        <>
            <aside className="w-72 bg-surface backdrop-blur-xl border-r border-border flex flex-col h-full flex-shrink-0 transition-colors duration-300">
                {/* Header */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
                    <Image src="/synapse_logo.png" alt="Synapse Logo" width={28} height={28} className="drop-shadow-md" />
                    <h2 className="font-heading font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand to-cyan-400">
                        Synapse
                    </h2>
                </div>

                {/* Room List */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>Your Rooms</span>
                        <div className="flex gap-1 text-zinc-500">
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="hover:text-brand transition-colors p-1 rounded-md hover:bg-surface-hover"
                                title="Join Room ID"
                            >
                                <Search size={16} />
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="hover:text-brand transition-colors p-1 rounded-md hover:bg-surface-hover"
                                title="Create new room"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {isLoadingRooms ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                            className="space-y-1"
                        >
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                >
                                    <div className="h-6 w-6 bg-surface-hover rounded-md animate-pulse"></div>
                                    <div className="h-4 bg-surface-hover rounded-md w-3/4 animate-pulse"></div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        rooms.map((room) => (
                            <RoomListItem
                                key={room.id}
                                id={room.id}
                                name={room.name}
                                isActive={activeRoomId === room.id}
                                onClick={setActiveRoom}
                            />
                        ))
                    )}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-border bg-surface-elevated transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group hover:bg-surface-hover p-1.5 -ml-1.5 rounded-lg transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                            title="Open Profile Settings"
                        >
                            <Avatar name={user?.username || 'U'} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-brand transition-colors">{user?.username || 'User'}</p>
                                <p className="text-xs text-brand truncate">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button onClick={logout} title="Log out" className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}
