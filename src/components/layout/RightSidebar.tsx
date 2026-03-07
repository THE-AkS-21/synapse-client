'use client';

import { useChatStore } from '@/store/chatStore';

export default function RightSidebar() {
    const { activeRoomId, onlineUsers } = useChatStore();

    const currentOnlineUsers = activeRoomId ? (onlineUsers[activeRoomId] || []) : [];

    return (
        <aside className="w-64 bg-surface backdrop-blur-xl border-l border-border flex flex-col h-full flex-shrink-0 transition-colors duration-300">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <h3 className="font-medium tracking-tight text-foreground">Room Members</h3>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                        Online — {currentOnlineUsers.length}
                    </h4>
                    <div className="space-y-2">
                        {currentOnlineUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-hover cursor-pointer overflow-hidden transition-colors">
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium text-foreground truncate">{u.username}</span>
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
