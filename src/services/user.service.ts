import { api } from './api';

export const UserService = {
    searchUsers: async (query: string) => {
        const res = await api.get(`/api/v1/users/search?query=${encodeURIComponent(query)}`);
        return res.data;
    }
};