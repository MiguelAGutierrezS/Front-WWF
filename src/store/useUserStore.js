import { create } from 'zustand';
import { userService } from '../services/userService';

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getAllUsers();
      set({ users: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userService.createUser(userData);
      set((state) => ({ 
        users: [...state.users, newUser],
        isLoading: false 
      }));
      return newUser;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
