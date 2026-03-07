'use client';

import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { Hash, Users, Copy } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface/30 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-24 h-24 mb-6 relative bg-black/20 p-4 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md"
                >
                    <Image src="/synapse_logo.png" alt="Synapse Logo" fill className="object-contain p-2 drop-shadow-xl" priority />
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl font-heading font-semibold text-foreground mb-2"
                >
                    Welcome to Synapse
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-zinc-500 max-w-sm"
                >
                    Select a room from the sidebar to start chatting, or create a new one to invite others.
                </motion.p>
            </motion.div>
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

                    <div className="flex items-center gap-2 ml-auto bg-surface-elevated px-3 py-1.5 rounded-xl border border-border group cursor-pointer hover:bg-surface-hover transition-colors" onClick={handleCopyRoomId} title="Click to copy Room ID">
                        <span className="text-xs font-mono tracking-wider text-zinc-400 group-hover:text-brand transition-colors">
                            {activeRoomId}
                        </span>
                        <Copy size={14} className="text-zinc-500 group-hover:text-brand transition-colors" />
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
