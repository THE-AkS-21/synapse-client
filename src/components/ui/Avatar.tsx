import React from 'react';
import { cn } from './Button'; // Borrowing the cn utility

export interface AvatarProps {
    name: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    theme?: 'indigo' | 'emerald';
}

export function Avatar({ name, className, size = 'md', theme = 'indigo' }: AvatarProps) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div
            className={cn(
                'flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white shadow-lg',
                {
                    'bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-indigo-500/20': theme === 'indigo',
                    'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20': theme === 'emerald',
                    'h-8 w-8 text-xs': size === 'sm',
                    'h-10 w-10 text-sm': size === 'md',
                    'h-12 w-12 text-base': size === 'lg',
                },
                className
            )}
            aria-label={`${name} avatar`}
        >
            {initial}
        </div>
    );
}
