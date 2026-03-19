import React from 'react';
import { Hash, Lock, Globe, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RoomListItemProps {
    id: string;
    name: string;
    isActive: boolean;
    type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
    onClick: (id: string) => void;
}

export function RoomListItem({ id, name, isActive, type, onClick }: RoomListItemProps) {
    const Icon = type === 'PRIVATE' ? Lock : type === 'DIRECT' ? MessageCircle : Hash;

    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-left font-medium border",
                isActive
                    ? "bg-brand-light text-brand border-brand/30 shadow-sm"
                    : "bg-transparent text-foreground/70 border-transparent hover:bg-surface-hover hover:text-foreground"
            )}
        >
            <Icon
                size={15}
                className={cn("shrink-0 transition-colors", isActive ? "text-brand" : "text-foreground/40 group-hover:text-foreground/70")}
            />

            <span className="truncate text-sm flex-1">{name}</span>

            {/* Room type badge */}
            {type === 'PRIVATE' && (
                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Private
                </span>
            )}

            {type === 'PUBLIC' && !isActive && (
                <Globe size={11} className="shrink-0 text-foreground/30" />
            )}

            {/* Active Indicator Dot */}
            {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-brand" />
            )}
        </button>
    );
}