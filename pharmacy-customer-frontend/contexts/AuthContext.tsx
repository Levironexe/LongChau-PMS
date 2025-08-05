"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: 'regular' | 'vip';
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage (mock database)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = existingUsers.find((u: any) => 
        (u.email === email || u.phone === email) && u.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials. Please check your email/phone and password.');
      }

      // Create mock user object
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        customer_type: 'regular' as const,
        role: 'customer',
        avatar: user.avatar || undefined,
      };
      
      // Store user data and token
      const mockToken = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', mockToken);
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.some((u: any) => 
        u.email === userData.email || u.phone === userData.phone
      );

      if (userExists) {
        throw new Error('An account with this email or phone number already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now(), // Simple ID generation
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // In real app, this would be hashed
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        createdAt: new Date().toISOString(),
      };

      // Store user in mock database
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Create user session
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        customer_type: 'regular' as const,
        role: 'customer',
      };
      
      // Auto-login after successful registration
      const mockToken = btoa(JSON.stringify({ userId: newUser.id, timestamp: Date.now() }));
      localStorage.setItem('user', JSON.stringify(userSession));
      localStorage.setItem('token', mockToken);
      
      setUser(userSession);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}