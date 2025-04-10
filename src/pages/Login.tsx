/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address or username');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    
    try {
      await login(email, password);
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-navy">Desk Audit System</h1>
          <p className="text-gray-600 mt-2">Login to access your dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Username / Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoComplete="current-password"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-navy hover:bg-navy-dark transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
