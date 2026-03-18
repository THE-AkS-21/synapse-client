import { api } from './api';

export const InvitationService = {
    getPending: async () => {
        const res = await api.get('/api/v1/invitations/pending');
        return res.data || [];
    },
    accept: async (invitationId: number) => {
        const res = await api.post(`/api/v1/invitations/${invitationId}/respond`, null, {
            params: { accept: true }
        });
        return res.data;
    },
    decline: async (invitationId: number) => {
        const res = await api.post(`/api/v1/invitations/${invitationId}/respond`, null, {
            params: { accept: false }
        });
        return res.data;
    },
    sendGeneralInvite: async (toUsername: string, roomId?: string) => {
        const params: Record<string, string> = { toUsername };
        if (roomId) params.roomId = roomId;
        const res = await api.post('/api/v1/invitations/send', null, { params });
        return res.data;
    },
    inviteToRoom: async (roomId: string, targetDisplayId: string) => {
        const res = await api.post(`/api/v1/invitations/room/${roomId}/invite`, null, {
            params: { targetDisplayId }
        });
        return res.data;
    }
};