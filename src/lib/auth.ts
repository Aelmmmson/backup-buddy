
export interface User {
    user_id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
    role_id: number;
    role_name: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const login = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
};

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Alias for consistency with interceptor
export const getAccessToken = getToken;

// Placeholder for refresh token logic
export const refreshAccessToken = async (): Promise<boolean> => {
    // TODO: Implement actual refresh token logic if backend supports it.
    // For now, return false to trigger logout if 401 occurs.
    return false;
};

export const getUser = (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
