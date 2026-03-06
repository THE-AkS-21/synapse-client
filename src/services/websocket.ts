import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore } from '../store/chatStore';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
    private client: Client | null = null;
    private currentRoomId: string | null = null;
    private subscriptions: Record<string, StompSubscription> = {};
    private typingTimeout: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    connect() {
        if (this.client && (this.client.connected || this.client.active)) {
            return;
        }

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

        this.client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),

            connectHeaders: token
                ? { Authorization: `Bearer ${token}` }
                : {},

            debug: (str) => {
                if (process.env.NODE_ENV !== "production") {
                    console.log("[STOMP]", str);
                }
            },

            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log("Connected to WebSocket server");

            const state = useChatStore.getState();
            if (state.activeRoomId) {
                this.joinRoom(state.activeRoomId);
            }
        };

        this.client.onStompError = (frame) => {
            console.error("Broker error:", frame.headers["message"]);
            console.error(frame.body);
        };

        this.client.onWebSocketError = (event) => {
            console.error("WebSocket error:", event);
        };

        this.client.onDisconnect = () => {
            console.log("WebSocket disconnected");
        };

        this.client.activate();
    }

    joinRoom(roomId: string) {
        if (this.currentRoomId === roomId) return;

        if (this.currentRoomId) {
            this.leaveRoom(this.currentRoomId);
        }

        this.currentRoomId = roomId;

        if (!this.client || !this.client.connected) {
            if (!this.client) this.connect();
            return;
            // will run joinRoom inside onConnect
        }

        // Subscribe to chat messages
        this.subscriptions[`chat_${roomId}`] = this.client.subscribe(`/topic/chat/${roomId}`, (message: IMessage) => {
            if (message.body) {
                const parsedMessage = JSON.parse(message.body);
                useChatStore.getState().appendMessage(roomId, parsedMessage);
            }
        });

        // Subscribe to presence
        this.subscriptions[`presence_${roomId}`] = this.client.subscribe(`/topic/presence/${roomId}`, (message: IMessage) => {
            if (message.body) {
                const presenceEvent = JSON.parse(message.body);
                useChatStore.getState().setOnlineUsers(roomId, presenceEvent.onlineUsers || []);
                useChatStore.getState().setTypingUsers(roomId, presenceEvent.typingUsers || []);
            }
        });

        // Immediately upon entering, send a presence join message
        this.client.publish({
            destination: `/app/presence/join/${roomId}`,
            body: JSON.stringify({}),
        });

        // Setup 25-second heartbeat
        this.startHeartbeat();
    }

    leaveRoom(roomId: string) {
        if (this.subscriptions[`chat_${roomId}`]) {
            this.subscriptions[`chat_${roomId}`].unsubscribe();
            delete this.subscriptions[`chat_${roomId}`];
        }
        if (this.subscriptions[`presence_${roomId}`]) {
            this.subscriptions[`presence_${roomId}`].unsubscribe();
            delete this.subscriptions[`presence_${roomId}`];
        }

        if (this.client && this.client.connected) {
            this.client.publish({
                destination: `/app/presence/leave/${roomId}`,
                body: JSON.stringify({}),
            });
        }
        this.stopHeartbeat();
        this.currentRoomId = null;
    }

    sendMessage(roomId: string, content: string) {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: `/app/room/${roomId}`,
                body: JSON.stringify({ content }),
            });
        }
    }

    // Handle typing event locally to add debounce/inactivity
    sendTyping(roomId: string, isTyping: boolean) {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: `/app/presence/typing/${roomId}`,
                body: JSON.stringify({ isTyping }),
            });
        }
    }

    handleTypingChange(roomId: string) {
        this.sendTyping(roomId, true);
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        // send typing false after 3 seconds of inactivity
        this.typingTimeout = setTimeout(() => {
            this.sendTyping(roomId, false);
        }, 3000);
    }

    handleTypingBlur(roomId: string) {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.sendTyping(roomId, false);
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.client && this.client.connected) {
                this.client.publish({
                    destination: '/app/presence/heartbeat', // Assuming no roomId required here per typical patterns, or adapt
                    body: JSON.stringify({}),
                });
            }
        }, 25000); // every 25 seconds
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    }

    disconnect() {
        if (this.currentRoomId) {
            this.leaveRoom(this.currentRoomId);
        }
        if (this.client) {
            this.client.deactivate();
        }
    }
}

export const wsService = new WebSocketService();
