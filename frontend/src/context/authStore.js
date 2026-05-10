import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
    },
    checkAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, token });
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null });
            }
        }
    }
}));
