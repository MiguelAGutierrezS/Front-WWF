import { apiClient } from './api';

export const cameraStationService = {
  createStation: async (stationData) => {
    const { data } = await apiClient.post('/camera-stations/', stationData);
    return data;
  },
  
  getStations: async (skip = 0, limit = 100) => {
    const { data } = await apiClient.get(`/camera-stations/?skip=${skip}&limit=${limit}`);
    return data;
  },
  
  getStationById: async (id) => {
    const { data } = await apiClient.get(`/camera-stations/${id}`);
    return data;
  },
  
  updateStation: async (id, stationData) => {
    const { data } = await apiClient.patch(`/camera-stations/${id}`, stationData);
    return data;
  },
  
  deleteStation: async (id) => {
    const { data } = await apiClient.delete(`/camera-stations/${id}`);
    return data;
  },
  
  uploadMediaFile: async (stationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post(`/camera-stations/${stationId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },
  
  getStationSummary: async (stationId) => {
    const { data } = await apiClient.get(`/camera-stations/${stationId}/summary`);
    return data;
  }
};
