import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, org?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: Role) => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pybot_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('pybot_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user } = await api.getCurrentUser();
      setUser(user);
    } catch {
      localStorage.removeItem('pybot_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('pybot_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string, org?: string) => {
    const res = await api.register({ name, email, password: pass, organization: org });
    localStorage.setItem('pybot_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('pybot_token');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (role: Role) => {
    if (role === 'admin') {
      await login('admin@pybot.ai', 'AdminPass123!');
    } else {
      await login('user@pybot.ai', 'UserPass123!');
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
