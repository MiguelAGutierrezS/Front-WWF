import { create } from 'zustand';
import { projectService } from '../services/projectService';

export const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectService.getProjects();
      set({ projects: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProject: async (projectData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectService.createProject(projectData, userId);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return newProject;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
