import { apiClient } from './api';

export const authService = {
  register: async (userData) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },
  
  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
  
  refreshToken: async (refreshTokenStr) => {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshTokenStr });
    return data;
  },
  
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  }
};
