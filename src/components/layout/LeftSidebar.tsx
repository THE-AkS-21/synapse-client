'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { api } from '@/services/api';
import { Plus, Hash, LogOut } from 'lucide-react';
import CreateRoomModal from '@/components/modals/CreateRoomModal';

export default function LeftSidebar() {
    const { user, logout } = useAuthStore();
    const { rooms, setRooms, activeRoomId, setActiveRoom } = useChatStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (user?.id) {
            api.get(`/api/v1/rooms/user/${user.id}`)
                .then(res => setRooms(res.data))
                .catch(err => console.error('Failed to load rooms:', err));
        }
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

                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => setActiveRoom(room.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeRoomId === room.id
                                ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                }`}
                        >
                            <Hash size={18} className={activeRoomId === room.id ? 'text-indigo-500' : 'text-zinc-500'} />
                            <span className="truncate">{room.name}</span>
                        </button>
                    ))}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
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
