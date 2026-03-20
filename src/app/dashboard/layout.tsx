'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const { isAuthenticated } = useAuthStore();
    const { isLeftSidebarOpen, isRightSidebarOpen, closeSidebars } = useUiStore();
    const activeRoomId = useChatStore(state => state.activeRoomId);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    useEffect(() => { if (isClient && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isClient, router]);

    // Auto-close sidebars on mobile when a room is selected
    useEffect(() => {
        if (window.innerWidth < 1024) closeSidebars();
    }, [activeRoomId, closeSidebars]);

    if (!isClient || !isAuthenticated) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background relative transition-colors duration-300">
            {/* Soft dynamic ambient glows instead of hardcoded dark colors */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-brand/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Mobile Backdrop */}
            {(isLeftSidebarOpen || isRightSidebarOpen) && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={closeSidebars} />
            )}

            {/* Left Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <LeftSidebar />
            </div>

            {/* Main Content Area - Replaced bg-black/40 with bg-surface */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface shadow-2xl z-10 border-x border-border relative">
                {children}
            </main>

            {/* Right Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <RightSidebar />
            </div>
        </div>
    );
}