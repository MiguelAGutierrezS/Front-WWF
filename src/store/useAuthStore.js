import { create } from 'zustand';
import { clearAnonSessionId } from '../utils/session';

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('wwf_access_token'),
  user: null,
  accessToken: localStorage.getItem('wwf_access_token') || null,
  refreshToken: localStorage.getItem('wwf_refresh_token') || null,
  
  setSession: (user, tokens) => {
    localStorage.setItem('wwf_access_token', tokens.access_token);
    localStorage.setItem('wwf_refresh_token', tokens.refresh_token);
    set({
      isAuthenticated: true,
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    });
  },
  
  clearSession: () => {
    localStorage.removeItem('wwf_access_token');
    localStorage.removeItem('wwf_refresh_token');
    clearAnonSessionId();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null
    });
  },
}));
