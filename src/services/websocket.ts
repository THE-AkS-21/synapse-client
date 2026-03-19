import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message } from '../store/chatStore';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

// Singleton state: Preserved across React re-renders and Hot Module Replacements
let stompClient: Client | null = null;
let currentChatSubscription: StompSubscription | null = null;
let currentPresenceSubscription: StompSubscription | null = null;
let globalSubscription: StompSubscription | null = null;
let currentRoomId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Custom Heartbeat Emitter
 * Required to keep the backend `PresenceService` TTL keys alive in Redis.
 */
const startHeartbeat = () => {
    stopHeartbeat();
    const sendBeat = () => {
        if (stompClient?.connected) {
            stompClient.publish({ destination: '/app/presence/heartbeat', body: JSON.stringify({}) });
        }
    };
    sendBeat(); // Fire immediately, then interval
    heartbeatInterval = setInterval(sendBeat, 25000); // Fire every 25 seconds
};

const stopHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
};

type PresenceEvent = { onlineUsers: string[], typingUsers: string[] };

export const connectWebSocket = (
    roomId: string | null,
    token: string,
    onMessageReceived: (msg: Message) => void,
    onPresenceReceived: (presence: PresenceEvent) => void,
    onGlobalEventReceived: (event: any) => void
) => {
    // If already connected, just route to the new room
    if (stompClient?.connected) {
        if (roomId) changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        // Step 1: Subscribe to the global event bus for cross-room notifications
        globalSubscription = stompClient!.subscribe('/topic/global-events', (msg: IMessage) => {
            if (msg.body) onGlobalEventReceived(JSON.parse(msg.body));
        });

        // Step 2: Subscribe to the specific room if provided
        if (roomId) changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);

        // Step 3: Initiate presence tracking
        startHeartbeat();
    };

    stompClient.onDisconnect = () => stopHeartbeat();
    stompClient.activate();
};

const changeRoomSubscription = (
    newRoomId: string,
    onMessageReceived: (msg: Message) => void,
    onPresenceReceived: (presence: PresenceEvent) => void
) => {
    // Gracefully leave previous room to clear typing/online status on the backend
    if (currentRoomId && currentRoomId !== newRoomId && stompClient?.connected) {
        stompClient.publish({ destination: `/app/presence/leave/${currentRoomId}`, body: JSON.stringify({}) });
    }

    currentChatSubscription?.unsubscribe();
    currentPresenceSubscription?.unsubscribe();
    currentRoomId = newRoomId;

    currentChatSubscription = stompClient?.subscribe(`/topic/chat/${newRoomId}`, (msg: IMessage) => {
        if (msg.body) onMessageReceived(JSON.parse(msg.body));
    }) as StompSubscription;

    currentPresenceSubscription = stompClient?.subscribe(`/topic/presence/${newRoomId}`, (msg: IMessage) => {
        if (msg.body) onPresenceReceived(JSON.parse(msg.body));
    }) as StompSubscription;

    // Announce arrival to trigger backend presence updates
    stompClient?.publish({ destination: `/app/presence/join/${newRoomId}`, body: JSON.stringify({}) });
};

export const disconnectWebSocket = (roomId: string | null) => {
    if (roomId && currentRoomId === roomId) {
        currentChatSubscription?.unsubscribe();
        currentPresenceSubscription?.unsubscribe();
        if (stompClient?.connected) {
            stompClient.publish({ destination: `/app/presence/leave/${roomId}`, body: JSON.stringify({}) });
        }
        currentRoomId = null;
    }
};

export const disconnectGlobalWebSocket = () => {
    globalSubscription?.unsubscribe();
    stompClient?.deactivate();
    stompClient = null;
};

export const sendMessage = (roomId: string, content: string) => {
    if (!stompClient?.connected) {
        console.warn("Attempted to send message while disconnected");
        return;
    }
    const timestamp = Date.now();
    stompClient.publish({
        destination: `/app/room/${roomId}`,
        body: JSON.stringify({ content, timestamp })
    });
};

export const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    if (!stompClient?.connected) return;
    stompClient.publish({
        destination: `/app/presence/typing/${roomId}`,
        body: JSON.stringify({ isTyping })
    });
};