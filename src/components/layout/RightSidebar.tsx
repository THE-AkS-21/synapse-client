'use client';

import { useChatStore } from '@/store/chatStore';

export default function RightSidebar() {
    const { activeRoomId, onlineUsers } = useChatStore();

    const currentOnlineUsers = activeRoomId ? (onlineUsers[activeRoomId] || []) : [];

    return (
        <aside className="w-64 bg-[#09090b]/80 backdrop-blur-xl border-l border-white/5 flex flex-col h-full flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <h3 className="font-medium tracking-tight text-zinc-200">Room Members</h3>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                        Online — {currentOnlineUsers.length}
                    </h4>
                    <div className="space-y-2">
                        {currentOnlineUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 cursor-pointer overflow-hidden transition-colors">
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#09090b] rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium text-zinc-300 truncate">{u.username}</span>
                            </div>
                        ))}

                        {currentOnlineUsers.length === 0 && (
                            <p className="text-xs text-zinc-500 italic px-2">No one is here...</p>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
