import React from 'react';
import { Hash } from 'lucide-react';
import { cn } from './Button'; // Borrowing the cn utility

export interface RoomListItemProps {
    id: string;
    name: string;
    isActive: boolean;
    onClick: (id: string) => void;
}

export function RoomListItem({ id, name, isActive, onClick }: RoomListItemProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                {
                    'bg-indigo-500/10 text-indigo-400 font-medium': isActive,
                    'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200': !isActive,
                }
            )}
        >
            <Hash
                size={18}
                className={isActive ? 'text-indigo-500' : 'text-zinc-500'}
            />
            <span className="truncate">{name}</span>
        </button>
    );
}
