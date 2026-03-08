import { create } from 'zustand';

export interface Message {
    id: string;
    roomId: string;
    senderId?: number;
    senderUsername: string;
    senderName: string;
    content: string;
    timestamp: number;
}

export interface UserPresence {
    id: string;
    username: string;
    avatarUrl?: string;
}

export interface Room {
    id: string;
    name: string;
    type?: 'PUBLIC' | 'PRIVATE' | 'DIRECT';
    creatorId?: number;
    description?: string;
    createdAt?: string;
    /** For DM rooms — the other participant's username */
    dmPartner?: string;
}

interface ChatState {
    rooms: Room[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>;
    onlineUsers: Record<string, UserPresence[]>;
    typingUsers: Record<string, string[]>;

    setRooms: (rooms: Room[]) => void;
    addRoom: (room: Room) => void;
    setActiveRoom: (roomId: string | null) => void;

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

    addRoom: (room) => set((state) => ({
        rooms: state.rooms.some(r => r.id === room.id)
            ? state.rooms
            : [room, ...state.rooms],
    })),

    setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

    setMessages: (roomId, initialMessages) => set((state) => ({
        messages: { ...state.messages, [roomId]: initialMessages }
    })),

    appendMessage: (roomId, message) => set((state) => {
        const existing = state.messages[roomId] || [];
        if (existing.some(m => m.id === message.id)) return state;
        return { messages: { ...state.messages, [roomId]: [...existing, message] } };
    }),

    setOnlineUsers: (roomId, users) => set((state) => ({
        onlineUsers: { ...state.onlineUsers, [roomId]: users }
    })),

    setTypingUsers: (roomId, users) => set((state) => ({
        typingUsers: { ...state.typingUsers, [roomId]: users }
    })),
}));
