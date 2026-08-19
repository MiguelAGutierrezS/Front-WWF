import { apiClient } from './api';

export const speciesService = {
  getSpecies: async (skip = 0, limit = 100) => {
    const { data } = await apiClient.get(`/species/?skip=${skip}&limit=${limit}`);
    return data;
  },
  
  getSpeciesData: async () => {
    const { data } = await apiClient.get('/species/data');
    return data;
  },
  
  getSpeciesById: async (id) => {
    const { data } = await apiClient.get(`/species/${id}`);
    return data;
  },
  
  verifySpecies: async (id, verifiedStatus) => {
    const { data } = await apiClient.post(`/species/${id}/verify`, { verified: verifiedStatus });
    return data;
  }
};
