import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : (typeof window !== 'undefined' ? window.location.origin : ''));

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('picket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global errors like 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - clearing session');
      localStorage.removeItem('picket_token');
      // We could use window.location.href = '/login' here if we weren't using React state
      // But AuthContext will handle the state change if we trigger it or if they just fail next request.
    }
    return Promise.reject(error);
  }
);

export default api;
