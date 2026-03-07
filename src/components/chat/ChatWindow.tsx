'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { Hash, Users, Copy } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ChatWindow() {
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const rooms = useChatStore(state => state.rooms);
    const typingUsers = useChatStore(state => state.typingUsers);
    const onlineUsers = useChatStore(state => state.onlineUsers);
    const token = useAuthStore(state => state.token);

    useChatWebSocket(activeRoomId || '', token);

    const handleCopyRoomId = () => {
        if (activeRoomId) {
            navigator.clipboard.writeText(activeRoomId);
            toast.success('Room ID copied to clipboard!');
        }
    };

    if (!activeRoomId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
                <div className="w-20 h-20 mb-6 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20">
                    <Hash size={40} className="text-brand" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Welcome to Synapse</h2>
                <p className="text-zinc-500 max-w-sm">
                    Select a room from the sidebar to start chatting, or create a new one to invite others.
                </p>
            </div>
        );
    }

    const room = rooms.find(r => r.id === activeRoomId);
    const currentTyping = typingUsers[activeRoomId] || [];
    const currentOnline = onlineUsers[activeRoomId] || [];

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden transition-colors duration-300">
            {/* Room Header */}
            <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-border bg-surface/80 backdrop-blur-md z-10 transition-colors duration-300">
                <div className="flex items-center gap-3 w-full">
                    <Avatar name={room?.name || 'R'} size="sm" />
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-foreground leading-tight truncate">{room?.name || 'Loading...'}</h2>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Users size={12} /> {currentOnline.length} online
                            </span>
                            {currentTyping.length > 0 && (
                                <span className="text-brand font-medium animate-pulse">
                                    • {currentTyping.join(', ')} {currentTyping.length > 1 ? 'are' : 'is'} typing...
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleCopyRoomId}
                        title="Copy Room ID"
                        className="p-2 ml-auto text-zinc-500 hover:text-brand hover:bg-surface-hover rounded-lg transition-all"
                    >
                        <Copy size={18} />
                    </button>
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
