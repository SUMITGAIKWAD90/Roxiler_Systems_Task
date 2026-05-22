import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: userData } = await api.auth.me();
        setUser(userData);
      } catch {
        persistAuth(null, null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token, persistAuth]);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    persistAuth(data.user, data.token);
    return data.user;
  };

  const register = async (formData) => {
    const data = await api.auth.register(formData);
    persistAuth(data.user, data.token);
    return data.user;
  };

  const logout = async () => {
    try {
      if (token) await api.auth.logout();
    } catch {
      /* ignore */
    }
    persistAuth(null, null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
