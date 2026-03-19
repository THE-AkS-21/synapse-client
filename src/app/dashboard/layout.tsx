'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const { isAuthenticated } = useAuthStore();
    const { isLeftSidebarOpen, isRightSidebarOpen, closeSidebars } = useUiStore();
    const activeRoomId = useChatStore(state => state.activeRoomId);

    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Hydration safeguard
    useEffect(() => { setIsClient(true); }, []);

    // Auth Guard
    useEffect(() => {
        if (isClient && !isAuthenticated) router.push('/login');
    }, [isAuthenticated, isClient, router]);

    // Auto-close sidebars on mobile when a room is selected
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            closeSidebars();
        }
    }, [activeRoomId, closeSidebars]);

    if (!isClient || !isAuthenticated) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative transition-colors duration-300">
            {/* Ambient Background Glows (Theme Aware via opacity) */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {(isLeftSidebarOpen || isRightSidebarOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={closeSidebars}
                    />
                )}
            </AnimatePresence>

            {/* Left Sidebar (Framer Motion for smooth mobile sliding) */}
            <motion.div
                initial={false}
                animate={{ x: isLeftSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? '-100%' : 0) }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-auto lg:relative flex-shrink-0"
            >
                <LeftSidebar />
            </motion.div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface/50 shadow-2xl z-10 border-x border-border backdrop-blur-3xl relative h-full">
                {children}
            </main>

            {/* Right Sidebar */}
            <motion.div
                initial={false}
                animate={{ x: isRightSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : 0) }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-72 sm:w-80 lg:w-auto lg:relative flex-shrink-0"
            >
                <RightSidebar />
            </motion.div>
        </div>
    );
}