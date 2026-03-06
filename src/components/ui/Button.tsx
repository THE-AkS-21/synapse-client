import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
                    {
                        'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20': variant === 'primary',
                        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700': variant === 'secondary',
                        'hover:bg-zinc-800 text-zinc-300 hover:text-white': variant === 'ghost',
                        'bg-red-500/10 text-red-500 hover:bg-red-500/20': variant === 'danger',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-11 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg font-semibold': size === 'lg',
                        'h-11 w-11': size === 'icon',
                    },
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button };
