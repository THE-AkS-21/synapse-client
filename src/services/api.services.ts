import { api } from './api';

export const InvitationService = {
    getPending: async () => {
        const res = await api.get('/api/v1/invitations/pending');
        return res.data || [];
    },
    accept: async (invitationId: number) => {
        const res = await api.post(`/api/v1/invitations/${invitationId}/respond`, null, { params: { accept: true } });
        return res.data;
    },
    decline: async (invitationId: number) => {
        const res = await api.post(`/api/v1/invitations/${invitationId}/respond`, null, { params: { accept: false } });
        return res.data;
    },
    sendGeneralInvite: async (toUsername: string, roomId?: string) => {
        const params: Record<string, string> = { toUsername };
        if (roomId) params.roomId = roomId;
        const res = await api.post('/api/v1/invitations/send', null, { params });
        return res.data;
    },
    inviteToRoom: async (roomId: string, targetDisplayId: string) => {
        const res = await api.post(`/api/v1/invitations/room/${roomId}/invite`, null, { params: { targetDisplayId } });
        return res.data;
    }
};

export const RoomService = {
    getUserRooms: async () => {
        const res = await api.get('/api/v1/rooms/user');
        return res.data;
    },
    getPublicRooms: async () => {
        const res = await api.get('/api/v1/rooms/public');
        // Handle paginated vs non-paginated spring responses safely
        return res.data?.content ?? res.data;
    },
    getRoomParticipants: async (roomId: string) => {
        const res = await api.get(`/api/v1/rooms/${roomId}/participants`);
        return res.data;
    },
    removeParticipant: async (roomId: string, userId: string) => {
        return api.delete(`/api/v1/rooms/${roomId}/participants/${userId}`);
    },
    startDirectMessage: async (user1Id: number, user2Id: number) => {
        const res = await api.post('/api/v1/rooms/direct', { user1Id, user2Id });
        return res.data;
    },
    joinPublicRoom: async (roomId: string) => {
        const res = await api.post(`/api/v1/rooms/${roomId}/join`);
        return res.data;
    }
};

export const UserService = {
    searchUsers: async (query: string) => {
        const res = await api.get(`/api/v1/users/search?query=${encodeURIComponent(query)}`);
        return res.data;
    }
};