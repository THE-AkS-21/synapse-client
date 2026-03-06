import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('synapse_jwt', token);
                }
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('synapse_jwt');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
