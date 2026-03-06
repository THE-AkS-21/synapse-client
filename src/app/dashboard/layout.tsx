'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isClient, router]);

    if (!isClient || !isAuthenticated) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#09090b] animated-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm animate-pulse">Connecting to Synapse...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#09090b]">
            {/* Background ambient glows */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <LeftSidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-black/40 shadow-2xl z-10 border-x border-white/5 backdrop-blur-3xl">
                {children}
            </main>

            <RightSidebar />
        </div>
    );
}
