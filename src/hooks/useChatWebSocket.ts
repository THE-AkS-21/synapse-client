import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { useChatStore, Message, UserPresence } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import toast from 'react-hot-toast';

export const useChatWebSocket = (roomId: string | null, token: string | null) => {
    const router = useRouter();

    useEffect(() => {
        if (!roomId || !token) return;

        connectWebSocket(roomId, token,
            (newMessage: any) => {
                // Fetch the freshest state directly from Zustand to avoid React stale closures
                const currentUserId = useAuthStore.getState().user?.id;
                const currentActiveRoomId = useChatStore.getState().activeRoomId;
                const sender = newMessage.senderUsername || newMessage.from || 'Unknown';

                // Intercept SYSTEM events for removals
                if (sender === 'SYSTEM' && newMessage.content?.startsWith('USER_REMOVED:')) {
                    const removedUserId = newMessage.content.split(':')[1];

                    // Check if the user being removed is the currently logged-in user
                    if (String(removedUserId) === String(currentUserId)) {
                        useChatStore.getState().removeRoom(roomId); // Remove it from sidebar

                        // If they are currently looking at the room they were removed from
                        if (currentActiveRoomId === roomId) {
                            useChatStore.getState().setActiveRoom(null); // Return to default dashboard view
                            useUiStore.getState().closeSidebars();
                            router.replace('/dashboard'); // Soft URL reset
                            toast.error('You were removed from this room by the creator.');
                        }
                    }
                    return; // Prevent SYSTEM message from showing in the chat UI
                }

                // Normal chat message handling
                const mappedMessage: Message = {
                    id: newMessage.id,
                    roomId: newMessage.roomId,
                    senderId: newMessage.senderId,
                    senderUsername: sender,
                    senderName: sender,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                };
                useChatStore.getState().appendMessage(roomId, mappedMessage);
            },
            (presenceEvent: { onlineUsers: string[] }) => {
                const mappedOnlineUsers: UserPresence[] = (presenceEvent.onlineUsers || []).map((u: any) => {
                    const username = typeof u === 'string' ? u : (u.username || u.id || 'Unknown');
                    return { id: username, username };
                });

                useChatStore.getState().setOnlineUsers(roomId, mappedOnlineUsers);
            },
            (globalEvent: any) => {
                // Handle global room deletions
                if (globalEvent.type === 'ROOM_DELETED') {
                    const deletedRoomId = globalEvent.roomId;
                    useChatStore.getState().removeRoom(deletedRoomId);

                    const currentActiveRoomId = useChatStore.getState().activeRoomId;
                    if (currentActiveRoomId === deletedRoomId) {
                        useChatStore.getState().setActiveRoom(null);
                        useUiStore.getState().closeSidebars();
                        router.replace('/dashboard');
                        toast.error('The room you were in was deleted by the admin.');
                    }
                }
            }
        );

        return () => {
            disconnectWebSocket(roomId);
        };
        // Stripped state actions from dependencies so the connection doesn't drop and reconnect constantly
    }, [roomId, token, router]);
};