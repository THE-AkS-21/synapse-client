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
                        id: msg.messageId,
                        roomId: msg.roomId,
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
                    const isMe = msg.senderUsername === user?.username;
                    // A message is "consecutive" if the previous message has the same sender
                    const isConsecutive = index > 0 && roomMessages[index - 1].senderUsername === msg.senderUsername;
                    // Avatar shows at the LAST message of each group (not first)
                    // isLast = true if next message has different sender (or this is the final message)
                    const nextMsg = roomMessages[index + 1];
                    const isLast = !nextMsg || nextMsg.senderUsername !== msg.senderUsername;

                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={isMe}
                            isConsecutive={isConsecutive}
                            isLast={isLast}
                        />
                    );
                }}
            />
        </div>
    );
}
