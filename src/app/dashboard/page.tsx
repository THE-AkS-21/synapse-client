'use client';

import ChatWindow from '@/components/chat/ChatWindow';

export default function DashboardPage() {
    return (
        <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 bg-background overflow-hidden text-foreground relative">
            <ChatWindow />
        </div>
    );
}