'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { api } from '@/services/api';
import { Plus, LogOut } from 'lucide-react';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import { Avatar } from '@/components/ui/Avatar';
import { RoomListItem } from '@/components/ui/RoomListItem';

export default function LeftSidebar() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const rooms = useChatStore(state => state.rooms);
    const setRooms = useChatStore(state => state.setRooms);
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const setActiveRoom = useChatStore(state => state.setActiveRoom);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);

    useEffect(() => {
        let active = true;
        if (user?.username) {
            // Safe initialization pattern 
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
            <aside className="w-72 bg-[#09090b]/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-full flex-shrink-0">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <h2 className="font-heading font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Synapse
                    </h2>
                </div>

                {/* Room List */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>Your Rooms</span>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hover:text-indigo-400 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {isLoadingRooms ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-2.5 rounded-xl">
                                    <div className="h-5 w-5 bg-zinc-800 rounded"></div>
                                    <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
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
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <Avatar name={user?.username || 'U'} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-zinc-500 truncate">Online</p>
                        </div>
                        <button onClick={logout} className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}
