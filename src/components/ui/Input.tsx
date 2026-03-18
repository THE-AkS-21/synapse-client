import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative w-full group">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors group-focus-within:text-brand">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'glass flex h-12 w-full rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50',
                        icon && 'pl-11',
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