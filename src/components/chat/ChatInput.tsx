'use client';

import { useState, useRef } from 'react';
import { sendMessage, sendTypingStatus } from '@/services/websocket';
import { useAuthStore } from '@/store/authStore';
import { SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ roomId }: { roomId: string }) {
    const [text, setText] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const user = useAuthStore(state => state.user);

    const handleSend = () => {
        if (!text.trim()) return;

        // Send the message payload securely (backend handles sender identity via token)
        sendMessage(roomId, text.trim());

        setText('');

        // Immediately stop the typing indicator when the message is sent
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        sendTypingStatus(roomId, false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        // Broadcast that the user is currently typing
        sendTypingStatus(roomId, true);

        // Clear the previous timeout and set a new one to stop typing after 2 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(roomId, false);
        }, 2000);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        sendTypingStatus(roomId, false);
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
    };

    const canSend = text.trim().length > 0;

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-4xl mx-auto">
            <div className="relative w-full">
                <input
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder="Message room..."
                    className="w-full border rounded-2xl pl-5 pr-14 py-3.5 text-sm focus-visible:outline-none transition-all duration-200"
                    style={{
                        background: 'var(--surface-elevated)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74,222,128,0.15)'; }}
                />

                <AnimatePresence>
                    {canSend && (
                        <motion.button
                            key="send-btn"
                            type="submit"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white transition-all shadow-lg active:scale-95"
                            style={{ background: 'var(--brand)' }}
                        >
                            <SendHorizontal size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}