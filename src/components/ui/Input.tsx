import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button'; // reuse cn utility

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-12 w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder:text-zinc-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 glass',
                        icon && 'pl-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
