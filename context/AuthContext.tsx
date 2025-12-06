import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as storage from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => Promise<boolean>;
  register: (username: string, fullName: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
} 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const sessionId = storage.getSessionUserId();
      if (sessionId) {
        // Here we rely on the API to fetch user by ID
        const storedUser = await storage.getUserById(sessionId);
        if (storedUser) {
          setUser(storedUser);
        } else {
          storage.clearSessionUserId();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const user = await storage.loginUser(username, password);
    if (user) {
      setUser(user);
      storage.setSessionUserId(user.id);
      return true;
    }
    return false;
  };

  const register = async (username: string, fullName: string, password?: string): Promise<boolean> => {
    const user = await storage.registerUser(username, fullName, password);
    if (user) {
      setUser(user);
      storage.setSessionUserId(user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    storage.clearSessionUserId();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};