import React, { memo } from 'react';
import { format, isToday } from 'date-fns';
import { Avatar } from './Avatar';
import { Message } from '@/store/chatStore';
import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';

interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
    isConsecutive: boolean;
    isLast: boolean;
}

const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
};

export const MessageBubble = memo(({ msg, isMe, isConsecutive, isLast }: MessageBubbleProps) => {
    const showAvatar = isLast && !isMe;

    const getBubbleRounding = () => {
        if (isMe) {
            return !isConsecutive && !isLast ? 'rounded-2xl rounded-br-sm' :
                !isConsecutive ? 'rounded-2xl rounded-br-md' :
                    !isLast ? 'rounded-l-2xl rounded-r-md' :
                        'rounded-2xl rounded-tr-md rounded-br-sm';
        } else {
            return !isConsecutive && !isLast ? 'rounded-2xl rounded-bl-sm' :
                !isConsecutive ? 'rounded-2xl rounded-bl-md' :
                    !isLast ? 'rounded-r-2xl rounded-l-md' :
                        'rounded-2xl rounded-tl-md rounded-bl-sm';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5 pb-0.5' : 'mt-4 pb-0.5'}`}
        >
            <div className={`flex max-w-[75%] gap-2.5 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                {!isMe && (
                    <div className="flex-shrink-0 w-8">
                        {showAvatar && (
                            <Avatar
                                name={msg.senderName || msg.senderUsername || '?'}
                                size="sm"
                                theme="slate"
                            />
                        )}
                    </div>
                )}

                <div className={`flex flex-col gap-0.5 relative ${isMe ? 'items-end' : 'items-start'}`}>

                    {!isConsecutive && (
                        <div className="flex items-baseline gap-2 mb-0.5 px-1">
                            <span className="text-[13px] font-bold text-brand">
                                {isMe ? 'You' : (msg.senderName || msg.senderUsername)}
                            </span>
                            {msg.timestamp && (
                                <span className="text-[10px] opacity-40 font-mono text-foreground">
                                    {formatMessageTime(msg.timestamp)}
                                </span>
                            )}
                        </div>
                    )}

                    <div
                        className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${getBubbleRounding()} 
                        ${msg.isDeleted
                            ? 'bg-surface border border-border text-foreground/50 italic flex items-center gap-2'
                            : isMe
                                ? 'bg-gradient-to-br from-brand to-brand-hover text-white shadow-md'
                                : 'bg-surface-elevated border border-border text-foreground'
                        }`}
                    >
                        {msg.isDeleted ? (
                            <>
                                <Ban size={14} className="opacity-50" />
                                This message was deleted
                            </>
                        ) : (
                            msg.content
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';