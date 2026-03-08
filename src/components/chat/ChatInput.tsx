'use client';

import { useState, useRef } from 'react';
import { wsService } from '@/services/websocket';
import { SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ roomId }: { roomId: string }) {
    const [text, setText] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        wsService.sendMessage(roomId, text.trim());
        setText('');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        wsService.sendTyping(roomId, false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
                wsService.sendMessage(roomId, text.trim());
                setText('');
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                wsService.sendTyping(roomId, false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        wsService.sendTyping(roomId, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            wsService.sendTyping(roomId, false);
        }, 2000);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        wsService.sendTyping(roomId, false);
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-brand text-white hover:bg-brand/90 transition-all shadow-lg hover:shadow-brand/30 active:scale-95"
                        >
                            <SendHorizontal size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
