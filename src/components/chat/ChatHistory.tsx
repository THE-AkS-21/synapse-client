'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useChatStore, Message } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Virtuoso } from 'react-virtuoso';
import { MessageBubble } from '@/components/ui/MessageBubble';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface RawMessage {
    id: string;
    roomId: string;
    senderId: number;
    senderUsername: string;
    receiverUsername?: string;
    content: string;
    timestamp: number;
    traceId?: string;
}

// Helper to reliably check if two messages are from the same person
const isSameSender = (msg1: Message, msg2: Message) => {
    if (msg1.senderId && msg2.senderId) return String(msg1.senderId) === String(msg2.senderId);
    return msg1.senderUsername === msg2.senderUsername;
};

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
                        id: msg.id,
                        roomId: msg.roomId,
                        senderId: msg.senderId,
                        senderUsername: msg.senderUsername,
                        senderName: msg.senderUsername,
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

        return () => { active = false; };
    }, [roomId, setMessages, messages]);

    if (isLoading && roomMessages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 transition-colors duration-300"
                 style={{ background: 'var(--background)' }}>
                <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="w-16 h-16 relative p-3 rounded-2xl border drop-shadow-lg"
                    style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                >
                    <Image src="/synapse_logo.png" alt="Loading" fill className="object-contain p-1.5" priority />
                </motion.div>
                <p className="text-sm font-medium tracking-wide animate-pulse" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                    Syncing nodes...
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 px-6 py-4 flex flex-col" style={{ minHeight: 0 }}>
            <Virtuoso
                style={{ height: '100%', width: '100%' }}
                data={roomMessages}
                initialTopMostItemIndex={roomMessages.length > 0 ? roomMessages.length - 1 : 0}
                followOutput="smooth"
                itemContent={(index, msg) => {
                    const prevMsg = roomMessages[index - 1];
                    const nextMsg = roomMessages[index + 1];

                    const isMe = String(msg.senderId) === String(user?.id) || msg.senderUsername === user?.username;

                    // 1. Time Gap Logic (5 mins = 300000ms) - Determines if we need a new Header (Name + Time)
                    const timeGapToPrev = prevMsg ? Math.abs(msg.timestamp - prevMsg.timestamp) : 0;
                    const isNewGroup = !prevMsg || !isSameSender(msg, prevMsg) || timeGapToPrev > 300000;

                    // 2. Last In Group - Determines if we show the Avatar Bubble
                    const timeGapToNext = nextMsg ? Math.abs(nextMsg.timestamp - msg.timestamp) : 0;
                    const isLastInGroup = !nextMsg || !isSameSender(msg, nextMsg) || timeGapToNext > 300000;

                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={isMe}
                            isConsecutive={!isNewGroup}
                            isLast={isLastInGroup}
                        />
                    );
                }}
            />
        </div>
    );
}