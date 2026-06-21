import apiClient from './apiClient';

const API_BASE_URL = '/api/plan';

export const tripService = {
  getHistory: async () => {
    const response = await apiClient.get('/api/history');
    return response.data;
  },

  getItinerary: async (planId) => {
    const response = await apiClient.get(`/api/history/${planId}`);
    return response.data;
  },

  optimizeDay: async (planId, day) => {
    const response = await apiClient.post(`${API_BASE_URL}/optimize_day`, { plan_id: planId, day });
    return response.data;
  },

  saveTimeline: async (planId, days) => {
    const response = await apiClient.put(`${API_BASE_URL}/${planId}/timeline`, { days });
    return response.data;
  },

  saveMetadata: async (planId, metadata) => {
    const response = await apiClient.put(`${API_BASE_URL}/${planId}/metadata`, metadata);
    return response.data;
  }
};
