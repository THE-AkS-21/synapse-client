import React, { memo } from 'react';
import { format, isToday } from 'date-fns';
import { Avatar } from './Avatar';
import { Message } from '@/store/chatStore';

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
        <div className={`flex w-full pb-4 ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
            <div className={`flex max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isConsecutive && (
                    <Avatar
                        name={msg.senderName || '?'}
                        size="sm"
                        theme={isMe ? 'indigo' : 'emerald'}
                    />
                )}
                {isConsecutive && <div className="w-8 flex-shrink-0"></div>}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isConsecutive && (
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                            <span className="text-sm font-semibold text-foreground">
                                {isMe ? 'You' : msg.senderName}
                            </span>
                            {msg.timestamp && (
                                <span className="text-xs text-zinc-500">
                                    {formatMessageTime(msg.timestamp)}
                                </span>
                            )}
                        </div>
                    )}

                    <div
                        className={`px-4 py-2.5 rounded-2xl ${isMe
                            ? 'bg-brand text-white rounded-br-sm shadow-md shadow-brand/20'
                            : 'bg-surface-elevated text-foreground border border-border rounded-bl-sm backdrop-blur-md'
                            }`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';
