import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
    name: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    theme?: 'brand' | 'slate' | 'indigo' | 'emerald';
}

const GRADIENTS: Record<string, string> = {
    brand: 'linear-gradient(135deg, var(--brand), var(--brand-hover))',
    slate: 'linear-gradient(135deg, #64748b, #475569)',
    indigo: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    emerald: 'linear-gradient(135deg, #34d399, #10b981)',
};

export function Avatar({ name, className, size = 'md', theme = 'brand' }: AvatarProps) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const gradient = GRADIENTS[theme] || GRADIENTS.brand;

    return (
        <div
            className={cn(
                'flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white shadow-lg',
                {
                    'h-8 w-8 text-xs': size === 'sm',
                    'h-10 w-10 text-sm': size === 'md',
                    'h-12 w-12 text-base': size === 'lg',
                },
                className
            )}
            style={{ background: gradient }}
            aria-label={`${name} avatar`}
        >
            {initial}
        </div>
    );
}