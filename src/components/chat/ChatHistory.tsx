'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Virtuoso } from 'react-virtuoso';
import { MessageBubble } from '@/components/ui/MessageBubble';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface RawMessage {
    messageId: string;
    roomId: string;
    senderUsername: string;
    content: string;
    timestamp: string;
}

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
                    const mappedHistory = history.map((msg: RawMessage) => ({
                        id: msg.messageId, // Use UUID from DB
                        roomId: msg.roomId,
                        senderUsername: msg.senderUsername,
                        senderName: msg.senderUsername, // fallback or enrich later
                        content: msg.content,
                        timestamp: msg.timestamp,
                    }));
                    setMessages(roomId, mappedHistory.reverse());
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
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-background transition-colors duration-300">
                <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-16 h-16 relative bg-black/10 p-3 rounded-2xl border border-white/5 drop-shadow-lg"
                >
                    <Image src="/synapse_logo.png" alt="Loading" fill className="object-contain p-1.5" priority />
                </motion.div>
                <p className="text-sm text-zinc-500 font-medium tracking-wide animate-pulse">Syncing nodes...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 px-6 py-4 flex flex-col pt-20">
            <Virtuoso
                style={{ height: '100%', width: '100%' }}
                data={roomMessages}
                initialTopMostItemIndex={roomMessages.length > 0 ? roomMessages.length - 1 : 0}
                followOutput="smooth"
                itemContent={(index, msg) => {
                    const isMe = msg.senderUsername === user?.username;
                    const isConsecutive = index > 0 && roomMessages[index - 1].senderUsername === msg.senderUsername;

                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={isMe}
                            isConsecutive={isConsecutive}
                        />
                    );
                }}
            />
        </div>
    );
}
