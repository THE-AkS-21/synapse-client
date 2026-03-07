import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { useChatStore, Message, UserPresence } from '../store/chatStore';

export const useChatWebSocket = (roomId: string, token: string | null) => {
    const appendMessage = useChatStore((state) => state.appendMessage);
    const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
    const setTypingUsers = useChatStore((state) => state.setTypingUsers);

    useEffect(() => {
        if (!roomId || !token) return;

        connectWebSocket(roomId, token,
            (newMessage: any) => {
                const mappedMessage: Message = {
                    id: newMessage.id,
                    roomId: newMessage.roomId,
                    senderUsername: newMessage.from,
                    senderName: newMessage.from,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                };
                appendMessage(roomId, mappedMessage);
            },
            (presenceEvent: { onlineUsers: string[], typingUsers: string[] }) => {
                const mappedOnlineUsers = (presenceEvent.onlineUsers || []).map((u: any) => {
                    // Map string usernames from backend to UserPresence objects
                    const username = typeof u === 'string' ? u : (u.username || u.id || 'Unknown');
                    return { id: username, username };
                });
                setOnlineUsers(roomId, mappedOnlineUsers);
                setTypingUsers(roomId, presenceEvent.typingUsers || []);
            }
        );

        return () => {
            disconnectWebSocket(roomId);
        };
    }, [roomId, token, appendMessage, setOnlineUsers, setTypingUsers]);
};
