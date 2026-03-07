import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

let stompClient: Client | null = null;
let currentChatSubscription: StompSubscription | null = null;
let currentPresenceSubscription: StompSubscription | null = null;
let currentRoomId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatInterval = setInterval(() => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/presence/heartbeat',
                body: JSON.stringify({}),
            });
        }
    }, 25000);
};

const stopHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
};

export const connectWebSocket = (roomId: string, token: string, onMessageReceived: Function, onPresenceReceived: Function) => {
    if (stompClient && stompClient.connected) {
        changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => {
            if (process.env.NODE_ENV !== "production") {
                console.log("[STOMP]", str);
            }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        console.log("Connected to WebSocket server");
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
        console.log("WebSocket disconnected");
        stopHeartbeat();
    };

    stompClient.activate();
};

const changeRoomSubscription = (newRoomId: string, onMessageReceived: Function, onPresenceReceived: Function) => {
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
