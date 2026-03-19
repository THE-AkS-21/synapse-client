"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Placeholder to prevent hydration mismatch layout shift
    if (!mounted) {
        return <div className="w-8 h-8 rounded-xl bg-surface border border-transparent opacity-50" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                "bg-surface border border-transparent hover:bg-surface-hover hover:border-border",
                "text-foreground/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
            )}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );
}