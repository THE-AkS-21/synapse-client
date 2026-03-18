'use client';

import { useState } from 'react';
import { sendMessage } from '@/services/websocket';
import { SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ roomId }: { roomId: string }) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        sendMessage(roomId, text.trim());
        setText('');
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

    const canSend = text.trim().length > 0;

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-4xl mx-auto">
            <div className="relative w-full">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message room..."
                    className="w-full border border-border bg-surface-elevated text-foreground rounded-2xl pl-5 pr-14 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
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