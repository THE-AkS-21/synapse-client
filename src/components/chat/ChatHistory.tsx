'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import { wsService } from '@/services/websocket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatHistory({ roomId }: { roomId: string }) {
    const { messages, setMessages } = useChatStore();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const roomMessages = messages[roomId] || [];

    // Initial fetch and WebSocket connect
    useEffect(() => {
        let active = true;

        async function fetchHistory() {
            setIsLoading(true);
            try {
                const res = await api.get(`/api/v1/messages/room/${roomId}?page=0&size=50`);
                // Assuming API returns an array or an object with content array
                const history = Array.isArray(res.data) ? res.data : res.data.content || [];
                if (active) {
                    setMessages(roomId, history.reverse()); // Oldest first
                }
            } catch (err) {
                console.error('Failed to load history:', err);
            } finally {
                if (active) setIsLoading(false);
            }
        }

        if (!messages[roomId]) {
            fetchHistory();
        }

        // Connect to WebSocket and join room
        wsService.connect();
        // Timeout added because if connect() is still establishing, joinRoom is handled in onConnect.
        // If it's already connected, we just join immediately.
        setTimeout(() => {
            wsService.joinRoom(roomId);
        }, 100);

        return () => {
            active = false;
            wsService.leaveRoom(roomId);
        };
    }, [roomId, setMessages, messages]); // Added messages to deps

    useEffect(() => {
        // Scroll to bottom on new messages
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [roomId, messages]); // use messages from store directly for dep

    if (isLoading && roomMessages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 flex flex-col pt-20">
            <div className="flex-1"></div> {/* Spacer to push messages down if few */}

            <AnimatePresence initial={false}>
                {roomMessages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id;
                    const isConsecutive = index > 0 && roomMessages[index - 1].senderId === msg.senderId;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                        >
                            <div className={`flex max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                {!isConsecutive && (
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${isMe ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-indigo-500/20' : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20'
                                        }`}>
                                        {msg.senderName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                {isConsecutive && <div className="w-8 flex-shrink-0"></div>}

                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isConsecutive && (
                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                            <span className="text-sm font-semibold text-zinc-300">{isMe ? 'You' : msg.senderName}</span>
                                            {msg.timestamp && (
                                                <span className="text-xs text-zinc-500">
                                                    {format(new Date(msg.timestamp), 'h:mm a')}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className={`px-4 py-2.5 rounded-2xl ${isMe
                                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-900/20'
                                        : 'bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-bl-sm backdrop-blur-md'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap word-break-words break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
