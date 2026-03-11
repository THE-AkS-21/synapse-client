import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message, UserPresence } from '../store/chatStore';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

let stompClient: Client | null = null;
let currentChatSubscription: StompSubscription | null = null;
let currentPresenceSubscription: StompSubscription | null = null;
let currentRoomId: string | null = null;
let globalSubscription: StompSubscription | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

const startHeartbeat = () => {
    stopHeartbeat();
    const sendBeat = () => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/presence/heartbeat',
                body: JSON.stringify({}),
            });
        }
    };
    sendBeat(); // Fire instantly to register presence without delay
    heartbeatInterval = setInterval(sendBeat, 25000);
};

const stopHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
};

type MessageCallback = (msg: Message) => void;
type PresenceEvent = { onlineUsers: string[], typingUsers: string[] };
type PresenceCallback = (presence: PresenceEvent) => void;
type GlobalEventCallback = (event: any) => void;

export const connectWebSocket = (roomId: string, token: string, onMessageReceived: MessageCallback, onPresenceReceived: PresenceCallback, onGlobalEventReceived: GlobalEventCallback) => {
    if (stompClient && stompClient.connected) {
        changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => {
            // You can implement custom STOMP frame logging here if needed in DEV mode.
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        console.debug("[WebSocket] Connected successfully");

        // Subscribe to global events ONCE per connection
        globalSubscription = stompClient!.subscribe('/topic/global-events', (msg: IMessage) => {
            if (msg.body) onGlobalEventReceived(JSON.parse(msg.body));
        });

        changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
        startHeartbeat();
    };

    stompClient.onStompError = (frame) => {
        console.error("Broker error:", frame.headers["message"]);
    };

    stompClient.onWebSocketError = (event) => {
        console.error("WebSocket error:", event);
    };

    stompClient.onDisconnect = () => {
        console.debug("[WebSocket] Disconnected");
        stopHeartbeat();
    };

    stompClient.activate();
};

const changeRoomSubscription = (newRoomId: string, onMessageReceived: MessageCallback, onPresenceReceived: PresenceCallback) => {
    if (currentRoomId && currentRoomId !== newRoomId && stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/app/presence/leave/${currentRoomId}`,
            body: JSON.stringify({}),
        });
    }

    if (currentChatSubscription) currentChatSubscription.unsubscribe();
    if (currentPresenceSubscription) currentPresenceSubscription.unsubscribe();

    currentRoomId = newRoomId;

    currentChatSubscription = stompClient?.subscribe(`/topic/chat/${newRoomId}`, (msg: IMessage) => {
        if (msg.body) {
            onMessageReceived(JSON.parse(msg.body));
        }
    }) as StompSubscription;

    currentPresenceSubscription = stompClient?.subscribe(`/topic/presence/${newRoomId}`, (msg: IMessage) => {
        if (msg.body) {
            onPresenceReceived(JSON.parse(msg.body));
        }
    }) as StompSubscription;

    stompClient?.publish({
        destination: `/app/presence/join/${newRoomId}`,
        body: JSON.stringify({}),
    });
};

export const disconnectWebSocket = (roomId: string) => {
    if (currentRoomId === roomId) {
        if (currentChatSubscription) currentChatSubscription.unsubscribe();
        if (currentPresenceSubscription) currentPresenceSubscription.unsubscribe();
        if (globalSubscription) globalSubscription.unsubscribe();

        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/presence/leave/${roomId}`,
                body: JSON.stringify({}),
            });
        }

        currentRoomId = null;
        currentChatSubscription = null;
        currentPresenceSubscription = null;
    }
};

export const sendMessage = (roomId: string, content: string) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/app/room/${roomId}`,
            body: JSON.stringify({ content }),
        });
    }
};

export const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/app/presence/typing/${roomId}`,
            body: JSON.stringify({ isTyping }),
        });
    }
};

export const wsService = {
    connect: () => { },
    joinRoom: () => { },
    leaveRoom: () => { },
    sendMessage,
    sendTyping: sendTypingStatus,
};
