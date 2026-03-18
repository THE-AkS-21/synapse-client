import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { useChatStore, Message, UserPresence } from '../store/chatStore';
import toast from 'react-hot-toast';

export const useChatWebSocket = (roomId: string | null, token: string | null) => {
    const appendMessage = useChatStore((state) => state.appendMessage);
    const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
    const setTypingUsers = useChatStore((state) => state.setTypingUsers);
    const removeRoom = useChatStore((state) => state.removeRoom);
    const activeRoomId = useChatStore((state) => state.activeRoomId);
    const setActiveRoom = useChatStore((state) => state.setActiveRoom);

    useEffect(() => {
        if (!roomId || !token) return;

        connectWebSocket(roomId, token,
            (newMessage: any) => {
                const mappedMessage: Message = {
                    id: newMessage.id,
                    roomId: newMessage.roomId,
                    senderId: newMessage.senderId, // Fixed reference error here
                    senderUsername: newMessage.senderUsername || newMessage.from || 'Unknown',
                    senderName: newMessage.senderUsername || newMessage.from || 'Unknown',
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                };
                appendMessage(roomId, mappedMessage);
            },
            (presenceEvent: { onlineUsers: string[], typingUsers: string[] }) => {
                const mappedOnlineUsers: UserPresence[] = (presenceEvent.onlineUsers || []).map((u: any) => {
                    // Normalize backend data whether it sends full objects or string identifiers
                    const username = typeof u === 'string' ? u : (u.username || u.id || 'Unknown');
                    return { id: username, username };
                });

                setOnlineUsers(roomId, mappedOnlineUsers);
                setTypingUsers(roomId, presenceEvent.typingUsers || []);
            },
            (globalEvent: any) => {
                if (globalEvent.type === 'ROOM_DELETED') {
                    const deletedRoomId = globalEvent.roomId;
                    removeRoom(deletedRoomId);

                    if (activeRoomId === deletedRoomId) {
                        setActiveRoom(null);
                        toast.error('The room you were in was deleted by the admin.');
                    }
                }
            }
        );

        return () => {
            disconnectWebSocket(roomId);
        };
    }, [roomId, token, appendMessage, setOnlineUsers, setTypingUsers, removeRoom, activeRoomId, setActiveRoom]);
};