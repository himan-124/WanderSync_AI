import { create } from 'zustand';
import { useAuthStore } from '@/store/authStore';
import { authService } from '../services/authService';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setAuth(data.username, data.access_token, data.refresh_token);
    return data;
  };

  const register = async (username, password) => {
    const data = await authService.register(username, password);
    setAuth(data.username, data.access_token, data.refresh_token);
    return data;
  };

  const logout = () => {
    storeLogout();
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout
  };
};
