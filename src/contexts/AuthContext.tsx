
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { login as apiLogin, logout as apiLogout } from '../services/api/authService';
import { getTokens } from '../services/api/apiClient';

export type UserRole = 'ro_admin' | 'ho_admin' | 'desk_auditor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const { accessToken } = getTokens();
    
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Call API login service
      const userData = await apiLogin(email, password);
      
      // Save user to state and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Complete login
      toast.success(`Logged in as ${userData.name}`);
      navigate(`/dashboard/${userData.role}`);
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Call API logout
    apiLogout();
    
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem('user');
    
    // Navigate back to login page
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};