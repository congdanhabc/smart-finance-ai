// src/api/client.ts
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Gắn Token
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response: Bắt lỗi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth')) {
        window.location.href = '/auth'; 
      }
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res: AxiosResponse<T> = await axiosInstance.get(url, { params, ...config });
    return res.data;
  },
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return res.data;
  },
  // Thêm put, delete tương tự nếu cần
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return res.data;
  },
  delete: async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res: AxiosResponse<T> = await axiosInstance.delete(url, { params, ...config });
    return res.data;
  },
};