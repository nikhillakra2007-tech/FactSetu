import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'x') => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('factsetu_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check real backend session on mount
  useEffect(() => {
    const checkSession = async () => {
      const liveUser = await ApiService.getCurrentUser();
      if (liveUser) {
        setUser(liveUser);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('factsetu_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('factsetu_user');
      }
    }
  }, [user]);

  const loginWithEmail = async (email: string, password = 'password123'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.name || email.split('@')[0],
          role: data.user.role,
          provider: 'email',
        };
        setUser(profile);
        setIsAuthModalOpen(false);
        return true;
      }
    } catch {
      // Backend not running, local session fallback
    }

    const mockProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      display_name: email.split('@')[0],
      provider: 'email',
    };
    setUser(mockProfile);
    setIsAuthModalOpen(false);
    return true;
  };

  const signupWithEmail = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.name || name || email.split('@')[0],
          role: data.user.role,
          provider: 'email',
        };
        setUser(profile);
        setIsAuthModalOpen(false);
        return true;
      }
    } catch {
      // Backend not running, local session fallback
    }

    const mockProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      display_name: name || email.split('@')[0],
      provider: 'email',
    };
    setUser(mockProfile);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithOAuth = async (provider: 'google' | 'x') => {
    const mockUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: provider === 'google' ? 'citizen@gmail.com' : 'verified_handle@x.com',
      display_name: provider === 'google' ? 'Google Citizen' : 'Verified Handle',
      provider,
    };
    setUser(mockUser);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithEmail,
        signupWithEmail,
        loginWithOAuth,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
