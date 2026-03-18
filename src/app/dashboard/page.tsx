'use client';

import ChatWindow from '@/components/chat/ChatWindow';

export default function DashboardPage() {
    return (
        <div className="flex h-full w-full bg-background overflow-hidden text-foreground">
            <ChatWindow />
        </div>
    );
}