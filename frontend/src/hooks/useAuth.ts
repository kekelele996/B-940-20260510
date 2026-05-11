import { useAuthStore } from '../stores/auth';
import { authApi } from '../api';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      login(response.data.user, response.data.token);
      return response;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (
    username: string, 
    password: string, 
    email: string,
    phone?: string
  ) => {
    setLoading(true);
    try {
      const response = await authApi.register({ username, password, email, phone });
      login(response.data.user, response.data.token);
      return response;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await authApi.getMe();
      updateUser(response.data);
    } catch {
      logout();
    }
  }, [token, updateUser, logout]);

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token, user, refreshUser]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    isAdmin: user?.role === 'admin',
  };
}
