import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { storage } from './storage';

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser & { createdAt?: string };
  };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (username: string, password: string) =>
    api.post<AuthResponse>('/register', { username, password }),

  login: (username: string, password: string) =>
    api.post<AuthResponse>('/login', { username, password }),

  getProfile: () => api.get<ProfileResponse>('/profile'),
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const isPlaceholder = API_BASE_URL.includes('YOUR-BACKEND-URL');
      if (isPlaceholder) {
        return 'API URL not configured. Set EXPO_PUBLIC_API_URL in mobile/.env to your backend (e.g. http://YOUR_PC_IP:5000/api/auth).';
      }
      return `Cannot reach server (${API_BASE_URL}). Is the backend running? Same Wi‑Fi as your phone?`;
    }
    return (
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
};
