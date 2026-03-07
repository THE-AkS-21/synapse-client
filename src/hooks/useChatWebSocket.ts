import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { useChatStore } from '../store/chatStore';

export const useChatWebSocket = (roomId: string, token: string | null) => {
    const appendMessage = useChatStore((state) => state.appendMessage);
    const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
    const setTypingUsers = useChatStore((state) => state.setTypingUsers);

    useEffect(() => {
        if (!roomId || !token) return;

        connectWebSocket(roomId, token,
            (newMessage: any) => {
                appendMessage(roomId, newMessage);
            },
            (presenceEvent: any) => {
                setOnlineUsers(roomId, presenceEvent.onlineUsers || []);
                setTypingUsers(roomId, presenceEvent.typingUsers || []);
            }
        );

        return () => {
            disconnectWebSocket(roomId);
        };
    }, [roomId, token, appendMessage, setOnlineUsers, setTypingUsers]);
};
