import React from 'react';
import { Hash, Lock, Globe, MessageCircle } from 'lucide-react';

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
        opacity: 0.7,
        border: '1px solid transparent',
    };

    return (
        <button
            onClick={() => onClick(id)}
            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-left font-medium"
            style={isActive ? activeStyle : inactiveStyle}
            onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1'; } }}
            onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.7'; } }}
        >
            <Icon
                size={15}
                className="shrink-0 transition-colors"
                style={{ color: isActive ? 'var(--brand)' : 'inherit' }}
            />
            <span className="truncate text-sm flex-1">{name}</span>

            {/* Room type badge */}
            {type === 'PRIVATE' && (
                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                    Private
                </span>
            )}
            {type === 'PUBLIC' && !isActive && (
                <Globe size={10} className="shrink-0" style={{ color: 'var(--foreground)', opacity: 0.3 }} />
            )}

            {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--brand)' }} />
            )}
        </button>
    );
}
