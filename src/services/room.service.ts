import { api } from './api';

export const RoomService = {
    getUserRooms: async () => {
        const res = await api.get('/api/v1/rooms/user');
        return res.data;
    },
    getPublicRooms: async () => {
        const res = await api.get('/api/v1/rooms/public');
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