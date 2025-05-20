/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL ?? '';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY ?? '';

// Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_API_KEY,
    },
});

// Add token from localStorage + handle FormData
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            config.headers = config.headers ?? {};
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error: any) => Promise.reject(error)
);

// Log responses and errors
api.interceptors.response.use(
    (response: any) => {
        console.debug('[RESPONSE]', response);
        return response;
    },
    (error: { response: any; }) => {
        console.error('[ERROR]', error?.response ?? error);
        return Promise.reject(error?.response ?? error);
    }
);

// GET with manual token injection
const getWithToken = async <T = any>(
    endpoint: string,
    token?: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
    const headers = config?.headers ?? {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return api.get(endpoint, { params, ...config, headers });
};

// Export service
export const ApiService = {
    get: <T = any>(
        endpoint: string,
        params?: Record<string, any>,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => api.get(endpoint, { params, ...config }),

    post: <T = any>(
        endpoint: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => api.post(endpoint, data, config),

    put: <T = any>(
        endpoint: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => api.put(endpoint, data, config),

    delete: <T = any>(
        endpoint: string,
        params?: Record<string, any>,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => api.delete(endpoint, { params, ...config }),

    getWithToken,
};
/* eslint-enable @typescript-eslint/no-explicit-any */
