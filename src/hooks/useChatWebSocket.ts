import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { useChatStore, Message, UserPresence } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useChatWebSocket = (roomId: string | null, token: string | null) => {
    const router = useRouter();

    useEffect(() => {
        if (!token) return;

        const handleIncomingMessage = (newMessage: any) => {
            const store = useChatStore.getState();
            const content = typeof newMessage.content === 'string' ? newMessage.content : '';
            const sender = String(newMessage.senderUsername || newMessage.from || '').toUpperCase();
            const senderId = String(newMessage.senderId || '');

            const isSystemMessage = sender === 'SYSTEM' || senderId === '0';

            if (isSystemMessage) {
                processSystemMessage(content, roomId!, store, router);
                return;
            }

            const mappedMessage: Message = {
                id: newMessage.id,
                roomId: newMessage.roomId,
                senderId: newMessage.senderId,
                senderUsername: newMessage.senderUsername || 'System',
                senderName: newMessage.senderUsername || 'System',
                content: content,
                timestamp: newMessage.timestamp,
            };
            store.appendMessage(roomId!, mappedMessage);
        };

        const handlePresenceUpdate = (presenceEvent: { onlineUsers: string[] }) => {
            const mappedOnlineUsers: UserPresence[] = (presenceEvent.onlineUsers || []).map((u: any) => {
                const username = typeof u === 'string' ? u : (u.username || u.id || 'Unknown');
                return { id: username, username };
            });
            useChatStore.getState().setOnlineUsers(roomId!, mappedOnlineUsers);
        };

        const handleGlobalEvent = (globalEvent: any) => {
            processGlobalEvent(globalEvent, router);
        };

        connectWebSocket(roomId, token, handleIncomingMessage, handlePresenceUpdate, handleGlobalEvent);

        return () => {
            disconnectWebSocket(roomId);
        };
    }, [roomId, token, router]);
};

// --- Helper Functions ---

const processSystemMessage = (content: string, roomId: string, store: any, router: any) => {
    const currentUserId = String(useAuthStore.getState().user?.id);
    const currentActiveRoomId = store.activeRoomId;
    const uiStore = useUiStore.getState();

    if (content.includes('USER_REMOVED:') || content.includes('USER_JOINED:')) {
        store.triggerRefresh();

        if (content.includes('USER_REMOVED:')) {
            const removedUserId = content.split('USER_REMOVED:')[1]?.replace(/[^0-9]/g, '').trim();

            if (removedUserId === currentUserId) {
                store.removeRoom(roomId);
                if (currentActiveRoomId === roomId) {
                    store.setActiveRoom(null);
                    uiStore.closeSidebars();
                    router.replace('/dashboard');
                    setTimeout(() => toast.error('You were removed from this room.'), 50);
                }
            }
        }
    }
    // CRITICAL FIX: Make the match more robust using .includes()
    else if (content.includes('MESSAGES_CLEARED')) {
        store.clearMessages(roomId);
    }
    else if (content.startsWith('MESSAGE_DELETED:')) {
        const deletedMsgId = content.split(':')[1];
        store.deleteMessage(roomId, deletedMsgId);
    }
    else if (content.includes('ROOM_DELETED')) {
        store.removeRoom(roomId);
        if (currentActiveRoomId === roomId) {
            store.setActiveRoom(null);
            uiStore.closeSidebars();
            router.replace('/dashboard');
            setTimeout(() => toast.error('This room was deleted by the admin.'), 50);
        }
    }
};

const processGlobalEvent = (globalEvent: any, router: any) => {
    const store = useChatStore.getState();
    const currentUserId = String(useAuthStore.getState().user?.id);

    switch (globalEvent.type) {
        case 'ROOM_DELETED':
            store.removeRoom(globalEvent.roomId);
            if (store.activeRoomId === globalEvent.roomId) {
                store.setActiveRoom(null);
                useUiStore.getState().closeSidebars();
                router.replace('/dashboard');
            }
            break;

        case 'USER_REMOVED_FROM_ROOM':
            if (String(globalEvent.targetId) === currentUserId) {
                store.removeRoom(globalEvent.roomId);
                if (store.activeRoomId === globalEvent.roomId) {
                    store.setActiveRoom(null);
                    router.replace('/dashboard');
                }
            }
            break;

        case 'ROOM_CREATED':
            const participantIds = globalEvent.participantIds?.map(String) || [];
            if (participantIds.includes(currentUserId)) {
                api.get(`/api/v1/rooms/${globalEvent.roomId}`).then(res => {
                    store.addRoom(res.data, currentUserId);
                }).catch(console.error);
            } else if (globalEvent.roomType === 'PUBLIC') {
                store.triggerRefresh();
            }
            break;

        case 'USER_ADDED_TO_ROOM':
            if (String(globalEvent.userId) === currentUserId) {
                api.get(`/api/v1/rooms/${globalEvent.roomId}`).then(res => {
                    store.addRoom(res.data, currentUserId);
                    toast.success(`You were added to a new room!`);
                }).catch(console.error);
            }
            break;

        case 'INVITATION_RECEIVED':
            if (String(globalEvent.targetId) === currentUserId) {
                toast.success(`New invite received from @${globalEvent.fromUsername}!`);
                store.triggerRefresh();
            }
            break;
    }
};