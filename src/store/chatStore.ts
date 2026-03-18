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
    dmPartner?: string;
    participants?: { id: number | string, username: string }[];
}

interface ChatState {
    rooms: Room[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>;
    onlineUsers: Record<string, UserPresence[]>;
    typingUsers: Record<string, string[]>;

    removeRoom: (roomId: string) => void;
    setRooms: (rooms: Room[], currentUserId?: string | number) => void;
    addRoom: (room: Room, currentUserId?: string | number) => void;
    setActiveRoom: (roomId: string | null) => void;

    setMessages: (roomId: string, messages: Message[]) => void;
    appendMessage: (roomId: string, message: Message) => void;

    setOnlineUsers: (roomId: string, users: UserPresence[]) => void;
    setTypingUsers: (roomId: string, users: string[]) => void;
}

const formatRoom = (room: Room, currentUserId?: string | number): Room => {
    if (room.type === 'DIRECT' && currentUserId && room.participants) {
        const partner = room.participants.find(p => String(p.id) !== String(currentUserId));
        const partnerName = partner ? partner.username : room.dmPartner || 'Unknown User';
        return { ...room, dmPartner: partnerName, name: partnerName };
    }
    return room;
};

export const useChatStore = create<ChatState>((set) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    onlineUsers: {},
    typingUsers: {},

    setRooms: (rooms, currentUserId) => set({
        rooms: rooms.map(r => formatRoom(r, currentUserId))
    }),

    addRoom: (room, currentUserId) => set((state) => {
        if (state.rooms.some(r => r.id === room.id)) return state;
        return { rooms: [formatRoom(room, currentUserId), ...state.rooms] };
    }),

    removeRoom: (roomId) => set((state) => ({
        rooms: state.rooms.filter(r => r.id !== roomId),
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