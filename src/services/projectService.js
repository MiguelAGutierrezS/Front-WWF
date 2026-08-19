import { apiClient } from './api';

export const projectService = {
  createProject: async (projectData) => {
    const { data } = await apiClient.post('/projects/', projectData);
    return data;
  },
  
  getProjects: async (skip = 0, limit = 100) => {
    const { data } = await apiClient.get(`/projects/?skip=${skip}&limit=${limit}`);
    return data;
  },
  
  getProjectById: async (id) => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },
  
  updateProject: async (id, projectData) => {
    const { data } = await apiClient.patch(`/projects/${id}`, projectData);
    return data;
  },
  
  deleteProject: async (id) => {
    const { data } = await apiClient.delete(`/projects/${id}`);
    return data;
  },
  
  associateStation: async (projectId, stationId) => {
    const { data } = await apiClient.post(`/projects/${projectId}/stations`, { station_id: stationId });
    return data;
  },
  
  disassociateStation: async (projectId, stationId) => {
    const { data } = await apiClient.delete(`/projects/${projectId}/stations/${stationId}`);
    return data;
  },
  
  getProjectSummary: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/summary`);
    return data;
  }
};
