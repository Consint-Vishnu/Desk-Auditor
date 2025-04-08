import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from "sonner";

// Define API base URL
const API_BASE_URL = 'https://api.desk-audit.consint.ai';

// Token storage keys
const ACCESS_TOKEN_KEY = 'desk_audit_access_token';
const REFRESH_TOKEN_KEY = 'desk_audit_refresh_token';

// Interface for authentication tokens
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Create and configure API client
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store tokens in localStorage
export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

// Get tokens from localStorage
export const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
};

// Clear tokens from localStorage
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Refresh token request
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  const { refreshToken } = getTokens();
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await axios.post<AuthTokens>(`${API_BASE_URL}/login/refresh`, {
      refresh_token: refreshToken
    });
    
    storeTokens(response.data);
    return response.data;
  } catch (error) {
    clearTokens();
    return null;
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newTokens = await refreshAccessToken();
        
        if (newTokens && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        clearTokens();
        toast.error("Your session has expired. Please login again.");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;