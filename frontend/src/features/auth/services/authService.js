import apiClient from './apiClient';

const API_BASE_URL = '/api/auth';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/login`, { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed';
    }
  },

  register: async (username, password) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/register`, { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed';
    }
  },

  logout: async () => {
    try {
      await apiClient.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
};
