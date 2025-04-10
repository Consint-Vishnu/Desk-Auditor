
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

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
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const 
useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string, role: UserRole) => {
    // In a real app, you would validate credentials against a backend
    // Here we're just mocking the login process
    
    // Simulate a login delay
    setLoading(true);
    
    setTimeout(() => {
      // Create a mock user based on the role
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: role === 'ro_admin' 
          ? 'RO Admin User'
          : role === 'ho_admin'
            ? 'HO Admin User'
            : 'Desk Auditor User',
        email,
        role,
      };
      
      // Save user to state and localStorage
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Complete login
      setLoading(false);
      
      // Navigate to appropriate dashboard based on role
      toast.success(`Logged in as ${mockUser.name}`);
      
      navigate(`/dashboard/${role}`);
    }, 1000);
  };

  const logout = () => {
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
