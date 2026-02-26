import axios from 'axios';
import { parseJwt } from '../utils/jwt';
import i18n from '../i18n';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Temporarily disabled until backend CORS is configured
});

// Add interceptor to include token in requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Response interceptor — catches 401 Unauthorized responses (expired/invalid JWT).
 * Clears auth data from localStorage and redirects to the correct login page.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Don't redirect if this is a login/auth request failure
            // (wrong credentials should just show error, not redirect)
            const requestUrl = error.config?.url || '';
            const isAuthRequest = requestUrl.includes('/auth/login') || 
                                 requestUrl.includes('/auth/signup') || 
                                 requestUrl.includes('/auth/verify');
            
            if (isAuthRequest) {
                // Just pass the error through for login attempts
                return Promise.reject(error);
            }

            // For other 401 errors (expired token during authenticated requests),
            // clear session and redirect to appropriate login page
            const token = localStorage.getItem('token');
            let redirectPath = '/';

            if (token) {
                const decoded = parseJwt(token);
                if (decoded?.role) {
                    const role = decoded.role.toLowerCase();
                    if (role === 'student' || role === 'candidate') {
                        redirectPath = '/candidate/auth';
                    } else if (role === 'center_admin' || role === 'center-admin') {
                        redirectPath = '/center/auth';
                    } else if (role === 'ministry') {
                        redirectPath = '/ministry/auth';
                    } else if (role === 'admin' || role === 'super_admin' || role === 'super-admin') {
                        redirectPath = '/admin/auth';
                    }
                }
            }

            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('examScheduleInfo');

            // Reset language to English (LTR) on session expiry
            i18n.changeLanguage('en');
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';

            // Hard redirect to login page (avoids React state issues)
            window.location.href = redirectPath;
        }

        return Promise.reject(error);
    }
);

export default api;

