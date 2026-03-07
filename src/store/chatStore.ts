import { create } from 'zustand';

export interface Message {
    id: string; // Will store messageId (from DB) or id (from WebSocket)
    roomId: string;
    senderUsername: string; // Consistent user identifier
    senderName: string; // The display name
    content: string;
    timestamp: number; // Backend sends a long (ms)
}

export interface UserPresence {
    id: string;
    username: string;
    avatarUrl?: string;
}

export interface Room {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
}

interface ChatState {
    rooms: Room[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>; // Keyed by roomId
    onlineUsers: Record<string, UserPresence[]>; // Keyed by roomId
    typingUsers: Record<string, string[]>; // Keyed by roomId (array of usernames typing)

    setRooms: (rooms: Room[]) => void;
    setActiveRoom: (roomId: string) => void;

    setMessages: (roomId: string, messages: Message[]) => void;
    appendMessage: (roomId: string, message: Message) => void;

    setOnlineUsers: (roomId: string, users: UserPresence[]) => void;
    setTypingUsers: (roomId: string, users: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    onlineUsers: {},
    typingUsers: {},

    setRooms: (rooms) => set({ rooms }),

    setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

    setMessages: (roomId, initialMessages) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: initialMessages
        }
    })),

    appendMessage: (roomId, message) => set((state) => {
        const existing = state.messages[roomId] || [];
        // Ensure uniqueness based on ID
        if (existing.some(m => m.id === message.id)) return state;
        return {
            messages: {
                ...state.messages,
                [roomId]: [...existing, message]
            }
        };
    }),

    setOnlineUsers: (roomId, users) => set((state) => ({
        onlineUsers: {
            ...state.onlineUsers,
            [roomId]: users
        }
    })),

    setTypingUsers: (roomId, users) => set((state) => ({
        typingUsers: {
            ...state.typingUsers,
            [roomId]: users
        }
    })),
}));
