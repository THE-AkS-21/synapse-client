'use client';

import { useState } from 'react';
import { wsService } from '@/services/websocket';
import { SendHorizontal } from 'lucide-react';

export default function ChatInput({ roomId }: { roomId: string }) {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        wsService.sendMessage(roomId, text.trim());
        setText('');
        wsService.handleTypingBlur(roomId); // Stop typing instantly
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        wsService.handleTypingChange(roomId);
    };

    const handleBlur = () => {
        wsService.handleTypingBlur(roomId);
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-4xl mx-auto">
            <div className="relative w-full">
                <input
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Message room..."
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 glass shadow-2xl transition-all"
                />

                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <SendHorizontal size={18} />
                </button>
            </div>
        </form>
    );
}
