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
        // CRITICAL FIX: Only return if NO TOKEN. We want to connect globally even if roomId is null.
        if (!token) return;

        connectWebSocket(roomId, token,
            (newMessage: any) => {
                const store = useChatStore.getState();
                const authStore = useAuthStore.getState();
                const uiStore = useUiStore.getState();

                const currentUserId = String(authStore.user?.id);
                const currentActiveRoomId = store.activeRoomId;

                const content = typeof newMessage.content === 'string' ? newMessage.content : '';
                const sender = String(newMessage.senderUsername || newMessage.from || '').toUpperCase();
                const senderId = String(newMessage.senderId || '');

                const isSystemMessage = sender === 'SYSTEM' || senderId === '0';

                // Intercept SYSTEM events for dynamic updates
                if (isSystemMessage) {
                    if (content.includes('USER_REMOVED:') || content.includes('USER_JOINED:')) {
                        store.triggerRefresh();

                        if (content.includes('USER_REMOVED:')) {
                            const removedUserId = content.split('USER_REMOVED:')[1]?.replace(/[^0-9]/g, '').trim();

                            if (removedUserId === currentUserId) {
                                store.removeRoom(roomId!);
                                if (currentActiveRoomId === roomId) {
                                    store.setActiveRoom(null);
                                    uiStore.closeSidebars();
                                    router.replace('/dashboard');
                                    setTimeout(() => toast.error('You were removed from this room.'), 50);
                                }
                            }
                        }
                    }

                    if (content === 'MESSAGES_CLEARED') {
                        store.clearMessages(roomId!);
                        return;
                    }

                    if (content.startsWith('MESSAGE_DELETED:')) {
                        const deletedMsgId = content.split(':')[1];
                        store.deleteMessage(roomId!, deletedMsgId);
                        return;
                    }

                    if (content === 'ROOM_DELETED') {
                        store.removeRoom(roomId!);
                        if (currentActiveRoomId === roomId) {
                            store.setActiveRoom(null);
                            uiStore.closeSidebars();
                            router.replace('/dashboard');
                            setTimeout(() => toast.error('This room was deleted by the admin.'), 50);
                        }
                    }
                    return;
                }

                // Normal chat message
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
            },
            (presenceEvent: { onlineUsers: string[] }) => {
                const mappedOnlineUsers: UserPresence[] = (presenceEvent.onlineUsers || []).map((u: any) => {
                    const username = typeof u === 'string' ? u : (u.username || u.id || 'Unknown');
                    return { id: username, username };
                });
                useChatStore.getState().setOnlineUsers(roomId!, mappedOnlineUsers);
            },
            (globalEvent: any) => {
                const store = useChatStore.getState();
                const currentUserId = String(useAuthStore.getState().user?.id);

                if (globalEvent.type === 'ROOM_DELETED') {
                    store.removeRoom(globalEvent.roomId);
                    if (store.activeRoomId === globalEvent.roomId) {
                        store.setActiveRoom(null);
                        useUiStore.getState().closeSidebars();
                        router.replace('/dashboard');
                    }
                }

                if (globalEvent.type === 'USER_REMOVED_FROM_ROOM') {
                    if (String(globalEvent.targetId) === currentUserId) {
                        store.removeRoom(globalEvent.roomId);
                        if (store.activeRoomId === globalEvent.roomId) {
                            store.setActiveRoom(null);
                            router.replace('/dashboard');
                        }
                    }
                }

                if (globalEvent.type === 'ROOM_CREATED') {
                    const participantIds = globalEvent.participantIds?.map(String) || [];
                    // If you are part of the room, fetch it
                    if (participantIds.includes(currentUserId)) {
                        api.get(`/api/v1/rooms/${globalEvent.roomId}`).then(res => {
                            store.addRoom(res.data, currentUserId);
                        }).catch(console.error);
                    }
                    // If it's a public room, trigger a sidebar refresh so it shows in 'Discover'
                    else if (globalEvent.roomType === 'PUBLIC') {
                        store.triggerRefresh();
                    }
                }

                if (globalEvent.type === 'USER_ADDED_TO_ROOM') {
                    if (String(globalEvent.userId) === currentUserId) {
                        api.get(`/api/v1/rooms/${globalEvent.roomId}`).then(res => {
                            store.addRoom(res.data, currentUserId);
                            toast.success(`You were added to a new room!`);
                        }).catch(console.error);
                    }
                }

                if (globalEvent.type === 'INVITATION_RECEIVED') {
                    if (String(globalEvent.targetId) === currentUserId) {
                        toast.success(`New invite received from @${globalEvent.fromUsername}!`);
                        store.triggerRefresh(); // Refresh notification bell
                    }
                }
            }
        );

        return () => {
            disconnectWebSocket(roomId);
        };
    }, [roomId, token, router]);
};