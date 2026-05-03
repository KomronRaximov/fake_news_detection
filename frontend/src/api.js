import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/';
const PUBLIC_ENDPOINTS = ['login/', 'register/', 'logout/', 'verify-email/'];

const api = axios.create({
    baseURL: API_BASE_URL,
});

const clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

const isPublicEndpoint = (url = '') => {
    const normalizedUrl = url.replace(api.defaults.baseURL, '');
    return PUBLIC_ENDPOINTS.some((endpoint) => normalizedUrl.startsWith(endpoint));
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token && !isPublicEndpoint(config.url)) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isPublicEndpoint(error.config?.url)) {
            clearAuthTokens();
        }
        return Promise.reject(error);
    }
);

export { clearAuthTokens };
export default api;
