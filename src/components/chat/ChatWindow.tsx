'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { Hash, Users } from 'lucide-react';

export default function ChatWindow() {
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const rooms = useChatStore(state => state.rooms);
    const typingUsers = useChatStore(state => state.typingUsers);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const token = useAuthStore(state => state.token);

    useChatWebSocket(activeRoomId || '', token);

    if (!activeRoomId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Hash size={40} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-white mb-2">Welcome to Synapse</h2>
                <p className="text-zinc-400 max-w-sm">
                    Select a room from the sidebar to start chatting, or create a new one to invite others.
                </p>
            </div>
        );
    }

    const room = rooms.find(r => r.id === activeRoomId);
    const currentTyping = typingUsers[activeRoomId] || [];
    const currentOnline = onlineUsers[activeRoomId] || [];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#09090b]/40 relative overflow-hidden">
            {/* Room Header */}
            <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Hash size={20} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white leading-tight">{room?.name || 'Loading...'}</h2>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Users size={12} /> {currentOnline.length} online
                            </span>
                            {currentTyping.length > 0 && (
                                <span className="text-indigo-400 font-medium animate-pulse">
                                    • {currentTyping.join(', ')} {currentTyping.length > 1 ? 'are' : 'is'} typing...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <ChatHistory roomId={activeRoomId} />

            {/* Input Area */}
            <div className="p-4 bg-transparent mt-auto z-10">
                <ChatInput roomId={activeRoomId} />
            </div>
        </div>
    );
}
