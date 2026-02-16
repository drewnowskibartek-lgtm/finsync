import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { getAuthStorage } from '../utils/authStorage';
import type { UserProfile } from '../api/types';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, haslo: string) => Promise<void>;
  register: (email: string, haslo: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get<UserProfile>('/users/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storage = getAuthStorage();
    if (storage?.getItem('accessToken')) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, haslo: string) => {
    const res = await api.post('/auth/login', { email, haslo });
    const storage = getAuthStorage();
    storage?.setItem('accessToken', res.data.accessToken);
    storage?.setItem('refreshToken', res.data.refreshToken);
    await loadProfile();
  };

  const register = async (email: string, haslo: string) => {
    const res = await api.post('/auth/register', { email, haslo });
    const storage = getAuthStorage();
    storage?.setItem('accessToken', res.data.accessToken);
    storage?.setItem('refreshToken', res.data.refreshToken);
    await loadProfile();
  };

  const logout = () => {
    const storage = getAuthStorage();
    storage?.removeItem('accessToken');
    storage?.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  }
  return ctx;
};



