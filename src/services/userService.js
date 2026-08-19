import { apiClient } from './api';

export const userService = {
  claimAnonSession: async (anonSessionId) => {
    const { data } = await apiClient.post('/users/me/claim', { anon_session_id: anonSessionId });
    return data;
  },
  
  getUserHistory: async () => {
    const { data } = await apiClient.get('/users/me/history');
    return data;
  },
  
  getAllUsers: async () => {
    const { data } = await apiClient.get('/users/');
    return data;
  }
};
