'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { format, isToday } from 'date-fns';
import { Virtuoso } from 'react-virtuoso';

export default function ChatHistory({ roomId }: { roomId: string }) {
    const messages = useChatStore((state) => state.messages);
    const setMessages = useChatStore((state) => state.setMessages);
    const user = useAuthStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);

    const roomMessages = messages[roomId] || [];

    useEffect(() => {
        let active = true;

        async function fetchHistory() {
            setIsLoading(true);
            try {
                const res = await api.get(`/api/v1/messages/room/${roomId}?page=0&size=50`);
                const history = Array.isArray(res.data) ? res.data : res.data.content || [];
                if (active) {
                    setMessages(roomId, history.reverse());
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

        return () => {
            active = false;
        };
    }, [roomId, setMessages, messages]);

    if (isLoading && roomMessages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const formatMessageTime = (timestamp: string | number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
    };

    return (
        <div className="flex-1 px-6 py-4 flex flex-col pt-20">
            <Virtuoso
                style={{ height: '100%', width: '100%' }}
                data={roomMessages}
                initialTopMostItemIndex={roomMessages.length > 0 ? roomMessages.length - 1 : 0}
                followOutput="smooth"
                itemContent={(index, msg) => {
                    const isMe = msg.senderId === user?.id;
                    const isConsecutive = index > 0 && roomMessages[index - 1].senderId === msg.senderId;

                    return (
                        <div className={`flex w-full pb-4 ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
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
                                                    {formatMessageTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className={`px-4 py-2.5 rounded-2xl ${isMe
                                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-900/20'
                                        : 'bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-bl-sm backdrop-blur-md'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
