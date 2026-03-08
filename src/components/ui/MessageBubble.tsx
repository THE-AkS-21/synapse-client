import React, { memo } from 'react';
import { format, isToday } from 'date-fns';
import { Avatar } from './Avatar';
import { Message } from '@/store/chatStore';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
    isConsecutive: boolean;
}

const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
};

export const MessageBubble = memo(({ msg, isMe, isConsecutive }: MessageBubbleProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5 pb-1' : 'mt-4 pb-1'}`}
        >
            <div className={`flex max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isConsecutive && (
                    <Avatar
                        name={msg.senderName || '?'}
                        size="sm"
                        theme={isMe ? 'brand' : 'slate'}
                    />
                )}
                {isConsecutive && <div className="w-8 flex-shrink-0" />}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isConsecutive && (
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                {isMe ? 'You' : msg.senderName}
                            </span>
                            {msg.timestamp && (
                                <span className="text-[11px] tabular-nums" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                                    {formatMessageTime(msg.timestamp)}
                                </span>
                            )}
                        </div>
                    )}

                    {isMe ? (
                        /* My message — brand green gradient */
                        <div className="relative px-4 py-2.5 rounded-2xl rounded-br-sm text-white shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    ) : (
                        /* Other person's message — surface with border */
                        <div className="relative px-4 py-2.5 rounded-2xl rounded-bl-sm border"
                            style={{
                                background: 'var(--surface-elevated)',
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                            }}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';
