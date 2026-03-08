import React from 'react';
import { Hash, Lock, MessageCircle } from 'lucide-react';

export interface RoomListItemProps {
    id: string;
    name: string;
    isActive: boolean;
    type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
    onClick: (id: string) => void;
}

export function RoomListItem({ id, name, isActive, type, onClick }: RoomListItemProps) {
    const Icon = type === 'PRIVATE' ? Lock : type === 'DIRECT' ? MessageCircle : Hash;

    const activeStyle: React.CSSProperties = {
        background: 'var(--brand-light)',
        color: 'var(--brand)',
        border: '1px solid var(--border-hover)',
    };

    const inactiveStyle: React.CSSProperties = {
        background: 'transparent',
        color: 'var(--foreground)',
        opacity: 0.6,
        border: '1px solid transparent',
    };

    const inactiveHoverStyle: React.CSSProperties = {
        background: 'var(--surface-hover)',
        opacity: 1,
    };

    return (
        <button
            onClick={() => onClick(id)}
            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-left font-medium"
            style={isActive ? activeStyle : inactiveStyle}
            onMouseEnter={e => { if (!isActive) Object.assign((e.currentTarget as HTMLElement).style, inactiveHoverStyle); }}
            onMouseLeave={e => { if (!isActive) Object.assign((e.currentTarget as HTMLElement).style, inactiveStyle); }}
        >
            <Icon
                size={15}
                className="shrink-0 transition-colors"
                style={{ color: isActive ? 'var(--brand)' : 'inherit' }}
            />
            <span className="truncate text-sm">{name}</span>
            {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--brand)' }} />
            )}
        </button>
    );
}
