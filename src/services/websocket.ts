import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message } from '../store/chatStore';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

let stompClient: Client | null = null;
let currentChatSubscription: StompSubscription | null = null;
let currentPresenceSubscription: StompSubscription | null = null;
let globalSubscription: StompSubscription | null = null;
let currentRoomId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

const startHeartbeat = () => {
    stopHeartbeat();
    const sendBeat = () => {
        if (stompClient?.connected) {
            stompClient.publish({ destination: '/app/presence/heartbeat', body: JSON.stringify({}) });
        }
    };
    sendBeat();
    heartbeatInterval = setInterval(sendBeat, 25000);
};

const stopHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
};

type PresenceEvent = { onlineUsers: string[], typingUsers: string[] };

export const connectWebSocket = (
    roomId: string,
    token: string,
    onMessageReceived: (msg: Message) => void,
    onPresenceReceived: (presence: PresenceEvent) => void,
    onGlobalEventReceived: (event: any) => void
) => {
    if (stompClient?.connected) {
        changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
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
        globalSubscription = stompClient!.subscribe('/topic/global-events', (msg: IMessage) => {
            if (msg.body) onGlobalEventReceived(JSON.parse(msg.body));
        });

        changeRoomSubscription(roomId, onMessageReceived, onPresenceReceived);
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

    stompClient?.publish({ destination: `/app/presence/join/${newRoomId}`, body: JSON.stringify({}) });
};

export const disconnectWebSocket = (roomId: string) => {
    if (currentRoomId === roomId) {
        currentChatSubscription?.unsubscribe();
        currentPresenceSubscription?.unsubscribe();
        globalSubscription?.unsubscribe();

        if (stompClient?.connected) {
            stompClient.publish({ destination: `/app/presence/leave/${roomId}`, body: JSON.stringify({}) });
        }

        currentRoomId = null;
    }
};

export const sendMessage = (roomId: string, content: string) => {
    // Generate the hybrid client-side timestamp
    const timestamp = Date.now();
    stompClient?.publish({
        destination: `/app/room/${roomId}`,
        body: JSON.stringify({ content, timestamp })
    });
};

export const sendTypingStatus = (roomId: string, isTyping: boolean) => {
    stompClient?.publish({ destination: `/app/presence/typing/${roomId}`, body: JSON.stringify({ isTyping }) });
};