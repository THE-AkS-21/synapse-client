import React, { memo } from 'react';
import { format, isToday } from 'date-fns';
import { Avatar } from './Avatar';
import { Message } from '@/store/chatStore';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
    isConsecutive: boolean;
    isLast: boolean; // True when this is the last message in a consecutive group
}

const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
};

export const MessageBubble = memo(({ msg, isMe, isConsecutive, isLast }: MessageBubbleProps) => {
    // Show avatar at the BOTTOM of each group (isLast), aligned with the last bubble
    const showAvatar = isLast;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5 pb-0.5' : 'mt-4 pb-0.5'}`}
        >
            <div className={`flex max-w-[72%] gap-2.5 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar space — always reserve the width to align bubbles properly */}
                <div className="flex-shrink-0 w-8">
                    {showAvatar && (
                        <Avatar
                            name={msg.senderName || '?'}
                            size="sm"
                            theme={isMe ? 'brand' : 'slate'}
                        />
                    )}
                </div>

                <div className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Name + timestamp — only on first message of group */}
                    {!isConsecutive && (
                        <div className="flex items-baseline gap-2 mb-0.5 px-1">
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
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
                        <div className="relative px-4 py-2.5 rounded-2xl rounded-br-sm text-white shadow-md"
                            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-hover))' }}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    ) : (
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
