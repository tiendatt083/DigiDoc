import { create } from 'zustand';

const readStoredAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        return { user: null, token: null };
    }

    try {
        return { user: JSON.parse(userStr), token };
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { user: null, token: null };
    }
};

const storedAuth = readStoredAuth();

export const useAuthStore = create((set) => ({
    user: storedAuth.user,
    token: storedAuth.token,
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
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null });
            }
        }
    }
}));
