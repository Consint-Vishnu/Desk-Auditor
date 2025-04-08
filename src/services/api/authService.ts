import apiClient, { AuthTokens, storeTokens, clearTokens } from './apiClient';
import { jwtDecode } from './helper';
import { UserRole } from '@/contexts/AuthContext';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse extends AuthTokens {}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const login = async (email: string, password: string): Promise<UserInfo> => {
  try {
    const response = await apiClient.post<LoginResponse>('/login/', {
      username: email,
      password: password,
    });
    
    // Store tokens
    storeTokens(response.data);
    
    // Decode token to get user info
    const decodedToken = jwtDecode<{
      user_id: string;
      name: string;
      email: string;
      role: string;
    }>(response.data.access_token);
    
    // Map the role from token to our UserRole type
    const roleMapping: Record<string, UserRole> = {
      ho_admin: 'ho_admin',
      ro_admin: 'ro_admin',
      desk_auditor: 'desk_auditor'
    };
    
    const role = roleMapping[decodedToken.role] || 'desk_auditor';
    
    return {
      id: decodedToken.user_id || Math.random().toString(36).substring(2, 9),
      name: decodedToken.name || email.split('@')[0],
      email: decodedToken.email || email,
      role: role
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Login failed. Please check your credentials and try again.'
    );
  }
};

export const logout = (): void => {
  clearTokens();
};

export const refreshToken = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const response = await apiClient.post<LoginResponse>('/login/refresh', {
      refresh_token: refreshToken,
    });
    storeTokens(response.data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to refresh token. Please login again.'
    );
  }
};
