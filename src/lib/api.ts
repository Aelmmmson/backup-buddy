
import axios from "axios";
import { getAccessToken, refreshAccessToken, logout } from "./auth";

// Using the correct baseURL for the application
const api = axios.create({
    baseURL: "http://10.203.14.169:3066/v1/api/backup_monitor",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Request interceptor – add Bearer token
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor – handle 401 → try refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Updated token needs to be set in the headers for retry
                    const newToken = getAccessToken();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
            }

            // If refresh fails or throws, we should probably logout or redirect
            // logout(); // Uncomment this if auto-logout is desired on 401
        }

        return Promise.reject(error);
    }
);

export default api;
