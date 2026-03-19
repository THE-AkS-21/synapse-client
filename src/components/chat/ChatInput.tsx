'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage, sendTypingStatus } from '@/services/websocket';
import { SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ roomId }: { roomId: string }) {
    const [text, setText] = useState('');

    // Refs track typing state without triggering React re-renders
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    // Cleanup typing status if the component unmounts (e.g., user changes rooms)
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (isTypingRef.current) sendTypingStatus(roomId, false);
        };
    }, [roomId]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        // Fire 'started typing' event to WebSocket
        if (!isTypingRef.current && e.target.value.trim().length > 0) {
            isTypingRef.current = true;
            sendTypingStatus(roomId, true);
        }

        // Reset the countdown timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // If user stops typing for 2 seconds, broadcast 'stopped typing'
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            sendTypingStatus(roomId, false);
        }, 2000);
    };

    const handleSend = () => {
        if (!text.trim()) return;

        sendMessage(roomId, text.trim());
        setText('');

        // Instantly kill the typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        isTypingRef.current = false;
        sendTypingStatus(roomId, false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center w-full max-w-4xl mx-auto">
            <div className="relative w-full">
                <input
                    type="text"
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message room..."
                    className="w-full border border-border bg-surface-elevated text-foreground rounded-2xl pl-5 pr-14 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                />

                <AnimatePresence>
                    {text.trim().length > 0 && (
                        <motion.button
                            key="send-btn"
                            type="submit"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white bg-brand transition-all shadow-lg active:scale-95 hover:brightness-110"
                        >
                            <SendHorizontal size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}